'use client';

import { Container, Button, Card } from '@/components/ui';
import { Logo } from '@/components/Logo';
import { useRouter } from 'next/navigation';
import tokens from '@/design-system/tokens.json';

export default function HomePage() {
  const router = useRouter();

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)'
    }}>
      {/* Navigation */}
      <nav style={{
        padding: `${tokens.spacing[4]} ${tokens.spacing[6]}`,
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <Logo />
          <div style={{ display: 'flex', gap: tokens.spacing[3] }}>
            <button
              onClick={() => router.push('/saved-projects')}
              style={{
                padding: `${tokens.spacing[2]} ${tokens.spacing[4]}`,
                background: 'transparent',
                color: '#D1D5DB',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: tokens.radius.md,
                fontSize: '16px',
                fontWeight: 600,
                cursor: 'pointer',
                minHeight: '44px'
              }}
            >
              My Past Optimizations
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <Container>
        <div style={{
          maxWidth: '800px',
          margin: '0 auto',
          paddingTop: '80px',
          textAlign: 'center'
        }}>
          {/* Hero Section */}
          <h1 style={{
            fontSize: '48px',
            fontWeight: 'bold',
            color: '#F9FAFB',
            marginBottom: tokens.spacing[4],
            lineHeight: 1.2
          }}>
            Optimize Your Etsy Listings<br />in Minutes with AI
          </h1>

          <p style={{
            fontSize: '20px',
            color: '#9CA3AF',
            marginBottom: tokens.spacing[8],
            lineHeight: 1.6
          }}>
            Upload a product photo and we'll handle the rest
          </p>

          {/* Main CTA */}
          <div style={{
            display: 'inline-block',
            position: 'relative'
          }}>
            <button
              onClick={() => router.push('/upload')}
              style={{
                padding: '20px 48px',
                background: 'linear-gradient(135deg, #3B82F6, #10B981)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '24px',
                fontWeight: 'bold',
                cursor: 'pointer',
                boxShadow: '0 8px 24px rgba(59, 130, 246, 0.4)',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                minHeight: '64px',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.05)';
                e.currentTarget.style.boxShadow = '0 12px 32px rgba(59, 130, 246, 0.5)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(59, 130, 246, 0.4)';
              }}
            >
              📸 Optimize a Listing
            </button>

            {/* Info Bubble */}
            <div
              title="Start here to optimize a new Etsy listing"
              style={{
                position: 'absolute',
                top: '-8px',
                right: '-8px',
                width: '32px',
                height: '32px',
                background: '#3B82F6',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '18px',
                fontWeight: 'bold',
                cursor: 'help',
                boxShadow: '0 4px 12px rgba(59, 130, 246, 0.4)',
                border: '3px solid #0F172A'
              }}
            >i</button>
          </div>

          <p style={{
            fontSize: '14px',
            color: '#6B7280',
            marginTop: tokens.spacing[4]
          }}>
            Upload a photo of your product so we can analyze it
          </p>

          {/* How It Works */}
          <div style={{
            marginTop: '80px',
            textAlign: 'left'
          }}>
            <h2 style={{
              fontSize: '32px',
              fontWeight: 'bold',
              color: '#F9FAFB',
              marginBottom: tokens.spacing[6],
              textAlign: 'center'
            }}>
              How It Works
            </h2>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: tokens.spacing[6]
            }}>
              {/* Step 1 */}
              <Card>
                <div style={{ padding: tokens.spacing[6] }}>
                  <div style={{
                    width: '56px',
                    height: '56px',
                    background: '#3B82F6',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '32px',
                    marginBottom: tokens.spacing[4]
                  }}>
                    📸
                  </div>
                  <h3 style={{
                    fontSize: '20px',
                    fontWeight: 'bold',
                    color: '#F9FAFB',
                    marginBottom: tokens.spacing[2]
                  }}>
                    1. Upload Photo
                  </h3>
                  <p style={{
                    fontSize: '16px',
                    color: '#9CA3AF',
                    lineHeight: 1.6
                  }}>
                    Upload a product photo and we'll analyze it instantly
                  </p>
                </div>
              </Card>

              {/* Step 2 */}
              <Card>
                <div style={{ padding: tokens.spacing[6] }}>
                  <div style={{
                    width: '56px',
                    height: '56px',
                    background: '#10B981',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '32px',
                    marginBottom: tokens.spacing[4]
                  }}>
                    ✨
                  </div>
                  <h3 style={{
                    fontSize: '20px',
                    fontWeight: 'bold',
                    color: '#F9FAFB',
                    marginBottom: tokens.spacing[2]
                  }}>
                    2. AI Optimizes
                  </h3>
                  <p style={{
                    fontSize: '16px',
                    color: '#9CA3AF',
                    lineHeight: 1.6
                  }}>
                    Our AI generates perfect titles, tags, and descriptions
                  </p>
                </div>
              </Card>

              {/* Step 3 */}
              <Card>
                <div style={{ padding: tokens.spacing[6] }}>
                  <div style={{
                    width: '56px',
                    height: '56px',
                    background: '#8B5CF6',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '32px',
                    marginBottom: tokens.spacing[4]
                  }}>
                    🚀
                  </div>
                  <h3 style={{
                    fontSize: '20px',
                    fontWeight: 'bold',
                    color: '#F9FAFB',
                    marginBottom: tokens.spacing[2]
                  }}>
                    3. Copy & Publish
                  </h3>
                  <p style={{
                    fontSize: '16px',
                    color: '#9CA3AF',
                    lineHeight: 1.6
                  }}>
                    Copy everything with one click and paste into Etsy
                  </p>
                </div>
              </Card>
            </div>
          </div>

          {/* Secondary Actions */}
          <div style={{
            marginTop: '80px',
            display: 'flex',
            justifyContent: 'center',
            gap: tokens.spacing[4],
            flexWrap: 'wrap'
          }}>
            <button
              onClick={() => router.push('/saved-projects')}
              style={{
                padding: `${tokens.spacing[3]} ${tokens.spacing[6]}`,
                background: 'rgba(59, 130, 246, 0.1)',
                color: '#60A5FA',
                border: '1px solid #3B82F6',
                borderRadius: tokens.radius.lg,
                fontSize: '16px',
                fontWeight: 600,
                cursor: 'pointer',
                minHeight: '48px'
              }}
            >
              📂 View Saved Projects
            </button>

            <button
              onClick={() => router.push('/etsy-connect')}
              style={{
                padding: `${tokens.spacing[3]} ${tokens.spacing[6]}`,
                background: 'rgba(16, 185, 129, 0.1)',
                color: '#34D399',
                border: '1px solid #10B981',
                borderRadius: tokens.radius.lg,
                fontSize: '16px',
                fontWeight: 600,
                cursor: 'pointer',
                minHeight: '48px'
              }}
            >
              🔗 Connect Etsy Shop
            </button>
          </div>
        </div>
      </Container>

      {/* Mobile Responsive */}
      <style jsx>{`
        @media (max-width: 768px) {
          h1 {
            font-size: 36px !important;
          }
          
          .hero-description {
            font-size: 18px !important;
          }
          
          .main-cta {
            font-size: 20px !important;
            padding: 16px 32px !important;
          }
        }
      `}</style>
    </div>
  );
}
