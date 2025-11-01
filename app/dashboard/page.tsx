'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Logo } from '@/components/Logo'

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [purchasing, setPurchasing] = useState(false)

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/user/profile')
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error)
      }

      setUser(data.user)
    } catch (err: any) {
      setError(err.message)
      if (err.message?.includes('Not authenticated')) {
        router.push('/auth/signin')
      }
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

  const handleBuyCredits = async (packageType: string) => {
    try {
      setPurchasing(true)
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ package: packageType }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout')
      }

      // Redirect to Stripe checkout
      if (data.url) {
        window.location.href = data.url
      }
    } catch (err: any) {
      console.error('Checkout error:', err)
      setError(err.message || 'Failed to start checkout')
    } finally {
      setPurchasing(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: 'var(--primary)' }}></div>
      </div>
    )
  }

  if (error || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
        <div className="text-center">
          <p className="mb-4" style={{ color: 'var(--danger)' }}>{error || 'Failed to load profile'}</p>
          <Link href="/auth/signin" style={{ color: 'var(--primary)' }}>
            Go to Sign In
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      {/* Header */}
      <header className="border-b" style={{ borderColor: 'var(--border)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <Logo variant="full" size="md" href="/dashboard" />
            <div className="flex items-center gap-4">
              <span style={{ color: 'var(--muted)' }}>{user.email}</span>
              <button
                onClick={handleSignOut}
                className="px-4 py-2 rounded-lg transition-colors font-medium hover:bg-[var(--surface-2)]"
                style={{ background: 'var(--surface)', color: 'var(--text)' }}
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2" style={{ color: 'var(--text)' }}>
            Welcome back, {user.name}!
          </h2>
          <p style={{ color: 'var(--muted)' }}>Ready to optimize your Etsy listings with AI?</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="rounded-lg p-6 border" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium" style={{ color: 'var(--muted)' }}>Available Credits</p>
                <p className="text-3xl font-bold mt-2" style={{ color: 'var(--primary)' }}>{user.credits}</p>
              </div>
              <div className="rounded-full p-3" style={{ background: 'rgba(0, 179, 255, 0.2)' }}>
                <svg className="w-6 h-6" style={{ color: 'var(--primary)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <p className="text-xs mt-2" style={{ color: 'var(--muted)' }}>1 credit = 1 optimization</p>
          </div>

          <div className="rounded-lg p-6 border" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium" style={{ color: 'var(--muted)' }}>Optimizations</p>
                <p className="text-3xl font-bold mt-2" style={{ color: 'var(--text)' }}>0</p>
              </div>
              <div className="rounded-full p-3" style={{ background: 'rgba(34, 197, 94, 0.2)' }}>
                <svg className="w-6 h-6" style={{ color: 'var(--success)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <p className="text-xs mt-2" style={{ color: 'var(--muted)' }}>Total listings optimized</p>
          </div>

          <div className="rounded-lg p-6 border" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium" style={{ color: 'var(--muted)' }}>Account Status</p>
                <p className="text-lg font-semibold mt-2" style={{ color: 'var(--text)' }}>
                  {user.emailVerified ? '✅ Verified' : '⏳ Pending'}
                </p>
              </div>
              <div className="rounded-full p-3" style={{ background: 'rgba(22, 224, 255, 0.2)' }}>
                <svg className="w-6 h-6" style={{ color: 'var(--accent)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            </div>
            <p className="text-xs mt-2" style={{ color: 'var(--muted)' }}>Email: {user.email}</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="rounded-lg p-6 border mb-6" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
          <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text)' }}>Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link
              href="/analyze"
              className="flex items-center p-4 border-2 rounded-lg hover:border-[var(--primary)] hover:bg-[var(--surface)] transition-all"
              style={{ borderColor: 'var(--border)', background: 'var(--surface-2)' }}
            >
              <div className="rounded-lg p-3" style={{ background: 'rgba(0, 179, 255, 0.2)' }}>
                <svg className="w-6 h-6" style={{ color: 'var(--primary)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="font-medium" style={{ color: 'var(--text)' }}>Optimize Listing</p>
                <p className="text-sm" style={{ color: 'var(--muted)' }}>Generate AI variants</p>
              </div>
            </Link>

            <div className="flex items-center p-4 border rounded-lg opacity-50 cursor-not-allowed" style={{ borderColor: 'var(--border)', background: 'var(--surface-2)' }}>
              <div className="rounded-lg p-3" style={{ background: 'rgba(169, 180, 194, 0.2)' }}>
                <svg className="w-6 h-6" style={{ color: 'var(--muted)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="font-medium" style={{ color: 'var(--muted)' }}>Analyze Images</p>
                <p className="text-sm" style={{ color: 'var(--muted)' }}>Coming soon</p>
              </div>
            </div>

            <div className="flex items-center p-4 border rounded-lg opacity-50 cursor-not-allowed" style={{ borderColor: 'var(--border)', background: 'var(--surface-2)' }}>
              <div className="rounded-lg p-3" style={{ background: 'rgba(169, 180, 194, 0.2)' }}>
                <svg className="w-6 h-6" style={{ color: 'var(--muted)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="font-medium" style={{ color: 'var(--muted)' }}>Connect Etsy</p>
                <p className="text-sm" style={{ color: 'var(--muted)' }}>Coming soon</p>
              </div>
            </div>
          </div>
        </div>

        {/* Need More Credits */}
        {user.credits < 5 && (
          <div className="rounded p-4 border-l-4" style={{ background: 'rgba(239, 68, 68, 0.1)', borderLeftColor: 'var(--danger)' }}>
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5" style={{ color: 'var(--danger)' }} viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm" style={{ color: 'var(--text)' }}>
                  <strong>Running low on credits!</strong> You have {user.credits} credits remaining. 
                  <button 
                    onClick={() => handleBuyCredits('starter')}
                    disabled={purchasing}
                    className="underline ml-1 font-medium hover:opacity-80 transition-opacity disabled:opacity-50 disabled:cursor-wait" 
                    style={{ color: 'var(--primary)' }}
                  >
                    {purchasing ? 'Processing...' : 'Buy more credits'}
                  </button>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Credit Packages */}
        <div className="mt-6 rounded-lg p-6 border" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
          <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text)' }}>Credit Packages</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Starter Package */}
            <div className="border rounded-lg p-4 hover:border-[var(--primary)] transition-colors" style={{ borderColor: 'var(--border)', background: 'var(--surface-2)' }}>
              <h4 className="text-lg font-bold mb-2" style={{ color: 'var(--text)' }}>Starter</h4>
              <p className="text-3xl font-bold mb-1" style={{ color: 'var(--primary)' }}>$9</p>
              <p className="text-sm mb-4" style={{ color: 'var(--muted)' }}>10 credits</p>
              <button
                onClick={() => handleBuyCredits('starter')}
                disabled={purchasing}
                className="w-full px-4 py-2 rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-wait hover:bg-[var(--primary-700)]"
                style={{ background: 'var(--primary)', color: 'white' }}
              >
                {purchasing ? 'Processing...' : 'Purchase'}
              </button>
            </div>

            {/* Pro Package */}
            <div className="border-2 rounded-lg p-4 relative" style={{ borderColor: 'var(--primary)', background: 'var(--surface-2)' }}>
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 px-3 py-1 rounded-full text-xs font-bold" style={{ background: 'var(--primary)', color: 'white' }}>
                SAVE 13%
              </div>
              <h4 className="text-lg font-bold mb-2" style={{ color: 'var(--text)' }}>Pro</h4>
              <p className="text-3xl font-bold mb-1" style={{ color: 'var(--primary)' }}>$39</p>
              <p className="text-sm mb-4" style={{ color: 'var(--muted)' }}>50 credits</p>
              <button
                onClick={() => handleBuyCredits('pro')}
                disabled={purchasing}
                className="w-full px-4 py-2 rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-wait hover:bg-[var(--primary-700)]"
                style={{ background: 'var(--primary)', color: 'white' }}
              >
                {purchasing ? 'Processing...' : 'Purchase'}
              </button>
            </div>

            {/* Business Package */}
            <div className="border rounded-lg p-4 hover:border-[var(--primary)] transition-colors" style={{ borderColor: 'var(--border)', background: 'var(--surface-2)' }}>
              <div className="text-xs font-bold mb-2" style={{ color: 'var(--success)' }}>SAVE 19%</div>
              <h4 className="text-lg font-bold mb-2" style={{ color: 'var(--text)' }}>Business</h4>
              <p className="text-3xl font-bold mb-1" style={{ color: 'var(--primary)' }}>$129</p>
              <p className="text-sm mb-4" style={{ color: 'var(--muted)' }}>200 credits</p>
              <button
                onClick={() => handleBuyCredits('business')}
                disabled={purchasing}
                className="w-full px-4 py-2 rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-wait hover:bg-[var(--primary-700)]"
                style={{ background: 'var(--primary)', color: 'white' }}
              >
                {purchasing ? 'Processing...' : 'Purchase'}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
