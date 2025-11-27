'use client';

import { useState } from 'react';
import { TopNav, Breadcrumbs } from '@/components/navigation';
import { Container, Card, Button } from '@/components/ui';
import tokens from '@/design-system/tokens.json';

export default function OptimizeListingPage() {
  const [listingUrl, setListingUrl] = useState('');
  const [optimizationOptions, setOptimizationOptions] = useState<string[]>(['all']);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizationResult, setOptimizationResult] = useState<any>(null);

  const options = [
    { value: 'all', label: 'Optimize Everything', icon: '⚡' },
    { value: 'title', label: 'Optimize Title', icon: '📝' },
    { value: 'tags', label: 'Optimize Tags', icon: '🏷️' },
    { value: 'description', label: 'Optimize Description', icon: '📄' },
    { value: 'photos', label: 'Optimize Photos', icon: '📸' },
    { value: 'pricing', label: 'Optimize Pricing', icon: '💰' },
    { value: 'seo', label: 'SEO Boost', icon: '📊' },
  ];

  const toggleOption = (value: string) => {
    if (value === 'all') {
      setOptimizationOptions(['all']);
    } else {
      const newOptions = optimizationOptions.filter(o => o !== 'all');
      if (newOptions.includes(value)) {
        setOptimizationOptions(newOptions.filter(o => o !== value));
      } else {
        setOptimizationOptions([...newOptions, value]);
      }
    }
  };

  const handleOptimize = async () => {
    // Validation
    if (!listingUrl.trim()) {
      alert('⚠️ Please enter an Etsy listing URL to analyze');
      return;
    }
    
    if (!listingUrl.includes('etsy.com/listing/')) {
      alert('⚠️ Please enter a valid Etsy listing URL\n\nExample: https://www.etsy.com/listing/123456789/product-name');
      return;
    }

    setIsOptimizing(true);

    try {
      // Extract listing ID from URL
      const listingIdMatch = listingUrl.match(/listing\/(\d+)/);
      const listingId = listingIdMatch ? listingIdMatch[1] : '';

      // For now, run R.A.N.K. 285™ analysis on placeholder data
      // In production, this would fetch actual listing data from Etsy
      const response = await fetch('/api/seo/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform: 'Etsy',
          title: 'Sample Listing Title (fetching real data coming soon)',
          description: 'Sample description text for analysis',
          tags: 'sample, tags, keywords',
          category: 'Home & Living'
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setOptimizationResult({
          ...data,
          listingId: listingId,
          listingUrl: listingUrl,
          selectedOptions: optimizationOptions
        });
      } else {
        alert('Analysis failed. Please try again.');
      }
    } catch (error) {
      console.error('Optimization error:', error);
      alert('Failed to analyze listing. Please try again.');
    } finally {
      setIsOptimizing(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: tokens.colors.background }}>
      <TopNav />
      <Breadcrumbs />

      <Container>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          paddingTop: tokens.spacing[12],
          paddingBottom: tokens.spacing[12]
        }}>
          <div style={{ textAlign: 'center', marginBottom: tokens.spacing[12] }}>
            <h1 style={{
              fontSize: tokens.typography.fontSize['4xl'],
              fontWeight: tokens.typography.fontWeight.bold,
              color: tokens.colors.text,
              marginBottom: tokens.spacing[3]
            }}>
              ⚡ One-Click Listing Optimizer
            </h1>
            <p style={{
              fontSize: tokens.typography.fontSize.lg,
              color: tokens.colors.textMuted
            }}>
              Optimize your Etsy listings with R.A.N.K. 285™ intelligence
            </p>
          </div>

          <Card>
            <div style={{ padding: tokens.spacing[8] }}>
              <h2 style={{
                fontSize: tokens.typography.fontSize['2xl'],
                fontWeight: tokens.typography.fontWeight.semibold,
                color: tokens.colors.text,
                marginBottom: tokens.spacing[6]
              }}>
                Enter Listing Information
              </h2>

              <div style={{ marginBottom: tokens.spacing[6] }}>
                <label style={{
                  display: 'block',
                  fontSize: tokens.typography.fontSize.sm,
                  fontWeight: tokens.typography.fontWeight.medium,
                  color: tokens.colors.text,
                  marginBottom: tokens.spacing[2]
                }}>
                  Etsy Listing URL
                </label>
                <input
                  type="text"
                  value={listingUrl}
                  onChange={(e) => setListingUrl(e.target.value)}
                  placeholder="https://www.etsy.com/listing/..."
                  style={{
                    width: '100%',
                    padding: tokens.spacing[3],
                    background: tokens.colors.surface,
                    border: `1px solid ${tokens.colors.border}`,
                    borderRadius: tokens.radius.md,
                    color: tokens.colors.text,
                    fontSize: tokens.typography.fontSize.base
                  }}
                />
              </div>

              <div style={{ marginBottom: tokens.spacing[8] }}>
                <label style={{
                  display: 'block',
                  fontSize: tokens.typography.fontSize.sm,
                  fontWeight: tokens.typography.fontWeight.medium,
                  color: tokens.colors.text,
                  marginBottom: tokens.spacing[4]
                }}>
                  What would you like to optimize?
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: tokens.spacing[3] }}>
                  {options.map(option => (
                    <button
                      key={option.value}
                      onClick={() => toggleOption(option.value)}
                      style={{
                        padding: tokens.spacing[4],
                        background: optimizationOptions.includes(option.value) || optimizationOptions.includes('all')
                          ? `${tokens.colors.primary}1A`
                          : tokens.colors.surface,
                        border: optimizationOptions.includes(option.value) || optimizationOptions.includes('all')
                          ? `2px solid ${tokens.colors.primary}`
                          : `1px solid ${tokens.colors.border}`,
                        borderRadius: tokens.radius.md,
                        color: tokens.colors.text,
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: `all ${tokens.motion.duration.fast}`
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[3] }}>
                        <span style={{ fontSize: tokens.typography.fontSize.xl }}>{option.icon}</span>
                        <span style={{ fontWeight: tokens.typography.fontWeight.medium }}>{option.label}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <Button
                variant="primary"
                size="lg"
                fullWidth
                onClick={handleOptimize}
                disabled={!listingUrl || isOptimizing}
              >
                {isOptimizing ? 'Optimizing...' : '⚡ Optimize Listing'}
              </Button>

              {optimizationResult && (
                <div style={{ marginTop: tokens.spacing[6] }}>
                  {/* Overall Score */}
                  <div style={{
                    padding: tokens.spacing[8],
                    background: tokens.card.background,
                    border: `1px solid ${tokens.card.border}`,
                    borderRadius: tokens.card.radius,
                    boxShadow: tokens.shadows.card,
                    textAlign: 'center',
                    marginBottom: tokens.spacing[6]
                  }}>
                    <div style={{
                      fontSize: tokens.typography.fontSize['6xl'],
                      fontWeight: tokens.typography.fontWeight.bold,
                      color: tokens.colors.primary,
                      marginBottom: tokens.spacing[2]
                    }}>
                      {optimizationResult.totalPoints || 0} / 285
                    </div>
                    <div style={{
                      fontSize: tokens.typography.fontSize.xl,
                      color: tokens.colors.text,
                      marginBottom: tokens.spacing[1]
                    }}>
                      R.A.N.K. Score: {optimizationResult.overallScore || 0}%
                    </div>
                    <div style={{
                      fontSize: tokens.typography.fontSize.base,
                      color: tokens.colors.textMuted
                    }}>
                      ⚡ {optimizationResult.opportunityScore || 0}% Improvement Potential
                    </div>
                  </div>

                  {/* Component Breakdown */}
                  {optimizationResult.breakdown && (
                    <div style={{
                      padding: tokens.spacing[8],
                      background: tokens.card.background,
                      border: `1px solid ${tokens.card.border}`,
                      borderRadius: tokens.card.radius,
                      boxShadow: tokens.shadows.card,
                      marginBottom: tokens.spacing[6]
                    }}>
                      <h3 style={{
                        fontSize: tokens.typography.fontSize['2xl'],
                        fontWeight: tokens.typography.fontWeight.semibold,
                        color: tokens.colors.text,
                        marginBottom: tokens.spacing[6]
                      }}>
                        Component Breakdown
                      </h3>
                      {Object.entries(optimizationResult.breakdown).map(([component, data]: [string, any]) => {
                        const icons: Record<string, string> = {
                          title: '📝',
                          tags: '🏷️',
                          description: '📄',
                          photos: '📸',
                          attributes: '🎯',
                          category: '📁'
                        };
                        const color = data.percentage >= 70 ? tokens.colors.success : 
                                     data.percentage >= 50 ? tokens.colors.warning : tokens.colors.danger;
                        
                        return (
                          <div key={component} style={{ marginBottom: tokens.spacing[4] }}>
                            <div style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              marginBottom: tokens.spacing[2]
                            }}>
                              <span style={{
                                fontSize: tokens.typography.fontSize.base,
                                color: tokens.colors.text,
                                fontWeight: tokens.typography.fontWeight.medium
                              }}>
                                {icons[component]} {component.charAt(0).toUpperCase() + component.slice(1)}
                              </span>
                              <span style={{
                                fontSize: tokens.typography.fontSize.sm,
                                color: color,
                                fontWeight: tokens.typography.fontWeight.bold
                              }}>
                                {data.score}/{data.maxScore} ({data.percentage}%)
                              </span>
                            </div>
                            <div style={{
                              width: '100%',
                              height: '8px',
                              background: tokens.colors.surface2,
                              borderRadius: tokens.radius.full,
                              overflow: 'hidden'
                            }}>
                              <div style={{
                                width: `${data.percentage}%`,
                                height: '100%',
                                background: color,
                                transition: `width ${tokens.motion.duration.slow}`
                              }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Priority Issues */}
                  {optimizationResult.priorityIssues && optimizationResult.priorityIssues.length > 0 && (
                    <div style={{
                      padding: tokens.spacing[8],
                      background: tokens.card.background,
                      border: `1px solid ${tokens.card.border}`,
                      borderRadius: tokens.card.radius,
                      boxShadow: tokens.shadows.card,
                      marginBottom: tokens.spacing[6]
                    }}>
                      <h3 style={{
                        fontSize: tokens.typography.fontSize['2xl'],
                        fontWeight: tokens.typography.fontWeight.semibold,
                        color: tokens.colors.danger,
                        marginBottom: tokens.spacing[4]
                      }}>
                        🚨 Priority Issues
                      </h3>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[3] }}>
                        {optimizationResult.priorityIssues.map((issue: string, index: number) => (
                          <div key={index} style={{
                            padding: tokens.spacing[4],
                            background: `${tokens.colors.danger}1A`,
                            border: `1px solid ${tokens.colors.danger}33`,
                            borderRadius: tokens.radius.md,
                            fontSize: tokens.typography.fontSize.sm,
                            color: tokens.colors.text
                          }}>
                            {index + 1}. {issue}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Quick Wins */}
                  {optimizationResult.quickWins && optimizationResult.quickWins.length > 0 && (
                    <div style={{
                      padding: tokens.spacing[8],
                      background: tokens.card.background,
                      border: `1px solid ${tokens.card.border}`,
                      borderRadius: tokens.card.radius,
                      boxShadow: tokens.shadows.card,
                      marginBottom: tokens.spacing[6]
                    }}>
                      <h3 style={{
                        fontSize: tokens.typography.fontSize['2xl'],
                        fontWeight: tokens.typography.fontWeight.semibold,
                        color: tokens.colors.success,
                        marginBottom: tokens.spacing[4]
                      }}>
                        ⚡ Quick Wins
                      </h3>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[3] }}>
                        {optimizationResult.quickWins.map((win: string, index: number) => (
                          <div key={index} style={{
                            padding: tokens.spacing[4],
                            background: `${tokens.colors.success}1A`,
                            border: `1px solid ${tokens.colors.success}33`,
                            borderRadius: tokens.radius.md,
                            display: 'flex',
                            alignItems: 'center',
                            gap: tokens.spacing[3]
                          }}>
                            <span style={{ fontSize: tokens.typography.fontSize.xl }}>✓</span>
                            <span style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.text }}>{win}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Note about fetching */}
                  <div style={{
                    padding: tokens.spacing[6],
                    background: tokens.colors.surface,
                    border: `1px solid ${tokens.colors.border}`,
                    borderRadius: tokens.radius.md,
                    marginBottom: tokens.spacing[4]
                  }}>
                    <div style={{
                      fontSize: tokens.typography.fontSize.sm,
                      color: tokens.colors.textMuted,
                      marginBottom: tokens.spacing[2]
                    }}>
                      <strong style={{ color: tokens.colors.text }}>Note:</strong> This analysis uses sample data. 
                      Next update will fetch your actual listing from Etsy and provide real optimized versions.
                    </div>
                  </div>

                  <Button
                    variant="secondary"
                    size="md"
                    onClick={() => {
                      setOptimizationResult(null);
                      setListingUrl('');
                    }}
                  >
                    Analyze Another Listing
                  </Button>
                </div>
              )}
            </div>
          </Card>

          {isOptimizing && (
            <Card>
              <div style={{ padding: tokens.spacing[8], textAlign: 'center' }}>
                <div style={{
                  width: tokens.spacing[16],
                  height: tokens.spacing[16],
                  border: `4px solid ${tokens.colors.surface2}`,
                  borderTopColor: tokens.colors.primary,
                  borderRadius: tokens.radius.full,
                  animation: 'spin 1s linear infinite',
                  margin: `0 auto ${tokens.spacing[6]}`
                }} />
                <p style={{ color: tokens.colors.textMuted }}>Optimizing your listing...</p>
                <style jsx>{`
                  @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                  }
                `}</style>
              </div>
            </Card>
          )}
        </div>
      </Container>
    </div>
  );
}
