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
      console.log('Step 1: Scraping Etsy listing...');
      
      // Step 1: Scrape the Etsy listing
      const scrapeResponse = await fetch('/api/etsy/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: listingUrl })
      });

      const scrapeData = await scrapeResponse.json();
      
      if (!scrapeData.success) {
        alert(`⚠️ Failed to fetch listing data: ${scrapeData.error}\n\nPlease check the URL and try again.`);
        setIsOptimizing(false);
        return;
      }

      const listing = scrapeData.data;
      console.log('Scraped listing:', listing.title);

      // Step 2: Run R.A.N.K. 285™ analysis
      console.log('Step 2: Running R.A.N.K. 285™ analysis...');
      const auditResponse = await fetch('/api/seo/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform: 'Etsy',
          title: listing.title,
          description: listing.description,
          tags: listing.tags.join(', '),
          category: listing.category,
          photoCount: listing.imageCount
        })
      });

      const auditData = await auditResponse.json();
      
      if (!auditData.success) {
        alert('⚠️ Analysis failed. Please try again.');
        setIsOptimizing(false);
        return;
      }

      // Step 3: Generate optimized versions
      console.log('Step 3: Generating optimized content...');
      const optimizeResponse = await fetch('/api/optimize/listing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: listing.title,
          description: listing.description,
          tags: listing.tags,
          category: listing.category,
          price: listing.price,
          images: listing.images
        })
      });

      const optimizeData = await optimizeResponse.json();
      
      if (!optimizeData.success) {
        // Still show results even if optimization fails
        console.warn('Optimization generation failed:', optimizeData.error);
      }

      // Combine all data
      setOptimizationResult({
        ...auditData,
        listingId: listing.listingId,
        listingUrl: listingUrl,
        selectedOptions: optimizationOptions,
        originalData: {
          title: listing.title,
          description: listing.description,
          tags: listing.tags,
          images: listing.images,
          price: listing.price,
          category: listing.category
        },
        optimizedData: optimizeData.success ? optimizeData.optimized : null
      });

      console.log('✅ Optimization complete!');

    } catch (error) {
      console.error('Optimization error:', error);
      alert('❌ Failed to analyze listing. Please check your internet connection and try again.');
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
                  placeholder="https://www.etsy.com/listing/123456789/product-name"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !isOptimizing) {
                      handleOptimize();
                    }
                  }}
                  style={{
                    width: '100%',
                    padding: `${tokens.spacing[4]} ${tokens.spacing[4]}`,
                    background: tokens.colors.surface,
                    border: `2px solid ${listingUrl ? tokens.colors.primary : tokens.colors.border}`,
                    borderRadius: tokens.radius.md,
                    color: tokens.colors.text,
                    fontSize: tokens.typography.fontSize.base,
                    outline: 'none',
                    transition: `all ${tokens.motion.duration.fast}`
                  }}
                  onFocus={(e) => e.currentTarget.style.borderColor = tokens.colors.primary}
                  onBlur={(e) => e.currentTarget.style.borderColor = listingUrl ? tokens.colors.primary : tokens.colors.border}
                />
                <div style={{
                  fontSize: tokens.typography.fontSize.xs,
                  color: tokens.colors.textMuted,
                  marginTop: tokens.spacing[2]
                }}>
                  💡 Paste any Etsy listing URL and press Enter or click the button below
                </div>
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

                  {/* Optimized Content */}
                  {optimizationResult.optimizedData && (
                    <>
                      {/* Optimized Titles */}
                      {optimizationResult.optimizedData.titles && optimizationResult.optimizedData.titles.length > 0 && (
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
                            📝 Optimized Titles
                          </h3>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[4] }}>
                            {optimizationResult.optimizedData.titles.map((variant: any, index: number) => (
                              <div key={index} style={{
                                padding: tokens.spacing[6],
                                background: tokens.colors.surface,
                                border: `2px solid ${tokens.colors.border}`,
                                borderRadius: tokens.radius.md,
                                position: 'relative'
                              }}>
                                <div style={{
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  alignItems: 'start',
                                  marginBottom: tokens.spacing[3]
                                }}>
                                  <div style={{
                                    fontSize: tokens.typography.fontSize.xs,
                                    color: tokens.colors.primary,
                                    fontWeight: tokens.typography.fontWeight.semibold,
                                    textTransform: 'uppercase'
                                  }}>
                                    {variant.approach}
                                  </div>
                                  <button
                                    onClick={() => {
                                      navigator.clipboard.writeText(variant.text);
                                      alert('✅ Title copied to clipboard!');
                                    }}
                                    style={{
                                      padding: `${tokens.spacing[2]} ${tokens.spacing[4]}`,
                                      background: tokens.colors.primary,
                                      color: tokens.colors.primaryForeground,
                                      border: 'none',
                                      borderRadius: tokens.radius.md,
                                      fontSize: tokens.typography.fontSize.xs,
                                      fontWeight: tokens.typography.fontWeight.semibold,
                                      cursor: 'pointer'
                                    }}
                                  >
                                    📋 Copy
                                  </button>
                                </div>
                                <div style={{
                                  fontSize: tokens.typography.fontSize.lg,
                                  fontWeight: tokens.typography.fontWeight.semibold,
                                  color: tokens.colors.text,
                                  marginBottom: tokens.spacing[3],
                                  lineHeight: tokens.typography.lineHeight.relaxed
                                }}>
                                  {variant.text}
                                </div>
                                <div style={{
                                  fontSize: tokens.typography.fontSize.sm,
                                  color: tokens.colors.textMuted,
                                  marginBottom: tokens.spacing[2]
                                }}>
                                  {variant.reasoning}
                                </div>
                                <div style={{
                                  fontSize: tokens.typography.fontSize.xs,
                                  color: tokens.colors.textMuted
                                }}>
                                  Keywords: {variant.keywords?.join(', ')}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Optimized Tags */}
                      {optimizationResult.optimizedData.tags && optimizationResult.optimizedData.tags.length > 0 && (
                        <div style={{
                          padding: tokens.spacing[8],
                          background: tokens.card.background,
                          border: `1px solid ${tokens.card.border}`,
                          borderRadius: tokens.card.radius,
                          boxShadow: tokens.shadows.card,
                          marginBottom: tokens.spacing[6]
                        }}>
                          <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: tokens.spacing[4]
                          }}>
                            <h3 style={{
                              fontSize: tokens.typography.fontSize['2xl'],
                              fontWeight: tokens.typography.fontWeight.semibold,
                              color: tokens.colors.text
                            }}>
                              🏷️ Optimized Tags ({optimizationResult.optimizedData.tags.length}/13)
                            </h3>
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(optimizationResult.optimizedData.tags.join(', '));
                                alert('✅ All tags copied to clipboard!');
                              }}
                              style={{
                                padding: `${tokens.spacing[2]} ${tokens.spacing[4]}`,
                                background: tokens.colors.primary,
                                color: tokens.colors.primaryForeground,
                                border: 'none',
                                borderRadius: tokens.radius.md,
                                fontSize: tokens.typography.fontSize.sm,
                                fontWeight: tokens.typography.fontWeight.semibold,
                                cursor: 'pointer'
                              }}
                            >
                              📋 Copy All Tags
                            </button>
                          </div>
                          <div style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: tokens.spacing[2],
                            marginBottom: tokens.spacing[4]
                          }}>
                            {optimizationResult.optimizedData.tags.map((tag: string, index: number) => (
                              <span
                                key={index}
                                style={{
                                  padding: `${tokens.spacing[2]} ${tokens.spacing[4]}`,
                                  background: tokens.colors.surface,
                                  border: `1px solid ${tokens.colors.border}`,
                                  borderRadius: tokens.radius.full,
                                  fontSize: tokens.typography.fontSize.sm,
                                  color: tokens.colors.text
                                }}
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                          {optimizationResult.optimizedData.tagsReasoning && (
                            <div style={{
                              fontSize: tokens.typography.fontSize.sm,
                              color: tokens.colors.textMuted,
                              fontStyle: 'italic'
                            }}>
                              {optimizationResult.optimizedData.tagsReasoning}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Optimized Description */}
                      {optimizationResult.optimizedData.description && (
                        <div style={{
                          padding: tokens.spacing[8],
                          background: tokens.card.background,
                          border: `1px solid ${tokens.card.border}`,
                          borderRadius: tokens.card.radius,
                          boxShadow: tokens.shadows.card,
                          marginBottom: tokens.spacing[6]
                        }}>
                          <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: tokens.spacing[4]
                          }}>
                            <h3 style={{
                              fontSize: tokens.typography.fontSize['2xl'],
                              fontWeight: tokens.typography.fontWeight.semibold,
                              color: tokens.colors.text
                            }}>
                              📄 Optimized Description
                            </h3>
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(optimizationResult.optimizedData.description);
                                alert('✅ Description copied to clipboard!');
                              }}
                              style={{
                                padding: `${tokens.spacing[2]} ${tokens.spacing[4]}`,
                                background: tokens.colors.primary,
                                color: tokens.colors.primaryForeground,
                                border: 'none',
                                borderRadius: tokens.radius.md,
                                fontSize: tokens.typography.fontSize.sm,
                                fontWeight: tokens.typography.fontWeight.semibold,
                                cursor: 'pointer'
                              }}
                            >
                              📋 Copy Description
                            </button>
                          </div>
                          <div style={{
                            padding: tokens.spacing[6],
                            background: tokens.colors.surface,
                            border: `1px solid ${tokens.colors.border}`,
                            borderRadius: tokens.radius.md,
                            fontSize: tokens.typography.fontSize.base,
                            color: tokens.colors.text,
                            lineHeight: tokens.typography.lineHeight.relaxed,
                            whiteSpace: 'pre-wrap',
                            fontFamily: 'monospace',
                            maxHeight: '400px',
                            overflowY: 'auto'
                          }}>
                            {optimizationResult.optimizedData.description}
                          </div>
                          {optimizationResult.optimizedData.descriptionImprovements && optimizationResult.optimizedData.descriptionImprovements.length > 0 && (
                            <div style={{ marginTop: tokens.spacing[4] }}>
                              <div style={{
                                fontSize: tokens.typography.fontSize.sm,
                                fontWeight: tokens.typography.fontWeight.semibold,
                                color: tokens.colors.text,
                                marginBottom: tokens.spacing[2]
                              }}>
                                Improvements Made:
                              </div>
                              <ul style={{
                                fontSize: tokens.typography.fontSize.sm,
                                color: tokens.colors.textMuted,
                                paddingLeft: tokens.spacing[6]
                              }}>
                                {optimizationResult.optimizedData.descriptionImprovements.map((improvement: string, index: number) => (
                                  <li key={index} style={{ marginBottom: tokens.spacing[1] }}>{improvement}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Copy Everything Button */}
                      {optimizationResult.optimizedData && (
                        <div style={{
                          padding: tokens.spacing[8],
                          background: `${tokens.colors.primary}15`,
                          border: `2px solid ${tokens.colors.primary}`,
                          borderRadius: tokens.card.radius,
                          textAlign: 'center',
                          marginBottom: tokens.spacing[6]
                        }}>
                          <div style={{
                            fontSize: tokens.typography.fontSize.xl,
                            fontWeight: tokens.typography.fontWeight.bold,
                            color: tokens.colors.text,
                            marginBottom: tokens.spacing[3]
                          }}>
                            🎉 Optimization Complete!
                          </div>
                          <div style={{
                            fontSize: tokens.typography.fontSize.base,
                            color: tokens.colors.textMuted,
                            marginBottom: tokens.spacing[6]
                          }}>
                            Your listing has been optimized. Copy the content and paste it into your Etsy listing.
                          </div>
                          <button
                            onClick={() => {
                              const allContent = `
=== OPTIMIZED TITLES ===
${optimizationResult.optimizedData.titles.map((t: any, i: number) => `${i + 1}. ${t.text}`).join('\n')}

=== OPTIMIZED TAGS (${optimizationResult.optimizedData.tags.length}) ===
${optimizationResult.optimizedData.tags.join(', ')}

=== OPTIMIZED DESCRIPTION ===
${optimizationResult.optimizedData.description}
                              `.trim();
                              navigator.clipboard.writeText(allContent);
                              alert('✅ All optimized content copied to clipboard!');
                            }}
                            style={{
                              padding: `${tokens.spacing[4]} ${tokens.spacing[8]}`,
                              background: tokens.colors.primary,
                              color: tokens.colors.primaryForeground,
                              border: 'none',
                              borderRadius: tokens.radius.md,
                              fontSize: tokens.typography.fontSize.lg,
                              fontWeight: tokens.typography.fontWeight.bold,
                              cursor: 'pointer',
                              boxShadow: `0 4px 12px ${tokens.colors.primary}40`,
                              transition: `all ${tokens.motion.duration.fast}`
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.transform = 'translateY(-2px)';
                              e.currentTarget.style.boxShadow = `0 6px 16px ${tokens.colors.primary}60`;
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.transform = 'translateY(0)';
                              e.currentTarget.style.boxShadow = `0 4px 12px ${tokens.colors.primary}40`;
                            }}
                          >
                            📋 Copy Everything to Clipboard
                          </button>
                        </div>
                      )}
                    </>
                  )}

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
              <div style={{ padding: tokens.spacing[12], textAlign: 'center' }}>
                <div style={{
                  width: '80px',
                  height: '80px',
                  border: `6px solid ${tokens.colors.surface2}`,
                  borderTopColor: tokens.colors.primary,
                  borderRadius: tokens.radius.full,
                  animation: 'spin 1s linear infinite',
                  margin: `0 auto ${tokens.spacing[8]}`
                }} />
                <div style={{
                  fontSize: tokens.typography.fontSize['2xl'],
                  fontWeight: tokens.typography.fontWeight.bold,
                  color: tokens.colors.text,
                  marginBottom: tokens.spacing[4]
                }}>
                  ⚡ Optimizing Your Listing
                </div>
                <div style={{
                  fontSize: tokens.typography.fontSize.base,
                  color: tokens.colors.textMuted,
                  marginBottom: tokens.spacing[6]
                }}>
                  Running R.A.N.K. 285™ analysis and generating optimized content...
                </div>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: tokens.spacing[3],
                  alignItems: 'center',
                  fontSize: tokens.typography.fontSize.sm,
                  color: tokens.colors.textMuted
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                    <span style={{ color: tokens.colors.success }}>✓</span>
                    <span>Fetching listing data from Etsy</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                    <span style={{ color: tokens.colors.primary }}>⟳</span>
                    <span>Running R.A.N.K. 285™ analysis</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                    <span style={{ color: tokens.colors.textMuted }}>○</span>
                    <span>Generating optimized content with AI</span>
                  </div>
                </div>
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
