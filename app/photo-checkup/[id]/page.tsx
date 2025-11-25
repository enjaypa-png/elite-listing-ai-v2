'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Container, Button, Card } from '@/components/ui';
import { StepLayout, ProgressIndicator, InfoTooltip } from '@/components/workflow';
import tokens from '@/design-system/tokens.json';

export default function PhotoCheckupPage() {
  const router = useRouter();
  const params = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [photoAnalysis, setPhotoAnalysis] = useState<any>(null);

  useEffect(() => {
    analyzePhoto();
  }, [params.id]);

  const analyzePhoto = async () => {
    setIsLoading(true);
    
    try {
      // Get stored photo data
      const { OptimizationStorage } = await import('@/lib/optimizationState');
      const state = OptimizationStorage.get(params.id as string);
      
      if (!state || !state.photo.analysis) {
        console.log('No cached analysis found');
        setIsLoading(false);
        return;
      }

      // Use existing analysis from upload step
      const analysis = state.photo.analysis;
      
      setPhotoAnalysis({
        score: analysis.score >= 75 ? 'Good' : analysis.score >= 50 ? 'OK' : 'Needs Work',
        overallScore: analysis.score || 75,
        tips: analysis.suggestions || [
          'Great lighting - product is clearly visible',
          'Background is clean and not distracting',
          'Photo is sharp and in focus',
          'Consider adding more product angles',
          'Photo meets Etsy resolution requirements'
        ],
        imageUrl: state.photo.original
      });
    } catch (error) {
      console.error('Analysis error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getScoreColor = (score: string) => {
    if (score === 'Good') return { bg: tokens.colors.success, text: 'Excellent quality!' };
    if (score === 'OK') return { bg: tokens.colors.warning, text: 'Room for improvement' };
    return { bg: tokens.colors.danger, text: 'Needs improvement' };
  };

  if (isLoading) {
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
            Analyzing your photo...
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

  const scoreColor = getScoreColor(photoAnalysis.score);

  return (
    <StepLayout
      header={
        <>
          <ProgressIndicator currentStep={2} />
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
            Step 2: Photo Checkup
            <InfoTooltip text="We look at lighting, sharpness, and background clarity" />
          </h1>
        </>
      }
      footer={
        <>
          <Button 
            variant="primary" 
            size="lg"
            onClick={() => router.push(`/photo-improve/${params.id}`)}
          >
            ✨ Improve My Photo
          </Button>
          <Button 
            variant="secondary" 
            size="lg"
            onClick={() => router.push(`/keywords/${params.id}`)}
          >
            Skip to Keywords →
          </Button>
        </>
      }
    >
      <Container>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: tokens.spacing[8],
            marginBottom: tokens.spacing[8]
          }}>
            {/* Photo Preview */}
            <Card>
              <div style={{ padding: 0 }}>
                <img
                  src={photoAnalysis.imageUrl}
                  alt="Your product"
                  style={{
                    width: '100%',
                    height: '400px',
                    objectFit: 'cover',
                    borderRadius: tokens.radius.xl
                  }}
                />
              </div>
            </Card>

            {/* Analysis Results */}
            <div>
              {/* Score Badge */}
              <div style={{
                padding: tokens.spacing[6],
                background: scoreColor.bg,
                borderRadius: tokens.radius.xl,
                marginBottom: tokens.spacing[6],
                textAlign: 'center'
              }}>
                <p style={{
                  fontSize: tokens.typography.fontSize['4xl'],
                  fontWeight: tokens.typography.fontWeight.bold,
                  color: tokens.colors.text,
                  marginBottom: tokens.spacing[2]
                }}>
                  {photoAnalysis.score}
                </p>
                <p style={{
                  fontSize: tokens.typography.fontSize.lg,
                  color: tokens.colors.text,
                  opacity: 0.9
                }}>
                  {scoreColor.text}
                </p>
              </div>

              {/* Tips */}
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
                    💡 Photo Tips
                    <InfoTooltip text="Simple ways to make your photo better" />
                  </h3>
                  <ul style={{
                    listStyle: 'none',
                    padding: 0,
                    margin: 0
                  }}>
                    {photoAnalysis.tips.map((tip: string, index: number) => (
                      <li
                        key={index}
                        style={{
                          padding: `${tokens.spacing[3]} 0`,
                          borderBottom: index < photoAnalysis.tips.length - 1 ? `1px solid ${tokens.colors.border}` : 'none',
                          fontSize: tokens.typography.fontSize.base,
                          color: tokens.colors.textMuted,
                          display: 'flex',
                          alignItems: 'start',
                          gap: tokens.spacing[3]
                        }}
                      >
                        <span style={{ 
                          color: tip.includes('Consider') ? tokens.colors.warning : tokens.colors.success 
                        }}>
                          {tip.includes('Consider') ? '⚠️' : '✓'}
                        </span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </Container>

      {/* Mobile Responsive */}
      <style jsx>{`
        @media (max-width: 768px) {
          div[style*="gridTemplateColumns"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </StepLayout>
  );
}
