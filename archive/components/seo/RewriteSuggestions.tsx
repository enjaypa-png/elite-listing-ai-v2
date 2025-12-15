'use client';

import { useState } from 'react';
import { Button, Card } from '@/components/ui';
import tokens from '@/design-system/tokens.json';

interface Suggestion {
  text: string;
  reasoning: string;
  pointsGained: number;
  improvements: string[];
}

interface RewriteSuggestionsProps {
  type: 'title' | 'tags' | 'description';
  original: string;
  issues: string[];
  category: string;
  keywords: string[];
  onApply: (newContent: string) => void;
}

export function RewriteSuggestions({
  type,
  original,
  issues,
  category,
  keywords,
  onApply,
}: RewriteSuggestionsProps) {
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<any>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const generateSuggestions = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/seo/rewrite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          component: type,
          content: original,
          issues,
          category,
          keywords,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setSuggestions(data.data);
      }
    } catch (error) {
      console.error('Failed to generate suggestions:', error);
      alert('Failed to generate AI suggestions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!suggestions) {
    return (
      <Card>
        <div style={{ padding: tokens.spacing[6] }}>
          <div style={{ display: 'flex', alignItems: 'start', gap: tokens.spacing[4] }}>
            <div style={{ flex: 1 }}>
              <h3 style={{
                fontSize: tokens.typography.fontSize.lg,
                fontWeight: tokens.typography.fontWeight.semibold,
                color: tokens.colors.text,
                marginBottom: tokens.spacing[2]
              }}>
                ✨ AI-Powered Optimization
              </h3>
              <p style={{
                color: tokens.colors.textMuted,
                fontSize: tokens.typography.fontSize.sm,
                marginBottom: tokens.spacing[4]
              }}>
                Get intelligent rewrite suggestions that fix all detected issues and boost your R.A.N.K. score.
              </p>
              <Button
                variant="primary"
                size="md"
                onClick={generateSuggestions}
                disabled={loading}
              >
                {loading ? 'Generating...' : 'Generate Optimized Versions'}
              </Button>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  const currentSuggestion = suggestions.suggestions[selectedIndex];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[4] }}>
      <Card>
        <div style={{ padding: tokens.spacing[6] }}>
          <h3 style={{
            fontSize: tokens.typography.fontSize.xl,
            fontWeight: tokens.typography.fontWeight.semibold,
            color: tokens.colors.text,
            marginBottom: tokens.spacing[6]
          }}>
            ✨ Optimized {type.charAt(0).toUpperCase() + type.slice(1)}
          </h3>

          {/* Original */}
          <div style={{ marginBottom: tokens.spacing[6] }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: tokens.spacing[2],
              marginBottom: tokens.spacing[2]
            }}>
              <span style={{
                color: tokens.colors.danger,
                fontWeight: tokens.typography.fontWeight.semibold
              }}>❌ CURRENT</span>
            </div>
            <div style={{
              background: tokens.colors.background,
              border: `1px solid ${tokens.colors.danger}`,
              borderRadius: tokens.radius.md,
              padding: tokens.spacing[4]
            }}>
              <p style={{ color: tokens.colors.text }}>{original}</p>
            </div>
          </div>

          {/* Suggestion Selector */}
          <div style={{
            display: 'flex',
            gap: tokens.spacing[2],
            marginBottom: tokens.spacing[4]
          }}>
            {suggestions.suggestions.map((_: any, index: number) => (
              <button
                key={index}
                onClick={() => setSelectedIndex(index)}
                style={{
                  padding: `${tokens.spacing[2]} ${tokens.spacing[4]}`,
                  borderRadius: tokens.radius.md,
                  fontWeight: tokens.typography.fontWeight.medium,
                  transition: `all ${tokens.motion.duration.fast}`,
                  background: selectedIndex === index ? tokens.colors.primary : tokens.colors.background,
                  color: selectedIndex === index ? tokens.colors.primaryForeground : tokens.colors.textMuted,
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                Option {index + 1} (+{suggestions.suggestions[index].pointsGained} pts)
              </button>
            ))}
          </div>

          {/* Selected Suggestion */}
          <div style={{ marginBottom: tokens.spacing[6] }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: tokens.spacing[2],
              marginBottom: tokens.spacing[2]
            }}>
              <span style={{
                color: tokens.colors.success,
                fontWeight: tokens.typography.fontWeight.semibold
              }}>✅ OPTIMIZED</span>
              <span style={{
                color: tokens.colors.primary,
                fontWeight: tokens.typography.fontWeight.bold
              }}>+{currentSuggestion.pointsGained} points</span>
            </div>
            <div style={{
              background: tokens.colors.background,
              border: `1px solid ${tokens.colors.success}`,
              borderRadius: tokens.radius.md,
              padding: tokens.spacing[4],
              marginBottom: tokens.spacing[4]
            }}>
              <p style={{
                color: tokens.colors.text,
                fontWeight: tokens.typography.fontWeight.medium
              }}>{currentSuggestion.text}</p>
            </div>

            {/* Why This Is Better */}
            <div style={{
              background: tokens.colors.background,
              border: `1px solid ${tokens.colors.border}`,
              borderRadius: tokens.radius.md,
              padding: tokens.spacing[4],
              marginBottom: tokens.spacing[4]
            }}>
              <h4 style={{
                fontWeight: tokens.typography.fontWeight.semibold,
                color: tokens.colors.text,
                marginBottom: tokens.spacing[2]
              }}>💡 WHY THIS IS BETTER:</h4>
              <p style={{
                color: tokens.colors.textMuted,
                fontSize: tokens.typography.fontSize.sm,
                marginBottom: tokens.spacing[3]
              }}>{currentSuggestion.reasoning}</p>
              <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                {currentSuggestion.improvements.map((improvement: string, i: number) => (
                  <li key={i} style={{
                    fontSize: tokens.typography.fontSize.sm,
                    color: tokens.colors.textMuted,
                    display: 'flex',
                    alignItems: 'start',
                    gap: tokens.spacing[2],
                    marginBottom: tokens.spacing[1]
                  }}>
                    <span style={{ color: tokens.colors.success }}>✓</span>
                    <span>{improvement}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Impact Estimate */}
            <div style={{
              background: `${tokens.colors.primary}1A`,
              border: `1px solid ${tokens.colors.primary}33`,
              borderRadius: tokens.radius.md,
              padding: tokens.spacing[4]
            }}>
              <h4 style={{
                fontWeight: tokens.typography.fontWeight.semibold,
                color: tokens.colors.text,
                marginBottom: tokens.spacing[2]
              }}>📊 ESTIMATED IMPACT:</h4>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: tokens.spacing[4],
                fontSize: tokens.typography.fontSize.sm
              }}>
                <div>
                  <div style={{ color: tokens.colors.textMuted }}>CTR Increase:</div>
                  <div style={{
                    color: tokens.colors.primary,
                    fontWeight: tokens.typography.fontWeight.bold,
                    fontSize: tokens.typography.fontSize.lg
                  }}>{suggestions.impact.estimatedCTRIncrease}</div>
                </div>
                <div>
                  <div style={{ color: tokens.colors.textMuted }}>Ranking:</div>
                  <div style={{
                    color: tokens.colors.primary,
                    fontWeight: tokens.typography.fontWeight.bold,
                    fontSize: tokens.typography.fontSize.lg
                  }}>{suggestions.impact.estimatedRankingImprovement}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: tokens.spacing[3] }}>
            <Button
              variant="secondary"
              size="lg"
              fullWidth
              onClick={() => {
                navigator.clipboard.writeText(currentSuggestion.text);
                alert('Copied to clipboard!');
              }}
            >
              📋 Copy to Clipboard
            </Button>
            <Button
              variant="primary"
              size="lg"
              fullWidth
              onClick={() => onApply(currentSuggestion.text)}
            >
              ✅ Apply This Fix
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
