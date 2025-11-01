import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';
import Stripe from 'stripe';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature')!;

    if (!webhookSecret) {
      console.error('STRIPE_WEBHOOK_SECRET not configured');
      return NextResponse.json(
        { error: 'Webhook secret not configured' },
        { status: 500 }
      );
    }

    // Verify webhook signature
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message);
      return NextResponse.json(
        { error: `Webhook Error: ${err.message}` },
        { status: 400 }
      );
    }

    console.log('Received webhook event:', event.type);

    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutComplete(session);
        break;
      }

      case 'charge.refunded': {
        const charge = event.data.object as Stripe.Charge;
        await handleRefund(charge);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed', details: error.message },
      { status: 500 }
    );
  }
}

async function handleCheckoutComplete(session: Stripe.Checkout.Session) {
  try {
    const userId = session.metadata?.userId;
    const credits = parseInt(session.metadata?.credits || '0');
    const packageType = session.metadata?.packageType;

    if (!userId || !credits) {
      console.error('Missing metadata in checkout session:', session.id);
      return;
    }

    console.log(`Processing payment for user ${userId}: ${credits} credits`);

    // Check if this payment was already processed (idempotency)
    const existingLedger = await prisma.creditLedger.findFirst({
      where: {
        referenceId: session.id,
        referenceType: 'purchase',
      },
    });

    if (existingLedger) {
      console.log('Payment already processed:', session.id);
      return;
    }

    // Get current balance
    const currentBalance = await prisma.creditLedger.aggregate({
      where: { userId },
      _sum: { amount: true },
    });

    const newBalance = (currentBalance._sum.amount || 0) + credits;

    // Add credits to ledger
    await prisma.creditLedger.create({
      data: {
        userId,
        amount: credits,
        balance: newBalance,
        type: 'purchase',
        description: `${packageType} package - ${credits} credits`,
        referenceId: session.id,
        referenceType: 'purchase',
        stripePaymentId: session.payment_intent as string,
        metadata: {
          sessionId: session.id,
          packageType,
          amountPaid: session.amount_total,
          currency: session.currency,
        },
      },
    });

    console.log(`Successfully added ${credits} credits to user ${userId}. New balance: ${newBalance}`);
  } catch (error) {
    console.error('Error handling checkout complete:', error);
    throw error;
  }
}

async function handleRefund(charge: Stripe.Charge) {
  try {
    const paymentIntentId = charge.payment_intent as string;

    // Find the original purchase
    const originalPurchase = await prisma.creditLedger.findFirst({
      where: {
        stripePaymentId: paymentIntentId,
        type: 'purchase',
      },
    });

    if (!originalPurchase) {
      console.error('Original purchase not found for refund:', paymentIntentId);
      return;
    }

    // Check if refund already processed
    const existingRefund = await prisma.creditLedger.findFirst({
      where: {
        referenceId: charge.id,
        referenceType: 'refund',
      },
    });

    if (existingRefund) {
      console.log('Refund already processed:', charge.id);
      return;
    }

    const userId = originalPurchase.userId;
    const creditsToDeduct = -originalPurchase.amount; // Negative to deduct

    // Get current balance
    const currentBalance = await prisma.creditLedger.aggregate({
      where: { userId },
      _sum: { amount: true },
    });

    const newBalance = (currentBalance._sum.amount || 0) + creditsToDeduct;

    // Deduct credits
    await prisma.creditLedger.create({
      data: {
        userId,
        amount: creditsToDeduct,
        balance: newBalance,
        type: 'refund',
        description: `Refund - ${-creditsToDeduct} credits removed`,
        referenceId: charge.id,
        referenceType: 'refund',
        stripePaymentId: paymentIntentId,
        metadata: {
          chargeId: charge.id,
          amountRefunded: charge.amount_refunded,
        },
      },
    });

    console.log(`Successfully refunded ${-creditsToDeduct} credits for user ${userId}. New balance: ${newBalance}`);
  } catch (error) {
    console.error('Error handling refund:', error);
    throw error;
  }
}
