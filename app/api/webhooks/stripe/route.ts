import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import Stripe from 'stripe'

export const runtime = 'nodejs'

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

// Structured logging helpers
function logInfo(message: string, data?: any) {
  console.log(JSON.stringify({ level: 'info', message, ...data, timestamp: new Date().toISOString() }))
}

function logError(message: string, error?: any, data?: any) {
  console.error(JSON.stringify({ 
    level: 'error', 
    message, 
    error: error?.message, 
    stack: error?.stack,
    ...data,
    timestamp: new Date().toISOString() 
  }))
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')!

    if (!webhookSecret) {
      logError('STRIPE_WEBHOOK_SECRET not configured')
      return NextResponse.json(
        { error: 'Webhook secret not configured' },
        { status: 500 }
      )
    }

    // Verify webhook signature
    let event: Stripe.Event
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
      logInfo('Webhook signature verified', { eventType: event.type, eventId: event.id })
    } catch (err: any) {
      logError('Webhook signature verification failed', err)
      return NextResponse.json(
        { error: `Webhook Error: ${err.message}` },
        { status: 400 }
      )
    }

    logInfo('Processing webhook event', { eventType: event.type, eventId: event.id })

    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        await handleCheckoutComplete(session)
        break
      }

      case 'charge.refunded': {
        const charge = event.data.object as Stripe.Charge
        await handleRefund(charge)
        break
      }

      default:
        logInfo('Unhandled event type', { eventType: event.type })
    }

    return NextResponse.json({ received: true, eventType: event.type })
  } catch (error: any) {
    logError('Webhook handler failed', error)
    return NextResponse.json(
      { error: 'Webhook handler failed', details: error.message },
      { status: 500 }
    )
  }
}

async function handleCheckoutComplete(session: Stripe.Checkout.Session) {
  const startTime = Date.now()
  try {
    const userId = session.metadata?.userId || session.metadata?.user_id
    const credits = parseInt(session.metadata?.credits || '0')
    const packageType = session.metadata?.packageType || session.metadata?.package_type
    const idempotencyKey = session.metadata?.idempotency_key || session.id

    if (!userId || !credits) {
      logError('Missing metadata in checkout session', null, { sessionId: session.id })
      
      // Store failed event
      try {
        await prisma.webhookEvent.create({
          data: {
            userId: userId || 'unknown',
            eventType: 'checkout.session.completed',
            eventId: session.id,
            stripePaymentId: session.id,
            status: 'failed',
            errorMessage: 'Missing userId or credits in metadata',
            stripeCreatedAt: new Date(session.created * 1000),
          }
        })
      } catch (e) {
        logError('Failed to store webhook event', e)
      }
      
      return
    }

    logInfo('Processing checkout complete', { 
      userId, 
      credits, 
      packageType,
      sessionId: session.id,
      idempotencyKey
    })

    // Check if this payment was already processed (idempotency)
    const existingLedger = await prisma.creditLedger.findFirst({
      where: {
        referenceId: idempotencyKey,
      },
    })

    const isDuplicate = !!existingLedger

    if (isDuplicate) {
      logInfo('Payment already processed (idempotent)', { 
        referenceId: idempotencyKey,
        existingBalance: existingLedger.balance 
      })
      
      // Store duplicate event
      await prisma.webhookEvent.create({
        data: {
          userId,
          eventType: 'checkout.session.completed',
          eventId: session.id,
          stripePaymentId: session.id,
          stripePaymentIntentId: session.payment_intent as string,
          credits,
          amount: session.amount_total || 0,
          status: 'processed',
          referenceId: idempotencyKey,
          isDuplicate: true,
          stripeCreatedAt: new Date(session.created * 1000),
        }
      })
      
      return
    }

    // Get current balance
    const latestLedger = await prisma.creditLedger.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: { balance: true }
    })

    const currentBalance = latestLedger?.balance || 0
    const newBalance = currentBalance + credits

    // Add credits to ledger
    await prisma.creditLedger.create({
      data: {
        userId,
        amount: credits,
        balance: newBalance,
        type: 'purchase',
        description: `${packageType} package - ${credits} credits`,
        referenceId: idempotencyKey,
        stripePaymentId: session.id,
        metadata: {
          sessionId: session.id,
          packageType,
          amountPaid: session.amount_total,
          currency: session.currency,
          customerEmail: session.customer_email,
        },
      },
    })

    // Store successful webhook event
    await prisma.webhookEvent.create({
      data: {
        userId,
        eventType: 'checkout.session.completed',
        eventId: session.id,
        stripePaymentId: session.id,
        stripePaymentIntentId: session.payment_intent as string,
        credits,
        amount: session.amount_total || 0,
        status: 'processed',
        referenceId: idempotencyKey,
        isDuplicate: false,
        stripeCreatedAt: new Date(session.created * 1000),
      }
    })

    const duration = Date.now() - startTime
    logInfo('Credits added successfully', { 
      userId, 
      credits,
      previousBalance: currentBalance,
      newBalance,
      duration,
      referenceId: idempotencyKey,
      stripePaymentId: session.id,
      stripePaymentIntentId: session.payment_intent
    })
  } catch (error) {
    logError('Error handling checkout complete', error, { sessionId: session.id })
    
    // Store failed event
    try {
      const userId = session.metadata?.userId || session.metadata?.user_id
      if (userId) {
        await prisma.webhookEvent.create({
          data: {
            userId,
            eventType: 'checkout.session.completed',
            eventId: session.id,
            stripePaymentId: session.id,
            status: 'failed',
            errorMessage: error instanceof Error ? error.message : 'Unknown error',
            stripeCreatedAt: new Date(session.created * 1000),
          }
        })
      }
    } catch (e) {
      logError('Failed to store failed webhook event', e)
    }
    
    throw error
  }
}

async function handleRefund(charge: Stripe.Charge) {
  try {
    const paymentIntentId = charge.payment_intent as string

    logInfo('Processing refund', { chargeId: charge.id, paymentIntentId })

    // Find the original purchase
    const originalPurchase = await prisma.creditLedger.findFirst({
      where: {
        stripePaymentIntentId: paymentIntentId,
        type: 'purchase',
      },
    })

    if (!originalPurchase) {
      logError('Original purchase not found for refund', null, { paymentIntentId })
      return
    }

    // Check if refund already processed (idempotency)
    const existingRefund = await prisma.creditLedger.findFirst({
      where: {
        referenceId: `refund_${charge.id}`,
      },
    })

    if (existingRefund) {
      logInfo('Refund already processed (idempotent)', { chargeId: charge.id })
      return
    }

    const userId = originalPurchase.userId
    const creditsToDeduct = -originalPurchase.amount // Negative to deduct

    // Get current balance
    const latestLedger = await prisma.creditLedger.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: { balance: true }
    })

    const currentBalance = latestLedger?.balance || 0
    const newBalance = Math.max(0, currentBalance + creditsToDeduct) // Don't go below zero

    // Deduct credits
    await prisma.creditLedger.create({
      data: {
        userId,
        amount: creditsToDeduct,
        balance: newBalance,
        type: 'refund',
        description: `Refund - ${-creditsToDeduct} credits removed`,
        referenceId: `refund_${charge.id}`,
        metadata: {
          chargeId: charge.id,
          amountRefunded: charge.amount_refunded,
          originalPurchaseId: originalPurchase.id,
        },
      },
    })

    logInfo('Refund processed successfully', { 
      userId, 
      creditsDeducted: -creditsToDeduct,
      previousBalance: currentBalance,
      newBalance 
    })
  } catch (error) {
    logError('Error handling refund', error, { chargeId: charge.id })
    throw error
  }
}
