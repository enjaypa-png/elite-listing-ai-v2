'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Container, Card } from '@/components/ui';
import tokens from '@/design-system/tokens.json';

export default function TitleDescriptionPage() {
  const router = useRouter();
  const params = useParams();
  const [isGenerating, setIsGenerating] = useState(true);
  const [content, setContent] = useState<any>(null);
  const [selectedTitle, setSelectedTitle] = useState<'current' | 'suggested'>('suggested');
  const [selectedDescription, setSelectedDescription] = useState<'current' | 'suggested'>('suggested');

  useEffect(() => {
    generateContent();
  }, [params.id]);

  const generateContent = async () => {
    setIsGenerating(true);
    
    try {
      // Get stored data
      const { OptimizationStorage } = await import('@/lib/optimizationState');
      const state = OptimizationStorage.get(params.id as string);
      
      if (!state) {
        console.error('No optimization state found');
        router.push('/upload');
        return;
      }

      // Call optimization API with selected keywords
      const response = await fetch('/api/optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: state.title.current || '',
          description: state.description.current || '',
          tags: state.keywords.selected,
          platform: 'etsy'
        })
      });

      if (!response.ok) {
        throw new Error('Content generation failed');
      }

      const data = await response.json();
      
      // Get first variant
      const variant = data.variants?.[0] || {};
      
      setContent({
        title: {
          current: state.title.current || 'Your Product',
          suggested: variant.title || 'AI-Generated Title'
        },
        description: {
          current: state.description.current || 'Product description',
          suggested: variant.description || 'AI-Generated Description'
        }
      });

      // Update state
      OptimizationStorage.update(params.id as string, {
        title: {
          current: state.title.current || 'Your Product',
          suggested: variant.title || '',
          selected: 'suggested'
        },
        description: {
          current: state.description.current || '',
          suggested: variant.description || '',
          selected: 'suggested'
        }
      });
    } catch (error) {
      console.error('Content generation error:', error);
      alert('Failed to generate content. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApplyAll = () => {
    setSelectedTitle('suggested');
    setSelectedDescription('suggested');
  };

  const handleContinue = () => {
    // Save selections to state
    const { OptimizationStorage } = require('@/lib/optimizationState');
    OptimizationStorage.update(params.id as string, {
      title: {
        ...content.title,
        selected: selectedTitle
      },
      description: {
        ...content.description,
        selected: selectedDescription
      }
    });
    
    // Continue to finish
    router.push(`/finish/${params.id}`);
  };

  if (isGenerating) {
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
          <p style={{ fontSize: '18px', color: '#9CA3AF' }}>Writing your title and description...</p>
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
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
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
              Step 5: Title & Description
              <span
                title="We rewrite your text based on your photo and chosen phrases"
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
            <p style={{
              fontSize: '18px',
              color: '#9CA3AF'
            }}>
              Compare and choose the best version for your listing
            </p>
          </div>

          {/* Title Section */}
          <div style={{ marginBottom: '48px' }}>
            <h2 style={{
              fontSize: '24px',
              fontWeight: 'bold',
              color: '#F9FAFB',
              marginBottom: '24px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              📝 Title
              <span
                title="Your listing title - keep it clear and keyword-rich"
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
            </h2>

            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '24px'
            }}
            className="comparison-grid"
            >
              {/* What You Have Now */}
              <Card>
                <div style={{ padding: '24px' }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '16px'
                  }}>
                    <h3 style={{
                      fontSize: '16px',
                      fontWeight: 600,
                      color: '#9CA3AF'
                    }}>
                      What You Have Now
                    </h3>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                      <input
                        type="radio"
                        name="title"
                        checked={selectedTitle === 'current'}
                        onChange={() => setSelectedTitle('current')}
                        style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                      />
                      <span style={{ fontSize: '14px', color: '#D1D5DB' }}>Use This</span>
                    </label>
                  </div>
                  <p style={{
                    fontSize: '18px',
                    color: '#F9FAFB',
                    lineHeight: 1.5,
                    padding: '16px',
                    background: 'rgba(0, 0, 0, 0.3)',
                    borderRadius: '8px',
                    border: selectedTitle === 'current' ? '2px solid #3B82F6' : '1px solid rgba(255,255,255,0.1)'
                  }}>
                    {content.title.current}
                  </p>
                </div>
              </Card>

              {/* Our Suggested Version */}
              <Card>
                <div style={{ padding: '24px' }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '16px'
                  }}>
                    <h3 style={{
                      fontSize: '16px',
                      fontWeight: 600,
                      color: '#10B981',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}>
                      Our Suggested Version ✨
                    </h3>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                      <input
                        type="radio"
                        name="title"
                        checked={selectedTitle === 'suggested'}
                        onChange={() => setSelectedTitle('suggested')}
                        style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#10B981' }}
                      />
                      <span style={{ fontSize: '14px', color: '#D1D5DB' }}>Use This</span>
                    </label>
                  </div>
                  <p style={{
                    fontSize: '18px',
                    color: '#F9FAFB',
                    lineHeight: 1.5,
                    padding: '16px',
                    background: 'rgba(16, 185, 129, 0.1)',
                    borderRadius: '8px',
                    border: selectedTitle === 'suggested' ? '2px solid #10B981' : '1px solid rgba(16, 185, 129, 0.3)'
                  }}>
                    {content.title.suggested}
                  </p>
                </div>
              </Card>
            </div>
          </div>

          {/* Description Section */}
          <div style={{ marginBottom: '48px' }}>
            <h2 style={{
              fontSize: '24px',
              fontWeight: 'bold',
              color: '#F9FAFB',
              marginBottom: '24px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              📄 Description
              <span
                title="Your product description - tell customers what makes your product special"
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
            </h2>

            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '24px'
            }}
            className="comparison-grid"
            >
              {/* What You Have Now */}
              <Card>
                <div style={{ padding: '24px' }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '16px'
                  }}>
                    <h3 style={{
                      fontSize: '16px',
                      fontWeight: 600,
                      color: '#9CA3AF'
                    }}>
                      What You Have Now
                    </h3>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                      <input
                        type="radio"
                        name="description"
                        checked={selectedDescription === 'current'}
                        onChange={() => setSelectedDescription('current')}
                        style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                      />
                      <span style={{ fontSize: '14px', color: '#D1D5DB' }}>Use This</span>
                    </label>
                  </div>
                  <div style={{
                    fontSize: '16px',
                    color: '#D1D5DB',
                    lineHeight: 1.7,
                    padding: '16px',
                    background: 'rgba(0, 0, 0, 0.3)',
                    borderRadius: '8px',
                    border: selectedDescription === 'current' ? '2px solid #3B82F6' : '1px solid rgba(255,255,255,0.1)',
                    minHeight: '300px',
                    maxHeight: '400px',
                    overflowY: 'auto',
                    whiteSpace: 'pre-wrap'
                  }}>
                    {content.description.current}
                  </div>
                </div>
              </Card>

              {/* Our Suggested Version */}
              <Card>
                <div style={{ padding: '24px' }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '16px'
                  }}>
                    <h3 style={{
                      fontSize: '16px',
                      fontWeight: 600,
                      color: '#10B981',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}>
                      Our Suggested Version ✨
                    </h3>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                      <input
                        type="radio"
                        name="description"
                        checked={selectedDescription === 'suggested'}
                        onChange={() => setSelectedDescription('suggested')}
                        style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#10B981' }}
                      />
                      <span style={{ fontSize: '14px', color: '#D1D5DB' }}>Use This</span>
                    </label>
                  </div>
                  <div style={{
                    fontSize: '16px',
                    color: '#F9FAFB',
                    lineHeight: 1.7,
                    padding: '16px',
                    background: 'rgba(16, 185, 129, 0.1)',
                    borderRadius: '8px',
                    border: selectedDescription === 'suggested' ? '2px solid #10B981' : '1px solid rgba(16, 185, 129, 0.3)',
                    minHeight: '300px',
                    maxHeight: '400px',
                    overflowY: 'auto',
                    whiteSpace: 'pre-wrap'
                  }}>
                    {content.description.suggested}
                  </div>
                </div>
              </Card>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '16px',
            flexWrap: 'wrap'
          }}>
            <button
              onClick={() => router.back()}
              style={{
                padding: '12px 24px',
                background: 'rgba(239, 68, 68, 0.1)',
                color: '#EF4444',
                border: '1px solid #EF4444',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: 600,
                cursor: 'pointer',
                minHeight: '48px'
              }}
              title="Go back to keywords"
            >
              ← Back
            </button>

            <button
              onClick={handleApplyAll}
              style={{
                padding: '12px 24px',
                background: 'rgba(59, 130, 246, 0.1)',
                color: '#60A5FA',
                border: '1px solid #3B82F6',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: 600,
                cursor: 'pointer',
                minHeight: '48px'
              }}
              title="Use both AI-suggested title and description"
            >
              ✨ Apply All Suggestions
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
                boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
              }}
              title="Continue to final step"
            >
              Continue to Finish →
            </button>
          </div>

          {/* Selection Summary */}
          <div style={{
            marginTop: '32px',
            textAlign: 'center',
            padding: '16px',
            background: 'rgba(59, 130, 246, 0.05)',
            borderRadius: '8px',
            border: '1px solid rgba(59, 130, 246, 0.2)'
          }}>
            <p style={{ fontSize: '14px', color: '#9CA3AF', marginBottom: '8px' }}>
              Your selections:
            </p>
            <p style={{ fontSize: '16px', color: '#F9FAFB' }}>
              Title: <strong style={{ color: selectedTitle === 'suggested' ? '#10B981' : '#60A5FA' }}>
                {selectedTitle === 'suggested' ? 'AI-Suggested' : 'Original'}
              </strong>
              {' • '}
              Description: <strong style={{ color: selectedDescription === 'suggested' ? '#10B981' : '#60A5FA' }}>
                {selectedDescription === 'suggested' ? 'AI-Suggested' : 'Original'}
              </strong>
            </p>
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
