'use client';

import React, { useState } from 'react';
import tokens from '@/design-system/tokens.json';

interface Keyword {
  keyword: string;
  searchVolume: number;
  competition: 'low' | 'medium' | 'high';
  intent: 'purchase' | 'discovery' | 'gifting' | 'seasonal';
  relevanceScore: number;
  keywordScore: number;
  ctrPotential: number;
  conversionPotential: number;
  algorithmFit: string;
}

interface AlgorithmInsights {
  listingQualityImpact: string;
  expectedCTR: string;
  competitivenessLevel: string;
  optimizationTips: string[];
}

interface KeywordResultsProps {
  data: {
    primaryKeywords: Keyword[];
    secondaryKeywords: Keyword[];
    totalKeywords: number;
    averageRelevance: number;
    topIntent: string;
    suggestions: string[];
    algorithmInsights: AlgorithmInsights;
  };
}

export function KeywordResults({ data }: KeywordResultsProps) {
  const [showSecondary, setShowSecondary] = useState(false);

  const getCompetitionColor = (competition: string) => {
    switch (competition) {
      case 'low': return { bg: `${tokens.colors.success}15`, text: tokens.colors.success, emoji: '🟢' };
      case 'medium': return { bg: `${tokens.colors.warning}15`, text: tokens.colors.warning, emoji: '🟡' };
      case 'high': return { bg: `${tokens.colors.error}15`, text: tokens.colors.error, emoji: '🔴' };
      default: return { bg: tokens.colors.surfaceHover, text: tokens.colors.text, emoji: '⚪' };
    }
  };

  const getIntentIcon = (intent: string) => {
    switch (intent) {
      case 'purchase': return '💰';
      case 'gifting': return '🎁';
      case 'discovery': return '🔍';
      case 'seasonal': return '🌟';
      default: return '📌';
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert(`Copied: ${text}`);
  };

  const exportAsCSV = () => {
    const csvRows = [
      ['Keyword', 'Search Volume', 'Competition', 'Intent', 'Keyword Score', 'CTR Potential', 'Conversion Potential', 'Type'],
      ...data.primaryKeywords.map(k => [
        k.keyword, k.searchVolume, k.competition, k.intent, k.keywordScore, k.ctrPotential, k.conversionPotential, 'Primary'
      ]),
      ...data.secondaryKeywords.map(k => [
        k.keyword, k.searchVolume, k.competition, k.intent, k.keywordScore, k.ctrPotential, k.conversionPotential, 'Secondary'
      ])
    ];
    
    const csvContent = csvRows.map(row => row.join(',')).join('\\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `etsy-keywords-${Date.now()}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const KeywordCard = ({ keyword, isPrimary = true }: { keyword: Keyword; isPrimary?: boolean }) => {
    const compColors = getCompetitionColor(keyword.competition);
    
    return (
      <div style={{
        background: 'linear-gradient(135deg, #1E293B 0%, #1A2332 100%)',
        border: `2px solid ${isPrimary ? '#3B82F6' : '#334155'}`,
        borderRadius: tokens.radius.lg,
        padding: 0,
        transition: 'all 0.2s ease',
        cursor: 'pointer',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = '0 8px 16px rgba(0, 0, 0, 0.4)';
        e.currentTarget.style.borderColor = '#3B82F6';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.3)';
        e.currentTarget.style.borderColor = isPrimary ? '#3B82F6' : '#334155';
      }}
      >
        {/* Keyword Title Header */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.03)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          padding: tokens.spacing[4],
          borderRadius: `${tokens.radius.lg} ${tokens.radius.lg} 0 0`
        }}>
          <h4 style={{
            fontSize: isPrimary ? tokens.typography.fontSize.lg : tokens.typography.fontSize.base,
            fontWeight: tokens.typography.fontWeight.bold,
            color: '#F1F5F9',
            marginBottom: tokens.spacing[2]
          }}>
            {keyword.keyword}
          </h4>
          
          {/* Badges Row */}
          <div style={{ display: 'flex', gap: tokens.spacing[2], flexWrap: 'wrap' }}>
            {/* Competition Badge */}
            <span style={{
              padding: `${tokens.spacing[1]} ${tokens.spacing[3]}`,
              backgroundColor: compColors.bg,
              color: compColors.text,
              borderRadius: tokens.radius.md,
              fontSize: tokens.typography.fontSize.xs,
              fontWeight: tokens.typography.fontWeight.semibold,
              display: 'flex',
              alignItems: 'center',
              gap: tokens.spacing[1],
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
            }}>
              {compColors.emoji} {keyword.competition.toUpperCase()}
            </span>
            
            {/* Intent Badge */}
            <span style={{
              padding: `${tokens.spacing[1]} ${tokens.spacing[3]}`,
              backgroundColor: 'rgba(59, 130, 246, 0.2)',
              color: '#60A5FA',
              borderRadius: tokens.radius.md,
              fontSize: tokens.typography.fontSize.xs,
              fontWeight: tokens.typography.fontWeight.semibold,
              display: 'flex',
              alignItems: 'center',
              gap: tokens.spacing[1],
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
            }}>
              {getIntentIcon(keyword.intent)} {keyword.intent}
            </span>
          </div>
        </div>

        {/* Card Body */}
        <div style={{ padding: tokens.spacing[4] }}>
          {/* Metrics Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: tokens.spacing[3],
            marginBottom: tokens.spacing[3]
          }}>
            {/* Search Volume */}
            <div>
              <p style={{
                fontSize: tokens.typography.fontSize.xs,
                color: '#94A3B8',
                marginBottom: tokens.spacing[1]
              }}>
                Search Volume
              </p>
              <p style={{
                fontSize: tokens.typography.fontSize.base,
                fontWeight: tokens.typography.fontWeight.semibold,
                color: '#E2E8F0'
              }}>
                📊 {keyword.searchVolume}/month
              </p>
            </div>

            {/* Keyword Score */}
            <div>
              <p style={{
                fontSize: tokens.typography.fontSize.xs,
                color: '#94A3B8',
                marginBottom: tokens.spacing[1]
              }}>
                Keyword Score
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                <p style={{
                  fontSize: tokens.typography.fontSize.base,
                  fontWeight: tokens.typography.fontWeight.bold,
                  color: keyword.keywordScore >= 75 ? tokens.colors.success : keyword.keywordScore >= 50 ? tokens.colors.warning : tokens.colors.error
                }}>
                  ⭐ {keyword.keywordScore}/100
                </p>
                <div style={{
                  flex: 1,
                  height: '6px',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: tokens.radius.full,
                  overflow: 'hidden'
                }}>
                  <div style={{
                    width: `${keyword.keywordScore}%`,
                    height: '100%',
                    background: keyword.keywordScore >= 75 
                      ? 'linear-gradient(90deg, #10B981, #34D399)'
                      : keyword.keywordScore >= 50 
                        ? 'linear-gradient(90deg, #F59E0B, #FCD34D)'
                        : 'linear-gradient(90deg, #EF4444, #F87171)',
                    transition: 'width 0.3s ease',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
                  }} />
                </div>
              </div>
            </div>

            {/* CTR Potential */}
            <div>
              <p style={{
                fontSize: tokens.typography.fontSize.xs,
                color: '#94A3B8',
                marginBottom: tokens.spacing[1]
              }}>
                CTR Potential
              </p>
              <p style={{
                fontSize: tokens.typography.fontSize.base,
                fontWeight: tokens.typography.fontWeight.semibold,
                color: '#E2E8F0'
              }}>
                👆 {keyword.ctrPotential}%
              </p>
            </div>

            {/* Conversion Potential */}
            <div>
              <p style={{
                fontSize: tokens.typography.fontSize.xs,
                color: '#94A3B8',
                marginBottom: tokens.spacing[1]
              }}>
                Conversion
              </p>
              <p style={{
                fontSize: tokens.typography.fontSize.base,
                fontWeight: tokens.typography.fontWeight.semibold,
                color: '#E2E8F0'
              }}>
                💵 {keyword.conversionPotential}%
              </p>
            </div>
          </div>

        {/* Algorithm Fit */}
        {keyword.algorithmFit && (
          <div style={{
            backgroundColor: `${tokens.colors.primary}08`,
            borderLeft: `3px solid ${tokens.colors.primary}`,
            padding: tokens.spacing[3],
            marginBottom: tokens.spacing[3],
            borderRadius: tokens.radius.sm
          }}>
            <p style={{
              fontSize: tokens.typography.fontSize.xs,
              color: tokens.colors.primary,
              lineHeight: 1.5
            }}>
              💡 {keyword.algorithmFit}
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: tokens.spacing[2] }}>
          <button
            onClick={() => copyToClipboard(keyword.keyword)}
            style={{
              flex: 1,
              padding: `${tokens.spacing[2]} ${tokens.spacing[4]}`,
              backgroundColor: '#1E293B',
              color: '#E2E8F0',
              border: '2px solid #334155',
              borderRadius: tokens.radius.md,
              fontSize: tokens.typography.fontSize.sm,
              fontWeight: tokens.typography.fontWeight.medium,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: tokens.spacing[2],
              transition: 'all 0.2s ease',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#2D3748';
              e.currentTarget.style.borderColor = '#4A5568';
              e.currentTarget.style.transform = 'scale(1.02)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#1E293B';
              e.currentTarget.style.borderColor = '#334155';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            📋 Copy
          </button>
          <button
            style={{
              flex: 1,
              padding: `${tokens.spacing[2]} ${tokens.spacing[4]}`,
              background: 'linear-gradient(135deg, #3B82F6, #2563EB)',
              color: 'white',
              border: 'none',
              borderRadius: tokens.radius.md,
              fontSize: tokens.typography.fontSize.sm,
              fontWeight: tokens.typography.fontWeight.medium,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: tokens.spacing[2],
              transition: 'all 0.2s ease',
              boxShadow: '0 4px 6px rgba(59, 130, 246, 0.3)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.05)';
              e.currentTarget.style.boxShadow = '0 6px 12px rgba(59, 130, 246, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = '0 4px 6px rgba(59, 130, 246, 0.3)';
            }}
          >
            ➕ Add to Tags
          </button>
        </div>
      </div>
    );
  };

  return (
    <div style={{ width: '100%' }}>
      {/* Summary Header */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(16, 185, 129, 0.15))',
        border: '2px solid #3B82F6',
        borderRadius: tokens.radius.lg,
        padding: tokens.spacing[6],
        marginBottom: tokens.spacing[6],
        boxShadow: '0 8px 16px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(59, 130, 246, 0.1) inset'
      }}>
        <h3 style={{
          fontSize: tokens.typography.fontSize['2xl'],
          fontWeight: tokens.typography.fontWeight.bold,
          color: '#F1F5F9',
          marginBottom: tokens.spacing[4],
          textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)'
        }}>
          🎯 Keyword Analysis Complete
        </h3>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: tokens.spacing[4]
        }}>
          <div>
            <p style={{
              fontSize: tokens.typography.fontSize.sm,
              color: tokens.colors.textMuted,
              marginBottom: tokens.spacing[1]
            }}>
              Total Keywords
            </p>
            <p style={{
              fontSize: tokens.typography.fontSize['2xl'],
              fontWeight: tokens.typography.fontWeight.bold,
              color: tokens.colors.primary
            }}>
              {data.totalKeywords}
            </p>
          </div>

          <div>
            <p style={{
              fontSize: tokens.typography.fontSize.sm,
              color: tokens.colors.textMuted,
              marginBottom: tokens.spacing[1]
            }}>
              Average Relevance
            </p>
            <p style={{
              fontSize: tokens.typography.fontSize['2xl'],
              fontWeight: tokens.typography.fontWeight.bold,
              color: data.averageRelevance >= 80 ? tokens.colors.success : data.averageRelevance >= 60 ? tokens.colors.warning : tokens.colors.error
            }}>
              {data.averageRelevance}%
            </p>
          </div>

          <div>
            <p style={{
              fontSize: tokens.typography.fontSize.sm,
              color: tokens.colors.textMuted,
              marginBottom: tokens.spacing[1]
            }}>
              Expected CTR
            </p>
            <p style={{
              fontSize: tokens.typography.fontSize['2xl'],
              fontWeight: tokens.typography.fontWeight.bold,
              color: tokens.colors.success
            }}>
              {data.algorithmInsights.expectedCTR}
            </p>
          </div>

          <div>
            <p style={{
              fontSize: tokens.typography.fontSize.sm,
              color: tokens.colors.textMuted,
              marginBottom: tokens.spacing[1]
            }}>
              Top Intent
            </p>
            <p style={{
              fontSize: tokens.typography.fontSize.xl,
              fontWeight: tokens.typography.fontWeight.bold,
              color: tokens.colors.text
            }}>
              {getIntentIcon(data.topIntent)} {data.topIntent}
            </p>
          </div>
        </div>
      </div>

      {/* Algorithm Insights */}
      {data.algorithmInsights.optimizationTips && data.algorithmInsights.optimizationTips.length > 0 && (
        <div style={{
          background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.12), rgba(37, 99, 235, 0.12))',
          border: '2px solid #3B82F6',
          borderRadius: tokens.radius.lg,
          padding: tokens.spacing[5],
          marginBottom: tokens.spacing[6],
          boxShadow: '0 6px 12px rgba(0, 0, 0, 0.25)'
        }}>
          <h4 style={{
            fontSize: tokens.typography.fontSize.lg,
            fontWeight: tokens.typography.fontWeight.semibold,
            color: '#60A5FA',
            marginBottom: tokens.spacing[3],
            display: 'flex',
            alignItems: 'center',
            gap: tokens.spacing[2],
            textShadow: '0 1px 2px rgba(0, 0, 0, 0.2)'
          }}>
            💡 Algorithm Optimization Tips
          </h4>
          <ul style={{
            listStyle: 'none',
            padding: 0,
            margin: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: tokens.spacing[2]
          }}>
            {data.algorithmInsights.optimizationTips.map((tip, index) => (
              <li key={index} style={{
                display: 'flex',
                alignItems: 'start',
                gap: tokens.spacing[2],
                fontSize: tokens.typography.fontSize.sm,
                color: tokens.colors.primary,
                lineHeight: 1.6
              }}>
                <span style={{ flexShrink: 0, fontSize: '16px' }}>✓</span>
                {tip}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Primary Keywords */}
      <div style={{ marginBottom: tokens.spacing[8] }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: tokens.spacing[4]
        }}>
          <h3 style={{
            fontSize: tokens.typography.fontSize.xl,
            fontWeight: tokens.typography.fontWeight.bold,
            color: tokens.colors.text,
            display: 'flex',
            alignItems: 'center',
            gap: tokens.spacing[2]
          }}>
            🎯 Primary Keywords
            <span style={{
              padding: `${tokens.spacing[1]} ${tokens.spacing[3]}`,
              backgroundColor: tokens.colors.primary,
              color: 'white',
              borderRadius: tokens.radius.full,
              fontSize: tokens.typography.fontSize.xs,
              fontWeight: tokens.typography.fontWeight.bold
            }}>
              {data.primaryKeywords.length}
            </span>
          </h3>
          <button
            onClick={() => {
              const allPrimary = data.primaryKeywords.map(k => k.keyword).join(', ');
              copyToClipboard(allPrimary);
            }}
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
            📋 Copy All Primary
          </button>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 320px), 1fr))',
          gap: tokens.spacing[4]
        }}>
          {data.primaryKeywords.map((keyword, index) => (
            <KeywordCard key={index} keyword={keyword} isPrimary={true} />
          ))}
        </div>
      </div>

      {/* Secondary Keywords */}
      <div style={{ marginBottom: tokens.spacing[6] }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: tokens.spacing[4]
        }}>
          <h3 style={{
            fontSize: tokens.typography.fontSize.xl,
            fontWeight: tokens.typography.fontWeight.bold,
            color: tokens.colors.text,
            display: 'flex',
            alignItems: 'center',
            gap: tokens.spacing[2]
          }}>
            🔍 Secondary Keywords (Long-Tail)
            <span style={{
              padding: `${tokens.spacing[1]} ${tokens.spacing[3]}`,
              backgroundColor: tokens.colors.surfaceHover,
              color: tokens.colors.text,
              borderRadius: tokens.radius.full,
              fontSize: tokens.typography.fontSize.xs,
              fontWeight: tokens.typography.fontWeight.bold,
              border: `1px solid ${tokens.colors.border}`
            }}>
              {data.secondaryKeywords.length}
            </span>
          </h3>
          <button
            onClick={() => setShowSecondary(!showSecondary)}
            style={{
              padding: `${tokens.spacing[2]} ${tokens.spacing[4]}`,
              backgroundColor: tokens.colors.surface,
              color: tokens.colors.text,
              border: `1px solid ${tokens.colors.border}`,
              borderRadius: tokens.radius.md,
              fontSize: tokens.typography.fontSize.sm,
              fontWeight: tokens.typography.fontWeight.medium,
              cursor: 'pointer'
            }}
          >
            {showSecondary ? '▼ Hide' : '▶ Show'} All {data.secondaryKeywords.length} Keywords
          </button>
        </div>

        {showSecondary && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 280px), 1fr))',
            gap: tokens.spacing[3]
          }}>
            {data.secondaryKeywords.map((keyword, index) => (
              <KeywordCard key={index} keyword={keyword} isPrimary={false} />
            ))}
          </div>
        )}
      </div>

      {/* Suggestions */}
      {data.suggestions && data.suggestions.length > 0 && (
        <div style={{
          background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(251, 191, 36, 0.15))',
          border: '2px solid #F59E0B',
          borderRadius: tokens.radius.lg,
          padding: tokens.spacing[5],
          boxShadow: '0 6px 12px rgba(0, 0, 0, 0.25)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Animated border effect */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '3px',
            background: 'linear-gradient(90deg, transparent, #FCD34D, transparent)',
            animation: 'shimmer 3s infinite'
          }} />
          <h4 style={{
            fontSize: tokens.typography.fontSize.lg,
            fontWeight: tokens.typography.fontWeight.semibold,
            color: '#FCD34D',
            marginBottom: tokens.spacing[3],
            display: 'flex',
            alignItems: 'center',
            gap: tokens.spacing[2],
            textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)'
          }}>
            ⚠️ Suggestions to Improve
          </h4>
          <ul style={{
            listStyle: 'none',
            padding: 0,
            margin: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: tokens.spacing[2]
          }}>
            {data.suggestions.map((suggestion, index) => (
              <li key={index} style={{
                display: 'flex',
                alignItems: 'start',
                gap: tokens.spacing[2],
                fontSize: tokens.typography.fontSize.sm,
                color: tokens.colors.warning,
                lineHeight: 1.6
              }}>
                <span style={{ flexShrink: 0 }}>•</span>
                {suggestion}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Quick Copy All & Export */}
      <div style={{
        marginTop: tokens.spacing[6],
        backgroundColor: tokens.colors.surface,
        border: `2px solid ${tokens.colors.border}`,
        borderRadius: tokens.radius.lg,
        padding: tokens.spacing[5],
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: tokens.spacing[4]
      }}>
        <div>
          <h4 style={{
            fontSize: tokens.typography.fontSize.lg,
            fontWeight: tokens.typography.fontWeight.semibold,
            color: tokens.colors.text,
            marginBottom: tokens.spacing[1]
          }}>
            Ready to use these keywords?
          </h4>
          <p style={{
            fontSize: tokens.typography.fontSize.sm,
            color: tokens.colors.textMuted
          }}>
            Copy all keywords, export as CSV, or save to your account
          </p>
        </div>
        <div style={{ display: 'flex', gap: tokens.spacing[2], flexWrap: 'wrap' }}>
          <button
            onClick={() => {
              const allKeywords = [
                ...data.primaryKeywords.map(k => k.keyword),
                ...data.secondaryKeywords.map(k => k.keyword)
              ].join(', ');
              copyToClipboard(allKeywords);
            }}
            style={{
              padding: `${tokens.spacing[3]} ${tokens.spacing[5]}`,
              backgroundColor: tokens.colors.surface,
              color: tokens.colors.text,
              border: `1px solid ${tokens.colors.border}`,
              borderRadius: tokens.radius.lg,
              fontSize: tokens.typography.fontSize.sm,
              fontWeight: tokens.typography.fontWeight.semibold,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: tokens.spacing[2]
            }}
          >
            📋 Copy All
          </button>
          <button
            onClick={exportAsCSV}
            style={{
              padding: `${tokens.spacing[3]} ${tokens.spacing[5]}`,
              backgroundColor: tokens.colors.surface,
              color: tokens.colors.text,
              border: `1px solid ${tokens.colors.border}`,
              borderRadius: tokens.radius.lg,
              fontSize: tokens.typography.fontSize.sm,
              fontWeight: tokens.typography.fontWeight.semibold,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: tokens.spacing[2]
            }}
          >
            📄 Export CSV
          </button>
          <button
            style={{
              padding: `${tokens.spacing[3]} ${tokens.spacing[6]}`,
              background: `linear-gradient(135deg, ${tokens.colors.primary}, ${tokens.colors.success})`,
              color: 'white',
              border: 'none',
              borderRadius: tokens.radius.lg,
              fontSize: tokens.typography.fontSize.base,
              fontWeight: tokens.typography.fontWeight.semibold,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: tokens.spacing[2],
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
            }}
          >
            💾 Save to Account
          </button>
        </div>
      </div>
      
      {/* CSS Animations */}
      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}
