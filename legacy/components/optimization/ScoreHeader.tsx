'use client';

import React from 'react';
import tokens from '@/design-system/tokens.json';

interface ScoreHeaderProps {
  currentScore: number;
  maxScore: number;
  percentage: number;
  potentialScore?: number;
}

export function ScoreHeader({ currentScore, maxScore, percentage, potentialScore }: ScoreHeaderProps) {
  const getScoreColor = (percent: number) => {
    if (percent < 50) return tokens.colors.error;
    if (percent < 75) return tokens.colors.warning;
    return tokens.colors.success;
  };

  const scoreColor = getScoreColor(percentage);
  const potentialPercentage = potentialScore ? Math.round((potentialScore / maxScore) * 100) : 0;

  return (
    <div style={{
      backgroundColor: tokens.colors.surface,
      borderRadius: tokens.radius.lg,
      padding: tokens.spacing[6],
      marginBottom: tokens.spacing[6],
      border: `1px solid ${tokens.colors.border}`
    }}>
      <div style={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: tokens.spacing[6],
        flexWrap: 'wrap'
      }}>
        {/* Current Score */}
        <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[6] }}>
          <div style={{ position: 'relative', width: '128px', height: '128px' }}>
            <div style={{
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              border: `8px solid ${tokens.colors.borderLight}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative'
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  fontSize: tokens.typography.fontSize['3xl'],
                  fontWeight: tokens.typography.fontWeight.bold,
                  color: scoreColor
                }}>
                  {currentScore}
                </div>
                <div style={{
                  fontSize: tokens.typography.fontSize.sm,
                  color: tokens.colors.textMuted
                }}>
                  / {maxScore}
                </div>
              </div>
            </div>
            {/* Progress ring */}
            <svg style={{
              position: 'absolute',
              top: 0,
              left: 0,
              transform: 'rotate(-90deg)',
              width: '128px',
              height: '128px'
            }}>
              <circle
                cx="64"
                cy="64"
                r="56"
                fill="none"
                stroke={scoreColor}
                strokeWidth="8"
                strokeDasharray={`${percentage * 3.52} 352`}
                strokeLinecap="round"
              />
            </svg>
          </div>
          
          <div>
            <h2 style={{
              fontSize: tokens.typography.fontSize['2xl'],
              fontWeight: tokens.typography.fontWeight.bold,
              marginBottom: tokens.spacing[2],
              color: tokens.colors.text
            }}>
              Listing Optimization Score
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2], marginBottom: tokens.spacing[2] }}>
              <span style={{
                padding: `${tokens.spacing[1]} ${tokens.spacing[3]}`,
                backgroundColor: percentage < 50 ? `${tokens.colors.error}15` : percentage < 75 ? `${tokens.colors.warning}15` : `${tokens.colors.success}15`,
                color: scoreColor,
                borderRadius: tokens.radius.sm,
                fontSize: tokens.typography.fontSize.sm,
                fontWeight: tokens.typography.fontWeight.semibold
              }}>
                {percentage}% Optimized
              </span>
              {percentage < 75 && (
                <span style={{
                  padding: `${tokens.spacing[1]} ${tokens.spacing[3]}`,
                  backgroundColor: `${tokens.colors.warning}10`,
                  color: tokens.colors.warning,
                  borderRadius: tokens.radius.sm,
                  fontSize: tokens.typography.fontSize.xs,
                  border: `1px solid ${tokens.colors.warning}`,
                  display: 'flex',
                  alignItems: 'center',
                  gap: tokens.spacing[1]
                }}>
                  ⚠️ Needs Improvement
                </span>
              )}
            </div>
            <p style={{
              fontSize: tokens.typography.fontSize.sm,
              color: tokens.colors.textMuted
            }}>
              Based on Etsy's 2025 algorithm (285 ranking factors)
            </p>
          </div>
        </div>

        {/* Potential Score */}
        {potentialScore && (
          <div style={{
            background: `linear-gradient(135deg, ${tokens.colors.success}10, ${tokens.colors.primary}10)`,
            borderRadius: tokens.radius.lg,
            padding: tokens.spacing[6],
            border: `2px solid ${tokens.colors.success}`,
            minWidth: '280px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[3], marginBottom: tokens.spacing[3] }}>
              <span style={{ fontSize: '24px' }}>📈</span>
              <h3 style={{
                fontSize: tokens.typography.fontSize.lg,
                fontWeight: tokens.typography.fontWeight.semibold,
                color: tokens.colors.success
              }}>
                Potential Score
              </h3>
            </div>
            <div style={{
              fontSize: tokens.typography.fontSize['3xl'],
              fontWeight: tokens.typography.fontWeight.bold,
              color: tokens.colors.success,
              marginBottom: tokens.spacing[2]
            }}>
              {potentialScore} / {maxScore}
            </div>
            <div style={{
              fontSize: tokens.typography.fontSize.sm,
              color: tokens.colors.success,
              marginBottom: tokens.spacing[3],
              fontWeight: tokens.typography.fontWeight.medium
            }}>
              {potentialPercentage}% if all issues fixed
            </div>
            <div style={{
              width: '100%',
              height: '8px',
              backgroundColor: `${tokens.colors.success}20`,
              borderRadius: tokens.radius.full,
              overflow: 'hidden'
            }}>
              <div style={{
                width: `${potentialPercentage}%`,
                height: '100%',
                backgroundColor: tokens.colors.success,
                transition: 'width 0.3s ease'
              }} />
            </div>
            <p style={{
              fontSize: tokens.typography.fontSize.xs,
              color: tokens.colors.success,
              marginTop: tokens.spacing[2],
              fontWeight: tokens.typography.fontWeight.medium
            }}>
              +{potentialScore - currentScore} points possible
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
