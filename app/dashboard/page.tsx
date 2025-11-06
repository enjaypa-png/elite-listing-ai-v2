'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Container, Button, Card, Alert, Footer } from '@/components/ui'
import { HealthPanel } from '@/components/HealthPanel'
import tokens from '@/design-system/tokens.json'

interface CreditTransaction {
  id: string
  amount: number
  balanceAfter: number
  type: string
  description: string
  createdAt: string
}

interface OptimizationHistory {
  id: string
  type: string
  status: string
  createdAt: string
  completedAt: string | null
  result: any
  variants: Array<{
    id: string
    variantNumber: number
    title: string | null
    description: string | null
    score: number | null
  }>
}

function DashboardContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [user, setUser] = useState<any>(null)
  const [credits, setCredits] = useState<{
    balance: number
    stats: any
    recentTransactions: CreditTransaction[]
  } | null>(null)
  const [optimizations, setOptimizations] = useState<OptimizationHistory[]>([])
  const [loadingOptimizations, setLoadingOptimizations] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    fetchData()
    
    // Check for payment success
    const paymentStatus = searchParams.get('payment')
    if (paymentStatus === 'success') {
      setSuccess('Payment successful! Your credits have been added.')
      // Remove query param
      router.replace('/dashboard')
      // Refresh credits after 2 seconds
      setTimeout(fetchData, 2000)
    } else if (paymentStatus === 'cancelled') {
      setError('Payment was cancelled.')
      router.replace('/dashboard')
    }
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      // Fetch profile
      const profileRes = await fetch('/api/user/profile')
      const profileData = await profileRes.json()
      if (!profileRes.ok) throw new Error(profileData.error)
      setUser(profileData.user)

      // Fetch credits
      const creditsRes = await fetch('/api/user/credits')
      const creditsData = await creditsRes.json()
      if (!creditsRes.ok) throw new Error(creditsData.error)
      setCredits(creditsData)
      
      // Fetch optimization history
      await fetchOptimizations()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }
  
  const fetchOptimizations = async () => {
    setLoadingOptimizations(true)
    try {
      const res = await fetch('/api/optimizations?limit=5')
      const data = await res.json()
      if (res.ok) {
        setOptimizations(data.optimizations || [])
      }
    } catch (err) {
      console.error('Failed to fetch optimizations:', err)
    } finally {
      setLoadingOptimizations(false)
    }
  }

  const handleBuyCredits = (packageType: 'starter' | 'pro' | 'business') => {
    router.push(`/checkout?package=${packageType}`)
  }

  const handleSignOut = async () => {
    try {
      await fetch('/api/auth/signout', { method: 'POST' })
      router.push('/auth/signin')
    } catch (err) {
      console.error('Sign out error:', err)
    }
  }

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: tokens.colors.background
      }}>
        <div style={{
          width: '3rem',
          height: '3rem',
          border: `3px solid ${tokens.colors.border}`,
          borderTop: `3px solid ${tokens.colors.primary}`,
          borderRadius: tokens.radius.full,
          animation: 'spin 1s linear infinite'
        }}></div>
        <style jsx>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    )
  }

  if (error && !user) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: tokens.colors.background
      }}>
        <Container>
          <div style={{ textAlign: 'center', maxWidth: '500px', margin: '0 auto' }}>
            <Alert variant="danger" style={{ marginBottom: tokens.spacing[4] }}>
              {error || 'Failed to load profile'}
            </Alert>
            <Button variant="primary" href="/auth/signin">Back to Sign In</Button>
          </div>
        </Container>
      </div>
    )
  }

  const balance = credits?.balance || 0
  const isLowCredits = balance < 5
  const hasNoCredits = balance === 0

  return (
    <>
      <header style={{
        borderBottom: `1px solid ${tokens.colors.border}`,
        padding: `${tokens.spacing[4]} 0`,
        backgroundColor: tokens.colors.background
      }}>
        <Container>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <img src="/logo.png" alt="Elite Listing AI" style={{ height: '2.5rem', width: 'auto' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[4] }}>
              <span style={{ 
                color: tokens.colors.textMuted,
                fontSize: tokens.typography.fontSize.sm
              }}>
                {user?.email}
              </span>
              <Button variant="ghost" size="sm" onClick={handleSignOut}>
                Sign Out
              </Button>
            </div>
          </div>
        </Container>
      </header>

      <main style={{ 
        padding: `${tokens.spacing[8]} 0`,
        minHeight: 'calc(100vh - 200px)',
        backgroundColor: tokens.colors.background
      }}>
        <Container>
          {success && (
            <Alert variant="success" style={{ marginBottom: tokens.spacing[6] }}>
              {success}
            </Alert>
          )}

          {error && (
            <Alert variant="danger" style={{ marginBottom: tokens.spacing[6] }}>
              {error}
            </Alert>
          )}

          <div style={{ marginBottom: tokens.spacing[8] }}>
            <h2 style={{
              fontSize: tokens.typography.fontSize['3xl'],
              fontWeight: tokens.typography.fontWeight.bold,
              color: tokens.colors.text,
              marginBottom: tokens.spacing[2]
            }}>
              Welcome back, {user?.name}
            </h2>
            <p style={{ 
              color: tokens.colors.textMuted,
              fontSize: tokens.typography.fontSize.base
            }}>
              Manage your listings and optimizations
            </p>
          </div>

          {(hasNoCredits || isLowCredits) && (
            <Alert variant={hasNoCredits ? "danger" : "warning"} style={{ marginBottom: tokens.spacing[6] }}>
              <strong>{hasNoCredits ? '⚠️ No Credits' : '⚡ Low Credits'}:</strong> 
              {hasNoCredits 
                ? ' You need credits to optimize listings. Purchase a package below to get started.'
                : ` You have ${balance} ${balance === 1 ? 'credit' : 'credits'} remaining. Consider purchasing more credits.`
              }
            </Alert>
          )}

          {/* Your AI Tools - Moved to Top */}
          <Card padding="8" style={{ marginBottom: tokens.spacing[8] }}>
            <h3 style={{
              fontSize: tokens.typography.fontSize['2xl'],
              fontWeight: tokens.typography.fontWeight.semibold,
              color: tokens.colors.text,
              marginBottom: tokens.spacing[6]
            }}>
              Your AI Tools
            </h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: tokens.spacing[4]
            }}>
              <Button 
                variant="primary" 
                size="lg" 
                href="/analyze"
                disabled={hasNoCredits}
              >
                Optimize Listing
              </Button>
              <Button 
                variant="secondary" 
                size="lg"
                href="/analyze"
                disabled={hasNoCredits}
              >
                Analyze Images
              </Button>
              <Button 
                variant="secondary" 
                size="lg"
                href="/analyze"
                disabled={hasNoCredits}
              >
                Generate Keywords
              </Button>
              <Button 
                variant="secondary" 
                size="lg"
                href="/analyze"
                disabled={hasNoCredits}
              >
                SEO Audit
              </Button>
            </div>
          </Card>

          {/* Health Panel */}
          <HealthPanel />

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: tokens.spacing[6],
            marginBottom: tokens.spacing[8]
          }}>
            <Card padding="6" hover>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <p style={{
                    fontSize: tokens.typography.fontSize.sm,
                    fontWeight: tokens.typography.fontWeight.medium,
                    color: tokens.colors.textMuted,
                    marginBottom: tokens.spacing[2]
                  }}>
                    Available Credits
                  </p>
                  <p style={{
                    fontSize: tokens.typography.fontSize['3xl'],
                    fontWeight: tokens.typography.fontWeight.bold,
                    color: balance === 0 ? tokens.colors.danger : tokens.colors.primary
                  }}>
                    {balance}
                  </p>
                </div>
                <div style={{
                  width: '3rem',
                  height: '3rem',
                  borderRadius: tokens.radius.full,
                  backgroundColor: `${tokens.colors.primary}15`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <svg style={{ width: '1.5rem', height: '1.5rem', color: tokens.colors.primary }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                </div>
              </div>
              <p style={{
                fontSize: tokens.typography.fontSize.xs,
                color: tokens.colors.textMuted,
                marginTop: tokens.spacing[2]
              }}>
                1 credit = 1 optimization
              </p>
            </Card>

            <Card padding="6" hover>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <p style={{
                    fontSize: tokens.typography.fontSize.sm,
                    fontWeight: tokens.typography.fontWeight.medium,
                    color: tokens.colors.textMuted,
                    marginBottom: tokens.spacing[2]
                  }}>
                    Optimizations
                  </p>
                  <p style={{
                    fontSize: tokens.typography.fontSize['3xl'],
                    fontWeight: tokens.typography.fontWeight.bold,
                    color: tokens.colors.text
                  }}>
                    {credits?.stats?.totalUsed || 0}
                  </p>
                </div>
                <div style={{
                  width: '3rem',
                  height: '3rem',
                  borderRadius: tokens.radius.full,
                  backgroundColor: `${tokens.colors.success}15`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <svg style={{ width: '1.5rem', height: '1.5rem', color: tokens.colors.success }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/>
                  </svg>
                </div>
              </div>
              <p style={{
                fontSize: tokens.typography.fontSize.xs,
                color: tokens.colors.textMuted,
                marginTop: tokens.spacing[2]
              }}>
                Total listings optimized
              </p>
            </Card>

            <Card padding="6" hover>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <p style={{
                    fontSize: tokens.typography.fontSize.sm,
                    fontWeight: tokens.typography.fontWeight.medium,
                    color: tokens.colors.textMuted,
                    marginBottom: tokens.spacing[2]
                  }}>
                    Total Purchased
                  </p>
                  <p style={{
                    fontSize: tokens.typography.fontSize['3xl'],
                    fontWeight: tokens.typography.fontWeight.bold,
                    color: tokens.colors.text
                  }}>
                    {credits?.stats?.totalPurchased || 0}
                  </p>
                </div>
                <div style={{
                  width: '3rem',
                  height: '3rem',
                  borderRadius: tokens.radius.full,
                  backgroundColor: `${tokens.colors.success}15`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <svg style={{ width: '1.5rem', height: '1.5rem', color: tokens.colors.success }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>
                  </svg>
                </div>
              </div>
              <p style={{
                fontSize: tokens.typography.fontSize.xs,
                color: tokens.colors.textMuted,
                marginTop: tokens.spacing[2]
              }}>
                Lifetime credits bought
              </p>
            </Card>
          </div>

          <Card padding="8" style={{ marginBottom: tokens.spacing[6] }}>
            <h3 style={{
              fontSize: tokens.typography.fontSize['2xl'],
              fontWeight: tokens.typography.fontWeight.semibold,
              color: tokens.colors.text,
              marginBottom: tokens.spacing[6]
            }}>
              Buy Credits
            </h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: tokens.spacing[4]
            }}>
              <Card padding="6" hover style={{ cursor: 'pointer' }} onClick={() => handleBuyCredits('starter')}>
                <h4 style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.text, marginBottom: tokens.spacing[2] }}>
                  Starter
                </h4>
                <p style={{ fontSize: tokens.typography.fontSize['3xl'], fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.primary, marginBottom: tokens.spacing[2] }}>
                  10 Credits
                </p>
                <p style={{ fontSize: tokens.typography.fontSize.xl, color: tokens.colors.text, marginBottom: tokens.spacing[3] }}>
                  $9.00
                </p>
                <Button variant="secondary" size="sm" fullWidth>
                  Purchase
                </Button>
              </Card>

              <Card padding="6" hover style={{ cursor: 'pointer', border: `2px solid ${tokens.colors.primary}` }} onClick={() => handleBuyCredits('pro')}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: tokens.spacing[2] }}>
                  <h4 style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.text }}>
                    Pro
                  </h4>
                  <span style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.bold, backgroundColor: `${tokens.colors.primary}20`, color: tokens.colors.primary, padding: `${tokens.spacing[1]} ${tokens.spacing[2]}`, borderRadius: tokens.radius.md }}>
                    BEST VALUE
                  </span>
                </div>
                <p style={{ fontSize: tokens.typography.fontSize['3xl'], fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.primary, marginBottom: tokens.spacing[2] }}>
                  50 Credits
                </p>
                <p style={{ fontSize: tokens.typography.fontSize.xl, color: tokens.colors.text, marginBottom: tokens.spacing[3] }}>
                  $39.00
                </p>
                <Button variant="primary" size="sm" fullWidth>
                  Purchase
                </Button>
              </Card>

              <Card padding="6" hover style={{ cursor: 'pointer' }} onClick={() => handleBuyCredits('business')}>
                <h4 style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.text, marginBottom: tokens.spacing[2] }}>
                  Business
                </h4>
                <p style={{ fontSize: tokens.typography.fontSize['3xl'], fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.primary, marginBottom: tokens.spacing[2] }}>
                  200 Credits
                </p>
                <p style={{ fontSize: tokens.typography.fontSize.xl, color: tokens.colors.text, marginBottom: tokens.spacing[3] }}>
                  $129.00
                </p>
                <Button variant="secondary" size="sm" fullWidth>
                  Purchase
                </Button>
              </Card>
            </div>
          </Card>

          {credits?.recentTransactions && credits.recentTransactions.length > 0 && (
            <Card padding="8" style={{ marginBottom: tokens.spacing[6] }}>
              <h3 style={{
                fontSize: tokens.typography.fontSize['2xl'],
                fontWeight: tokens.typography.fontWeight.semibold,
                color: tokens.colors.text,
                marginBottom: tokens.spacing[6]
              }}>
                Recent Transactions (Last 10)
              </h3>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: tokens.typography.fontSize.sm }}>
                  <thead>
                    <tr style={{ borderBottom: `2px solid ${tokens.colors.border}` }}>
                      <th style={{ padding: tokens.spacing[3], textAlign: 'left', color: tokens.colors.textMuted, fontWeight: tokens.typography.fontWeight.medium }}>Date</th>
                      <th style={{ padding: tokens.spacing[3], textAlign: 'left', color: tokens.colors.textMuted, fontWeight: tokens.typography.fontWeight.medium }}>Type</th>
                      <th style={{ padding: tokens.spacing[3], textAlign: 'left', color: tokens.colors.textMuted, fontWeight: tokens.typography.fontWeight.medium }}>Description</th>
                      <th style={{ padding: tokens.spacing[3], textAlign: 'right', color: tokens.colors.textMuted, fontWeight: tokens.typography.fontWeight.medium }}>Amount</th>
                      <th style={{ padding: tokens.spacing[3], textAlign: 'right', color: tokens.colors.textMuted, fontWeight: tokens.typography.fontWeight.medium }}>Balance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {credits.recentTransactions.map((txn) => (
                      <tr key={txn.id} style={{ borderBottom: `1px solid ${tokens.colors.border}` }}>
                        <td style={{ padding: tokens.spacing[3], color: tokens.colors.textMuted }}>
                          {new Date(txn.createdAt).toLocaleDateString()}
                        </td>
                        <td style={{ padding: tokens.spacing[3] }}>
                          <span style={{
                            padding: `${tokens.spacing[1]} ${tokens.spacing[2]}`,
                            borderRadius: tokens.radius.md,
                            fontSize: tokens.typography.fontSize.xs,
                            fontWeight: tokens.typography.fontWeight.medium,
                            backgroundColor: 
                              txn.type === 'purchase' ? `${tokens.colors.success}20` :
                              txn.type === 'usage' ? `${tokens.colors.primary}20` :
                              txn.type === 'refund' ? `${tokens.colors.danger}20` :
                              `${tokens.colors.warning}20`,
                            color: 
                              txn.type === 'purchase' ? tokens.colors.success :
                              txn.type === 'usage' ? tokens.colors.primary :
                              txn.type === 'refund' ? tokens.colors.danger :
                              tokens.colors.warning
                          }}>
                            {txn.type}
                          </span>
                        </td>
                        <td style={{ padding: tokens.spacing[3], color: tokens.colors.text }}>
                          {txn.description}
                        </td>
                        <td style={{ 
                          padding: tokens.spacing[3], 
                          textAlign: 'right',
                          color: txn.amount > 0 ? tokens.colors.success : tokens.colors.danger,
                          fontWeight: tokens.typography.fontWeight.medium
                        }}>
                          {txn.amount > 0 ? '+' : ''}{txn.amount}
                        </td>
                        <td style={{ 
                          padding: tokens.spacing[3], 
                          textAlign: 'right',
                          color: tokens.colors.text,
                          fontWeight: tokens.typography.fontWeight.medium
                        }}>
                          {txn.balanceAfter}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {/* Optimization History */}
          <Card padding="8" style={{ marginBottom: tokens.spacing[6] }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: tokens.spacing[6] }}>
              <h3 style={{
                fontSize: tokens.typography.fontSize['2xl'],
                fontWeight: tokens.typography.fontWeight.semibold,
                color: tokens.colors.text
              }}>
                Recent Optimizations
              </h3>
              {loadingOptimizations && (
                <span style={{ color: tokens.colors.textMuted, fontSize: tokens.typography.fontSize.sm }}>
                  Loading...
                </span>
              )}
            </div>
            
            {optimizations.length === 0 ? (
              <div style={{
                padding: `${tokens.spacing[8]} ${tokens.spacing[4]}`,
                textAlign: 'center',
                color: tokens.colors.textMuted
              }}>
                <p style={{ marginBottom: tokens.spacing[4] }}>
                  No optimizations yet. Start by clicking "Optimize Listing" below!
                </p>
                <Button variant="primary" size="sm" href="/analyze">
                  Create First Optimization
                </Button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[4] }}>
                {optimizations.map((opt) => (
                  <Card key={opt.id} padding="5" style={{ borderLeft: `4px solid ${opt.status === 'completed' ? tokens.colors.success : opt.status === 'failed' ? tokens.colors.danger : tokens.colors.warning}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: tokens.spacing[3] }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2], marginBottom: tokens.spacing[2] }}>
                          <span style={{
                            padding: `${tokens.spacing[1]} ${tokens.spacing[2]}`,
                            borderRadius: tokens.radius.md,
                            fontSize: tokens.typography.fontSize.xs,
                            fontWeight: tokens.typography.fontWeight.medium,
                            backgroundColor: opt.status === 'completed' ? `${tokens.colors.success}20` : `${tokens.colors.warning}20`,
                            color: opt.status === 'completed' ? tokens.colors.success : tokens.colors.warning
                          }}>
                            {opt.status}
                          </span>
                          <span style={{
                            fontSize: tokens.typography.fontSize.xs,
                            color: tokens.colors.textMuted
                          }}>
                            {new Date(opt.createdAt).toLocaleString()}
                          </span>
                        </div>
                        {opt.result?.healthScore && (
                          <p style={{
                            fontSize: tokens.typography.fontSize.sm,
                            color: tokens.colors.text,
                            marginBottom: tokens.spacing[1]
                          }}>
                            Health Score: <strong style={{ color: tokens.colors.primary }}>{opt.result.healthScore}/100</strong>
                          </p>
                        )}
                      </div>
                      <Button variant="ghost" size="sm" href={`/analyze?optimizationId=${opt.id}`}>
                        View Details
                      </Button>
                    </div>
                    
                    {opt.variants && opt.variants.length > 0 && (
                      <div style={{
                        backgroundColor: tokens.colors.backgroundAlt,
                        borderRadius: tokens.radius.md,
                        padding: tokens.spacing[3]
                      }}>
                        <p style={{
                          fontSize: tokens.typography.fontSize.xs,
                          fontWeight: tokens.typography.fontWeight.medium,
                          color: tokens.colors.textMuted,
                          marginBottom: tokens.spacing[2]
                        }}>
                          Generated {opt.variants.length} variants
                        </p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[2] }}>
                          {opt.variants.slice(0, 2).map((variant) => (
                            <div key={variant.id} style={{
                              fontSize: tokens.typography.fontSize.sm,
                              color: tokens.colors.text
                            }}>
                              <strong style={{ color: tokens.colors.primary }}>Variant {variant.variantNumber}:</strong> {variant.title?.substring(0, 80)}...
                              {variant.score && (
                                <span style={{
                                  marginLeft: tokens.spacing[2],
                                  fontSize: tokens.typography.fontSize.xs,
                                  color: tokens.colors.textMuted
                                }}>
                                  (Score: {variant.score}/100)
                                </span>
                              )}
                            </div>
                          ))}
                          {opt.variants.length > 2 && (
                            <p style={{
                              fontSize: tokens.typography.fontSize.xs,
                              color: tokens.colors.textMuted,
                              fontStyle: 'italic'
                            }}>
                              +{opt.variants.length - 2} more variant{opt.variants.length - 2 > 1 ? 's' : ''}
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </Card>
                ))}
                
                {optimizations.length >= 5 && (
                  <Button variant="ghost" size="sm" onClick={fetchOptimizations}>
                    Load More
                  </Button>
                )}
              </div>
            )}
          </Card>

          <Card padding="8" style={{ marginBottom: tokens.spacing[6] }}>
            <h3 style={{
              fontSize: tokens.typography.fontSize['2xl'],
              fontWeight: tokens.typography.fontWeight.semibold,
              color: tokens.colors.text,
              marginBottom: tokens.spacing[6]
            }}>
              Integrations
            </h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: tokens.spacing[4]
            }}>
              <Button variant="primary" size="lg" href="/etsy">
                🛍️ Connect Etsy Shop
              </Button>
            </div>
          </Card>
        </Container>
      </main>

      <Footer />
    </>
  )
}

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#0B0F14'
      }}>
        <div style={{
          width: '3rem',
          height: '3rem',
          border: '3px solid #2A3441',
          borderTop: '3px solid #00B3FF',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        <style jsx>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  )
}
