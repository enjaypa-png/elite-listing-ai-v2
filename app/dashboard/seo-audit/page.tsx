'use client';

import { useRouter } from 'next/navigation';
import { Container, Card, Button } from '@/components/ui';
import { TopNav, Breadcrumbs } from '@/components/navigation';
import tokens from '@/design-system/tokens.json';

export default function SEOAuditPage() {
  const router = useRouter();

  return (
    <div style={{ minHeight: '100vh', background: tokens.colors.background }}>
      <TopNav />
      <Breadcrumbs />

      <Container>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          paddingTop: tokens.spacing[12],
          paddingBottom: tokens.spacing[12],
          textAlign: 'center'
        }}>
          <Card>
            <div style={{ padding: tokens.spacing[12] }}>
              <div style={{ fontSize: tokens.typography.fontSize['6xl'], marginBottom: tokens.spacing[6] }}>
                📊
              </div>
              <h1 style={{
                fontSize: tokens.typography.fontSize['3xl'],
                fontWeight: tokens.typography.fontWeight.bold,
                color: tokens.colors.text,
                marginBottom: tokens.spacing[4]
              }}>
                Complete SEO Audit
              </h1>
              <p style={{
                fontSize: tokens.typography.fontSize.lg,
                color: tokens.colors.textMuted,
                marginBottom: tokens.spacing[8]
              }}>
                Get a full 285-point breakdown of your listing
              </p>
              <Button variant="primary" size="lg" onClick={() => router.push('/dashboard/keywords')}>
                Start Analysis
              </Button>
            </div>
          </Card>
        </div>
      </Container>
    </div>
  );
}
