'use client'

import { useState, useEffect } from 'react'
import { Card, Button, Alert } from '@/components/ui'
import tokens from '@/design-system/tokens.json'

interface HealthData {
  authenticated: boolean
  user: { id: string; email: string } | null
  environment: any
  services: any
  warnings: string[]
  timestamp: string
}

interface CreditData {
  balance: number
  stats: any
  recentTransactions: any[]
}

export function HealthPanel() {
  const [health, setHealth] = useState<HealthData | null>(null)
  const [credits, setCredits] = useState<CreditData | null>(null)
  const [lastWebhook, setLastWebhook] = useState<any>(null)
  const [etsyShopCount, setEtsyShopCount] = useState<number>(0)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState('')
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  useEffect(() => {
    fetchAllData()
  }, [])

  const fetchAllData = async () => {
    try {
      // Fetch health
      const healthRes = await fetch('/api/health')
      const healthData = await healthRes.json()
      if (healthRes.ok) {
        setHealth(healthData)
        
        // Get Etsy shop count if in mock mode
        if (healthData.services?.etsy?.mode === 'mock') {
          setEtsyShopCount(25) // Mock data has 25 listings
        }
      }

      // Fetch credits if authenticated
      if (healthData.authenticated) {
        const creditsRes = await fetch('/api/user/credits')
        const creditsData = await creditsRes.json()
        if (creditsRes.ok) {
          setCredits(creditsData)
          
          // Get last webhook event from transactions
          const lastPurchase = creditsData.recentTransactions?.find(
            (t: any) => t.type === 'purchase'
          )
          if (lastPurchase) {
            setLastWebhook({
              type: 'purchase',
              timestamp: lastPurchase.createdAt,
              credits: lastPurchase.amount,
              isDuplicate: false
            })
          }
        }
      }

      setError('')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchAllData()
  }

  const handleBuyCredits = async (packageType: 'starter' | 'pro' | 'business') => {
    setActionLoading(`buy-${packageType}`)
    setActionMessage(null)
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ packageType })
      })
      const data = await response.json()
      if (response.ok && data.url) {
        window.location.href = data.url
      } else {
        throw new Error(data.error || 'Failed to create checkout')
      }
    } catch (err: any) {
      setActionMessage({ type: 'error', text: err.message })
    } finally {
      setActionLoading(null)
    }
  }

  const handleOptimizeDemo = async () => {
    setActionLoading('optimize-demo')
    setActionMessage(null)
    try {
      const response = await fetch('/api/optimize/demo', {
        method: 'POST'
      })
      const data = await response.json()
      if (response.ok) {
        setActionMessage({ 
          type: 'success', 
          text: `✓ Demo completed! Generated 3 variants. New balance: ${data.optimization.new_balance} credits` 
        })
        // Refresh credits
        await fetchAllData()
      } else {
        throw new Error(data.error || 'Failed to run demo')
      }
    } catch (err: any) {
      setActionMessage({ type: 'error', text: err.message })
    } finally {
      setActionLoading(null)
    }
  }

  const handleConnectEtsy = () => {
    window.location.href = '/etsy'
  }

  if (loading) {
    return (
      <Card padding="6">
        <div style={{ textAlign: 'center', padding: `${tokens.spacing[8]} 0`, color: tokens.colors.textMuted }}>
          Loading system health...
        </div>
      </Card>
    )
  }

  if (error && !health) {
    return (
      <Card padding="6">
        <Alert variant="danger">
          System Health Check Failed: {error}
        </Alert>
      </Card>
    )
  }

  const envStatus = health?.environment || {}
  const allGreen = 
    envStatus.stripe?.hasSecretKey &&
    envStatus.stripe?.hasWebhookSecret &&
    envStatus.openai?.hasApiKey &&
    envStatus.supabase?.hasUrl

  return (
    <Card padding="6">
      <div style={{ marginBottom: tokens.spacing[4], display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{
          fontSize: tokens.typography.fontSize.xl,
          fontWeight: tokens.typography.fontWeight.semibold,
          color: tokens.colors.text
        }}>
          System Health & Actions
        </h3>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleRefresh}
          disabled={refreshing}
        >
          {refreshing ? 'Refreshing...' : '🔄 Refresh'}
        </Button>
      </div>

      {actionMessage && (
        <Alert variant={actionMessage.type === 'success' ? 'success' : 'danger'} style={{ marginBottom: tokens.spacing[4] }}>
          {actionMessage.text}
        </Alert>
      )}

      {/* Overall Status */}
      <div style={{
        padding: tokens.spacing[4],
        backgroundColor: allGreen ? `${tokens.colors.success}15` : `${tokens.colors.warning}15`,
        borderRadius: tokens.radius.lg,
        marginBottom: tokens.spacing[4],
        display: 'flex',
        alignItems: 'center',
        gap: tokens.spacing[3]
      }}>
        <span style={{ fontSize: tokens.typography.fontSize['2xl'] }}>
          {allGreen ? '✅' : '⚠️'}
        </span>
        <div style={{ flex: 1 }}>
          <p style={{
            fontWeight: tokens.typography.fontWeight.semibold,
            color: tokens.colors.text,
            marginBottom: tokens.spacing[1]
          }}>
            {allGreen ? 'All Systems Operational' : 'Configuration Issues Detected'}
          </p>
          <p style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.textMuted }}>
            Last check: {health ? new Date(health.timestamp).toLocaleTimeString() : 'N/A'}
          </p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.textMuted }}>
            Balance: <strong style={{ color: tokens.colors.primary }}>{credits?.balance || 0}</strong> credits
          </p>
        </div>
      </div>

      {/* Warnings */}
      {health?.warnings && health.warnings.length > 0 && (
        <Alert variant="warning" style={{ marginBottom: tokens.spacing[4] }}>
          <strong>Configuration Required:</strong>
          <ul style={{ margin: `${tokens.spacing[2]} 0 0 ${tokens.spacing[4]}`, listStyle: 'disc' }}>
            {health.warnings.map((warning, i) => (
              <li key={i} style={{ fontSize: tokens.typography.fontSize.sm }}>{warning}</li>
            ))}
          </ul>
        </Alert>
      )}

      {/* Environment Status Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: tokens.spacing[3],
        marginBottom: tokens.spacing[4]
      }}>
        <StatusBadge
          label="Stripe"
          status={envStatus.stripe?.hasSecretKey && envStatus.stripe?.hasWebhookSecret ? 'green' : 'red'}
          tooltip={!envStatus.stripe?.hasSecretKey ? 'Add STRIPE_SECRET_KEY to .env' : !envStatus.stripe?.hasWebhookSecret ? 'Add STRIPE_WEBHOOK_SECRET to .env' : 'Configured'}
        />
        <StatusBadge
          label="OpenAI"
          status={envStatus.openai?.hasApiKey ? 'green' : 'red'}
          tooltip={!envStatus.openai?.hasApiKey ? 'Add OPENAI_API_KEY to .env' : 'Configured'}
        />
        <StatusBadge
          label="Supabase"
          status={envStatus.supabase?.hasUrl ? 'green' : 'red'}
          tooltip={!envStatus.supabase?.hasUrl ? 'Add NEXT_PUBLIC_SUPABASE_URL to .env' : 'Configured'}
        />
        <StatusBadge
          label="Etsy"
          status={health?.services?.etsy?.mode === 'mock' ? 'yellow' : 'green'}
          tooltip={health?.services?.etsy?.mode === 'mock' ? `Mock mode - ${etsyShopCount} sample listings` : 'Real API configured'}
        />
      </div>

      {/* Telemetry Section */}
      <div style={{ 
        padding: tokens.spacing[3],
        backgroundColor: tokens.colors.backgroundAlt,
        borderRadius: tokens.radius.md,
        marginBottom: tokens.spacing[4],
        fontSize: tokens.typography.fontSize.sm
      }}>
        <div style={{ marginBottom: tokens.spacing[2] }}>
          <strong style={{ color: tokens.colors.text }}>Last Webhook:</strong>{' '}
          <span style={{ color: tokens.colors.textMuted }}>
            {lastWebhook ? (
              <>
                {lastWebhook.type} (+{lastWebhook.credits} credits) at {new Date(lastWebhook.timestamp).toLocaleString()}
                {lastWebhook.isDuplicate && <span style={{ color: tokens.colors.warning }}> [DUPLICATE - replay-safe]</span>}
              </>
            ) : (
              'No recent webhooks'
            )}
          </span>
        </div>
        <div style={{ marginBottom: tokens.spacing[2] }}>
          <strong style={{ color: tokens.colors.text }}>Etsy Mode:</strong>{' '}
          <span style={{ color: tokens.colors.textMuted }}>
            {health?.services?.etsy?.mode || 'unknown'} {etsyShopCount > 0 && `(${etsyShopCount} listings available)`}
          </span>
        </div>
        <div>
          <strong style={{ color: tokens.colors.text }}>Environment:</strong>{' '}
          <span style={{ color: tokens.colors.textMuted }}>
            {envStatus.general?.nodeEnv || 'unknown'}
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
        gap: tokens.spacing[2]
      }}>
        <Button
          variant="primary"
          size="sm"
          onClick={() => handleBuyCredits('starter')}
          disabled={!!actionLoading}
        >
          {actionLoading === 'buy-starter' ? 'Loading...' : 'Buy Starter'}
        </Button>
        <Button
          variant="primary"
          size="sm"
          onClick={() => handleBuyCredits('pro')}
          disabled={!!actionLoading}
        >
          {actionLoading === 'buy-pro' ? 'Loading...' : 'Buy Pro'}
        </Button>
        <Button
          variant="primary"
          size="sm"
          onClick={() => handleBuyCredits('business')}
          disabled={!!actionLoading}
        >
          {actionLoading === 'buy-business' ? 'Loading...' : 'Buy Business'}
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={handleOptimizeDemo}
          disabled={!!actionLoading || (credits?.balance || 0) < 1}
        >
          {actionLoading === 'optimize-demo' ? 'Running...' : 'Optimize Demo'}
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={handleConnectEtsy}
          disabled={!!actionLoading}
        >
          Connect Etsy
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleRefresh}
          disabled={!!actionLoading || refreshing}
        >
          Refresh Balance
        </Button>
      </div>
    </Card>
  )
}

interface StatusBadgeProps {
  label: string
  status: 'green' | 'yellow' | 'red'
  tooltip?: string
}

function StatusBadge({ label, status, tooltip }: StatusBadgeProps) {
  const colors = {
    green: tokens.colors.success,
    yellow: tokens.colors.warning,
    red: tokens.colors.danger
  }

  return (
    <div 
      style={{
        padding: tokens.spacing[2],
        borderRadius: tokens.radius.md,
        backgroundColor: `${colors[status]}15`,
        border: `1px solid ${colors[status]}40`,
        textAlign: 'center'
      }}
      title={tooltip}
    >
      <div style={{ 
        fontSize: tokens.typography.fontSize.lg,
        marginBottom: tokens.spacing[1]
      }}>
        {status === 'green' ? '✓' : status === 'yellow' ? '⚠' : '✗'}
      </div>
      <div style={{
        fontSize: tokens.typography.fontSize.xs,
        fontWeight: tokens.typography.fontWeight.medium,
        color: tokens.colors.text
      }}>
        {label}
      </div>
      {tooltip && (
        <div style={{
          fontSize: tokens.typography.fontSize.xs,
          color: tokens.colors.textMuted,
          marginTop: tokens.spacing[1],
          lineHeight: '1.2'
        }}>
          {status === 'red' ? tooltip.split(' ').slice(-2).join(' ') : 'OK'}
        </div>
      )}
    </div>
  )
}
