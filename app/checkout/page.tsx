'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Container, Button, Card, Alert } from '@/components/ui'
import tokens from '@/design-system/tokens.json'

function CheckoutContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const packageType = searchParams.get('package') || 'starter'
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const packages = {
    starter: { name: 'Starter Pack', credits: 10, price: 990, description: 'Perfect for getting started' },
    pro: { name: 'Pro Pack', credits: 50, price: 3990, description: 'Best value for active sellers' },
    business: { name: 'Business Pack', credits: 200, price: 12990, description: 'For high-volume shops' }
  }

  const selectedPackage = packages[packageType as keyof typeof packages] || packages.starter

  const handleCheckout = async () => {
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          package: packageType,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session')
      }

      // Redirect to Stripe Checkout
      if (data.url) {
        window.location.href = data.url
      }
    } catch (err: any) {
      setError(err.message)
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: tokens.colors.background }}>
      <header style={{
        borderBottom: `1px solid ${tokens.colors.border}`,
        padding: `${tokens.spacing[4]} 0`,
        backgroundColor: tokens.colors.background
      }}>
        <Container>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <img 
              src="/logo.png" 
              alt="Elite Listing AI" 
              style={{ height: '2.5rem', width: 'auto', cursor: 'pointer' }} 
              onClick={() => router.push('/dashboard')} 
            />
            <Button variant="ghost" size="sm" onClick={() => router.push('/dashboard')}>
              Back to Dashboard
            </Button>
          </div>
        </Container>
      </header>

      <main style={{ padding: `${tokens.spacing[12]} 0` }}>
        <Container>
          <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <h1 style={{
              fontSize: tokens.typography.fontSize['3xl'],
              fontWeight: tokens.typography.fontWeight.bold,
              color: tokens.colors.text,
              marginBottom: tokens.spacing[2],
              textAlign: 'center'
            }}>
              Complete Your Purchase
            </h1>
            <p style={{ 
              color: tokens.colors.textMuted,
              fontSize: tokens.typography.fontSize.base,
              textAlign: 'center',
              marginBottom: tokens.spacing[8]
            }}>
              You'll be redirected to Stripe to complete your payment securely
            </p>

            {error && (
              <Alert variant="danger" style={{ marginBottom: tokens.spacing[6] }}>
                {error}
              </Alert>
            )}

            <Card padding="8">
              <div style={{ marginBottom: tokens.spacing[6] }}>
                <h2 style={{
                  fontSize: tokens.typography.fontSize.xl,
                  fontWeight: tokens.typography.fontWeight.semibold,
                  color: tokens.colors.text,
                  marginBottom: tokens.spacing[4]
                }}>
                  {selectedPackage.name}
                </h2>
                <p style={{ color: tokens.colors.textMuted, marginBottom: tokens.spacing[4] }}>
                  {selectedPackage.description}
                </p>

                <div style={{
                  padding: tokens.spacing[4],
                  backgroundColor: tokens.colors.backgroundAlt,
                  borderRadius: tokens.radius.lg,
                  marginBottom: tokens.spacing[4]
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: tokens.spacing[2] }}>
                    <span style={{ color: tokens.colors.textMuted }}>Credits:</span>
                    <span style={{ color: tokens.colors.text, fontWeight: tokens.typography.fontWeight.semibold }}>
                      {selectedPackage.credits}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: tokens.spacing[2] }}>
                    <span style={{ color: tokens.colors.textMuted }}>Price per credit:</span>
                    <span style={{ color: tokens.colors.text }}>
                      ${(selectedPackage.price / 100 / selectedPackage.credits).toFixed(2)}
                    </span>
                  </div>
                  <div style={{ 
                    borderTop: `1px solid ${tokens.colors.border}`,
                    paddingTop: tokens.spacing[2],
                    marginTop: tokens.spacing[2],
                    display: 'flex',
                    justifyContent: 'space-between'
                  }}>
                    <span style={{ 
                      color: tokens.colors.text,
                      fontWeight: tokens.typography.fontWeight.semibold,
                      fontSize: tokens.typography.fontSize.lg
                    }}>
                      Total:
                    </span>
                    <span style={{ 
                      color: tokens.colors.primary,
                      fontWeight: tokens.typography.fontWeight.bold,
                      fontSize: tokens.typography.fontSize['2xl']
                    }}>
                      ${(selectedPackage.price / 100).toFixed(2)}
                    </span>
                  </div>
                </div>

                <div style={{
                  padding: tokens.spacing[4],
                  backgroundColor: `${tokens.colors.primary}15`,
                  borderRadius: tokens.radius.lg,
                  marginBottom: tokens.spacing[6]
                }}>
                  <p style={{ 
                    color: tokens.colors.text,
                    fontSize: tokens.typography.fontSize.sm,
                    marginBottom: tokens.spacing[2]
                  }}>
                    ✅ <strong>Secure Payment</strong> - Processed by Stripe
                  </p>
                  <p style={{ 
                    color: tokens.colors.text,
                    fontSize: tokens.typography.fontSize.sm,
                    marginBottom: tokens.spacing[2]
                  }}>
                    ✅ <strong>Instant Delivery</strong> - Credits added immediately
                  </p>
                  <p style={{ 
                    color: tokens.colors.text,
                    fontSize: tokens.typography.fontSize.sm
                  }}>
                    ✅ <strong>No Expiration</strong> - Use credits anytime
                  </p>
                </div>
              </div>

              <Button 
                variant="primary" 
                size="lg" 
                fullWidth 
                onClick={handleCheckout}
                disabled={loading}
              >
                {loading ? 'Redirecting to Stripe...' : 'Proceed to Payment'}
              </Button>

              <p style={{
                textAlign: 'center',
                color: tokens.colors.textMuted,
                fontSize: tokens.typography.fontSize.xs,
                marginTop: tokens.spacing[4]
              }}>
                By continuing, you agree to our Terms of Service and Privacy Policy
              </p>
            </Card>

            <div style={{ textAlign: 'center', marginTop: tokens.spacing[6] }}>
              <Button variant="ghost" onClick={() => router.push('/dashboard')}>
                ← Back to Dashboard
              </Button>
            </div>
          </div>
        </Container>
      </main>
    </div>
  )
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CheckoutContent />
    </Suspense>
  )
}
