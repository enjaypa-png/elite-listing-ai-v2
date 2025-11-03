'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Container, Button, Card, Alert } from '@/components/ui'
import tokens from '@/design-system/tokens.json'

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/user/profile')
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch profile')
      }

      setUser(data.user)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    try {
      await fetch('/api/auth/signout', { method: 'POST' })
      router.push('/auth/signin')
      router.refresh()
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
        justifyContent: 'center'
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

  if (error || !user) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ textAlign: 'center' }}>
          <Alert variant="danger">{error || 'Failed to load profile'}</Alert>
          <Button href="/auth/signin">Back to Sign In</Button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh' }}>
      <header style={{
        borderBottom: `1px solid ${tokens.colors.border}`,
        padding: `${tokens.spacing[4]} 0`
      }}>
        <Container>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <Link href="/">
              <img src="/logo.png" alt="Elite Listing AI" style={{ height: '2.5rem', width: 'auto' }} />
            </Link>
            <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[4] }}>
              <span style={{ color: tokens.colors.textMuted }}>{user.email}</span>
              <Button variant="ghost" onClick={handleSignOut}>
                Sign Out
              </Button>
            </div>
          </div>
        </Container>
      </header>

      <main style={{ padding: `${tokens.spacing[8]} 0` }}>
        <Container>
          <div style={{ marginBottom: tokens.spacing[8] }}>
            <h2 style={{
              fontSize: tokens.typography.fontSize['3xl'],
              fontWeight: tokens.typography.fontWeight.bold,
              color: tokens.colors.text,
              marginBottom: tokens.spacing[2]
            }}>
              Welcome back, {user.name}
            </h2>
            <p style={{ color: tokens.colors.textMuted }}>
              Manage your listings and optimizations
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: tokens.spacing[6],
            marginBottom: tokens.spacing[8]
          }}>
            <Card padding="6">
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
                    color: tokens.colors.primary
                  }}>
                    {user.credits}
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

            <Card padding="6">
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
                    0
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

            <Card padding="6">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <p style={{
                    fontSize: tokens.typography.fontSize.sm,
                    fontWeight: tokens.typography.fontWeight.medium,
                    color: tokens.colors.textMuted,
                    marginBottom: tokens.spacing[2]
                  }}>
                    Account Status
                  </p>
                  <p style={{
                    fontSize: tokens.typography.fontSize.xl,
                    fontWeight: tokens.typography.fontWeight.semibold,
                    color: tokens.colors.success
                  }}>
                    Active
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
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                </div>
              </div>
              <p style={{
                fontSize: tokens.typography.fontSize.xs,
                color: tokens.colors.textMuted,
                marginTop: tokens.spacing[2]
              }}>
                Member since {new Date(user.createdAt).toLocaleDateString()}
              </p>
            </Card>
          </div>

          <Card padding="8">
            <h3 style={{
              fontSize: tokens.typography.fontSize['2xl'],
              fontWeight: tokens.typography.fontWeight.semibold,
              color: tokens.colors.text,
              marginBottom: tokens.spacing[6]
            }}>
              Quick Actions
            </h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: tokens.spacing[4]
            }}>
              <Button variant="primary" size="lg" href="/analyze">
                Optimize Listing
              </Button>
              <Button variant="secondary" size="lg" disabled>
                Analyze Images
              </Button>
              <Button variant="secondary" size="lg" disabled>
                Generate Keywords
              </Button>
              <Button variant="secondary" size="lg" disabled>
                SEO Audit
              </Button>
            </div>
          </Card>
        </Container>
      </main>
    </div>
  )
}
