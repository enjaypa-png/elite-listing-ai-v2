'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Container, Card } from '@/components/ui';
import tokens from '@/design-system/tokens.json';

export default function EtsyConnectPage() {
  const router = useRouter();
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = async () => {
    setIsConnecting(true);
    
    try {
      // TODO: Wire up to /api/etsy/connect
      // Redirect to Etsy OAuth flow
      window.location.href = '/api/etsy/connect';
    } catch (error) {
      console.error('Connection error:', error);
      setIsConnecting(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
      paddingTop: '80px'
    }}>
      <Container>
        <div style={{ maxWidth: '700px', margin: '0 auto', textAlign: 'center' }}>
          {/* Header */}
          <div style={{ marginBottom: '48px' }}>
            <div style={{
              width: '80px',
              height: '80px',
              background: '#F16521',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '40px',
              margin: '0 auto 24px',
              boxShadow: '0 8px 24px rgba(241, 101, 33, 0.3)'
            }}>
              🔗
            </div>

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
              Connect Your Etsy Shop
              <span
                title="Link your shop so you can update listings automatically"
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
              color: '#9CA3AF',
              lineHeight: 1.6
            }}>
              Connect your Etsy shop to automatically sync your optimizations and update listings with one click
            </p>
          </div>

          {/* Benefits */}
          <Card>
            <div style={{ padding: '32px' }}>
              <h3 style={{
                fontSize: '20px',
                fontWeight: 'bold',
                color: '#F9FAFB',
                marginBottom: '24px'
              }}>
                What you can do after connecting:
              </h3>

              <div style={{
                textAlign: 'left',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px'
              }}>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <span style={{ fontSize: '24px' }}>✓</span>
                  <div>
                    <p style={{
                      fontSize: '16px',
                      fontWeight: 600,
                      color: '#F9FAFB',
                      marginBottom: '4px'
                    }}>
                      Import Existing Listings
                    </p>
                    <p style={{
                      fontSize: '14px',
                      color: '#9CA3AF'
                    }}>
                      Pull in your current listings with all photos and text
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                  <span style={{ fontSize: '24px' }}>✓</span>
                  <div>
                    <p style={{
                      fontSize: '16px',
                      fontWeight: 600,
                      color: '#F9FAFB',
                      marginBottom: '4px'
                    }}>
                      One-Click Updates
                    </p>
                    <p style={{
                      fontSize: '14px',
                      color: '#9CA3AF'
                    }}>
                      Push optimized titles, tags, and descriptions directly to Etsy
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                  <span style={{ fontSize: '24px' }}>✓</span>
                  <div>
                    <p style={{
                      fontSize: '16px',
                      fontWeight: 600,
                      color: '#F9FAFB',
                      marginBottom: '4px'
                    }}>
                      Track Performance
                    </p>
                    <p style={{
                      fontSize: '14px',
                      color: '#9CA3AF'
                    }}>
                      See how your optimizations impact views and sales
                    </p>
                  </div>
                </div>
              </div>

              {/* Connect Button */}
              <button
                onClick={handleConnect}
                disabled={isConnecting}
                style={{
                  width: '100%',
                  marginTop: '32px',
                  padding: '16px',
                  background: isConnecting 
                    ? '#374151' 
                    : 'linear-gradient(135deg, #F16521, #E14817)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '18px',
                  fontWeight: 'bold',
                  cursor: isConnecting ? 'not-allowed' : 'pointer',
                  minHeight: '56px',
                  boxShadow: '0 4px 12px rgba(241, 101, 33, 0.3)',
                  opacity: isConnecting ? 0.6 : 1
                }}
              >
                {isConnecting ? 'Connecting...' : '🔗 Connect Etsy Shop'}
              </button>

              {/* Privacy Note */}
              <p style={{
                marginTop: '16px',
                fontSize: '12px',
                color: '#6B7280',
                lineHeight: 1.5
              }}>
                🔒 Secure OAuth connection. We never see your password. You can disconnect anytime.
              </p>
            </div>
          </Card>

          {/* Back Button */}
          <div style={{
            marginTop: '32px',
            textAlign: 'center'
          }}>
            <button
              onClick={() => router.back()}
              style={{
                padding: '10px 24px',
                background: 'transparent',
                color: '#9CA3AF',
                border: '1px solid #374151',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                minHeight: '44px'
              }}
            >
              ← Back
            </button>
          </div>
        </div>
      </Container>
    </div>
  );
}
