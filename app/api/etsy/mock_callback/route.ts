import { NextRequest, NextResponse } from 'next/server'
import { etsyClient } from '@/lib/etsyClient'

/**
 * Mock Etsy Callback Endpoint
 * Simulates OAuth callback from Etsy
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const userId = searchParams.get('user_id')

    if (!code || !userId) {
      return NextResponse.redirect(
        new URL('/dashboard?error=etsy_auth_failed', request.url)
      )
    }

    // Exchange code for tokens
    const tokens = await etsyClient.exchangeCodeForToken(code, 'mock_verifier')

    // Get shop info
    const shop = await etsyClient.getShop(tokens.access_token)

    // In a real app, we'd store tokens in database here
    // For mock, we'll pass data via URL params (not secure, just for demo)
    const callbackUrl = new URL('/dashboard', request.url)
    callbackUrl.searchParams.set('etsy_connected', 'true')
    callbackUrl.searchParams.set('shop_name', shop.shop_name)
    callbackUrl.searchParams.set('shop_id', shop.shop_id.toString())

    return NextResponse.redirect(callbackUrl)
  } catch (error: any) {
    console.error('Mock Etsy callback error:', error)
    return NextResponse.redirect(
      new URL('/dashboard?error=etsy_callback_failed', request.url)
    )
  }
}
