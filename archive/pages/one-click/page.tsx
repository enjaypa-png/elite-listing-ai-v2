'use client';

import { useState, useEffect } from 'react';
import { TopNav, Breadcrumbs } from '@/components/navigation';
import { Container, Card, Button } from '@/components/ui';
import tokens from '@/design-system/tokens.json';

export default function OneClickPage() {
  const [hasEtsyAuth, setHasEtsyAuth] = useState(false);
  const [userListings, setUserListings] = useState<any[]>([]);
  const [selectedListing, setSelectedListing] = useState<any>(null);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizationResult, setOptimizationResult] = useState<any>(null);

  useEffect(() => {
    checkEtsyAuth();
  }, []);

  const checkEtsyAuth = async () => {
    try {
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
      const response = await fetch('/api/etsy/my-listings');
      const data = await response.json();
      if (data.success) {
        setUserListings(data.listings);
      }
    } catch (error) {
      console.error('Failed to load listings:', error);
    }
  };

  const handleOneClickOptimize = async () => {
    if (!selectedListing) {
      alert('Please select a listing to optimize');
      return;
    }

    setIsOptimizing(true);

    try {
      // Run ALL 6 modules: Title, Tags, Description, Images, Pricing, SEO Boost
      const response = await fetch('/api/optimize/one-click', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          listingId: selectedListing.id,
          title: selectedListing.title,
          description: selectedListing.description,
          tags: selectedListing.tags || [],
          images: selectedListing.images || [],
          price: selectedListing.price || 0,
          fullOptimization: true // All 6 modules
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setOptimizationResult(data);
      } else {
        alert('Optimization failed: ' + data.error);
      }

    } catch (error: any) {
      console.error('One-Click optimization error:', error);
      alert('Failed to optimize. Please try again.');
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
            <div style={{
              display: 'inline-block',
              padding: `${tokens.spacing[2]} ${tokens.spacing[4]}`,
              background: `${tokens.colors.primary}20`,
              border: `1px solid ${tokens.colors.primary}`,
              borderRadius: tokens.radius.full,
              fontSize: tokens.typography.fontSize.sm,
              fontWeight: tokens.typography.fontWeight.semibold,
              color: tokens.colors.primary,
              marginBottom: tokens.spacing[4]
            }}>
              PREMIUM FEATURE
            </div>
            <h1 style={{
              fontSize: tokens.typography.fontSize['4xl'],
              fontWeight: tokens.typography.fontWeight.bold,
              color: tokens.colors.text,
              marginBottom: tokens.spacing[3]
            }}>
              One-Click Full Optimization
            </h1>
            <p style={{
              fontSize: tokens.typography.fontSize.lg,
              color: tokens.colors.textMuted,
              maxWidth: '600px',
              margin: '0 auto'
            }}>
              Complete end-to-end optimization: Title, Tags, Description, Images, Pricing, and SEO Boost
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
                  Select Listing to Optimize
                </h2>

                {/* OAuth Listing Selector */}
                {hasEtsyAuth && userListings.length > 0 ? (
                  <>
                    <div style={{ marginBottom: tokens.spacing[6] }}>
                      <label style={{
                        display: 'block',
                        fontSize: tokens.typography.fontSize.base,
                        fontWeight: tokens.typography.fontWeight.medium,
                        color: tokens.colors.text,
                        marginBottom: tokens.spacing[3]
                      }}>
                        Choose Your Listing
                      </label>
                      <select
                        value={selectedListing?.id || ''}
                        onChange={(e) => {
                          const listing = userListings.find(l => l.id === e.target.value);
                          setSelectedListing(listing);
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
                        <option value="">Select a listing from your shop</option>
                        {userListings.map(listing => (
                          <option key={listing.id} value={listing.id}>
                            {listing.title}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* What Gets Optimized */}
                    <div style={{
                      padding: tokens.spacing[6],
                      background: tokens.colors.surface,
                      border: `1px solid ${tokens.colors.border}`,
                      borderRadius: tokens.radius.md,
                      marginBottom: tokens.spacing[8]
                    }}>
                      <h3 style={{
                        fontSize: tokens.typography.fontSize.lg,
                        fontWeight: tokens.typography.fontWeight.semibold,
                        color: tokens.colors.text,
                        marginBottom: tokens.spacing[4]
                      }}>
                        What Gets Optimized:
                      </h3>
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(2, 1fr)',
                        gap: tokens.spacing[3]
                      }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: tokens.spacing[2]
                        }}>
                          <span style={{ color: tokens.colors.success, fontSize: '20px' }}>✓</span>
                          <span style={{ color: tokens.colors.text }}>Title</span>
                        </div>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: tokens.spacing[2]
                        }}>
                          <span style={{ color: tokens.colors.success, fontSize: '20px' }}>✓</span>
                          <span style={{ color: tokens.colors.text }}>Tags</span>
                        </div>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: tokens.spacing[2]
                        }}>
                          <span style={{ color: tokens.colors.success, fontSize: '20px' }}>✓</span>
                          <span style={{ color: tokens.colors.text }}>Description</span>
                        </div>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: tokens.spacing[2]
                        }}>
                          <span style={{ color: tokens.colors.success, fontSize: '20px' }}>✓</span>
                          <span style={{ color: tokens.colors.text }}>Images</span>
                        </div>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: tokens.spacing[2]
                        }}>
                          <span style={{ color: tokens.colors.success, fontSize: '20px' }}>✓</span>
                          <span style={{ color: tokens.colors.text }}>Pricing</span>
                        </div>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: tokens.spacing[2]
                        }}>
                          <span style={{ color: tokens.colors.success, fontSize: '20px' }}>✓</span>
                          <span style={{ color: tokens.colors.text }}>SEO Boost</span>
                        </div>
                      </div>
                    </div>

                    {/* One-Click Button */}
                    <Button
                      variant="primary"
                      size="lg"
                      fullWidth
                      onClick={handleOneClickOptimize}
                      disabled={isOptimizing || !selectedListing}
                      style={{
                        height: '60px',
                        fontSize: tokens.typography.fontSize.xl,
                        fontWeight: tokens.typography.fontWeight.bold,
                        background: `linear-gradient(135deg, ${tokens.colors.primary}, #0056CC)`
                      }}
                    >
                      {isOptimizing ? (
                        <>
                          <div style={{
                            display: 'inline-block',
                            width: '20px',
                            height: '20px',
                            border: '3px solid rgba(255,255,255,0.3)',
                            borderTopColor: '#FFFFFF',
                            borderRadius: '50%',
                            animation: 'spin 1s linear infinite',
                            marginRight: tokens.spacing[2]
                          }} />
                          Running Full Optimization...
                        </>
                      ) : (
                        'Run One-Click Optimization'
                      )}
                    </Button>
                  </>
                ) : (
                  <div style={{
                    padding: tokens.spacing[8],
                    background: `${tokens.colors.primary}15`,
                    border: `2px solid ${tokens.colors.primary}`,
                    borderRadius: tokens.radius.md,
                    textAlign: 'center'
                  }}>
                    <h3 style={{
                      fontSize: tokens.typography.fontSize.xl,
                      fontWeight: tokens.typography.fontWeight.bold,
                      color: tokens.colors.text,
                      marginBottom: tokens.spacing[4]
                    }}>
                      Connect Your Etsy Shop
                    </h3>
                    <p style={{
                      fontSize: tokens.typography.fontSize.base,
                      color: tokens.colors.textMuted,
                      marginBottom: tokens.spacing[6]
                    }}>
                      One-Click Optimization requires connecting your Etsy shop to automatically import and optimize your listings.
                    </p>
                    <Button
                      variant="primary"
                      size="lg"
                      onClick={() => window.location.href = '/api/etsy/connect'}
                    >
                      Connect Etsy Shop
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Results */}
          {optimizationResult && (
            <Card>
              <div style={{ padding: tokens.spacing[8], textAlign: 'center' }}>
                <h2 style={{
                  fontSize: tokens.typography.fontSize['3xl'],
                  color: tokens.colors.success,
                  marginBottom: tokens.spacing[4]
                }}>
                  Full Optimization Complete
                </h2>
                <p style={{
                  fontSize: tokens.typography.fontSize.lg,
                  color: tokens.colors.textMuted,
                  marginBottom: tokens.spacing[6]
                }}>
                  All 6 modules have been optimized: Title, Tags, Description, Images, Pricing, and SEO Boost
                </p>
                <div style={{
                  display: 'flex',
                  gap: tokens.spacing[3],
                  justifyContent: 'center'
                }}>
                  <Button
                    variant="primary"
                    onClick={() => {/* View results logic */}}
                  >
                    View Results
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setOptimizationResult(null);
                      setSelectedListing(null);
                    }}
                  >
                    Optimize Another Listing
                  </Button>
                </div>
              </div>
            </Card>
          )}
        </div>
      </Container>

      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
