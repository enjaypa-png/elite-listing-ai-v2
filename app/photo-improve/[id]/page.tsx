'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Container, Card } from '@/components/ui';
import tokens from '@/design-system/tokens.json';

export default function PhotoImprovePage() {
  const router = useRouter();
  const params = useParams();
  const [isImproving, setIsImproving] = useState(true);
  const [selectedVersion, setSelectedVersion] = useState<'original' | 'improved'>('improved');
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

      // TODO: Wire up to actual image improvement API
      // For now, skip this step automatically
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setPhotoData({
        original: state.photo.original,
        improved: state.photo.original, // Same as original - AI enhancement coming soon
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
    // Save selection and continue to keywords
    router.push(`/keywords/${params.id}?photo=${selectedVersion}`);
  };

  if (isImproving) {
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
          <p style={{ fontSize: '18px', color: '#9CA3AF' }}>Improving your photo...</p>
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
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
      paddingTop: '40px',
      paddingBottom: '80px'
    }}>
      <Container>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
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
              Step 3: Photo Improvement
              <span
                title="See how your image improves after cleaning and sharpening"
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
              >{"ℹ"}</span>
            </h1>
            <p style={{
              fontSize: '18px',
              color: '#9CA3AF'
            }}>
              Compare your original photo with our AI-enhanced version
            </p>
          </div>

          {/* Before/After Comparison */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '32px',
            marginBottom: '40px'
          }}
          className="comparison-grid"
          >
            {/* Original */}
            <div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '16px'
              }}>
                <h3 style={{
                  fontSize: '20px',
                  fontWeight: 'bold',
                  color: '#F9FAFB'
                }}>
                  Original
                </h3>
                <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="photoVersion"
                    checked={selectedVersion === 'original'}
                    onChange={() => setSelectedVersion('original')}
                    style={{ width: '20px', height: '20px', cursor: 'pointer', accentColor: '#3B82F6' }}
                  />
                  <span style={{ fontSize: '16px', color: '#D1D5DB', fontWeight: 600 }}>
                    Keep Original
                  </span>
                </label>
              </div>
              <Card>
                <div style={{ padding: 0 }}>
                  <img
                    src={photoData.original}
                    alt="Original photo"
                    style={{
                      width: '100%',
                      height: '400px',
                      objectFit: 'cover',
                      borderRadius: '12px',
                      border: selectedVersion === 'original' ? '3px solid #3B82F6' : 'none'
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
                marginBottom: '16px'
              }}>
                <h3 style={{
                  fontSize: '20px',
                  fontWeight: 'bold',
                  color: '#F9FAFB',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  Improved ✨
                </h3>
                <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="photoVersion"
                    checked={selectedVersion === 'improved'}
                    onChange={() => setSelectedVersion('improved')}
                    style={{ width: '20px', height: '20px', cursor: 'pointer', accentColor: '#10B981' }}
                  />
                  <span style={{ fontSize: '16px', color: '#D1D5DB', fontWeight: 600 }}>
                    Use Improved
                  </span>
                </label>
              </div>
              <Card>
                <div style={{ padding: 0 }}>
                  <img
                    src={photoData.improved}
                    alt="Improved photo"
                    style={{
                      width: '100%',
                      height: '400px',
                      objectFit: 'cover',
                      borderRadius: '12px',
                      border: selectedVersion === 'improved' ? '3px solid #10B981' : 'none'
                    }}
                  />
                </div>
              </Card>
            </div>
          </div>

          {/* Improvements List */}
          <Card>
            <div style={{ padding: '32px' }}>
              <h3 style={{
                fontSize: '20px',
                fontWeight: 'bold',
                color: '#F9FAFB',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                🎨 What We Improved
                <span
                  title="Automatic enhancements made to your photo"
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
                >{"ℹ"}</span>
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
                      padding: '12px 0',
                      borderBottom: index < photoData.improvements.length - 1 ? '1px solid rgba(255,255,255,0.1)' : 'none',
                      fontSize: '16px',
                      color: '#D1D5DB',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px'
                    }}
                  >
                    <span style={{ color: '#10B981', fontSize: '20px' }}>✓</span>
                    <span>{improvement}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Card>

          {/* Action Buttons */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '16px',
            marginTop: '40px'
          }}>
            <button
              onClick={() => router.back()}
              style={{
                padding: '16px 32px',
                background: 'rgba(239, 68, 68, 0.1)',
                color: '#EF4444',
                border: '1px solid #EF4444',
                borderRadius: '8px',
                fontSize: '18px',
                fontWeight: 'bold',
                cursor: 'pointer',
                minHeight: '56px'
              }}
            >
              ← Back
            </button>

            <button
              onClick={handleContinue}
              style={{
                padding: '16px 48px',
                background: 'linear-gradient(135deg, #3B82F6, #10B981)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '18px',
                fontWeight: 'bold',
                cursor: 'pointer',
                minHeight: '56px',
                boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}
            >
              Continue to Keywords →
            </button>
          </div>

          {/* Selection Summary */}
          <div style={{
            marginTop: '24px',
            textAlign: 'center',
            fontSize: '14px',
            color: '#9CA3AF'
          }}>
            Using: <strong style={{ color: selectedVersion === 'improved' ? '#10B981' : '#60A5FA' }}>
              {selectedVersion === 'improved' ? 'Improved Photo' : 'Original Photo'}
            </strong>
          </div>
        </div>
      </Container>

      {/* Mobile Responsive */}
      <style jsx>{`
        @media (max-width: 768px) {
          .comparison-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
