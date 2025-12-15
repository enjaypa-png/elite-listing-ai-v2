'use client';

import { Container, Card } from '@/components/ui';
import { TopNav, Breadcrumbs } from '@/components/navigation';
import tokens from '@/design-system/tokens.json';

export default function ListingsPage() {
  return (
    <div style={{ minHeight: '100vh', background: tokens.colors.background }}>
      <TopNav />
      <Breadcrumbs />
      <Container>
        <div style={{ maxWidth: '1200px', margin: '0 auto', paddingTop: tokens.spacing[12], textAlign: 'center' }}>
          <Card>
            <div style={{ padding: tokens.spacing[12] }}>
              <div style={{ fontSize: tokens.typography.fontSize['6xl'], marginBottom: tokens.spacing[6] }}>📦</div>
              <h1 style={{
                fontSize: tokens.typography.fontSize['3xl'],
                fontWeight: tokens.typography.fontWeight.bold,
                color: tokens.colors.text,
                marginBottom: tokens.spacing[4]
              }}>
                My Listings
              </h1>
              <p style={{ fontSize: tokens.typography.fontSize.lg, color: tokens.colors.textMuted }}>
                Listing manager coming soon
              </p>
            </div>
          </Card>
        </div>
      </Container>
    </div>
  );
}
