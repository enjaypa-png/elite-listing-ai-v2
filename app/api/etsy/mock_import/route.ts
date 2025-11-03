import { NextRequest, NextResponse } from 'next/server'
import { etsyClient } from '@/lib/etsyClient'

/**
 * Mock Etsy Import Endpoint
 * Simulates importing listings from connected Etsy shop
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { access_token, shop_id, limit = 25 } = body

    if (!access_token || !shop_id) {
      return NextResponse.json(
        { error: 'Missing access_token or shop_id' },
        { status: 400 }
      )
    }

    // Get mock listings
    const listings = await etsyClient.getShopListings(access_token, shop_id, limit)

    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 1000))

    return NextResponse.json({
      success: true,
      message: `Successfully imported ${listings.length} mock listings`,
      listings: listings,
      shop_id: shop_id,
      imported_at: new Date().toISOString(),
      note: '🔧 This is mock data. Real Etsy API integration pending approval.',
    })
  } catch (error: any) {
    console.error('Mock Etsy import error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to import mock listings' },
      { status: 500 }
    )
  }
}
