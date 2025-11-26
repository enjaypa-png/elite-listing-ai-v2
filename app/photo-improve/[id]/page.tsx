'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Container, Card, Button } from '@/components/ui';
import { StepLayout, ProgressIndicator, InfoTooltip } from '@/components/workflow';
import { TopNav, Breadcrumbs } from '@/components/navigation';
import tokens from '@/design-system/tokens.json';

export default function PhotoImprovePage() {
  const router = useRouter();
  const params = useParams();
  const [isImproving, setIsImproving] = useState(true);
  const [selectedVersion, setSelectedVersion] = useState<'original' | 'improved'>('original');
  const [photoData, setPhotoData] = useState<any>(null);

  useEffect(() => {
    improvePhoto();
  }, []);

  const improvePhoto = async () => {
    setIsImproving(true);
    
    try {
      // Get the actual uploaded photo from sessionStorage
      const { OptimizationStorage } = await import('@/lib/optimizationState');
      const state = OptimizationStorage.get(params.id as string);
      
      if (!state || !state.photo.original) {
        console.error('No photo found in optimization state');
        setIsImproving(false);
        return;
      }

      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setPhotoData({
        original: state.photo.original,
        improved: state.photo.original,
        improvements: [
          'AI photo enhancement feature coming soon',
          'For now, using your original photo',
          'Continue to keywords to optimize your listing text'
        ]
      });
    } catch (error) {
      console.error('Improvement error:', error);
    } finally {
      setIsImproving(false);
    }
  };

  const handleContinue = () => {
    router.push(`/keywords/${params.id}`);
  };

  if (isImproving) {
    return (
      <div style={{
        minHeight: '100vh',
        background: tokens.colors.background,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: tokens.spacing[16],
            height: tokens.spacing[16],
            border: `4px solid ${tokens.colors.surface2}`,
            borderTopColor: tokens.colors.primary,
            borderRadius: tokens.radius.full,
            animation: 'spin 1s linear infinite',
            margin: `0 auto ${tokens.spacing[6]}`
          }} />
          <p style={{ 
            fontSize: tokens.typography.fontSize.lg, 
            color: tokens.colors.textMuted 
          }}>
            Preparing your photo...
          </p>
        </div>
        <style jsx>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <>
      <TopNav />
      <Breadcrumbs />
      
      <StepLayout
      header={
        <>
          <ProgressIndicator currentStep={3} />
          <h1 style={{
            fontSize: tokens.typography.fontSize['3xl'],
            fontWeight: tokens.typography.fontWeight.bold,
            color: tokens.colors.text,
            marginBottom: tokens.spacing[3],
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: tokens.spacing[3]
          }}>
            Step 3: Photo Improvement
            <InfoTooltip text="AI photo enhancement coming soon" />
          </h1>
          <p style={{
            fontSize: tokens.typography.fontSize.lg,
            color: tokens.colors.textMuted
          }}>
            Compare your original photo with enhanced version (coming soon)
          </p>
        </>
      }
      footer={
        <>
          <Button variant="secondary" size="lg" onClick={() => router.back()}>
            ← Back
          </Button>
          <Button variant="primary" size="lg" onClick={handleContinue}>
            Continue to Keywords →
          </Button>
        </>
      }
    >
      <Container>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          {/* Before/After Comparison */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: tokens.spacing[8],
            marginBottom: tokens.spacing[10]
          }}>
            {/* Original */}
            <div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: tokens.spacing[4]
              }}>
                <h3 style={{
                  fontSize: tokens.typography.fontSize.xl,
                  fontWeight: tokens.typography.fontWeight.bold,
                  color: tokens.colors.text
                }}>
                  Original
                </h3>
                <label style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2], cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="photo"
                    checked={selectedVersion === 'original'}
                    onChange={() => setSelectedVersion('original')}
                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                  />
                  <span style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.textMuted }}>Keep Original</span>
                </label>
              </div>
              <Card>
                <div style={{ padding: 0 }}>
                  <img
                    src={photoData.original}
                    alt="Original"
                    style={{
                      width: '100%',
                      height: '400px',
                      objectFit: 'contain',
                      borderRadius: tokens.radius.xl,
                      background: tokens.colors.surface
                    }}
                  />
                </div>
              </Card>
            </div>

            {/* Improved */}
            <div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: tokens.spacing[4]
              }}>
                <h3 style={{
                  fontSize: tokens.typography.fontSize.xl,
                  fontWeight: tokens.typography.fontWeight.bold,
                  color: tokens.colors.success,
                  display: 'flex',
                  alignItems: 'center',
                  gap: tokens.spacing[2]
                }}>
                  Improved ✨
                </h3>
                <label style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2], cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="photo"
                    checked={selectedVersion === 'improved'}
                    onChange={() => setSelectedVersion('improved')}
                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                  />
                  <span style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.textMuted }}>Use Improved</span>
                </label>
              </div>
              <Card>
                <div style={{ padding: 0, position: 'relative' }}>
                  <img
                    src={photoData.improved}
                    alt="Improved"
                    style={{
                      width: '100%',
                      height: '400px',
                      objectFit: 'contain',
                      borderRadius: tokens.radius.xl,
                      background: tokens.colors.surface,
                      border: selectedVersion === 'improved' ? `3px solid ${tokens.colors.success}` : 'none'
                    }}
                  />
                </div>
              </Card>
            </div>
          </div>

          {/* What We Improved */}
          <Card>
            <div style={{ padding: tokens.spacing[6] }}>
              <h3 style={{
                fontSize: tokens.typography.fontSize.xl,
                fontWeight: tokens.typography.fontWeight.bold,
                color: tokens.colors.text,
                marginBottom: tokens.spacing[4],
                display: 'flex',
                alignItems: 'center',
                gap: tokens.spacing[2]
              }}>
                💡 What We Improved
                <InfoTooltip text="Enhancement features coming soon" />
              </h3>
              <ul style={{
                listStyle: 'none',
                padding: 0,
                margin: 0
              }}>
                {photoData.improvements.map((improvement: string, index: number) => (
                  <li
                    key={index}
                    style={{
                      padding: `${tokens.spacing[3]} 0`,
                      borderBottom: index < photoData.improvements.length - 1 ? `1px solid ${tokens.colors.border}` : 'none',
                      fontSize: tokens.typography.fontSize.base,
                      color: tokens.colors.textMuted,
                      display: 'flex',
                      alignItems: 'start',
                      gap: tokens.spacing[3]
                    }}
                  >
                    <span style={{ color: tokens.colors.success }}>✓</span>
                    <span>{improvement}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Card>

          <div style={{
            marginTop: tokens.spacing[8],
            textAlign: 'center',
            padding: tokens.spacing[4],
            background: `${tokens.colors.primary}0D`,
            borderRadius: tokens.radius.lg,
            border: `1px solid ${tokens.colors.border}`
          }}>
            <p style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.textMuted }}>
              Using: <strong style={{ color: selectedVersion === 'improved' ? tokens.colors.success : tokens.colors.primary }}>
                {selectedVersion === 'improved' ? 'Improved Photo' : 'Original Photo'}
              </strong>
            </p>
          </div>
        </div>
      </Container>

      <style jsx>{`
        @media (max-width: 768px) {
          div[style*="gridTemplateColumns"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </StepLayout>
    </>
  );
}
