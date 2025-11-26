'use client';

import { useRouter } from 'next/navigation';
import { Container, Card, Button } from '@/components/ui';
import tokens from '@/design-system/tokens.json';

interface FeatureCard {
  icon: string;
  title: string;
  description: string;
  route: string;
  stats?: string;
  color: string;
}

export default function DashboardPage() {
  const router = useRouter();

  const features: FeatureCard[] = [
    {
      icon: '📸',
      title: 'Photo Analysis',
      description: 'Optimize your product images',
      route: '/dashboard/photo-analysis',
      stats: 'OpenAI Vision powered',
      color: tokens.colors.primary
    },
    {
      icon: '🔍',
      title: 'Keyword Strategy',
      description: 'Find blue ocean opportunities with real Etsy data',
      route: '/dashboard/keyword-strategy',
      stats: 'Real Etsy data',
      color: tokens.colors.success
    },
    {
      icon: '📊',
      title: 'SEO Audit',
      description: 'Complete 285-point listing analysis',
      route: '/dashboard/seo-audit',
      stats: 'Etsy 2025 algorithm',
      color: tokens.colors.warning
    },
    {
      icon: '🔄',
      title: 'Etsy Sync',
      description: 'One-click sync with your shop',
      route: '/dashboard/etsy-sync',
      stats: 'OAuth connected',
      color: tokens.colors.primary
    },
    {
      icon: '📦',
      title: 'My Listings',
      description: 'View and manage optimized listings',
      route: '/dashboard/listings',
      stats: '0 listings',
      color: tokens.colors.surface2
    },
    {
      icon: '⚡',
      title: 'Batch Optimization',
      description: 'Optimize multiple listings at once',
      route: '/dashboard/batch',
      stats: 'Coming soon',
      color: tokens.colors.surface2
    }
  ];

  return (
    <div style={{
      minHeight: '100vh',
      background: tokens.colors.background
    }}>
      <Container>
        <div style={{ 
          maxWidth: '1400px', 
          margin: '0 auto',
          paddingTop: tokens.spacing[12],
          paddingBottom: tokens.spacing[12]
        }}>
          {/* Header */}
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
              Optimize your Etsy listings with our R.A.N.K. 285™ algorithm system
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 400px',
            gap: tokens.spacing[8]
          }}>
            {/* Main Content */}
            <div>
              {/* Quick Start Section */}
              <Card>
                <div style={{ padding: tokens.spacing[6], marginBottom: tokens.spacing[6] }}>
                  <h2 style={{
                    fontSize: tokens.typography.fontSize['2xl'],
                    fontWeight: tokens.typography.fontWeight.bold,
                    color: tokens.colors.text,
                    marginBottom: tokens.spacing[4]
                  }}>
                    🚀 Quick Start
                  </h2>
                  <div style={{
                    display: 'flex',
                    gap: tokens.spacing[4]
                  }}>
                    <Button 
                      variant="primary" 
                      size="lg"
                      onClick={() => router.push('/upload')}
                    >
                      📸 Start with Photo Analysis
                    </Button>
                    <Button 
                      variant="secondary" 
                      size="lg"
                      onClick={() => router.push('/dashboard/keywords')}
                    >
                      🔍 Start with Keywords
                    </Button>
                  </div>
                </div>
              </Card>

              {/* Feature Cards */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: tokens.spacing[6],
                marginTop: tokens.spacing[6]
              }}>
                {features.map((feature, index) => (
                  <Card key={index}>
                    <div 
                      onClick={() => router.push(feature.route)}
                      style={{
                        padding: tokens.spacing[6],
                        cursor: 'pointer',
                        transition: `all ${tokens.motion.duration.normal}`,
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-4px)';
                        e.currentTarget.style.boxShadow = `0 8px 24px ${feature.color}33`;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    >
                      <div style={{
                        fontSize: tokens.typography.fontSize['4xl'],
                        marginBottom: tokens.spacing[4]
                      }}>
                        {feature.icon}
                      </div>
                      <h3 style={{
                        fontSize: tokens.typography.fontSize.xl,
                        fontWeight: tokens.typography.fontWeight.bold,
                        color: tokens.colors.text,
                        marginBottom: tokens.spacing[2]
                      }}>
                        {feature.title}
                      </h3>
                      <p style={{
                        fontSize: tokens.typography.fontSize.sm,
                        color: tokens.colors.textMuted,
                        marginBottom: tokens.spacing[4]
                      }}>
                        {feature.description}
                      </p>
                      {feature.stats && (
                        <div style={{
                          fontSize: tokens.typography.fontSize.xs,
                          color: feature.color,
                          fontWeight: tokens.typography.fontWeight.medium,
                          padding: `${tokens.spacing[1]} ${tokens.spacing[3]}`,
                          background: `${feature.color}1A`,
                          borderRadius: tokens.radius.md,
                          display: 'inline-block'
                        }}>
                          {feature.stats}
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Right Sidebar */}
            <div>
              {/* Recent Activity */}
              <Card>
                <div style={{ padding: tokens.spacing[6] }}>
                  <h3 style={{
                    fontSize: tokens.typography.fontSize.lg,
                    fontWeight: tokens.typography.fontWeight.bold,
                    color: tokens.colors.text,
                    marginBottom: tokens.spacing[4]
                  }}>
                    📝 Recent Activity
                  </h3>
                  <div style={{
                    fontSize: tokens.typography.fontSize.sm,
                    color: tokens.colors.textMuted,
                    textAlign: 'center',
                    padding: tokens.spacing[8]
                  }}>
                    No recent activity yet
                    <br />
                    <br />
                    Start optimizing to see your history here
                  </div>
                </div>
              </Card>

              {/* Stats Summary */}
              <Card>
                <div style={{ padding: tokens.spacing[6], marginTop: tokens.spacing[6] }}>
                  <h3 style={{
                    fontSize: tokens.typography.fontSize.lg,
                    fontWeight: tokens.typography.fontWeight.bold,
                    color: tokens.colors.text,
                    marginBottom: tokens.spacing[4]
                  }}>
                    📊 Your Stats
                  </h3>
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: tokens.spacing[3]
                  }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: tokens.typography.fontSize.sm
                    }}>
                      <span style={{ color: tokens.colors.textMuted }}>Total Listings:</span>
                      <span style={{ 
                        color: tokens.colors.text,
                        fontWeight: tokens.typography.fontWeight.bold
                      }}>0</span>
                    </div>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: tokens.typography.fontSize.sm
                    }}>
                      <span style={{ color: tokens.colors.textMuted }}>Optimized:</span>
                      <span style={{ 
                        color: tokens.colors.success,
                        fontWeight: tokens.typography.fontWeight.bold
                      }}>0</span>
                    </div>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: tokens.typography.fontSize.sm
                    }}>
                      <span style={{ color: tokens.colors.textMuted }}>Avg Score:</span>
                      <span style={{ 
                        color: tokens.colors.text,
                        fontWeight: tokens.typography.fontWeight.bold
                      }}>-</span>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </Container>

      {/* Mobile Responsive */}
      <style jsx>{`
        @media (max-width: 1024px) {
          div[style*="gridTemplateColumns: '1fr 400px'"] {
            grid-template-columns: 1fr !important;
          }
          div[style*="gridTemplateColumns: 'repeat(2, 1fr)'"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
