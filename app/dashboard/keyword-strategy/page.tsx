'use client';

import { Container } from '@/components/ui';
import { TopNav, Breadcrumbs } from '@/components/navigation';
import { KeywordStrategyEngine } from '@/components/seo';
import tokens from '@/design-system/tokens.json';

export default function KeywordStrategyPage() {
  return (
    <div style={{ minHeight: '100vh', background: tokens.colors.background }}>
      <TopNav />
      <Breadcrumbs />

      <Container>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          paddingTop: tokens.spacing[8],
          paddingBottom: tokens.spacing[12]
        }}>
          <div style={{ textAlign: 'center', marginBottom: tokens.spacing[12] }}>
            <h1 style={{
              fontSize: tokens.typography.fontSize['4xl'],
              fontWeight: tokens.typography.fontWeight.bold,
              color: tokens.colors.text,
              marginBottom: tokens.spacing[3]
            }}>
              🎯 Keyword Strategy Engine
            </h1>
            <p style={{
              fontSize: tokens.typography.fontSize.lg,
              color: tokens.colors.textMuted
            }}>
              Find blue ocean opportunities using REAL Etsy search data
            </p>
          </div>

          <KeywordStrategyEngine />
        </div>
      </Container>
    </div>
  );
}
