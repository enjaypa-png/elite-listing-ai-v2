import { Suspense } from 'react';
import OptimizationStudio from '@/components/optimization/OptimizationStudio';
import tokens from '@/design-system/tokens.json';

// This is a Server Component (default in Next.js 15)
export default function OptimizePage({ params }: { params: { listingId: string } }) {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: tokens.colors.background }}>
      <Suspense fallback={
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: '48px',
              height: '48px',
              border: `4px solid ${tokens.colors.borderLight}`,
              borderTopColor: tokens.colors.primary,
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto',
              marginBottom: tokens.spacing[4]
            }} />
            <p style={{ color: tokens.colors.textMuted }}>Loading optimization studio...</p>
          </div>
        </div>
      }>
        <OptimizationStudio listingId={params.listingId} />
      </Suspense>
    </div>
  );
}

// Optional: Add metadata
export async function generateMetadata({ params }: { params: { listingId: string } }) {
  return {
    title: `Optimize Listing ${params.listingId} | Elite Listing AI`,
    description: 'AI-powered Etsy listing optimization with 285-point algorithm',
  };
}
