'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Container, Input, Button, Alert } from '@/components/ui'
import tokens from '@/design-system/tokens.json'

export default function SignInPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to sign in')
      }

      router.push('/dashboard')
      router.refresh()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: tokens.spacing[4],
      background: tokens.colors.background
    }}>
      <div style={{
        maxWidth: '28rem',
        width: '100%',
        backgroundColor: tokens.card.background,
        borderRadius: tokens.card.radius,
        padding: tokens.spacing[8],
        border: `1px solid ${tokens.card.border}`,
        boxShadow: tokens.shadows.card
      }}>
        <div style={{ textAlign: 'center', marginBottom: tokens.spacing[8] }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: tokens.spacing[6] }}>
            <img src="/logo.png" alt="Elite Listing AI" style={{ height: '3rem', width: 'auto' }} />
          </div>
          <h2 style={{
            fontSize: tokens.typography.fontSize['3xl'],
            fontWeight: tokens.typography.fontWeight.bold,
            color: tokens.colors.text,
            marginBottom: tokens.spacing[2]
          }}>
            Welcome back
          </h2>
          <p style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.textMuted }}>
            Sign in to your Elite Listing AI account
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {error && <Alert variant="danger">{error}</Alert>}

          <Input
            id="email"
            name="email"
            type="email"
            label="Email address"
            placeholder="you@example.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />

          <Input
            id="password"
            name="password"
            type="password"
            label="Password"
            placeholder="Your password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
          />

          <Button type="submit" disabled={loading} fullWidth>
            {loading ? 'Signing in...' : 'Sign in'}
          </Button>

          <div style={{ textAlign: 'center', marginTop: tokens.spacing[6] }}>
            <p style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.textMuted }}>
              Don't have an account?{' '}
              <Link href="/auth/signup" style={{ color: tokens.colors.primary, fontWeight: tokens.typography.fontWeight.medium, textDecoration: 'none' }}>
                Sign up
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}
