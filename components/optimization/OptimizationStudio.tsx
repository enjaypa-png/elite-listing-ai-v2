'use client';

import { useState, useEffect } from 'react';
import { ScoreHeader } from './ScoreHeader';
import { PhotoAnalysisGrid } from './PhotoAnalysisGrid';
import { TitleOptimizer } from './TitleOptimizer';
import { TagsOptimizer } from './TagsOptimizer';
import { DescriptionOptimizer } from './DescriptionOptimizer';
import { PriorityActionsSidebar } from './PriorityActionsSidebar';
import { mockListing, aiOptimizations, priorityIssues } from '@/lib/mockListingData';
import tokens from '@/design-system/tokens.json';

interface OptimizationStudioProps {
  listingId: string;
}

export default function OptimizationStudio({ listingId }: OptimizationStudioProps) {
  const [listing, setListing] = useState(mockListing);
  const [isLoading, setIsLoading] = useState(false);
  const [optimizations, setOptimizations] = useState<any>(null);
  const [photoAnalysis, setPhotoAnalysis] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Load listing data (mock for now, real API when approved)
  useEffect(() => {
    loadListing();
  }, [listingId]);

  const loadListing = async () => {
    setIsLoading(true);
    try {
      // TODO: When Etsy API approved, replace with:
      // const response = await fetch(`/api/etsy/import?listingId=${listingId}`);
      // const data = await response.json();
      // setListing(data);
      
      // For now, use mock data
      setListing(mockListing);
      
      // Immediately analyze the listing
      await analyzeListingWithAI();
      
    } catch (error) {
      console.error('Error loading listing:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const analyzeListingWithAI = async () => {
    try {
      // 1. Get optimizations (title, tags, description)
      const optimizeResponse = await fetch('/api/optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: listing.title,
          description: listing.description,
          tags: listing.tags,
          images: listing.images,
          price: listing.price
        })
      });
      
      if (optimizeResponse.ok) {
        const optimizeData = await optimizeResponse.json();
        setOptimizations(optimizeData);
      }
      
      // 2. Analyze photos in batch
      const photoResponse = await fetch('/api/optimize/images/batch-analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          photos: listing.images
        })
      });
      
      if (photoResponse.ok) {
        const photoData = await photoResponse.json();
        setPhotoAnalysis(photoData);
      }
      
    } catch (error) {
      console.error('Error analyzing listing:', error);
      // Use mock data as fallback
      setOptimizations(aiOptimizations);
    }
  };

  const handleCopyOptimizedContent = () => {
    const optimizedContent = `
TITLE:
${optimizations?.titles?.[0]?.text || aiOptimizations.titles[0].text}

TAGS:
${[...aiOptimizations.tags.current, ...aiOptimizations.tags.suggested].slice(0, 13).join(', ')}

DESCRIPTION:
${optimizations?.description?.optimized || aiOptimizations.description.optimized}
    `.trim();

    navigator.clipboard.writeText(optimizedContent);
    alert('Optimized content copied to clipboard!');
  };

  const handleSaveChanges = async () => {
    setIsSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSaving(false);
    alert('Changes saved successfully!');
  };

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: tokens.colors.background
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
          <p style={{ color: tokens.colors.textMuted }}>Analyzing your listing with AI...</p>
        </div>
      </div>
    );
  }

  const displayOptimizations = optimizations || aiOptimizations;

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: tokens.colors.background
    }}>
      {/* Header */}
      <div style={{
        backgroundColor: tokens.colors.surface,
        borderBottom: `1px solid ${tokens.colors.border}`,
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
      }}>
        <div className="studio-header-container">
          <div className="studio-header-left">
            <button
              onClick={() => window.history.back()}
              className="back-button"
              style={{
                padding: `${tokens.spacing[2]} ${tokens.spacing[3]}`,
                backgroundColor: 'transparent',
                color: tokens.colors.text,
                border: 'none',
                borderRadius: tokens.radius.md,
                fontSize: tokens.typography.fontSize.sm,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: tokens.spacing[2],
                minHeight: '44px',
                minWidth: '44px'
              }}
            >
              ← Back to Listings
            </button>
            <div>
              <h1 style={{
                fontSize: tokens.typography.fontSize['2xl'],
                fontWeight: tokens.typography.fontWeight.bold,
                color: tokens.colors.text,
                marginBottom: tokens.spacing[1]
              }}>
                Optimization Studio
              </h1>
              <p style={{
                fontSize: tokens.typography.fontSize.sm,
                color: tokens.colors.textMuted
              }}>
                Listing ID: {listingId}
                <span style={{
                  marginLeft: tokens.spacing[2],
                  padding: `${tokens.spacing[0.5]} ${tokens.spacing[2]}`,
                  backgroundColor: tokens.colors.surfaceHover,
                  color: tokens.colors.text,
                  borderRadius: tokens.radius.sm,
                  fontSize: tokens.typography.fontSize.xs,
                  border: `1px solid ${tokens.colors.border}`
                }}>
                  {listing.status}
                </span>
              </p>
            </div>
          </div>
          <div className="studio-header-actions">
            <button
              onClick={handleCopyOptimizedContent}
              className="header-button"
              style={{
                padding: `${tokens.spacing[2]} ${tokens.spacing[4]}`,
                backgroundColor: tokens.colors.surface,
                color: tokens.colors.text,
                border: `1px solid ${tokens.colors.border}`,
                borderRadius: tokens.radius.md,
                fontSize: '16px',
                fontWeight: tokens.typography.fontWeight.medium,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: tokens.spacing[2],
                minHeight: '44px'
              }}
            >
              📋 <span className="button-text">Copy Optimized Content</span>
            </button>
            <button
              onClick={handleSaveChanges}
              disabled={isSaving}
              className="header-button"
              style={{
                padding: `${tokens.spacing[2]} ${tokens.spacing[4]}`,
                backgroundColor: tokens.colors.primary,
                color: 'white',
                border: 'none',
                borderRadius: tokens.radius.md,
                fontSize: '16px',
                fontWeight: tokens.typography.fontWeight.medium,
                cursor: isSaving ? 'not-allowed' : 'pointer',
                opacity: isSaving ? 0.6 : 1,
                display: 'flex',
                alignItems: 'center',
                gap: tokens.spacing[2],
                minHeight: '44px'
              }}
            >
              💾 {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: `${tokens.spacing[8]} ${tokens.spacing[6]}`
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr',
          gap: tokens.spacing[6]
        }}>
          {/* Score Header */}
          <ScoreHeader
            currentScore={listing.currentScore}
            maxScore={listing.maxScore}
            percentage={listing.percentage}
            potentialScore={listing.potentialScore}
          />

          <div className="studio-layout">
            {/* Main Column - 2/3 width on desktop, full width on mobile */}
            <div className="studio-main-column">
              {/* Photo Gallery */}
              <PhotoAnalysisGrid
                images={listing.images}
                photoAnalysis={photoAnalysis}
                suggestions={aiOptimizations.photos.suggestions}
              />

              {/* Title Optimizer */}
              <TitleOptimizer
                currentTitle={listing.title}
                titleVariants={displayOptimizations.titles}
              />

              {/* Tags Optimizer */}
              <TagsOptimizer
                currentTags={displayOptimizations.tags.current}
                suggestedTags={displayOptimizations.tags.suggested}
                improvement={displayOptimizations.tags.improvement}
              />

              {/* Description Optimizer */}
              <DescriptionOptimizer
                currentDescription={displayOptimizations.description.current}
                optimizedDescription={displayOptimizations.description.optimized}
                characterCount={displayOptimizations.description.characterCount}
                improvement={displayOptimizations.description.improvement}
              />

              {/* Pricing Info */}
              <div className="pricing-card">
                <h3 style={{
                  fontSize: tokens.typography.fontSize.lg,
                  fontWeight: tokens.typography.fontWeight.semibold,
                  marginBottom: tokens.spacing[4],
                  color: tokens.colors.text
                }}>
                  Pricing & Shipping
                </h3>
                <div className="pricing-grid">
                  <div>
                    <p style={{
                      fontSize: tokens.typography.fontSize.sm,
                      color: tokens.colors.textMuted,
                      marginBottom: tokens.spacing[1]
                    }}>
                      Price
                    </p>
                    <p style={{
                      fontSize: tokens.typography.fontSize['2xl'],
                      fontWeight: tokens.typography.fontWeight.bold,
                      color: tokens.colors.text
                    }}>
                      ${listing.price}
                    </p>
                  </div>
                  <div>
                    <p style={{
                      fontSize: tokens.typography.fontSize.sm,
                      color: tokens.colors.textMuted,
                      marginBottom: tokens.spacing[1]
                    }}>
                      Shipping
                    </p>
                    <p style={{
                      fontSize: tokens.typography.fontSize['2xl'],
                      fontWeight: tokens.typography.fontWeight.bold,
                      color: tokens.colors.text
                    }}>
                      ${listing.shipping}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar - 1/3 width on desktop, full width below main content on mobile */}
            <div className="studio-sidebar">
              <PriorityActionsSidebar issues={priorityIssues} />
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div style={{
          marginTop: tokens.spacing[8],
          backgroundColor: tokens.colors.surface,
          borderRadius: tokens.radius.lg,
          border: `1px solid ${tokens.colors.border}`,
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          padding: tokens.spacing[6]
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: tokens.spacing[4] }}>
            <div>
              <h3 style={{
                fontWeight: tokens.typography.fontWeight.semibold,
                color: tokens.colors.text,
                marginBottom: tokens.spacing[1]
              }}>
                Ready to optimize your listing?
              </h3>
              <p style={{
                fontSize: tokens.typography.fontSize.sm,
                color: tokens.colors.textMuted
              }}>
                Apply AI-generated improvements to boost your listing score by up to {listing.potentialScore - listing.currentScore} points.
              </p>
            </div>
            <div style={{ display: 'flex', gap: tokens.spacing[3] }}>
              <button style={{
                padding: `${tokens.spacing[3]} ${tokens.spacing[6]}`,
                backgroundColor: tokens.colors.surface,
                color: tokens.colors.text,
                border: `1px solid ${tokens.colors.border}`,
                borderRadius: tokens.radius.lg,
                fontSize: tokens.typography.fontSize.sm,
                fontWeight: tokens.typography.fontWeight.medium,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: tokens.spacing[2]
              }}>
                🔗 Preview on Etsy
              </button>
              <button
                onClick={handleSaveChanges}
                disabled={isSaving}
                style={{
                  padding: `${tokens.spacing[3]} ${tokens.spacing[6]}`,
                  background: `linear-gradient(135deg, ${tokens.colors.primary}, ${tokens.colors.success})`,
                  color: 'white',
                  border: 'none',
                  borderRadius: tokens.radius.lg,
                  fontSize: tokens.typography.fontSize.sm,
                  fontWeight: tokens.typography.fontWeight.semibold,
                  cursor: isSaving ? 'not-allowed' : 'pointer',
                  opacity: isSaving ? 0.6 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: tokens.spacing[2]
                }}
              >
                💾 {isSaving ? 'Saving...' : 'Save & Optimize'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        /* Header responsive layout */
        .studio-header-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: ${tokens.spacing[4]} ${tokens.spacing[6]};
          display: flex;
          align-items: center;
          justifyContent: space-between;
          flex-wrap: wrap;
          gap: ${tokens.spacing[4]};
        }

        .studio-header-left {
          display: flex;
          align-items: center;
          gap: ${tokens.spacing[4]};
          flex-wrap: wrap;
        }

        .studio-header-actions {
          display: flex;
          gap: ${tokens.spacing[2]};
          flex-wrap: wrap;
        }

        /* Mobile-responsive layout */
        .studio-layout {
          display: grid;
          grid-template-columns: repeat(12, 1fr);
          gap: ${tokens.spacing[8]};
        }

        .studio-main-column {
          grid-column: span 8;
          display: flex;
          flex-direction: column;
          gap: ${tokens.spacing[8]};
        }

        .studio-sidebar {
          grid-column: span 4;
        }

        .pricing-card {
          background-color: ${tokens.colors.surface};
          border-radius: ${tokens.radius.lg};
          border: 1px solid ${tokens.colors.border};
          padding: ${tokens.spacing[6]};
        }

        .pricing-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: ${tokens.spacing[4]};
        }

        /* Mobile breakpoint: < 768px */
        @media (max-width: 768px) {
          .studio-header-container {
            padding: ${tokens.spacing[3]} ${tokens.spacing[4]};
          }

          .studio-header-left {
            flex-direction: column;
            align-items: flex-start;
            gap: ${tokens.spacing[2]};
          }

          .studio-header-actions {
            width: 100%;
            flex-direction: column;
          }

          .header-button {
            width: 100%;
            justify-content: center;
          }

          .back-button .button-text {
            display: none;
          }

          .studio-layout {
            grid-template-columns: 1fr;
            gap: ${tokens.spacing[6]};
          }

          .studio-main-column {
            grid-column: span 1;
            gap: ${tokens.spacing[6]};
          }

          .studio-sidebar {
            grid-column: span 1;
          }

          .pricing-grid {
            grid-template-columns: 1fr;
          }
        }

        /* Tablet breakpoint: 768px - 1024px */
        @media (min-width: 768px) and (max-width: 1024px) {
          .studio-layout {
            grid-template-columns: 1fr;
            gap: ${tokens.spacing[6]};
          }

          .studio-main-column {
            grid-column: span 1;
          }

          .studio-sidebar {
            grid-column: span 1;
          }
        }
      `}</style>
    </div>
  );
}
