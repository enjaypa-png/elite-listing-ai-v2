'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Container, Button, Card, Alert } from '@/components/ui'
import designTokens from '@/design-system/designTokens.json'

interface EtsyListing {
  listing_id: number
  title: string
  description: string
  price: string
  currency_code: string
  quantity: number
  state: string
  tags: string[]
  images: Array<{ url_570xN: string }>
  views: number
  num_favorers: number
  url: string
}

interface EtsyShop {
  shop_id: number
  shop_name: string
  title: string
  url: string
  listing_active_count: number
  icon_url_fullxfull?: string
}

export default function EtsyIntegrationPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [isConnected, setIsConnected] = useState(false)
  const [shop, setShop] = useState<EtsyShop | null>(null)
  const [listings, setListings] = useState<EtsyListing[]>([])
  const [loading, setLoading] = useState(false)
  const [importing, setImporting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [apiTokens, setApiTokens] = useState<any>(null)

  useEffect(() => {
    // Check if redirected from OAuth callback
    const connected = searchParams.get('etsy_connected')
    const shopName = searchParams.get('shop_name')
    const shopId = searchParams.get('shop_id')

    if (connected === 'true' && shopName && shopId) {
      setIsConnected(true)
      setShop({
        shop_id: parseInt(shopId),
        shop_name: shopName,
        title: `${shopName} - Mock Shop`,
        url: `https://www.etsy.com/shop/${shopName}`,
        listing_active_count: 25,
      })
      setSuccess('Etsy shop connected successfully! You can now import listings.')
    }

    const urlError = searchParams.get('error')
    if (urlError) {
      setError('Failed to connect Etsy shop. Please try again.')
    }
  }, [searchParams])

  const handleConnect = async () => {
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch('/api/etsy/mock_connect?user_id=demo_user')
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to connect')
      }

      setIsConnected(true)
      setShop(data.shop)
      setApiTokens(data.tokens)
      setSuccess(data.message)
    } catch (err: any) {
      setError(err.message || 'Failed to connect Etsy shop')
    } finally {
      setLoading(false)
    }
  }

  const handleImport = async () => {
    if (!shop || !apiTokens) return

    setImporting(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch('/api/etsy/mock_import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          access_token: apiTokens.access_token,
          shop_id: shop.shop_id,
          limit: 25,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to import')
      }

      setListings(data.listings)
      setSuccess(data.message)
    } catch (err: any) {
      setError(err.message || 'Failed to import listings')
    } finally {
      setImporting(false)
    }
  }

  const handleOptimizeListing = (listingId: number) => {
    // Navigate to optimize page with listing data
    router.push(`/optimize?listing_id=${listingId}&source=etsy`)
  }

  const handleDisconnect = () => {
    setIsConnected(false)
    setShop(null)
    setListings([])
    setApiTokens(null)
    setSuccess('Etsy shop disconnected')
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: designTokens.colors.background }}>
      <header style={{
        borderBottom: `1px solid ${designTokens.colors.border}`,
        padding: `${designTokens.spacing[4]} 0`,
        backgroundColor: designTokens.colors.background
      }}>
        <Container>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <img src="/logo.png" alt="Elite Listing AI" style={{ height: '2.5rem', width: 'auto', cursor: 'pointer' }} onClick={() => router.push('/dashboard')} />
            <Button variant="ghost" size="sm" onClick={() => router.push('/dashboard')}>
              Back to Dashboard
            </Button>
          </div>
        </Container>
      </header>

      <main style={{ padding: `${designTokens.spacing[8]} 0` }}>
        <Container>
          <div style={{ marginBottom: designTokens.spacing[8] }}>
            <h1 style={{
              fontSize: designTokens.typography.fontSize['3xl'],
              fontWeight: designTokens.typography.fontWeight.bold,
              color: designTokens.colors.text,
              marginBottom: designTokens.spacing[2]
            }}>
              🛍️ Etsy Integration
            </h1>
            <p style={{ color: designTokens.colors.textMuted, fontSize: designTokens.typography.fontSize.base }}>
              Connect your Etsy shop to import and optimize listings
            </p>
          </div>

          {error && (
            <Alert variant="danger" style={{ marginBottom: designTokens.spacing[6] }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert variant="success" style={{ marginBottom: designTokens.spacing[6] }}>
              {success}
            </Alert>
          )}

          <Alert variant="info" style={{ marginBottom: designTokens.spacing[6] }}>
            <strong>🔧 Mock Mode Active:</strong> Using simulated Etsy data while API approval is pending. All functionality is ready - just swap in real API keys when approved.
          </Alert>

          {!isConnected ? (
            <Card padding="8">
              <div style={{ textAlign: 'center', padding: `${designTokens.spacing[12]} 0` }}>
                <div style={{
                  width: '5rem',
                  height: '5rem',
                  backgroundColor: `${designTokens.colors.primary}15`,
                  borderRadius: designTokens.radius.full,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto',
                  marginBottom: designTokens.spacing[6]
                }}>
                  <svg style={{ width: '2.5rem', height: '2.5rem', color: designTokens.colors.primary }} fill="currentColor" viewBox="0 0 24 24">
                    <path d="M7.5 6.5C7.5 8.981 9.519 11 12 11s4.5-2.019 4.5-4.5S14.481 2 12 2 7.5 4.019 7.5 6.5zM20 21h1v-1c0-3.859-3.141-7-7-7h-4c-3.86 0-7 3.141-7 7v1h17z"/>
                  </svg>
                </div>
                <h2 style={{
                  fontSize: designTokens.typography.fontSize['2xl'],
                  fontWeight: designTokens.typography.fontWeight.semibold,
                  color: designTokens.colors.text,
                  marginBottom: designTokens.spacing[4]
                }}>
                  Connect Your Etsy Shop
                </h2>
                <p style={{
                  color: designTokens.colors.textMuted,
                  marginBottom: designTokens.spacing[8],
                  maxWidth: '500px',
                  margin: '0 auto',
                  marginBottom: designTokens.spacing[8]
                }}>
                  Link your Etsy shop to import listings, analyze performance, and optimize with AI-powered recommendations.
                </p>
                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleConnect}
                  disabled={loading}
                >
                  {loading ? 'Connecting...' : 'Connect Etsy Shop'}
                </Button>
              </div>
            </Card>
          ) : (
            <>
              <Card padding="6" hover style={{ marginBottom: designTokens.spacing[6] }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: designTokens.spacing[4] }}>
                    {shop?.icon_url_fullxfull && (
                      <img
                        src={shop.icon_url_fullxfull}
                        alt={shop.shop_name}
                        style={{
                          width: '4rem',
                          height: '4rem',
                          borderRadius: designTokens.radius.lg,
                          objectFit: 'cover'
                        }}
                      />
                    )}
                    <div>
                      <h3 style={{
                        fontSize: designTokens.typography.fontSize.xl,
                        fontWeight: designTokens.typography.fontWeight.semibold,
                        color: designTokens.colors.text,
                        marginBottom: designTokens.spacing[1]
                      }}>
                        {shop?.shop_name}
                      </h3>
                      <p style={{ color: designTokens.colors.textMuted, fontSize: designTokens.typography.fontSize.sm }}>
                        {shop?.listing_active_count} active listings
                      </p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: designTokens.spacing[3] }}>
                    <Button
                      variant="primary"
                      onClick={handleImport}
                      disabled={importing}
                    >
                      {importing ? 'Importing...' : listings.length > 0 ? 'Refresh Listings' : 'Import Listings'}
                    </Button>
                    <Button variant="ghost" onClick={handleDisconnect}>
                      Disconnect
                    </Button>
                  </div>
                </div>
              </Card>

              {listings.length > 0 && (
                <Card padding="8">
                  <h2 style={{
                    fontSize: designTokens.typography.fontSize['2xl'],
                    fontWeight: designTokens.typography.fontWeight.semibold,
                    color: designTokens.colors.text,
                    marginBottom: designTokens.spacing[6]
                  }}>
                    Your Listings ({listings.length})
                  </h2>

                  <div style={{ overflowX: 'auto' }}>
                    <table style={{
                      width: '100%',
                      borderCollapse: 'collapse',
                      fontSize: designTokens.typography.fontSize.sm
                    }}>
                      <thead>
                        <tr style={{ borderBottom: `2px solid ${designTokens.colors.border}` }}>
                          <th style={{ padding: designTokens.spacing[3], textAlign: 'left', color: designTokens.colors.textMuted, fontWeight: designTokens.typography.fontWeight.medium }}>Image</th>
                          <th style={{ padding: designTokens.spacing[3], textAlign: 'left', color: designTokens.colors.textMuted, fontWeight: designTokens.typography.fontWeight.medium }}>Title</th>
                          <th style={{ padding: designTokens.spacing[3], textAlign: 'left', color: designTokens.colors.textMuted, fontWeight: designTokens.typography.fontWeight.medium }}>Price</th>
                          <th style={{ padding: designTokens.spacing[3], textAlign: 'left', color: designTokens.colors.textMuted, fontWeight: designTokens.typography.fontWeight.medium }}>Views</th>
                          <th style={{ padding: designTokens.spacing[3], textAlign: 'left', color: designTokens.colors.textMuted, fontWeight: designTokens.typography.fontWeight.medium }}>Favs</th>
                          <th style={{ padding: designTokens.spacing[3], textAlign: 'left', color: designTokens.colors.textMuted, fontWeight: designTokens.typography.fontWeight.medium }}>Status</th>
                          <th style={{ padding: designTokens.spacing[3], textAlign: 'center', color: designTokens.colors.textMuted, fontWeight: designTokens.typography.fontWeight.medium }}>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {listings.map((listing) => (
                          <tr
                            key={listing.listing_id}
                            style={{
                              borderBottom: `1px solid ${designTokens.colors.border}`,
                              transition: 'background-color 0.2s'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = designTokens.colors.backgroundAlt}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                          >
                            <td style={{ padding: designTokens.spacing[3] }}>
                              <img
                                src={listing.images[0]?.url_570xN}
                                alt={listing.title}
                                style={{
                                  width: '3rem',
                                  height: '3rem',
                                  borderRadius: designTokens.radius.md,
                                  objectFit: 'cover'
                                }}
                              />
                            </td>
                            <td style={{ padding: designTokens.spacing[3], color: designTokens.colors.text, maxWidth: '300px' }}>
                              <div style={{ 
                                overflow: 'hidden', 
                                textOverflow: 'ellipsis', 
                                whiteSpace: 'nowrap',
                                fontWeight: designTokens.typography.fontWeight.medium
                              }}>
                                {listing.title}
                              </div>
                              <div style={{ 
                                color: designTokens.colors.textMuted, 
                                fontSize: designTokens.typography.fontSize.xs,
                                marginTop: designTokens.spacing[1]
                              }}>
                                {listing.tags.slice(0, 3).join(', ')}
                              </div>
                            </td>
                            <td style={{ padding: designTokens.spacing[3], color: designTokens.colors.text }}>
                              ${listing.price} {listing.currency_code}
                            </td>
                            <td style={{ padding: designTokens.spacing[3], color: designTokens.colors.text }}>
                              {listing.views}
                            </td>
                            <td style={{ padding: designTokens.spacing[3], color: designTokens.colors.text }}>
                              {listing.num_favorers}
                            </td>
                            <td style={{ padding: designTokens.spacing[3] }}>
                              <span style={{
                                padding: `${designTokens.spacing[1]} ${designTokens.spacing[2]}`,
                                borderRadius: designTokens.radius.md,
                                fontSize: designTokens.typography.fontSize.xs,
                                fontWeight: designTokens.typography.fontWeight.medium,
                                backgroundColor: listing.state === 'active' ? `${designTokens.colors.success}20` : `${designTokens.colors.warning}20`,
                                color: listing.state === 'active' ? designTokens.colors.success : designTokens.colors.warning
                              }}>
                                {listing.state}
                              </span>
                            </td>
                            <td style={{ padding: designTokens.spacing[3], textAlign: 'center' }}>
                              <Button
                                variant="primary"
                                size="sm"
                                onClick={() => handleOptimizeListing(listing.listing_id)}
                              >
                                Optimize This
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              )}
            </>
          )}
        </Container>
      </main>
    </div>
  )
}
