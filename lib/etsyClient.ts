/**
 * Etsy API Client - Abstraction layer for Etsy integration
 * Supports both mock (dev) and real (production) modes
 */

export interface EtsyListing {
  listing_id: number
  title: string
  description: string
  price: string
  currency_code: string
  quantity: number
  state: 'active' | 'draft' | 'inactive'
  tags: string[]
  images: Array<{
    url_570xN: string
    url_fullxfull: string
  }>
  views: number
  num_favorers: number
  created_timestamp: number
  url: string
}

export interface EtsyShop {
  shop_id: number
  shop_name: string
  title: string
  url: string
  listing_active_count: number
  icon_url_fullxfull?: string
}

export interface EtsyTokens {
  access_token: string
  refresh_token: string
  expires_at: number
}

export interface IEtsyClient {
  // OAuth flow
  getAuthorizationUrl(userId: string): Promise<string>
  exchangeCodeForToken(code: string, codeVerifier: string): Promise<EtsyTokens>
  refreshAccessToken(refreshToken: string): Promise<EtsyTokens>
  
  // Shop data
  getShop(accessToken: string): Promise<EtsyShop>
  
  // Listings
  getShopListings(accessToken: string, shopId: number, limit?: number): Promise<EtsyListing[]>
  getListing(accessToken: string, listingId: number): Promise<EtsyListing>
  
  // Update listing (for optimization)
  updateListing(
    accessToken: string,
    listingId: number,
    updates: {
      title?: string
      description?: string
      tags?: string[]
    }
  ): Promise<EtsyListing>
}

/**
 * Mock Etsy Client - Returns fake data for development
 */
class MockEtsyClient implements IEtsyClient {
  async getAuthorizationUrl(userId: string): Promise<string> {
    // Return mock OAuth URL that redirects to our mock callback
    return `/api/etsy/mock_callback?user_id=${userId}&code=mock_auth_code_${Date.now()}`
  }

  async exchangeCodeForToken(code: string, codeVerifier: string): Promise<EtsyTokens> {
    // Return mock tokens
    return {
      access_token: `mock_access_token_${Date.now()}`,
      refresh_token: `mock_refresh_token_${Date.now()}`,
      expires_at: Date.now() + 3600 * 1000, // 1 hour from now
    }
  }

  async refreshAccessToken(refreshToken: string): Promise<EtsyTokens> {
    return {
      access_token: `mock_access_token_refreshed_${Date.now()}`,
      refresh_token: refreshToken,
      expires_at: Date.now() + 3600 * 1000,
    }
  }

  async getShop(accessToken: string): Promise<EtsyShop> {
    return {
      shop_id: 12345678,
      shop_name: 'MockArtisanShop',
      title: 'Mock Artisan Shop - Handmade Crafts',
      url: 'https://www.etsy.com/shop/MockArtisanShop',
      listing_active_count: 25,
      icon_url_fullxfull: 'https://via.placeholder.com/150/00B3FF/FFFFFF?text=Shop',
    }
  }

  async getShopListings(accessToken: string, shopId: number, limit = 25): Promise<EtsyListing[]> {
    // Generate 25 mock listings
    const categories = ['Art', 'Jewelry', 'Home Decor', 'Clothing', 'Crafts']
    const adjectives = ['Handmade', 'Vintage', 'Custom', 'Rustic', 'Modern', 'Boho', 'Elegant']
    const items = [
      'Painting', 'Necklace', 'Wall Art', 'Candle', 'Vase', 'Bracelet', 'Pillow', 
      'Mug', 'Print', 'Earrings', 'Scarf', 'Basket', 'Frame', 'Ring', 'Bookmark'
    ]

    return Array.from({ length: limit }, (_, i) => {
      const adjective = adjectives[i % adjectives.length]
      const item = items[i % items.length]
      const category = categories[i % categories.length]
      const price = (Math.random() * 100 + 10).toFixed(2)
      const views = Math.floor(Math.random() * 500) + 50
      const favorers = Math.floor(Math.random() * 50) + 5

      return {
        listing_id: 1000000000 + i,
        title: `${adjective} ${item} - ${category}`,
        description: `Beautiful ${adjective.toLowerCase()} ${item.toLowerCase()} perfect for your home or as a gift. Made with care and attention to detail. Each piece is unique and handcrafted. Ships within 1-3 business days.`,
        price: price,
        currency_code: 'USD',
        quantity: Math.floor(Math.random() * 10) + 1,
        state: i % 10 === 0 ? 'draft' : 'active',
        tags: [
          adjective.toLowerCase(),
          item.toLowerCase(),
          category.toLowerCase(),
          'handmade',
          'gift',
          'unique',
        ].slice(0, Math.floor(Math.random() * 3) + 3),
        images: [
          {
            url_570xN: `https://via.placeholder.com/570x428/1a2332/00B3FF?text=${item}`,
            url_fullxfull: `https://via.placeholder.com/1500x1125/1a2332/00B3FF?text=${item}`,
          },
        ],
        views: views,
        num_favorers: favorers,
        created_timestamp: Date.now() - Math.floor(Math.random() * 90) * 24 * 60 * 60 * 1000, // Random date within last 90 days
        url: `https://www.etsy.com/listing/${1000000000 + i}/${adjective}-${item}`.toLowerCase().replace(/\s+/g, '-'),
      }
    })
  }

  async getListing(accessToken: string, listingId: number): Promise<EtsyListing> {
    const listings = await this.getShopListings(accessToken, 0, 25)
    const listing = listings.find(l => l.listing_id === listingId)
    if (!listing) {
      throw new Error('Listing not found')
    }
    return listing
  }

  async updateListing(
    accessToken: string,
    listingId: number,
    updates: { title?: string; description?: string; tags?: string[] }
  ): Promise<EtsyListing> {
    // Simulate update by returning the listing with updated fields
    const listing = await this.getListing(accessToken, listingId)
    return {
      ...listing,
      ...updates,
    }
  }
}

/**
 * Real Etsy Client - Uses actual Etsy API v3
 * TODO: Implement when API keys are approved
 */
class RealEtsyClient implements IEtsyClient {
  private apiKey: string
  private redirectUri: string

  constructor() {
    this.apiKey = process.env.ETSY_API_KEY || ''
    this.redirectUri = process.env.ETSY_REDIRECT_URI || ''
  }

  async getAuthorizationUrl(userId: string): Promise<string> {
    // TODO: Implement real OAuth flow with PKCE
    throw new Error('Real Etsy API not yet implemented - use mock mode')
  }

  async exchangeCodeForToken(code: string, codeVerifier: string): Promise<EtsyTokens> {
    // TODO: Exchange code for real tokens
    throw new Error('Real Etsy API not yet implemented - use mock mode')
  }

  async refreshAccessToken(refreshToken: string): Promise<EtsyTokens> {
    // TODO: Refresh real tokens
    throw new Error('Real Etsy API not yet implemented - use mock mode')
  }

  async getShop(accessToken: string): Promise<EtsyShop> {
    // TODO: GET /v3/application/shops/:shop_id
    throw new Error('Real Etsy API not yet implemented - use mock mode')
  }

  async getShopListings(accessToken: string, shopId: number, limit = 25): Promise<EtsyListing[]> {
    // TODO: GET /v3/application/shops/:shop_id/listings/active
    throw new Error('Real Etsy API not yet implemented - use mock mode')
  }

  async getListing(accessToken: string, listingId: number): Promise<EtsyListing> {
    // TODO: GET /v3/application/listings/:listing_id
    throw new Error('Real Etsy API not yet implemented - use mock mode')
  }

  async updateListing(
    accessToken: string,
    listingId: number,
    updates: { title?: string; description?: string; tags?: string[] }
  ): Promise<EtsyListing> {
    // TODO: PUT /v3/application/shops/:shop_id/listings/:listing_id
    throw new Error('Real Etsy API not yet implemented - use mock mode')
  }
}

/**
 * Factory function to get the appropriate client
 */
export function getEtsyClient(): IEtsyClient {
  const useMock = process.env.USE_MOCK_ETSY !== 'false' // Default to mock
  
  if (useMock) {
    console.log('🔧 Using Mock Etsy Client')
    return new MockEtsyClient()
  }
  
  console.log('🔌 Using Real Etsy Client')
  return new RealEtsyClient()
}

export const etsyClient = getEtsyClient()
