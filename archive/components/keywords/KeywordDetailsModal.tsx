'use client';

import React from 'react';

interface Keyword {
  keyword: string;
  keywordScore: number;
  searchVolume?: number;
  competition?: string;
  ctrPotential?: number;
  conversionPotential?: number;
  algorithmFit?: string;
}

interface Props {
  keyword: Keyword | null;
  onClose: () => void;
}

export function KeywordDetailsModal({ keyword, onClose }: Props) {
  if (!keyword) return null;

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '20px'
      }}
      onClick={onClose}
    >
      <div 
        style={{
          background: '#1F2937',
          borderRadius: '12px',
          padding: '32px',
          maxWidth: '600px',
          width: '100%',
          border: '2px solid #3B82F6',
          boxShadow: '0 24px 48px rgba(0, 0, 0, 0.6)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'start',
          marginBottom: '24px'
        }}>
          <div>
            <h3 style={{
              fontSize: '24px',
              fontWeight: 'bold',
              color: '#F9FAFB',
              marginBottom: '8px'
            }}>
              {keyword.keyword}
            </h3>
            <p style={{
              fontSize: '14px',
              color: '#9CA3AF'
            }}>
              Keyword Details
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#9CA3AF',
              fontSize: '28px',
              cursor: 'pointer',
              padding: '0',
              lineHeight: 1
            }}
          >
            ×
          </button>
        </div>

        {/* Metrics Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '16px',
          marginBottom: '24px'
        }}>
          {/* Search Volume */}
          <div style={{
            padding: '16px',
            background: 'rgba(59, 130, 246, 0.1)',
            borderRadius: '8px',
            border: '1px solid rgba(59, 130, 246, 0.3)'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '8px'
            }}>
              <p style={{
                fontSize: '14px',
                color: '#9CA3AF',
                fontWeight: 600
              }}>
                Search Volume
              </p>
              <span 
                title="An estimate of how many people search for this keyword on Etsy each month"
                style={{
                  cursor: 'help',
                  color: '#60A5FA',
                  fontSize: '14px'
                }}
              >
                ℹ️
              </span>
            </div>
            <p style={{
              fontSize: '24px',
              fontWeight: 'bold',
              color: '#F9FAFB'
            }}>
              📊 {keyword.searchVolume || 0}/month
            </p>
          </div>

          {/* Competition */}
          <div style={{
            padding: '16px',
            background: 'rgba(59, 130, 246, 0.1)',
            borderRadius: '8px',
            border: '1px solid rgba(59, 130, 246, 0.3)'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '8px'
            }}>
              <p style={{
                fontSize: '14px',
                color: '#9CA3AF',
                fontWeight: 600
              }}>
                Competition
              </p>
              <span 
                title="How many other sellers are using this keyword. Lower is better"
                style={{
                  cursor: 'help',
                  color: '#60A5FA',
                  fontSize: '14px'
                }}
              >
                ℹ️
              </span>
            </div>
            <p style={{
              fontSize: '24px',
              fontWeight: 'bold',
              color: '#F9FAFB',
              textTransform: 'uppercase'
            }}>
              {keyword.competition === 'low' && '🟢 '}
              {keyword.competition === 'medium' && '🟡 '}
              {keyword.competition === 'high' && '🔴 '}
              {keyword.competition || 'N/A'}
            </p>
          </div>

          {/* CTR Potential */}
          <div style={{
            padding: '16px',
            background: 'rgba(59, 130, 246, 0.1)',
            borderRadius: '8px',
            border: '1px solid rgba(59, 130, 246, 0.3)'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '8px'
            }}>
              <p style={{
                fontSize: '14px',
                color: '#9CA3AF',
                fontWeight: 600
              }}>
                CTR Potential
              </p>
              <span 
                title="How likely someone is to click on your listing if it shows up for this keyword"
                style={{
                  cursor: 'help',
                  color: '#60A5FA',
                  fontSize: '14px'
                }}
              >
                ℹ️
              </span>
            </div>
            <p style={{
              fontSize: '24px',
              fontWeight: 'bold',
              color: '#F9FAFB'
            }}>
              👆 {keyword.ctrPotential || 0}%
            </p>
          </div>

          {/* Conversion Potential */}
          <div style={{
            padding: '16px',
            background: 'rgba(59, 130, 246, 0.1)',
            borderRadius: '8px',
            border: '1px solid rgba(59, 130, 246, 0.3)'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '8px'
            }}>
              <p style={{
                fontSize: '14px',
                color: '#9CA3AF',
                fontWeight: 600
              }}>
                Conversion
              </p>
              <span 
                title="How likely someone is to buy after clicking on your listing for this keyword"
                style={{
                  cursor: 'help',
                  color: '#60A5FA',
                  fontSize: '14px'
                }}
              >
                ℹ️
              </span>
            </div>
            <p style={{
              fontSize: '24px',
              fontWeight: 'bold',
              color: '#F9FAFB'
            }}>
              💵 {keyword.conversionPotential || 0}%
            </p>
          </div>
        </div>

        {/* Algorithm Fit */}
        {keyword.algorithmFit && (
          <div style={{
            padding: '16px',
            background: 'rgba(16, 185, 129, 0.1)',
            borderRadius: '8px',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            marginBottom: '24px'
          }}>
            <p style={{
              fontSize: '12px',
              color: '#9CA3AF',
              fontWeight: 600,
              marginBottom: '8px'
            }}>
              AI INSIGHT:
            </p>
            <p style={{
              fontSize: '14px',
              color: '#F9FAFB',
              lineHeight: 1.6
            }}>
              {keyword.algorithmFit}
            </p>
          </div>
        )}

        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            width: '100%',
            padding: '12px',
            background: '#374151',
            color: '#F9FAFB',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: 600,
            cursor: 'pointer',
            minHeight: '48px'
          }}
        >
          Close
        </button>
      </div>
    </div>
  );
}
