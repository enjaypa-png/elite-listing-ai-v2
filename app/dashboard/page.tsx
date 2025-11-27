'use client';

import { useRouter } from 'next/navigation';
import { Container, Card, Button } from '@/components/ui';
import { TopNav } from '@/components/navigation';
import tokens from '@/design-system/tokens.json';

export default function DashboardPage() {
  const router = useRouter();

  return (
    <div style={{ minHeight: '100vh', background: tokens.colors.background }}>
      <TopNav />

      <Container>
        <div style={{ 
          maxWidth: '1200px', 
          margin: '0 auto',
          paddingTop: tokens.spacing[12],
          paddingBottom: tokens.spacing[12]
        }}>
          {/* Welcome Hero */}
          <div style={{ marginBottom: tokens.spacing[12] }}>
            <h1 style={{
              fontSize: tokens.typography.fontSize['4xl'],
              fontWeight: tokens.typography.fontWeight.bold,
              color: tokens.colors.text,
              marginBottom: tokens.spacing[3]
            }}>
              Welcome to Elite Listing AI
            </h1>
            <p style={{
              fontSize: tokens.typography.fontSize.lg,
              color: tokens.colors.textMuted
            }}>
              Etsy gives you search data. We show you what to do with it.
            </p>
          </div>

          {/* Primary Actions - Large Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: tokens.spacing[6],
            marginBottom: tokens.spacing[12]
          }}>
            {/* One-Click Optimizer */}
            <div
              onClick={() => router.push('/dashboard/optimize-listing')}
              style={{
                background: tokens.card.background,
                border: `2px solid ${tokens.colors.primary}80`,
                borderRadius: tokens.card.radius,
                padding: tokens.spacing[8],
                boxShadow: tokens.shadows.card,
                cursor: 'pointer',
                transition: `all ${tokens.motion.duration.normal}`
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = tokens.colors.primary;
                e.currentTarget.style.transform = 'translateY(-4px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = `${tokens.colors.primary}80`;
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'start', gap: tokens.spacing[4], marginBottom: tokens.spacing[4] }}>
                <div style={{
                  width: tokens.spacing[16],
                  height: tokens.spacing[16],
                  background: `${tokens.colors.primary}1A`,
                  borderRadius: tokens.radius.md,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: tokens.typography.fontSize['4xl']
                }}>
                  \u26A1
                </div>
                <div style={{ flex: 1 }}>
                  <h2 style={{
                    fontSize: tokens.typography.fontSize['2xl'],
                    fontWeight: tokens.typography.fontWeight.bold,
                    color: tokens.colors.text,
                    marginBottom: tokens.spacing[2]
                  }}>
                    One-Click Listing Optimizer
                  </h2>
                  <p style={{
                    fontSize: tokens.typography.fontSize.sm,
                    color: tokens.colors.textMuted,
                    marginBottom: tokens.spacing[4]
                  }}>
                    Optimize title, tags, description, and images with our R.A.N.K. 285™ system.
                  </p>
                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: tokens.spacing[2],
                    color: tokens.colors.primary,
                    fontWeight: tokens.typography.fontWeight.semibold
                  }}>
                    Start Optimizing <span>→</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Store Sync */}
            <div
              onClick={() => router.push('/dashboard/etsy-sync')}
              style={{
                background: tokens.card.background,
                border: `2px solid ${tokens.colors.border}`,
                borderRadius: tokens.card.radius,
                padding: tokens.spacing[8],
                boxShadow: tokens.shadows.card,
                cursor: 'pointer',
                transition: `all ${tokens.motion.duration.normal}`
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = tokens.colors.primary;
                e.currentTarget.style.transform = 'translateY(-4px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = tokens.colors.border;
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'start', gap: tokens.spacing[4], marginBottom: tokens.spacing[4] }}>
                <div style={{
                  width: tokens.spacing[16],
                  height: tokens.spacing[16],
                  background: `${tokens.colors.primary}1A`,
                  borderRadius: tokens.radius.md,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: tokens.typography.fontSize['4xl']
                }}>
                  \uD83D\uDD04
                </div>
                <div style={{ flex: 1 }}>
                  <h2 style={{
                    fontSize: tokens.typography.fontSize['2xl'],
                    fontWeight: tokens.typography.fontWeight.bold,
                    color: tokens.colors.text,
                    marginBottom: tokens.spacing[2]
                  }}>
                    Sync My Store
                  </h2>
                  <p style={{
                    fontSize: tokens.typography.fontSize.sm,
                    color: tokens.colors.textMuted,
                    marginBottom: tokens.spacing[4]
                  }}>
                    Connect your Etsy shop and pull your active listings for optimization.
                  </p>
                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: tokens.spacing[2],
                    color: tokens.colors.primary,
                    fontWeight: tokens.typography.fontWeight.semibold
                  }}>
                    Connect Store <span>→</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Secondary Tools */}
          <div style={{ marginBottom: tokens.spacing[8] }}>
            <h3 style={{
              fontSize: tokens.typography.fontSize.lg,
              fontWeight: tokens.typography.fontWeight.semibold,
              color: tokens.colors.text,
              marginBottom: tokens.spacing[4]
            }}>
              Quick Access
            </h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: tokens.spacing[4]
            }}>
              <div
                onClick={() => router.push('/dashboard/listings')}
                style={{
                  background: tokens.colors.surface,
                  border: `1px solid ${tokens.colors.border}`,
                  borderRadius: tokens.radius.md,
                  padding: tokens.spacing[6],
                  cursor: 'pointer',
                  transition: `all ${tokens.motion.duration.fast}`
                }}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = tokens.colors.primary}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = tokens.colors.border}
              >
                <div style={{ fontSize: tokens.typography.fontSize['3xl'], marginBottom: tokens.spacing[3] }}>\ud83d\udccb</div>
                <div style={{ fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.text, marginBottom: tokens.spacing[1] }}>My Listings</div>
                <div style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.textMuted }}>View & manage</div>
              </div>

              <div
                onClick={() => router.push('/dashboard/photo-analysis')}
                style={{
                  background: tokens.colors.surface,
                  border: `1px solid ${tokens.colors.border}`,
                  borderRadius: tokens.radius.md,
                  padding: tokens.spacing[6],
                  cursor: 'pointer',
                  transition: `all ${tokens.motion.duration.fast}`
                }}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = tokens.colors.primary}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = tokens.colors.border}
              >
                <div style={{ fontSize: tokens.typography.fontSize['3xl'], marginBottom: tokens.spacing[3] }}>\ud83d\udcf8</div>
                <div style={{ fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.text, marginBottom: tokens.spacing[1] }}>Photo Analysis</div>
                <div style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.textMuted }}>Optimize images</div>
              </div>

              <div
                onClick={() => router.push('/dashboard/etsy-sync')}
                style={{
                  background: tokens.colors.surface,
                  border: `1px solid ${tokens.colors.border}`,
                  borderRadius: tokens.radius.md,
                  padding: tokens.spacing[6],
                  cursor: 'pointer',
                  transition: `all ${tokens.motion.duration.fast}`
                }}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = tokens.colors.primary}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = tokens.colors.border}
              >
                <div style={{ fontSize: tokens.typography.fontSize['3xl'], marginBottom: tokens.spacing[3] }}>\ud83d\udd04</div>
                <div style={{ fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.text, marginBottom: tokens.spacing[1] }}>Etsy Sync</div>
                <div style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.textMuted }}>Connect shop</div>
              </div>

              <div
                onClick={() => router.push('/dashboard/batch')}
                style={{
                  background: tokens.colors.surface,
                  border: `1px solid ${tokens.colors.border}`,
                  borderRadius: tokens.radius.md,
                  padding: tokens.spacing[6],
                  cursor: 'pointer',
                  transition: `all ${tokens.motion.duration.fast}`
                }}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = tokens.colors.primary}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = tokens.colors.border}
              >
                <div style={{ fontSize: tokens.typography.fontSize['3xl'], marginBottom: tokens.spacing[3] }}>\u26a1</div>
                <div style={{ fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.text, marginBottom: tokens.spacing[1] }}>Batch Optimize</div>
                <div style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.textMuted }}>Multiple listings</div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: tokens.spacing[6]
          }}>
            <Card>
              <div style={{ padding: tokens.spacing[6] }}>
                <div style={{ color: tokens.colors.textMuted, fontSize: tokens.typography.fontSize.sm, marginBottom: tokens.spacing[1] }}>Total Listings</div>
                <div style={{ fontSize: tokens.typography.fontSize['3xl'], fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.text }}>0</div>
              </div>
            </Card>
            <Card>
              <div style={{ padding: tokens.spacing[6] }}>
                <div style={{ color: tokens.colors.textMuted, fontSize: tokens.typography.fontSize.sm, marginBottom: tokens.spacing[1] }}>Optimized</div>
                <div style={{ fontSize: tokens.typography.fontSize['3xl'], fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.success }}>0</div>
              </div>
            </Card>
            <Card>
              <div style={{ padding: tokens.spacing[6] }}>
                <div style={{ color: tokens.colors.textMuted, fontSize: tokens.typography.fontSize.sm, marginBottom: tokens.spacing[1] }}>Avg R.A.N.K. Score</div>
                <div style={{ fontSize: tokens.typography.fontSize['3xl'], fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.text }}>-</div>
              </div>
            </Card>
          </div>
        </div>
      </Container>
    </div>
  );
}
