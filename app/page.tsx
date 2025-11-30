'use client';

import { Container, Button, Card, Navbar, Footer } from '@/components/ui';
import { useRouter } from 'next/navigation';
import tokens from '@/design-system/tokens.json';

export default function HomePage() {
  const router = useRouter();

  return (
    <>
      <Navbar showAuth={true} />
      
      <div style={{
        minHeight: 'calc(100vh - 200px)',
        background: tokens.colors.background
      }}>
        {/* Hero Section */}
        <Container size="md">
          <div style={{
            textAlign: 'center',
            paddingTop: tokens.spacing[24],
            paddingBottom: tokens.spacing[16]
          }}>
            <h1 style={{
              fontSize: tokens.typography.fontSize['6xl'],
              fontWeight: tokens.typography.fontWeight.bold,
              lineHeight: tokens.typography.lineHeight.tight,
              color: tokens.colors.text,
              marginBottom: tokens.spacing[6]
            }}>
              Optimize Your Etsy Listings<br />
              <span style={{ color: tokens.colors.primary }}>in Minutes with AI</span>
            </h1>

            <p style={{
              fontSize: tokens.typography.fontSize.xl,
              color: tokens.colors.textMuted,
              marginBottom: tokens.spacing[12],
              lineHeight: tokens.typography.lineHeight.relaxed,
              maxWidth: '42rem',
              marginLeft: 'auto',
              marginRight: 'auto'
            }}>
              Upload a product photo and we'll handle the rest
            </p>

            {/* Main CTA */}
            <div style={{ marginBottom: tokens.spacing[4] }}>
              <Button 
                variant="primary" 
                size="xl" 
                onClick={() => router.push('/upload')}
              >
                Optimize a Listing
              </Button>
            </div>

            <p style={{
              fontSize: tokens.typography.fontSize.sm,
              color: tokens.colors.textMuted
            }}>
              Upload a photo of your product so we can analyze it
            </p>
          </div>

          {/* How It Works */}
          <div style={{
            marginTop: tokens.spacing[20],
            marginBottom: tokens.spacing[20]
          }}>
            <h2 style={{
              fontSize: tokens.typography.fontSize['4xl'],
              fontWeight: tokens.typography.fontWeight.bold,
              color: tokens.colors.text,
              marginBottom: tokens.spacing[12],
              textAlign: 'center'
            }}>
              How It Works
            </h2>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: tokens.spacing[8]
            }}>
              {/* Step 1 */}
              <Card padding="8">
                <div style={{
                  width: '3.5rem',
                  height: '3.5rem',
                  background: `${tokens.colors.primary}15`,
                  borderRadius: tokens.radius.xl,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: tokens.typography.fontSize['2xl'],
                  marginBottom: tokens.spacing[6]
                }}>
                  📸
                </div>
                <h3 style={{
                  fontSize: tokens.typography.fontSize.xl,
                  fontWeight: tokens.typography.fontWeight.semibold,
                  color: tokens.colors.text,
                  marginBottom: tokens.spacing[3]
                }}>
                  1. Upload Photo
                </h3>
                <p style={{
                  fontSize: tokens.typography.fontSize.base,
                  color: tokens.colors.textMuted,
                  lineHeight: tokens.typography.lineHeight.relaxed
                }}>
                  Upload a product photo and we'll analyze it instantly
                </p>
              </Card>

              {/* Step 2 */}
              <Card padding="8">
                <div style={{
                  width: '3.5rem',
                  height: '3.5rem',
                  background: `${tokens.colors.success}15`,
                  borderRadius: tokens.radius.xl,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: tokens.typography.fontSize['2xl'],
                  marginBottom: tokens.spacing[6]
                }}>
                  ✨
                </div>
                <h3 style={{
                  fontSize: tokens.typography.fontSize.xl,
                  fontWeight: tokens.typography.fontWeight.semibold,
                  color: tokens.colors.text,
                  marginBottom: tokens.spacing[3]
                }}>
                  2. AI Optimizes
                </h3>
                <p style={{
                  fontSize: tokens.typography.fontSize.base,
                  color: tokens.colors.textMuted,
                  lineHeight: tokens.typography.lineHeight.relaxed
                }}>
                  Our AI generates perfect titles, tags, and descriptions
                </p>
              </Card>

              {/* Step 3 */}
              <Card padding="8">
                <div style={{
                  width: '3.5rem',
                  height: '3.5rem',
                  background: `${tokens.colors.accent}15`,
                  borderRadius: tokens.radius.xl,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: tokens.typography.fontSize['2xl'],
                  marginBottom: tokens.spacing[6]
                }}>
                  🚀
                </div>
                <h3 style={{
                  fontSize: tokens.typography.fontSize.xl,
                  fontWeight: tokens.typography.fontWeight.semibold,
                  color: tokens.colors.text,
                  marginBottom: tokens.spacing[3]
                }}>
                  3. Copy & Publish
                </h3>
                <p style={{
                  fontSize: tokens.typography.fontSize.base,
                  color: tokens.colors.textMuted,
                  lineHeight: tokens.typography.lineHeight.relaxed
                }}>
                  Copy everything with one click and paste into Etsy
                </p>
              </Card>
            </div>
          </div>

          {/* Secondary Actions */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: tokens.spacing[4],
            marginBottom: tokens.spacing[16],
            flexWrap: 'wrap'
          }}>
            <Button variant="secondary" size="md" onClick={() => router.push('/saved-projects')}>
              📂 View Saved Projects
            </Button>
            <Button variant="secondary" size="md" onClick={() => router.push('/etsy-connect')}>
              🔗 Connect Etsy Shop
            </Button>
          </div>
        </Container>
      </div>

      <Footer />
    </>
  );
}
