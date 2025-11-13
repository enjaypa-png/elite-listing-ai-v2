'use client'

import { Navbar, Footer, Container, Button, Card } from '@/components/ui'
import tokens from '@/design-system/tokens.json'

export default function HomePage() {
  return (
    <>
      <Navbar />
      
      {/* Hero Section */}
      <section style={{
        textAlign: 'center',
        padding: `${tokens.spacing[24]} 0`,
      }}>
        <Container size="md">
          <h1 style={{
            fontSize: tokens.typography.fontSize['6xl'],
            fontWeight: tokens.typography.fontWeight.bold,
            lineHeight: tokens.typography.lineHeight.tight,
            color: tokens.colors.text,
            marginBottom: tokens.spacing[6]
          }}>
            Optimize Your Etsy Listings <span style={{ color: tokens.colors.primary }}>with AI</span>
          </h1>
          <p style={{
            fontSize: tokens.typography.fontSize.lg,
            color: tokens.colors.textMuted,
            marginBottom: tokens.spacing[8],
            maxWidth: '42rem',
            marginLeft: 'auto',
            marginRight: 'auto'
          }}>
            Generate high-converting titles, descriptions, and tags in seconds. Powered by GPT-4 and trained on successful Etsy listings.
          </p>
          
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: tokens.spacing[4],
            marginBottom: tokens.spacing[6],
            flexWrap: 'wrap'
          }}>
            <Button variant="primary" size="lg" href="/auth/signup">
              Start Free Trial
            </Button>
            <Button variant="secondary" size="lg" href="/auth/signin">
              Sign In
            </Button>
          </div>
          
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: tokens.spacing[2],
            color: tokens.colors.textMuted,
            fontSize: tokens.typography.fontSize.sm
          }}>
            <svg style={{ width: '1.25rem', height: '1.25rem' }} fill={tokens.colors.primary} viewBox="0 0 20 20">
              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
              <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"/>
            </svg>
            <span>Get 10 free credits when you sign up. No credit card required.</span>
          </div>
        </Container>
      </section>

      {/* Features Section */}
      <section style={{ padding: `${tokens.spacing[16]} 0` }}>
        <Container>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: tokens.spacing[8]
          }}>
            <Card hover padding="8">
              <div style={{
                width: '3rem',
                height: '3rem',
                backgroundColor: `${tokens.colors.primary}15`,
                borderRadius: tokens.radius.xl,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: tokens.spacing[6]
              }}>
                <svg style={{ width: '1.5rem', height: '1.5rem', color: tokens.colors.primary }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                </svg>
              </div>
              <h3 style={{
                fontSize: tokens.typography.fontSize.xl,
                fontWeight: tokens.typography.fontWeight.semibold,
                marginBottom: tokens.spacing[3],
                color: tokens.colors.text
              }}>
                AI-Powered Titles
              </h3>
              <p style={{
                color: tokens.colors.textMuted,
                lineHeight: tokens.typography.lineHeight.relaxed,
                fontSize: tokens.typography.fontSize.sm
              }}>
                Generate optimized title variants that rank higher in Etsy search and convert better.
              </p>
            </Card>

            <Card hover padding="8">
              <div style={{
                width: '3rem',
                height: '3rem',
                backgroundColor: `${tokens.colors.primary}15`,
                borderRadius: tokens.radius.xl,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: tokens.spacing[6]
              }}>
                <svg style={{ width: '1.5rem', height: '1.5rem', color: tokens.colors.primary }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/>
                </svg>
              </div>
              <h3 style={{
                fontSize: tokens.typography.fontSize.xl,
                fontWeight: tokens.typography.fontWeight.semibold,
                marginBottom: tokens.spacing[3],
                color: tokens.colors.text
              }}>
                Smart Tags
              </h3>
              <p style={{
                color: tokens.colors.textMuted,
                lineHeight: tokens.typography.lineHeight.relaxed,
                fontSize: tokens.typography.fontSize.sm
              }}>
                Get all 13 Etsy tags optimized for search volume, relevance, and competition.
              </p>
            </Card>

            <Card hover padding="8">
              <div style={{
                width: '3rem',
                height: '3rem',
                backgroundColor: `${tokens.colors.primary}15`,
                borderRadius: tokens.radius.xl,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: tokens.spacing[6]
              }}>
                <svg style={{ width: '1.5rem', height: '1.5rem', color: tokens.colors.primary }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                </svg>
              </div>
              <h3 style={{
                fontSize: tokens.typography.fontSize.xl,
                fontWeight: tokens.typography.fontWeight.semibold,
                marginBottom: tokens.spacing[3],
                color: tokens.colors.text
              }}>
                SEO Analysis
              </h3>
              <p style={{
                color: tokens.colors.textMuted,
                lineHeight: tokens.typography.lineHeight.relaxed,
                fontSize: tokens.typography.fontSize.sm
              }}>
                Get detailed SEO scores and actionable recommendations to improve your rankings.
              </p>
            </Card>
          </div>
        </Container>
      </section>

      {/* Social Proof */}
      <section style={{ padding: `${tokens.spacing[16]} 0`, textAlign: 'center' }}>
        <Container size="md">
          <p style={{
            color: tokens.colors.textMuted,
            fontSize: tokens.typography.fontSize.sm,
            marginBottom: tokens.spacing[10]
          }}>
            Trusted by Etsy sellers worldwide
          </p>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: tokens.spacing[12]
          }}>
            <div>
              <div style={{
                fontSize: tokens.typography.fontSize['4xl'],
                fontWeight: tokens.typography.fontWeight.bold,
                color: tokens.colors.primary,
                marginBottom: tokens.spacing[2]
              }}>
                10k+
              </div>
              <div style={{
                color: tokens.colors.textMuted,
                fontSize: tokens.typography.fontSize.sm
              }}>
                Listings Optimized
              </div>
            </div>
            <div>
              <div style={{
                fontSize: tokens.typography.fontSize['4xl'],
                fontWeight: tokens.typography.fontWeight.bold,
                color: tokens.colors.primary,
                marginBottom: tokens.spacing[2]
              }}>
                95%
              </div>
              <div style={{
                color: tokens.colors.textMuted,
                fontSize: tokens.typography.fontSize.sm
              }}>
                Satisfaction Rate
              </div>
            </div>
            <div>
              <div style={{
                fontSize: tokens.typography.fontSize['4xl'],
                fontWeight: tokens.typography.fontWeight.bold,
                color: tokens.colors.primary,
                marginBottom: tokens.spacing[2]
              }}>
                4.9/5
              </div>
              <div style={{
                color: tokens.colors.textMuted,
                fontSize: tokens.typography.fontSize.sm
              }}>
                Average Rating
              </div>
            </div>
          </div>
        </Container>
      </section>

      <Footer />
    </>
  )
}
