'use client';

import React, { useState, useMemo } from 'react';
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

interface KeywordResultsRedesignProps {
  data: {
    primaryKeywords: Keyword[];
    secondaryKeywords: Keyword[];
    totalKeywords: number;
    averageRelevance: number;
    topIntent: string;
    suggestions: string[];
  };
  isPremium?: boolean; // For free vs premium logic
}

export function KeywordResultsRedesign({ data, isPremium = true }: KeywordResultsRedesignProps) {
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);
  const [expandedKeyword, setExpandedKeyword] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);

  // Combine all keywords into single sorted list
  const allKeywords = useMemo(() => {
    const combined = [...data.primaryKeywords, ...data.secondaryKeywords];
    // Sort by keyword score (highest first)
    return combined.sort((a, b) => b.keywordScore - a.keywordScore);
  }, [data.primaryKeywords, data.secondaryKeywords]);

  // Limit keywords for free users
  const displayedKeywords = isPremium ? allKeywords : allKeywords.slice(0, 7);
  const lockedKeywordsCount = isPremium ? 0 : Math.max(0, allKeywords.length - 7);

  // Get color for keyword score
  const getScoreColor = (score: number) => {
    if (score >= 80) return { bg: '#10B98120', border: '#10B981', text: '#10B981', label: 'Excellent' };
    if (score >= 60) return { bg: '#F59E0B20', border: '#F59E0B', text: '#F59E0B', label: 'Good' };
    return { bg: '#EF444420', border: '#EF4444', text: '#EF4444', label: 'Fair' };
  };

  // Calculate character count (Etsy allows 13 tags, 20 chars each = 260 max, plus commas)
  const characterCount = useMemo(() => {
    return selectedKeywords.join(', ').length;
  }, [selectedKeywords]);

  const MAX_CHARACTERS = 260; // Conservative estimate
  const isOverLimit = characterCount > MAX_CHARACTERS;

  // Toggle keyword selection
  const toggleKeyword = (keyword: string) => {
    if (selectedKeywords.includes(keyword)) {
      setSelectedKeywords(selectedKeywords.filter(k => k !== keyword));
    } else {
      setSelectedKeywords([...selectedKeywords, keyword]);
    }
  };

  // Copy all tags to clipboard
  const copyAllTags = () => {
    if (selectedKeywords.length === 0) {
      alert('No tags selected. Please select keywords first.');
      return;
    }
    const tagsText = selectedKeywords.join(', ');
    navigator.clipboard.writeText(tagsText);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  };

  // Clear all selections
  const clearAllTags = () => {
    if (selectedKeywords.length > 0 && window.confirm(`Remove all ${selectedKeywords.length} selected tags?`)) {
      setSelectedKeywords([]);
    }
  };

  // Toggle deep dive view
  const toggleDeepDive = (keyword: string) => {
    if (!isPremium) {
      alert('Unlock advanced metrics with a premium account');
      return;
    }
    setExpandedKeyword(expandedKeyword === keyword ? null : keyword);
  };

  return (
    <div style={{ 
      display: 'flex', 
      gap: tokens.spacing[6],
      maxWidth: '1400px',
      margin: '0 auto',
      padding: tokens.spacing[6]
    }}>
      {/* Toast Notification */}
      {showToast && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          background: 'linear-gradient(135deg, #10B981, #059669)',
          color: 'white',
          padding: `${tokens.spacing[4]} ${tokens.spacing[6]}`,
          borderRadius: tokens.radius.lg,
          boxShadow: '0 8px 24px rgba(16, 185, 129, 0.4)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          gap: tokens.spacing[3],
          fontSize: '16px',
          fontWeight: tokens.typography.fontWeight.semibold,
          animation: 'slideIn 0.3s ease-out'
        }}>
          <span style={{ fontSize: '24px' }}>✓</span>
          <span>Tags copied to clipboard!</span>
        </div>
      )}

      {/* Main Content - Keyword List */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Header */}
        <div style={{ marginBottom: tokens.spacing[6] }}>
          <h2 style={{
            fontSize: tokens.typography.fontSize['2xl'],
            fontWeight: tokens.typography.fontWeight.bold,
            color: tokens.colors.text,
            marginBottom: tokens.spacing[2]
          }}>
            🎯 AI-Recommended Keywords
          </h2>
          <p style={{
            fontSize: tokens.typography.fontSize.base,
            color: tokens.colors.textMuted,
            lineHeight: 1.6
          }}>
            Select the best keywords for your Etsy listing. Keywords are ranked by our AI's quality score.
          </p>
        </div>

        {/* Keyword List */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: tokens.spacing[3]
        }}>
          {displayedKeywords.map((keyword, index) => {
            const scoreColor = getScoreColor(keyword.keywordScore);
            const isSelected = selectedKeywords.includes(keyword.keyword);
            const isExpanded = expandedKeyword === keyword.keyword;

            return (
              <div
                key={index}
                style={{
                  background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)',
                  border: `2px solid ${isSelected ? '#3B82F6' : '#334155'}`,
                  borderRadius: tokens.radius.lg,
                  padding: tokens.spacing[4],
                  transition: 'all 0.2s ease',
                  boxShadow: isSelected 
                    ? '0 8px 16px rgba(59, 130, 246, 0.3)' 
                    : '0 4px 8px rgba(0, 0, 0, 0.3)'
                }}
              >
                {/* Main Row */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: tokens.spacing[4]
                }}>
                  {/* Checkbox */}
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleKeyword(keyword.keyword)}
                    disabled={!isPremium && selectedKeywords.length >= 13 && !isSelected}
                    style={{
                      width: '24px',
                      height: '24px',
                      cursor: 'pointer',
                      accentColor: '#3B82F6'
                    }}
                  />

                  {/* Keyword Text */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{
                      fontSize: tokens.typography.fontSize.lg,
                      fontWeight: tokens.typography.fontWeight.semibold,
                      color: '#F1F5F9',
                      marginBottom: tokens.spacing[1]
                    }}>
                      {keyword.keyword}
                    </p>
                  </div>

                  {/* Keyword Score */}
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: tokens.spacing[1],
                    padding: tokens.spacing[3],
                    background: scoreColor.bg,
                    border: `2px solid ${scoreColor.border}`,
                    borderRadius: tokens.radius.md,
                    minWidth: '80px'
                  }}>
                    <span style={{
                      fontSize: tokens.typography.fontSize['2xl'],
                      fontWeight: tokens.typography.fontWeight.bold,
                      color: scoreColor.text
                    }}>
                      {keyword.keywordScore}
                    </span>
                    <span style={{
                      fontSize: tokens.typography.fontSize.xs,
                      color: scoreColor.text,
                      fontWeight: tokens.typography.fontWeight.semibold
                    }}>
                      {scoreColor.label}
                    </span>
                  </div>

                  {/* Deep Dive Button */}
                  <button
                    onClick={() => toggleDeepDive(keyword.keyword)}
                    title={isPremium ? "View detailed metrics" : "Unlock with premium"}
                    style={{
                      padding: `${tokens.spacing[2]} ${tokens.spacing[4]}`,
                      background: 'rgba(59, 130, 246, 0.1)',
                      color: '#60A5FA',
                      border: '1px solid #3B82F6',
                      borderRadius: tokens.radius.md,
                      fontSize: '14px',
                      fontWeight: tokens.typography.fontWeight.semibold,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: tokens.spacing[2],
                      minHeight: '44px',
                      whiteSpace: 'nowrap',
                      opacity: isPremium ? 1 : 0.6
                    }}
                  >
                    {!isPremium && '🔒 '}
                    {isExpanded ? '▼' : '▶'} Details
                  </button>
                </div>

                {/* Deep Dive Expanded View */}
                {isExpanded && isPremium && (
                  <div style={{
                    marginTop: tokens.spacing[4],
                    paddingTop: tokens.spacing[4],
                    borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: tokens.spacing[4]
                  }}>
                    {/* Search Volume */}
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2], marginBottom: tokens.spacing[1] }}>
                        <p style={{ fontSize: '14px', color: '#94A3B8', fontWeight: 600 }}>Search Volume</p>
                        <span title="An estimate of how many people search for this keyword on Etsy each month" style={{ cursor: 'help', color: '#60A5FA' }}>ℹ️</span>
                      </div>
                      <p style={{ fontSize: '18px', fontWeight: 'bold', color: '#E2E8F0' }}>
                        📊 {keyword.searchVolume}/month
                      </p>
                    </div>

                    {/* Competition */}
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2], marginBottom: tokens.spacing[1] }}>
                        <p style={{ fontSize: '14px', color: '#94A3B8', fontWeight: 600 }}>Competition</p>
                        <span title="How many other sellers are using this keyword. Lower is better" style={{ cursor: 'help', color: '#60A5FA' }}>ℹ️</span>
                      </div>
                      <p style={{ fontSize: '18px', fontWeight: 'bold', color: '#E2E8F0', textTransform: 'uppercase' }}>
                        {keyword.competition === 'low' && '🟢'} 
                        {keyword.competition === 'medium' && '🟡'} 
                        {keyword.competition === 'high' && '🔴'} 
                        {keyword.competition}
                      </p>
                    </div>

                    {/* CTR Potential */}
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2], marginBottom: tokens.spacing[1] }}>
                        <p style={{ fontSize: '14px', color: '#94A3B8', fontWeight: 600 }}>CTR Potential</p>
                        <span title="How likely someone is to click on your listing if it shows up for this keyword" style={{ cursor: 'help', color: '#60A5FA' }}>ℹ️</span>
                      </div>
                      <p style={{ fontSize: '18px', fontWeight: 'bold', color: '#E2E8F0' }}>
                        👆 {keyword.ctrPotential}%
                      </p>
                    </div>

                    {/* Conversion Potential */}
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2], marginBottom: tokens.spacing[1] }}>
                        <p style={{ fontSize: '14px', color: '#94A3B8', fontWeight: 600 }}>Conversion</p>
                        <span title="How likely someone is to buy after clicking on your listing for this keyword" style={{ cursor: 'help', color: '#60A5FA' }}>ℹ️</span>
                      </div>
                      <p style={{ fontSize: '18px', fontWeight: 'bold', color: '#E2E8F0' }}>
                        💵 {keyword.conversionPotential}%
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Locked Keywords Message for Free Users */}
        {!isPremium && lockedKeywordsCount > 0 && (
          <div style={{
            marginTop: tokens.spacing[4],
            padding: tokens.spacing[6],
            background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(16, 185, 129, 0.1))',
            border: '2px dashed #3B82F6',
            borderRadius: tokens.radius.lg,
            textAlign: 'center'
          }}>
            <p style={{
              fontSize: tokens.typography.fontSize.lg,
              fontWeight: tokens.typography.fontWeight.bold,
              color: '#60A5FA',
              marginBottom: tokens.spacing[2]
            }}>
              🔒 Unlock {lockedKeywordsCount} More Keywords
            </p>
            <p style={{
              fontSize: tokens.typography.fontSize.base,
              color: '#94A3B8',
              marginBottom: tokens.spacing[4]
            }}>
              Upgrade to premium to see the complete list and use the Etsy Tags Builder
            </p>
            <button style={{
              padding: `${tokens.spacing[3]} ${tokens.spacing[6]}`,
              background: 'linear-gradient(135deg, #3B82F6, #10B981)',
              color: 'white',
              border: 'none',
              borderRadius: tokens.radius.lg,
              fontSize: '16px',
              fontWeight: tokens.typography.fontWeight.bold,
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
              minHeight: '48px'
            }}>
              ⚡ Upgrade to Premium
            </button>
          </div>
        )}
      </div>

      {/* Etsy Tags Builder - Sidebar */}
      <div 
        className="etsy-tags-builder"
        style={{
          width: '360px',
          position: 'sticky',
          top: '20px',
          height: 'fit-content',
          background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)',
          border: '2px solid #3B82F6',
          borderRadius: tokens.radius.lg,
          padding: tokens.spacing[6],
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5)',
          opacity: isPremium ? 1 : 0.6,
          position: 'relative' as any
        }}
      >
        {/* Lock Overlay for Free Users */}
        {!isPremium && (
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.7)',
            borderRadius: tokens.radius.lg,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: tokens.spacing[4],
            padding: tokens.spacing[6],
            zIndex: 10
          }}>
            <span style={{ fontSize: '48px' }}>🔒</span>
            <p style={{
              fontSize: tokens.typography.fontSize.lg,
              fontWeight: tokens.typography.fontWeight.bold,
              color: 'white',
              textAlign: 'center'
            }}>
              Upgrade to Premium to Use the Etsy Tags Builder
            </p>
            <button style={{
              padding: `${tokens.spacing[3]} ${tokens.spacing[6]}`,
              background: 'linear-gradient(135deg, #3B82F6, #10B981)',
              color: 'white',
              border: 'none',
              borderRadius: tokens.radius.lg,
              fontSize: '16px',
              fontWeight: tokens.typography.fontWeight.bold,
              cursor: 'pointer',
              minHeight: '48px'
            }}>
              ⚡ Upgrade Now
            </button>
          </div>
        )}

        {/* Header */}
        <div style={{ marginBottom: tokens.spacing[4] }}>
          <h3 style={{
            fontSize: tokens.typography.fontSize.xl,
            fontWeight: tokens.typography.fontWeight.bold,
            color: '#F1F5F9',
            marginBottom: tokens.spacing[2],
            display: 'flex',
            alignItems: 'center',
            gap: tokens.spacing[2]
          }}>
            🏷️ Your Etsy Tags List
          </h3>
          <p style={{
            fontSize: '14px',
            color: '#94A3B8'
          }}>
            {selectedKeywords.length} tag{selectedKeywords.length !== 1 ? 's' : ''} selected
          </p>
        </div>

        {/* Character Counter */}
        <div style={{
          marginBottom: tokens.spacing[4],
          padding: tokens.spacing[3],
          background: isOverLimit ? 'rgba(239, 68, 68, 0.1)' : 'rgba(59, 130, 246, 0.1)',
          border: `2px solid ${isOverLimit ? '#EF4444' : '#3B82F6'}`,
          borderRadius: tokens.radius.md
        }}>
          <p style={{
            fontSize: '14px',
            color: '#94A3B8',
            marginBottom: tokens.spacing[1]
          }}>
            Character Count:
          </p>
          <p style={{
            fontSize: tokens.typography.fontSize['2xl'],
            fontWeight: tokens.typography.fontWeight.bold,
            color: isOverLimit ? '#EF4444' : '#60A5FA'
          }}>
            {characterCount} / {MAX_CHARACTERS}
          </p>
          {isOverLimit && (
            <p style={{
              fontSize: '12px',
              color: '#EF4444',
              marginTop: tokens.spacing[1]
            }}>
              ⚠️ Too many characters! Remove some tags.
            </p>
          )}
        </div>

        {/* Selected Tags Display */}
        <div style={{
          marginBottom: tokens.spacing[4],
          minHeight: '120px',
          maxHeight: '300px',
          overflowY: 'auto',
          padding: tokens.spacing[3],
          background: 'rgba(0, 0, 0, 0.3)',
          borderRadius: tokens.radius.md,
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          {selectedKeywords.length === 0 ? (
            <p style={{
              fontSize: '14px',
              color: '#64748B',
              textAlign: 'center',
              padding: tokens.spacing[4]
            }}>
              Select keywords from the list to build your tags
            </p>
          ) : (
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: tokens.spacing[2]
            }}>
              {selectedKeywords.map((tag, index) => (
                <div
                  key={index}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: tokens.spacing[2],
                    padding: `${tokens.spacing[1]} ${tokens.spacing[3]}`,
                    background: 'rgba(59, 130, 246, 0.2)',
                    border: '1px solid #3B82F6',
                    borderRadius: tokens.radius.md,
                    color: '#60A5FA',
                    fontSize: '14px'
                  }}
                >
                  <span>{tag}</span>
                  <button
                    onClick={() => toggleKeyword(tag)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#EF4444',
                      cursor: 'pointer',
                      padding: '2px',
                      fontSize: '16px',
                      lineHeight: 1
                    }}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: tokens.spacing[3]
        }}>
          <button
            onClick={copyAllTags}
            disabled={selectedKeywords.length === 0 || isOverLimit}
            style={{
              padding: `${tokens.spacing[3]} ${tokens.spacing[4]}`,
              background: selectedKeywords.length === 0 || isOverLimit
                ? 'rgba(100, 116, 139, 0.3)'
                : 'linear-gradient(135deg, #10B981, #059669)',
              color: 'white',
              border: 'none',
              borderRadius: tokens.radius.lg,
              fontSize: '16px',
              fontWeight: tokens.typography.fontWeight.bold,
              cursor: selectedKeywords.length === 0 || isOverLimit ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: tokens.spacing[2],
              minHeight: '48px',
              boxShadow: selectedKeywords.length > 0 ? '0 4px 12px rgba(16, 185, 129, 0.3)' : 'none',
              opacity: selectedKeywords.length === 0 || isOverLimit ? 0.5 : 1
            }}
          >
            📋 Copy All Tags ({selectedKeywords.length})
          </button>

          <button
            onClick={clearAllTags}
            disabled={selectedKeywords.length === 0}
            style={{
              padding: `${tokens.spacing[2]} ${tokens.spacing[4]}`,
              background: 'rgba(239, 68, 68, 0.1)',
              color: '#EF4444',
              border: '1px solid #EF4444',
              borderRadius: tokens.radius.md,
              fontSize: '14px',
              fontWeight: tokens.typography.fontWeight.semibold,
              cursor: selectedKeywords.length === 0 ? 'not-allowed' : 'pointer',
              minHeight: '44px',
              opacity: selectedKeywords.length === 0 ? 0.5 : 1
            }}
          >
            🗑️ Clear All
          </button>
        </div>

        {/* Tip */}
        <div style={{
          marginTop: tokens.spacing[4],
          padding: tokens.spacing[3],
          background: 'rgba(59, 130, 246, 0.1)',
          borderRadius: tokens.radius.md,
          fontSize: '12px',
          color: '#94A3B8',
          lineHeight: 1.5
        }}>
          💡 <strong style={{ color: '#60A5FA' }}>Tip:</strong> Etsy allows up to 13 tags per listing. Choose keywords with high scores for best results.
        </div>
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        @media (max-width: 1024px) {
          .etsy-tags-builder {
            position: fixed !important;
            bottom: 0 !important;
            left: 0 !important;
            right: 0 !important;
            width: 100% !important;
            max-height: 60vh;
            overflow-y: auto;
            border-radius: ${tokens.radius.lg} ${tokens.radius.lg} 0 0 !important;
            z-index: 1000;
          }
        }
      `}</style>
    </div>
  );
}
