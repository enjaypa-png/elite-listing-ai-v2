'use client';

import { useState, useEffect } from 'react';
import { TopNav, Breadcrumbs } from '@/components/navigation';
import { Container, Card, Button } from '@/components/ui';
import tokens from '@/design-system/tokens.json';

export default function OptimizeListingPage() {
  // Flow state
  const [hasEtsyAuth, setHasEtsyAuth] = useState(false);
  const [userListings, setUserListings] = useState<any[]>([]);
  const [selectedListing, setSelectedListing] = useState<any>(null);
  const [showManualEntry, setShowManualEntry] = useState(false);
  
  // Form state (for manual entry)
  const [manualTitle, setManualTitle] = useState('');
  const [manualDescription, setManualDescription] = useState('');
  const [manualTags, setManualTags] = useState('');
  
  // Optimization options (ONLY 4)
  const [optimizeTitle, setOptimizeTitle] = useState(false);
  const [optimizeTags, setOptimizeTags] = useState(false);
  const [optimizeDescription, setOptimizeDescription] = useState(false);
  const [seoBoost, setSeoBoost] = useState(false);
  
  // UI state
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizationResult, setOptimizationResult] = useState<any>(null);

  // Check OAuth status on mount
  useEffect(() => {
    checkEtsyAuth();
  }, []);

  const checkEtsyAuth = async () => {
    try {
      // Check if user has connected Etsy (placeholder - implement actual OAuth check)
      const response = await fetch('/api/user/profile');
      const data = await response.json();
      if (data.etsyConnected) {
        setHasEtsyAuth(true);
        loadUserListings();
      }
    } catch (error) {
      console.log('No Etsy auth yet');
    }
  };

  const loadUserListings = async () => {
    try {
      // Load user's listings via OAuth (placeholder - implement actual Etsy API call)
      const response = await fetch('/api/etsy/my-listings');
      const data = await response.json();
      if (data.success) {
        setUserListings(data.listings);
      }
    } catch (error) {
      console.error('Failed to load listings:', error);
    }
  };

  const handleOptimize = async () => {
    // Validate at least one option selected
    if (!optimizeTitle && !optimizeTags && !optimizeDescription && !seoBoost) {
      alert('Please select at least one optimization option');
      return;
    }

    // Validate data source
    if (!selectedListing && !showManualEntry) {
      alert('Please select a listing or enable manual entry');
      return;
    }

    if (showManualEntry && (!manualTitle || !manualDescription)) {
      alert('Please enter title and description');
      return;
    }

    setIsOptimizing(true);

    try {
      // Prepare listing data
      const listingData = showManualEntry ? {
        title: manualTitle,
        description: manualDescription,
        tags: manualTags.split('\n').filter(t => t.trim())
      } : {
        title: selectedListing.title,
        description: selectedListing.description,
        tags: selectedListing.tags || []
      };

      // Step 1: Run R.A.N.K. 285™ Analysis
      const auditResponse = await fetch('/api/seo/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform: 'Etsy',
          title: listingData.title,
          description: listingData.description,
          tags: listingData.tags.join(', ')
        })
      });

      const auditData = await auditResponse.json();

      // Step 2: Generate optimizations (only for selected modules)
      let optimizedData = null;
      
      if (optimizeTitle || optimizeTags || optimizeDescription || seoBoost) {
        const optimizeResponse = await fetch('/api/optimize/listing', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: listingData.title,
            description: listingData.description,
            tags: listingData.tags,
            modules: {
              title: optimizeTitle,
              tags: optimizeTags,
              description: optimizeDescription,
              seoBoost: seoBoost
            }
          })
        });

        const optimizeDataResponse = await optimizeResponse.json();
        if (optimizeDataResponse.success) {
          optimizedData = optimizeDataResponse.optimized;
        }
      }

      setOptimizationResult({
        ...auditData,
        optimizedData,
        selectedModules: {
          title: optimizeTitle,
          tags: optimizeTags,
          description: optimizeDescription,
          seoBoost: seoBoost
        }
      });

    } catch (error: any) {
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
          maxWidth: '1000px',
          margin: '0 auto',
          padding: `${tokens.spacing[8]} ${tokens.spacing[4]}`
        }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: tokens.spacing[8] }}>
            <h1 style={{
              fontSize: tokens.typography.fontSize['3xl'],
              fontWeight: tokens.typography.fontWeight.bold,
              color: tokens.colors.text,
              marginBottom: tokens.spacing[3]
            }}>
              Listing Optimization Hub
            </h1>
            <p style={{
              fontSize: tokens.typography.fontSize.lg,
              color: tokens.colors.textMuted
            }}>
              Optimize your Etsy listings with R.A.N.K. 285™ intelligence
            </p>
          </div>

          {/* Main Card */}
          {!optimizationResult && (
            <Card>
              <div style={{ padding: tokens.spacing[8] }}>
                <h2 style={{
                  fontSize: tokens.typography.fontSize['2xl'],
                  fontWeight: tokens.typography.fontWeight.bold,
                  color: tokens.colors.text,
                  marginBottom: tokens.spacing[6]
                }}>
                  Enter Listing Information
                </h2>

                {/* OAuth Listing Selector (Primary Flow) */}
                {hasEtsyAuth && userListings.length > 0 && (
                  <div style={{ marginBottom: tokens.spacing[6] }}>
                    <label style={{
                      display: 'block',
                      fontSize: tokens.typography.fontSize.base,
                      fontWeight: tokens.typography.fontWeight.medium,
                      color: tokens.colors.text,
                      marginBottom: tokens.spacing[3]
                    }}>
                      Select Your Listing
                    </label>
                    <select
                      value={selectedListing?.id || ''}
                      onChange={(e) => {
                        const listing = userListings.find(l => l.id === e.target.value);
                        setSelectedListing(listing);
                        setShowManualEntry(false);
                      }}
                      style={{
                        width: '100%',
                        padding: tokens.spacing[4],
                        background: tokens.colors.surface,
                        border: `2px solid ${tokens.colors.border}`,
                        borderRadius: tokens.radius.md,
                        color: tokens.colors.text,
                        fontSize: tokens.typography.fontSize.base
                      }}
                    >
                      <option value="">Choose a listing from your shop</option>
                      {userListings.map(listing => (
                        <option key={listing.id} value={listing.id}>
                          {listing.title}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Connect Etsy CTA (if not connected) */}
                {!hasEtsyAuth && (
                  <div style={{
                    padding: tokens.spacing[6],
                    background: `${tokens.colors.primary}15`,
                    border: `2px solid ${tokens.colors.primary}`,
                    borderRadius: tokens.radius.md,
                    marginBottom: tokens.spacing[6],
                    textAlign: 'center'
                  }}>
                    <p style={{
                      fontSize: tokens.typography.fontSize.base,
                      color: tokens.colors.text,
                      marginBottom: tokens.spacing[4]
                    }}>
                      Connect your Etsy shop to automatically import listings
                    </p>
                    <Button
                      variant="primary"
                      onClick={() => window.location.href = '/api/etsy/connect'}
                    >
                      Connect Etsy Shop
                    </Button>
                  </div>
                )}

                {/* Manual Entry Toggle */}
                <div style={{ marginBottom: tokens.spacing[6] }}>
                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: tokens.spacing[2],
                    cursor: 'pointer',
                    fontSize: tokens.typography.fontSize.base,
                    color: tokens.colors.textMuted
                  }}>
                    <input
                      type="checkbox"
                      checked={showManualEntry}
                      onChange={(e) => {
                        setShowManualEntry(e.target.checked);
                        if (e.target.checked) {
                          setSelectedListing(null);
                        }
                      }}
                      style={{ width: '18px', height: '18px' }}
                    />
                    <span>Manual Entry (Optional)</span>
                  </label>
                </div>

                {/* Manual Entry Fields (Hidden by default) */}
                {showManualEntry && (
                  <div style={{ marginBottom: tokens.spacing[6] }}>
                    <div style={{ marginBottom: tokens.spacing[4] }}>
                      <label style={{
                        display: 'block',
                        fontSize: tokens.typography.fontSize.sm,
                        fontWeight: tokens.typography.fontWeight.medium,
                        color: tokens.colors.text,
                        marginBottom: tokens.spacing[2]
                      }}>
                        Title
                      </label>
                      <input
                        type="text"
                        value={manualTitle}
                        onChange={(e) => setManualTitle(e.target.value)}
                        placeholder="Enter listing title"
                        style={{
                          width: '100%',
                          padding: tokens.spacing[3],
                          background: tokens.colors.surface,
                          border: `2px solid ${tokens.colors.border}`,
                          borderRadius: tokens.radius.md,
                          color: tokens.colors.text,
                          fontSize: tokens.typography.fontSize.base
                        }}
                      />
                    </div>
                    <div style={{ marginBottom: tokens.spacing[4] }}>
                      <label style={{
                        display: 'block',
                        fontSize: tokens.typography.fontSize.sm,
                        fontWeight: tokens.typography.fontWeight.medium,
                        color: tokens.colors.text,
                        marginBottom: tokens.spacing[2]
                      }}>
                        Description
                      </label>
                      <textarea
                        value={manualDescription}
                        onChange={(e) => setManualDescription(e.target.value)}
                        placeholder="Enter listing description"
                        rows={4}
                        style={{
                          width: '100%',
                          padding: tokens.spacing[3],
                          background: tokens.colors.surface,
                          border: `2px solid ${tokens.colors.border}`,
                          borderRadius: tokens.radius.md,
                          color: tokens.colors.text,
                          fontSize: tokens.typography.fontSize.base,
                          resize: 'vertical'
                        }}
                      />
                    </div>
                    <div>
                      <label style={{
                        display: 'block',
                        fontSize: tokens.typography.fontSize.sm,
                        fontWeight: tokens.typography.fontWeight.medium,
                        color: tokens.colors.text,
                        marginBottom: tokens.spacing[2]
                      }}>
                        Tags (one per line)
                      </label>
                      <textarea
                        value={manualTags}
                        onChange={(e) => setManualTags(e.target.value)}
                        placeholder="handmade jewelry&#10;sterling silver&#10;boho earrings"
                        rows={3}
                        style={{
                          width: '100%',
                          padding: tokens.spacing[3],
                          background: tokens.colors.surface,
                          border: `2px solid ${tokens.colors.border}`,
                          borderRadius: tokens.radius.md,
                          color: tokens.colors.text,
                          fontSize: tokens.typography.fontSize.base,
                          resize: 'vertical'
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* Optimization Options - ONLY 4 */}
                <div style={{ marginBottom: tokens.spacing[8] }}>
                  <label style={{
                    display: 'block',
                    fontSize: tokens.typography.fontSize.base,
                    fontWeight: tokens.typography.fontWeight.medium,
                    color: tokens.colors.text,
                    marginBottom: tokens.spacing[4]
                  }}>
                    What would you like to optimize?
                  </label>

                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: tokens.spacing[3]
                  }}>
                    {/* Optimize Title */}
                    <label style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: tokens.spacing[3],
                      padding: tokens.spacing[4],
                      background: optimizeTitle ? `${tokens.colors.primary}20` : tokens.colors.surface,
                      border: `2px solid ${optimizeTitle ? tokens.colors.primary : tokens.colors.border}`,
                      borderRadius: tokens.radius.md,
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}>
                      <input
                        type="checkbox"
                        checked={optimizeTitle}
                        onChange={(e) => setOptimizeTitle(e.target.checked)}
                        style={{ width: '18px', height: '18px' }}
                      />
                      <span style={{
                        fontSize: tokens.typography.fontSize.base,
                        color: tokens.colors.text,
                        fontWeight: tokens.typography.fontWeight.medium
                      }}>
                        Optimize Title
                      </span>
                    </label>

                    {/* Optimize Tags */}
                    <label style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: tokens.spacing[3],
                      padding: tokens.spacing[4],
                      background: optimizeTags ? `${tokens.colors.primary}20` : tokens.colors.surface,
                      border: `2px solid ${optimizeTags ? tokens.colors.primary : tokens.colors.border}`,
                      borderRadius: tokens.radius.md,
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}>
                      <input
                        type="checkbox"
                        checked={optimizeTags}
                        onChange={(e) => setOptimizeTags(e.target.checked)}
                        style={{ width: '18px', height: '18px' }}
                      />
                      <span style={{
                        fontSize: tokens.typography.fontSize.base,
                        color: tokens.colors.text,
                        fontWeight: tokens.typography.fontWeight.medium
                      }}>
                        Optimize Tags
                      </span>
                    </label>

                    {/* Optimize Description */}
                    <label style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: tokens.spacing[3],
                      padding: tokens.spacing[4],
                      background: optimizeDescription ? `${tokens.colors.primary}20` : tokens.colors.surface,
                      border: `2px solid ${optimizeDescription ? tokens.colors.primary : tokens.colors.border}`,
                      borderRadius: tokens.radius.md,
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}>
                      <input
                        type="checkbox"
                        checked={optimizeDescription}
                        onChange={(e) => setOptimizeDescription(e.target.checked)}
                        style={{ width: '18px', height: '18px' }}
                      />
                      <span style={{
                        fontSize: tokens.typography.fontSize.base,
                        color: tokens.colors.text,
                        fontWeight: tokens.typography.fontWeight.medium
                      }}>
                        Optimize Description
                      </span>
                    </label>

                    {/* SEO Boost */}
                    <label style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: tokens.spacing[3],
                      padding: tokens.spacing[4],
                      background: seoBoost ? `${tokens.colors.primary}20` : tokens.colors.surface,
                      border: `2px solid ${seoBoost ? tokens.colors.primary : tokens.colors.border}`,
                      borderRadius: tokens.radius.md,
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}>
                      <input
                        type="checkbox"
                        checked={seoBoost}
                        onChange={(e) => setSeoBoost(e.target.checked)}
                        style={{ width: '18px', height: '18px' }}
                      />
                      <span style={{
                        fontSize: tokens.typography.fontSize.base,
                        color: tokens.colors.text,
                        fontWeight: tokens.typography.fontWeight.medium
                      }}>
                        SEO Boost
                      </span>
                    </label>
                  </div>
                </div>

                {/* Optimize Button */}
                <Button
                  variant="primary"
                  size="lg"
                  fullWidth
                  onClick={handleOptimize}
                  disabled={isOptimizing}
                  style={{
                    height: '60px',
                    fontSize: tokens.typography.fontSize.xl,
                    fontWeight: tokens.typography.fontWeight.bold
                  }}
                >
                  {isOptimizing ? 'Optimizing...' : 'Optimize Listing'}
                </Button>
              </div>
            </Card>
          )}

          {/* Results (simplified for now) */}
          {optimizationResult && (
            <Card>
              <div style={{ padding: tokens.spacing[8], textAlign: 'center' }}>
                <h2 style={{
                  fontSize: tokens.typography.fontSize['2xl'],
                  color: tokens.colors.success,
                  marginBottom: tokens.spacing[4]
                }}>
                  Optimization Complete
                </h2>
                <p style={{ color: tokens.colors.textMuted, marginBottom: tokens.spacing[6] }}>
                  Your listing has been optimized. Results ready for review.
                </p>
                <Button
                  variant="secondary"
                  onClick={() => setOptimizationResult(null)}
                >
                  Optimize Another Listing
                </Button>
              </div>
            </Card>
          )}
        </div>
      </Container>
    </div>
  );
}
