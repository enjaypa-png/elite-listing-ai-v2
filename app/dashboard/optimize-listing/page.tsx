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
      // For now, show that it's working (full optimization logic coming next)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setOptimizationResult({
        success: true,
        message: 'Analysis complete! Full optimization features being built.',
        selectedOptions: optimizationOptions,
        listingUrl: listingUrl,
        note: 'Next: We will fetch the listing, run R.A.N.K. 285™ analysis, and provide optimized versions of title, tags, and description.'
      });
    } catch (error) {
      console.error('Optimization error:', error);
      alert('Failed to optimize listing. Please try again.');
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
                <div style={{
                  marginTop: tokens.spacing[6],
                  padding: tokens.spacing[6],
                  background: `${tokens.colors.primary}1A`,
                  border: `1px solid ${tokens.colors.primary}33`,
                  borderRadius: tokens.radius.md
                }}>
                  <div style={{
                    fontWeight: tokens.typography.fontWeight.semibold,
                    color: tokens.colors.primary,
                    marginBottom: tokens.spacing[3],
                    fontSize: tokens.typography.fontSize.lg
                  }}>
                    ✅ {optimizationResult.message}
                  </div>
                  <div style={{
                    fontSize: tokens.typography.fontSize.sm,
                    color: tokens.colors.textMuted,
                    marginBottom: tokens.spacing[3]
                  }}>
                    <strong>Selected:</strong> {optimizationResult.selectedOptions.includes('all') ? 'Optimize Everything' : optimizationResult.selectedOptions.join(', ')}
                  </div>
                  <div style={{
                    fontSize: tokens.typography.fontSize.sm,
                    color: tokens.colors.textMuted,
                    padding: tokens.spacing[4],
                    background: tokens.colors.background,
                    borderRadius: tokens.radius.sm,
                    marginTop: tokens.spacing[3],
                    border: `1px solid ${tokens.colors.border}`
                  }}>
                    <strong style={{ color: tokens.colors.text }}>Coming Next:</strong><br/>
                    {optimizationResult.note}
                  </div>
                  <div style={{ marginTop: tokens.spacing[4] }}>
                    <Button
                      variant="secondary"
                      size="md"
                      onClick={() => setOptimizationResult(null)}
                    >
                      Optimize Another Listing
                    </Button>
                  </div>
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
