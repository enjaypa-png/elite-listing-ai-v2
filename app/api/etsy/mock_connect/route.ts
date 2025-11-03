import { NextRequest, NextResponse } from 'next/server'
import { etsyClient } from '@/lib/etsyClient'

/**
 * Mock Etsy Connect Endpoint
 * Simulates OAuth flow without requiring real Etsy API approval
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('user_id')

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing user_id parameter' },
        { status: 400 }
      )
    }

    // Get mock authorization URL
    const authUrl = await etsyClient.getAuthorizationUrl(userId)

    // In a real flow, we'd redirect to Etsy's OAuth page
    // For mock, we simulate the entire flow in one step
    const mockCode = `mock_code_${Date.now()}`
    const tokens = await etsyClient.exchangeCodeForToken(mockCode, 'mock_verifier')

    // Get shop info
    const shop = await etsyClient.getShop(tokens.access_token)

    // Return success with shop data
    return NextResponse.json({
      success: true,
      message: 'Mock Etsy shop connected successfully',
      shop: shop,
      tokens: {
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expires_at: tokens.expires_at,
      },
      note: '🔧 This is mock data. Real Etsy API integration pending approval.',
    })
  } catch (error: any) {
    console.error('Mock Etsy connect error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to connect mock Etsy shop' },
      { status: 500 }
    )
  }
}
