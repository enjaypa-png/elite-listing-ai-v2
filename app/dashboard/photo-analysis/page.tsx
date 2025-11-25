'use client';

import { useRouter } from 'next/navigation';
import { Container, Card } from '@/components/ui';
import { TopNav, Breadcrumbs } from '@/components/navigation';
import tokens from '@/design-system/tokens.json';

export default function PhotoAnalysisPage() {
  const router = useRouter();

  return (
    <div style={{ minHeight: '100vh', background: tokens.colors.background }}>
      <TopNav />
      <Breadcrumbs />

      <Container>
        <div style={{ maxWidth: '1200px', margin: '0 auto', paddingTop: tokens.spacing[12], textAlign: 'center' }}>
          <Card>
            <div style={{ padding: tokens.spacing[12] }}>
              <div style={{ fontSize: tokens.typography.fontSize['6xl'], marginBottom: tokens.spacing[6] }}>📸</div>
              <h1 style={{
                fontSize: tokens.typography.fontSize['3xl'],
                fontWeight: tokens.typography.fontWeight.bold,
                color: tokens.colors.text,
                marginBottom: tokens.spacing[4]
              }}>
                Photo Analysis
              </h1>
              <p style={{ fontSize: tokens.typography.fontSize.lg, color: tokens.colors.textMuted, marginBottom: tokens.spacing[4] }}>
                Redirecting to upload workflow...
              </p>
            </div>
          </Card>
        </div>
      </Container>
      <script dangerouslySetInnerHTML={{ __html: `setTimeout(() => window.location.href = '/upload', 1000)` }} />
    </div>
  );
}
