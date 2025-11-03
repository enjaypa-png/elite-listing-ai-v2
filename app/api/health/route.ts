import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth-helpers'
import { getEtsyClient } from '@/lib/etsyClient'

// Structured logging
function logInfo(message: string, data?: any) {
  console.log(JSON.stringify({ level: 'info', message, ...data, timestamp: new Date().toISOString() }))
}

export async function GET(request: NextRequest) {
  try {
    // Health check doesn't require auth - show system status
    const user = await getCurrentUser().catch(() => null)
    
    // Check environment variables
    const envStatus = {
      stripe: {
        hasSecretKey: !!process.env.STRIPE_SECRET_KEY && process.env.STRIPE_SECRET_KEY !== 'sk_test_dummy_replace_with_real_test_key',
        hasWebhookSecret: !!process.env.STRIPE_WEBHOOK_SECRET && process.env.STRIPE_WEBHOOK_SECRET !== 'whsec_dummy_replace_with_real_webhook_secret',
        hasPublishableKey: !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
      },
      etsy: {
        useMock: process.env.USE_MOCK_ETSY !== 'false',
        hasApiKey: !!process.env.ETSY_API_KEY,
        hasRedirectUri: !!process.env.ETSY_REDIRECT_URI,
      },
      openai: {
        hasApiKey: !!process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'dummy-openai-key',
      },
      supabase: {
        hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://dummy.supabase.co',
        hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== 'dummy-anon-key',
      },
      general: {
        hasAppUrl: !!process.env.NEXT_PUBLIC_APP_URL,
        nodeEnv: process.env.NODE_ENV,
      }
    }

    // Test Etsy client
    const etsyClient = getEtsyClient()
    let etsyStatus = {
      mode: process.env.USE_MOCK_ETSY !== 'false' ? 'mock' : 'real',
      operational: true,
      error: null as string | null
    }

    try {
      // Test connection with mock token
      const shop = await etsyClient.getShop('test_token')
      etsyStatus.operational = true
    } catch (error: any) {
      etsyStatus.operational = false
      etsyStatus.error = error.message
    }

    logInfo('Health check completed', { 
      userId: user?.id,
      envStatus,
      etsyStatus 
    })

    return NextResponse.json({
      success: true,
      authenticated: !!user,
      user: user ? { id: user.id, email: user.email } : null,
      timestamp: new Date().toISOString(),
      environment: envStatus,
      services: {
        etsy: etsyStatus,
      },
      warnings: [
        ...(!envStatus.stripe.hasSecretKey ? ['Stripe Secret Key not configured - add STRIPE_SECRET_KEY to .env'] : []),
        ...(!envStatus.stripe.hasWebhookSecret ? ['Stripe Webhook Secret not configured - add STRIPE_WEBHOOK_SECRET to .env'] : []),
        ...(!envStatus.openai.hasApiKey ? ['OpenAI API Key not configured - add OPENAI_API_KEY to .env'] : []),
        ...(!envStatus.supabase.hasUrl ? ['Supabase URL not configured - add NEXT_PUBLIC_SUPABASE_URL to .env'] : []),
      ]
    })
  } catch (error: any) {
    console.error('Health check error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error.message,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}

// HEAD method for quick probe
export async function HEAD(request: NextRequest) {
  return new NextResponse(null, { status: 200 })
}
