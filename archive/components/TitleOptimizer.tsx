'use client';

import React, { useState } from 'react';
import tokens from '@/design-system/tokens.json';
import { TitleVariant } from '@/lib/mockListingData';

interface TitleOptimizerProps {
  currentTitle: string;
  titleVariants: TitleVariant[];
}

export function TitleOptimizer({ currentTitle, titleVariants }: TitleOptimizerProps) {
  const [selectedTitle, setSelectedTitle] = useState<number | null>(null);

  const currentScore = 45;
  const currentMaxScore = 70;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Title copied to clipboard!');
  };

  return (
    <div style={{
      backgroundColor: tokens.colors.surface,
      borderRadius: tokens.radius.lg,
      padding: tokens.spacing[6],
      border: `1px solid ${tokens.colors.border}`
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: tokens.spacing[4] }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[3] }}>
          <h3 style={{
            fontSize: tokens.typography.fontSize.xl,
            fontWeight: tokens.typography.fontWeight.semibold,
            color: tokens.colors.text
          }}>
            Title Optimization
          </h3>
          <span style={{ fontSize: '20px' }}>✨</span>
        </div>
      </div>

      {/* Current Title */}
      <div style={{ marginBottom: tokens.spacing[6], paddingBottom: tokens.spacing[6], borderBottom: `1px solid ${tokens.colors.border}` }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: tokens.spacing[2] }}>
          <span style={{
            fontSize: tokens.typography.fontSize.sm,
            fontWeight: tokens.typography.fontWeight.medium,
            color: tokens.colors.textMuted
          }}>
            Current Title
          </span>
          <span style={{
            padding: `${tokens.spacing[1]} ${tokens.spacing[3]}`,
            backgroundColor: `${tokens.colors.warning}15`,
            color: tokens.colors.warning,
            borderRadius: tokens.radius.sm,
            fontSize: tokens.typography.fontSize.sm,
            border: `1px solid ${tokens.colors.warning}`
          }}>
            {currentScore}/{currentMaxScore} points
          </span>
        </div>
        <div style={{
          backgroundColor: tokens.colors.surfaceHover,
          borderRadius: tokens.radius.lg,
          padding: tokens.spacing[4],
          border: `1px solid ${tokens.colors.border}`
        }}>
          <p style={{
            color: tokens.colors.text,
            fontWeight: tokens.typography.fontWeight.medium,
            marginBottom: tokens.spacing[2]
          }}>
            {currentTitle}
          </p>
          <p style={{
            fontSize: tokens.typography.fontSize.sm,
            color: tokens.colors.textMuted
          }}>
            ❌ Missing: keywords, gift angle, category terms
          </p>
        </div>
      </div>

      {/* AI-Generated Titles */}
      <div>
        <h4 style={{
          fontWeight: tokens.typography.fontWeight.semibold,
          marginBottom: tokens.spacing[3],
          display: 'flex',
          alignItems: 'center',
          gap: tokens.spacing[2],
          color: tokens.colors.text
        }}>
          <span style={{ fontSize: '16px' }}>✨</span>
          AI-Optimized Titles
        </h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[3] }}>
          {titleVariants.map((option, index) => (
            <div
              key={index}
              onClick={() => setSelectedTitle(index)}
              style={{
                border: `2px solid ${selectedTitle === index ? tokens.colors.success : tokens.colors.border}`,
                borderRadius: tokens.radius.lg,
                padding: tokens.spacing[4],
                cursor: 'pointer',
                backgroundColor: selectedTitle === index ? `${tokens.colors.success}05` : tokens.colors.surface,
                transition: 'all 0.2s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'start', justifyContent: 'space-between', gap: tokens.spacing[3], marginBottom: tokens.spacing[2] }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2], marginBottom: tokens.spacing[1], flexWrap: 'wrap' }}>
                    <span style={{
                      padding: `${tokens.spacing[1]} ${tokens.spacing[3]}`,
                      background: `linear-gradient(135deg, ${tokens.colors.success}, ${tokens.colors.primary})`,
                      color: 'white',
                      borderRadius: tokens.radius.sm,
                      fontSize: tokens.typography.fontSize.xs,
                      fontWeight: tokens.typography.fontWeight.semibold
                    }}>
                      Option {index + 1}
                    </span>
                    <span style={{
                      padding: `${tokens.spacing[1]} ${tokens.spacing[3]}`,
                      backgroundColor: `${tokens.colors.success}15`,
                      color: tokens.colors.success,
                      borderRadius: tokens.radius.sm,
                      fontSize: tokens.typography.fontSize.sm,
                      border: `1px solid ${tokens.colors.success}`
                    }}>
                      {option.score}/{option.maxScore} points
                    </span>
                    <span style={{
                      padding: `${tokens.spacing[1]} ${tokens.spacing[3]}`,
                      backgroundColor: `${tokens.colors.primary}15`,
                      color: tokens.colors.primary,
                      borderRadius: tokens.radius.sm,
                      fontSize: tokens.typography.fontSize.sm,
                      border: `1px solid ${tokens.colors.primary}`
                    }}>
                      {option.improvement}
                    </span>
                  </div>
                  <p style={{
                    fontWeight: tokens.typography.fontWeight.medium,
                    color: tokens.colors.text,
                    marginBottom: tokens.spacing[2]
                  }}>
                    {option.text}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: tokens.spacing[2] }}>
                  {selectedTitle === index && (
                    <button style={{
                      padding: `${tokens.spacing[2]} ${tokens.spacing[3]}`,
                      backgroundColor: tokens.colors.success,
                      color: 'white',
                      border: 'none',
                      borderRadius: tokens.radius.md,
                      fontSize: tokens.typography.fontSize.sm,
                      fontWeight: tokens.typography.fontWeight.medium,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: tokens.spacing[1]
                    }}>
                      ✓ Selected
                    </button>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      copyToClipboard(option.text);
                    }}
                    style={{
                      padding: `${tokens.spacing[2]} ${tokens.spacing[3]}`,
                      backgroundColor: tokens.colors.surface,
                      color: tokens.colors.text,
                      border: `1px solid ${tokens.colors.border}`,
                      borderRadius: tokens.radius.md,
                      fontSize: tokens.typography.fontSize.sm,
                      cursor: 'pointer'
                    }}
                  >
                    📋
                  </button>
                </div>
              </div>
              <p style={{
                fontSize: tokens.typography.fontSize.sm,
                color: tokens.colors.textMuted
              }}>
                💡 {option.reasoning}
              </p>
            </div>
          ))}
        </div>
      </div>

      {selectedTitle !== null && (
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
            ✓ Title optimized! This will improve your search visibility and increase clicks.
          </p>
        </div>
      )}
    </div>
  );
}
