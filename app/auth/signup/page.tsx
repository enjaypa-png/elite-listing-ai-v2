'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function SignUpPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create account')
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
      padding: '1rem',
      backgroundColor: '#0f1419',
      fontFamily: "'Inter', sans-serif"
    }}>
      <div style={{
        maxWidth: '28rem',
        width: '100%',
        backgroundColor: '#1a2332',
        borderRadius: '1rem',
        padding: '2rem',
        border: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
            <img src="/logo.png" alt="Elite Listing AI" style={{ height: '3rem', width: 'auto' }} />
          </div>
          <h2 style={{ 
            fontSize: '1.875rem', 
            fontWeight: '700', 
            color: '#f8f9fa',
            marginBottom: '0.5rem'
          }}>
            Create your account
          </h2>
          <p style={{ fontSize: '0.875rem', color: '#a6acb5' }}>
            Get 10 free credits to start optimizing
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {error && (
            <div style={{
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              borderLeft: '4px solid #EF4444',
              borderRadius: '0.375rem',
              padding: '1rem',
              marginBottom: '1.5rem'
            }}>
              <p style={{ fontSize: '0.875rem', color: '#EF4444' }}>{error}</p>
            </div>
          )}

          <div style={{ marginBottom: '1.5rem' }}>
            <label htmlFor="name" style={{ 
              display: 'block', 
              fontSize: '0.875rem', 
              fontWeight: '500',
              color: '#f8f9fa',
              marginBottom: '0.5rem'
            }}>
              Full name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              style={{
                width: '100%',
                padding: '0.75rem',
                backgroundColor: '#0f1419',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '0.5rem',
                color: '#f8f9fa',
                fontSize: '0.875rem',
                outline: 'none',
                transition: 'all 0.2s'
              }}
              placeholder="John Doe"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              onFocus={(e) => e.target.style.borderColor = '#00B3FF'}
              onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'}
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label htmlFor="email" style={{ 
              display: 'block', 
              fontSize: '0.875rem', 
              fontWeight: '500',
              color: '#f8f9fa',
              marginBottom: '0.5rem'
            }}>
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              style={{
                width: '100%',
                padding: '0.75rem',
                backgroundColor: '#0f1419',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '0.5rem',
                color: '#f8f9fa',
                fontSize: '0.875rem',
                outline: 'none',
                transition: 'all 0.2s'
              }}
              placeholder="you@example.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              onFocus={(e) => e.target.style.borderColor = '#00B3FF'}
              onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'}
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label htmlFor="password" style={{ 
              display: 'block', 
              fontSize: '0.875rem', 
              fontWeight: '500',
              color: '#f8f9fa',
              marginBottom: '0.5rem'
            }}>
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              style={{
                width: '100%',
                padding: '0.75rem',
                backgroundColor: '#0f1419',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '0.5rem',
                color: '#f8f9fa',
                fontSize: '0.875rem',
                outline: 'none',
                transition: 'all 0.2s'
              }}
              placeholder="At least 8 characters"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              onFocus={(e) => e.target.style.borderColor = '#00B3FF'}
              onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '0.875rem',
              backgroundColor: loading ? '#a6acb5' : '#00B3FF',
              color: loading ? '#f8f9fa' : '#1a1a2e',
              border: 'none',
              borderRadius: '0.75rem',
              fontWeight: '600',
              fontSize: '1rem',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s',
              marginBottom: '1.5rem'
            }}
            onMouseEnter={(e) => !loading && (e.currentTarget.style.backgroundColor = '#0095d9')}
            onMouseLeave={(e) => !loading && (e.currentTarget.style.backgroundColor = '#00B3FF')}
          >
            {loading ? 'Creating account...' : 'Create account'}
          </button>

          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '0.875rem', color: '#a6acb5' }}>
              Already have an account?{' '}
              <Link href="/auth/signin" style={{ color: '#00B3FF', fontWeight: '500', textDecoration: 'none' }}>
                Sign in
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}
