'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Container, Button, Card } from '@/components/ui';
import tokens from '@/design-system/tokens.json';

export default function PhotoCheckupPage() {
  const router = useRouter();
  const params = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [photoAnalysis, setPhotoAnalysis] = useState<any>(null);

  useEffect(() => {
    analyzePhoto();
  }, []);

  const analyzePhoto = async () => {
    setIsLoading(true);
    
    try {
      // TODO: Wire up to /api/optimize/image/analyze
      // For now, use mock data
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setPhotoAnalysis({
        score: 'Good', // Good / OK / Needs Work
        overallScore: 75,
        tips: [
          'Great lighting - product is clearly visible',
          'Background is clean and not distracting',
          'Photo is sharp and in focus',
          'Consider adding more product angles',
          'Photo meets Etsy resolution requirements'
        ],
        imageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7' // Mock
      });
    } catch (error) {
      console.error('Analysis error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getScoreColor = (score: string) => {
    if (score === 'Good') return { bg: '#10B981', text: 'Excellent quality!' };
    if (score === 'OK') return { bg: '#F59E0B', text: 'Room for improvement' };
    return { bg: '#EF4444', text: 'Needs improvement' };
  };

  if (isLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '64px',
            height: '64px',
            border: '4px solid #374151',
            borderTopColor: '#3B82F6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 24px'
          }} />
          <p style={{ fontSize: '18px', color: '#9CA3AF' }}>Analyzing your photo...</p>
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
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
      paddingTop: '40px',
      paddingBottom: '80px'
    }}>
      <Container>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          {/* Progress Indicator */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '16px',
            marginBottom: '40px'
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: '#10B981',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold'
            }}>
              ✓
            </div>
            <div style={{ width: '60px', height: '2px', background: '#3B82F6' }} />
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: '#3B82F6',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold'
            }}>
              2
            </div>
            <div style={{ width: '60px', height: '2px', background: '#374151' }} />
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: '#374151',
              color: '#6B7280',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold'
            }}>
              3
            </div>
          </div>

          {/* Header */}
          <div style={{
            textAlign: 'center',
            marginBottom: '40px'
          }}>
            <h1 style={{
              fontSize: '36px',
              fontWeight: 'bold',
              color: '#F9FAFB',
              marginBottom: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px'
            }}>
              Step 2: Photo Checkup
              <span
                title="We look at lighting, sharpness, and background clarity"
                style={{
                  width: '28px',
                  height: '28px',
                  background: '#3B82F6',
                  borderRadius: '50%',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '16px',
                  cursor: 'help'
                }}
              >
                ℹ️
              </span>
            </h1>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '32px',
            marginBottom: '32px'
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
                    borderRadius: '12px'
                  }}
                />
              </div>
            </Card>

            {/* Analysis Results */}
            <div>
              {/* Score Badge */}
              <div style={{
                padding: '24px',
                background: scoreColor.bg,
                borderRadius: '12px',
                marginBottom: '24px',
                textAlign: 'center'
              }}>
                <p style={{
                  fontSize: '48px',
                  fontWeight: 'bold',
                  color: 'white',
                  marginBottom: '8px'
                }}>
                  {photoAnalysis.score}
                </p>
                <p style={{
                  fontSize: '18px',
                  color: 'white',
                  opacity: 0.9
                }}>
                  {scoreColor.text}
                </p>
              </div>

              {/* Tips */}
              <Card>
                <div style={{ padding: '24px' }}>
                  <h3 style={{
                    fontSize: '20px',
                    fontWeight: 'bold',
                    color: '#F9FAFB',
                    marginBottom: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    💡 Photo Tips
                    <span
                      title="Simple ways to make your photo better"
                      style={{
                        width: '20px',
                        height: '20px',
                        background: '#3B82F6',
                        borderRadius: '50%',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '12px',
                        cursor: 'help'
                      }}
                    >
                      ℹ️
                    </span>
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
                          padding: '12px 0',
                          borderBottom: index < photoAnalysis.tips.length - 1 ? '1px solid rgba(255,255,255,0.1)' : 'none',
                          fontSize: '16px',
                          color: '#D1D5DB',
                          display: 'flex',
                          alignItems: 'start',
                          gap: '12px'
                        }}
                      >
                        <span style={{ color: tip.includes('Consider') ? '#F59E0B' : '#10B981' }}>
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

          {/* Action Buttons */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '16px'
          }}>
            <button
              onClick={() => router.push(`/photo-improve/${params.id}`)}
              style={{
                padding: '16px 32px',
                background: 'linear-gradient(135deg, #3B82F6, #10B981)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '18px',
                fontWeight: 'bold',
                cursor: 'pointer',
                minHeight: '56px',
                boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
              }}
            >
              ✨ Improve My Photo
            </button>

            <button
              onClick={() => router.push(`/keywords/${params.id}`)}
              style={{
                padding: '16px 32px',
                background: 'rgba(59, 130, 246, 0.1)',
                color: '#60A5FA',
                border: '1px solid #3B82F6',
                borderRadius: '8px',
                fontSize: '18px',
                fontWeight: 'bold',
                cursor: 'pointer',
                minHeight: '56px'
              }}
            >
              Skip to Keywords →
            </button>
          </div>
        </div>
      </Container>

      {/* Mobile Responsive */}
      <style jsx>{`
        @media (max-width: 768px) {
          .grid-container {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
