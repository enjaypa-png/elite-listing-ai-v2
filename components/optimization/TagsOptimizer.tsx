'use client';

import React, { useState } from 'react';
import tokens from '@/design-system/tokens.json';

interface TagsOptimizerProps {
  currentTags: string[];
  suggestedTags: string[];
  improvement: string;
}

export function TagsOptimizer({ currentTags, suggestedTags, improvement }: TagsOptimizerProps) {
  const [activeTags, setActiveTags] = useState<string[]>([...currentTags]);
  const maxTags = 13;
  const remaining = maxTags - activeTags.length;

  const addTag = (tag: string) => {
    if (activeTags.length < maxTags && !activeTags.includes(tag)) {
      setActiveTags([...activeTags, tag]);
    }
  };

  const removeTag = (tag: string) => {
    setActiveTags(activeTags.filter(t => t !== tag));
  };

  const addAllSuggested = () => {
    const newTags = [...activeTags];
    suggestedTags.forEach(tag => {
      if (newTags.length < maxTags && !newTags.includes(tag)) {
        newTags.push(tag);
      }
    });
    setActiveTags(newTags);
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
            Tags Optimization
          </h3>
          <span style={{
            padding: `${tokens.spacing[1]} ${tokens.spacing[3]}`,
            backgroundColor: tokens.colors.surfaceHover,
            color: tokens.colors.text,
            borderRadius: tokens.radius.sm,
            fontSize: tokens.typography.fontSize.sm,
            border: `1px solid ${tokens.colors.border}`
          }}>
            {activeTags.length} / {maxTags}
          </span>
        </div>
        {activeTags.length < maxTags && (
          <button
            onClick={addAllSuggested}
            style={{
              padding: `${tokens.spacing[2]} ${tokens.spacing[4]}`,
              backgroundColor: tokens.colors.success,
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
            + Add All Suggestions
          </button>
        )}
      </div>

      {/* Critical Warning */}
      {activeTags.length < maxTags && (
        <div style={{
          backgroundColor: `${tokens.colors.error}10`,
          border: `1px solid ${tokens.colors.error}`,
          borderRadius: tokens.radius.lg,
          padding: tokens.spacing[4],
          marginBottom: tokens.spacing[4],
          display: 'flex',
          gap: tokens.spacing[3]
        }}>
          <span style={{ fontSize: '20px', flexShrink: 0 }}>🔴</span>
          <div>
            <p style={{
              fontWeight: tokens.typography.fontWeight.semibold,
              color: tokens.colors.error,
              marginBottom: tokens.spacing[1]
            }}>
              CRITICAL: Only {activeTags.length} tags (need {maxTags})
            </p>
            <p style={{
              fontSize: tokens.typography.fontSize.sm,
              color: tokens.colors.error
            }}>
              Missing {remaining} tags means missing search opportunities. Add all suggested tags to gain {improvement}.
            </p>
          </div>
        </div>
      )}

      {/* Active Tags */}
      <div style={{ marginBottom: tokens.spacing[4] }}>
        <h4 style={{
          fontSize: tokens.typography.fontSize.sm,
          fontWeight: tokens.typography.fontWeight.semibold,
          color: tokens.colors.textMuted,
          marginBottom: tokens.spacing[2]
        }}>
          Active Tags:
        </h4>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: tokens.spacing[2] }}>
          {activeTags.map((tag, index) => {
            const isOriginal = currentTags.includes(tag);
            return (
              <span
                key={index}
                style={{
                  padding: `${tokens.spacing[2]} ${tokens.spacing[3]}`,
                  backgroundColor: isOriginal ? tokens.colors.surfaceHover : `${tokens.colors.success}15`,
                  color: isOriginal ? tokens.colors.text : tokens.colors.success,
                  border: `1px solid ${isOriginal ? tokens.colors.border : tokens.colors.success}`,
                  borderRadius: tokens.radius.md,
                  fontSize: tokens.typography.fontSize.sm,
                  display: 'flex',
                  alignItems: 'center',
                  gap: tokens.spacing[2]
                }}
              >
                {tag}
                <button
                  onClick={() => removeTag(tag)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'inherit',
                    cursor: 'pointer',
                    padding: 0,
                    fontSize: '12px'
                  }}
                >
                  ✕
                </button>
              </span>
            );
          })}
          {activeTags.length < maxTags && (
            <span style={{
              padding: `${tokens.spacing[2]} ${tokens.spacing[3]}`,
              backgroundColor: 'transparent',
              color: tokens.colors.textMuted,
              border: `2px dashed ${tokens.colors.border}`,
              borderRadius: tokens.radius.md,
              fontSize: tokens.typography.fontSize.sm
            }}>
              +{remaining} more
            </span>
          )}
        </div>
      </div>

      {/* Suggested Tags */}
      {activeTags.length < maxTags && (
        <div style={{
          backgroundColor: `${tokens.colors.primary}10`,
          borderRadius: tokens.radius.lg,
          padding: tokens.spacing[4]
        }}>
          <h4 style={{
            fontSize: tokens.typography.fontSize.sm,
            fontWeight: tokens.typography.fontWeight.semibold,
            color: tokens.colors.primary,
            marginBottom: tokens.spacing[3]
          }}>
            🏷️ Suggested High-Performing Tags:
          </h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: tokens.spacing[2] }}>
            {suggestedTags.map((tag, index) => {
              const isActive = activeTags.includes(tag);
              return (
                <button
                  key={index}
                  onClick={() => !isActive && addTag(tag)}
                  disabled={isActive || activeTags.length >= maxTags}
                  style={{
                    padding: `${tokens.spacing[2]} ${tokens.spacing[3]}`,
                    backgroundColor: isActive ? `${tokens.colors.success}15` : tokens.colors.surface,
                    color: isActive ? tokens.colors.success : tokens.colors.text,
                    border: `1px solid ${isActive ? tokens.colors.success : tokens.colors.border}`,
                    borderRadius: tokens.radius.md,
                    fontSize: tokens.typography.fontSize.sm,
                    cursor: isActive || activeTags.length >= maxTags ? 'not-allowed' : 'pointer',
                    opacity: isActive || activeTags.length >= maxTags ? 0.6 : 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: tokens.spacing[1]
                  }}
                >
                  {isActive ? '✓' : '+'} {tag}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {activeTags.length === maxTags && (
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
            ✓ All 13 tags used! Your listing will appear in more search results.
          </p>
        </div>
      )}
    </div>
  );
}
