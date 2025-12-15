'use client';

import React, { useState } from 'react';
import tokens from '@/design-system/tokens.json';

interface DescriptionOptimizerProps {
  currentDescription: string;
  optimizedDescription: string;
  characterCount: number;
  improvement: string;
}

export function DescriptionOptimizer({
  currentDescription,
  optimizedDescription,
  characterCount,
  improvement
}: DescriptionOptimizerProps) {
  const [useOptimized, setUseOptimized] = useState(false);
  const [activeTab, setActiveTab] = useState<'comparison' | 'optimized'>('comparison');

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Description copied to clipboard!');
  };

  return (
    <div style={{
      backgroundColor: tokens.colors.surface,
      borderRadius: tokens.radius.lg,
      padding: tokens.spacing[6],
      border: `1px solid ${tokens.colors.border}`
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: tokens.spacing[4] }}>
        <h3 style={{
          fontSize: tokens.typography.fontSize.xl,
          fontWeight: tokens.typography.fontWeight.semibold,
          color: tokens.colors.text
        }}>
          Description Optimization
        </h3>
        <button
          onClick={() => setUseOptimized(!useOptimized)}
          style={{
            padding: `${tokens.spacing[2]} ${tokens.spacing[4]}`,
            backgroundColor: useOptimized ? tokens.colors.success : tokens.colors.surface,
            color: useOptimized ? 'white' : tokens.colors.text,
            border: `1px solid ${useOptimized ? tokens.colors.success : tokens.colors.border}`,
            borderRadius: tokens.radius.md,
            fontSize: tokens.typography.fontSize.sm,
            fontWeight: tokens.typography.fontWeight.medium,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: tokens.spacing[2]
          }}
        >
          {useOptimized ? '✓ Using Optimized' : 'Use Optimized'}
        </button>
      </div>

      {/* Warning */}
      <div style={{
        backgroundColor: `${tokens.colors.warning}10`,
        border: `1px solid ${tokens.colors.warning}`,
        borderRadius: tokens.radius.lg,
        padding: tokens.spacing[4],
        marginBottom: tokens.spacing[4],
        display: 'flex',
        gap: tokens.spacing[3]
      }}>
        <span style={{ fontSize: '20px', flexShrink: 0 }}>⚠️</span>
        <div>
          <p style={{
            fontWeight: tokens.typography.fontWeight.semibold,
            color: tokens.colors.warning,
            marginBottom: tokens.spacing[1]
          }}>
            Description too short
          </p>
          <p style={{
            fontSize: tokens.typography.fontSize.sm,
            color: tokens.colors.warning
          }}>
            Current: {currentDescription.length} characters. Optimized: {characterCount} characters.
            Comprehensive descriptions improve SEO and conversions. Potential gain: {improvement}.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ marginBottom: tokens.spacing[4] }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          backgroundColor: tokens.colors.surfaceHover,
          borderRadius: tokens.radius.md,
          padding: tokens.spacing[1],
          gap: tokens.spacing[1]
        }}>
          <button
            onClick={() => setActiveTab('comparison')}
            style={{
              padding: `${tokens.spacing[2]} ${tokens.spacing[4]}`,
              backgroundColor: activeTab === 'comparison' ? tokens.colors.surface : 'transparent',
              color: tokens.colors.text,
              border: 'none',
              borderRadius: tokens.radius.sm,
              fontSize: tokens.typography.fontSize.sm,
              fontWeight: tokens.typography.fontWeight.medium,
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            Side by Side
          </button>
          <button
            onClick={() => setActiveTab('optimized')}
            style={{
              padding: `${tokens.spacing[2]} ${tokens.spacing[4]}`,
              backgroundColor: activeTab === 'optimized' ? tokens.colors.surface : 'transparent',
              color: tokens.colors.text,
              border: 'none',
              borderRadius: tokens.radius.sm,
              fontSize: tokens.typography.fontSize.sm,
              fontWeight: tokens.typography.fontWeight.medium,
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            Optimized Only
          </button>
        </div>
      </div>

      {/* Content */}
      {activeTab === 'comparison' ? (
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: tokens.spacing[4]
        }}>
          {/* Current */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: tokens.spacing[2] }}>
              <span style={{
                fontSize: tokens.typography.fontSize.sm,
                fontWeight: tokens.typography.fontWeight.semibold,
                color: tokens.colors.textMuted
              }}>
                Current Description
              </span>
              <span style={{
                padding: `${tokens.spacing[1]} ${tokens.spacing[2]}`,
                backgroundColor: `${tokens.colors.error}15`,
                color: tokens.colors.error,
                borderRadius: tokens.radius.sm,
                fontSize: tokens.typography.fontSize.xs,
                fontWeight: tokens.typography.fontWeight.medium
              }}>
                {currentDescription.length} chars
              </span>
            </div>
            <div style={{
              backgroundColor: `${tokens.colors.error}05`,
              border: `1px solid ${tokens.colors.error}`,
              borderRadius: tokens.radius.lg,
              padding: tokens.spacing[4],
              minHeight: '300px'
            }}>
              <p style={{
                color: tokens.colors.text,
                whiteSpace: 'pre-wrap',
                fontSize: tokens.typography.fontSize.sm
              }}>
                {currentDescription}
              </p>
            </div>
          </div>

          {/* Optimized */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: tokens.spacing[2] }}>
              <span style={{
                fontSize: tokens.typography.fontSize.sm,
                fontWeight: tokens.typography.fontWeight.semibold,
                color: tokens.colors.textMuted
              }}>
                AI-Optimized Description
              </span>
              <div style={{ display: 'flex', gap: tokens.spacing[2] }}>
                <span style={{
                  padding: `${tokens.spacing[1]} ${tokens.spacing[2]}`,
                  backgroundColor: `${tokens.colors.success}15`,
                  color: tokens.colors.success,
                  borderRadius: tokens.radius.sm,
                  fontSize: tokens.typography.fontSize.xs,
                  fontWeight: tokens.typography.fontWeight.medium
                }}>
                  {characterCount} chars
                </span>
                <span style={{
                  padding: `${tokens.spacing[1]} ${tokens.spacing[2]}`,
                  backgroundColor: `${tokens.colors.primary}15`,
                  color: tokens.colors.primary,
                  borderRadius: tokens.radius.sm,
                  fontSize: tokens.typography.fontSize.xs,
                  fontWeight: tokens.typography.fontWeight.medium
                }}>
                  {improvement}
                </span>
              </div>
            </div>
            <div style={{
              backgroundColor: `${tokens.colors.success}05`,
              border: `1px solid ${tokens.colors.success}`,
              borderRadius: tokens.radius.lg,
              padding: tokens.spacing[4],
              minHeight: '300px',
              position: 'relative'
            }}>
              <button
                onClick={() => copyToClipboard(optimizedDescription)}
                style={{
                  position: 'absolute',
                  top: tokens.spacing[2],
                  right: tokens.spacing[2],
                  padding: `${tokens.spacing[1]} ${tokens.spacing[3]}`,
                  backgroundColor: tokens.colors.surface,
                  color: tokens.colors.text,
                  border: `1px solid ${tokens.colors.border}`,
                  borderRadius: tokens.radius.md,
                  fontSize: tokens.typography.fontSize.sm,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: tokens.spacing[1]
                }}
              >
                📋 Copy
              </button>
              <p style={{
                color: tokens.colors.text,
                whiteSpace: 'pre-wrap',
                fontSize: tokens.typography.fontSize.sm,
                paddingRight: tokens.spacing[20]
              }}>
                {optimizedDescription}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div style={{
          background: `linear-gradient(135deg, ${tokens.colors.success}05, ${tokens.colors.primary}05)`,
          border: `2px solid ${tokens.colors.success}`,
          borderRadius: tokens.radius.lg,
          padding: tokens.spacing[6]
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: tokens.spacing[4] }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
              <span style={{
                padding: `${tokens.spacing[1]} ${tokens.spacing[3]}`,
                backgroundColor: tokens.colors.success,
                color: 'white',
                borderRadius: tokens.radius.sm,
                fontSize: tokens.typography.fontSize.xs,
                fontWeight: tokens.typography.fontWeight.semibold
              }}>
                AI-Optimized
              </span>
              <span style={{
                padding: `${tokens.spacing[1]} ${tokens.spacing[2]}`,
                backgroundColor: `${tokens.colors.success}15`,
                color: tokens.colors.success,
                borderRadius: tokens.radius.sm,
                fontSize: tokens.typography.fontSize.xs,
                fontWeight: tokens.typography.fontWeight.medium,
                border: `1px solid ${tokens.colors.success}`
              }}>
                {characterCount} characters
              </span>
              <span style={{
                padding: `${tokens.spacing[1]} ${tokens.spacing[2]}`,
                backgroundColor: `${tokens.colors.primary}15`,
                color: tokens.colors.primary,
                borderRadius: tokens.radius.sm,
                fontSize: tokens.typography.fontSize.xs,
                fontWeight: tokens.typography.fontWeight.medium,
                border: `1px solid ${tokens.colors.primary}`
              }}>
                {improvement}
              </span>
            </div>
            <button
              onClick={() => copyToClipboard(optimizedDescription)}
              style={{
                padding: `${tokens.spacing[2]} ${tokens.spacing[4]}`,
                backgroundColor: tokens.colors.primary,
                color: 'white',
                border: 'none',
                borderRadius: tokens.radius.md,
                fontSize: tokens.typography.fontSize.sm,
                fontWeight: tokens.typography.fontWeight.medium,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: tokens.spacing[2]
              }}
            >
              📋 Copy to Clipboard
            </button>
          </div>
          <div style={{
            backgroundColor: 'white',
            borderRadius: tokens.radius.lg,
            padding: tokens.spacing[4]
          }}>
            <p style={{
              color: tokens.colors.text,
              whiteSpace: 'pre-wrap',
              fontSize: tokens.typography.fontSize.sm
            }}>
              {optimizedDescription}
            </p>
          </div>
        </div>
      )}

      {useOptimized && (
        <div style={{
          marginTop: tokens.spacing[4],
          backgroundColor: `${tokens.colors.success}10`,
          border: `1px solid ${tokens.colors.success}`,
          borderRadius: tokens.radius.lg,
          padding: tokens.spacing[4]
        }}>
          <p style={{
            fontSize: tokens.typography.fontSize.sm,
            fontWeight: tokens.typography.fontWeight.medium,
            color: tokens.colors.success
          }}>
            ✓ Optimized description selected! This includes keywords, features, benefits, and SEO-friendly formatting.
          </p>
        </div>
      )}
    </div>
  );
}
