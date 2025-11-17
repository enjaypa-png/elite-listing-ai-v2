'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Container } from '@/components/ui';
import { KeywordSimpleList } from '@/components/keywords/KeywordSimpleList';
import { EtsyTagsBuilder } from '@/components/keywords/EtsyTagsBuilder';
import { KeywordDetailsModal } from '@/components/keywords/KeywordDetailsModal';
import tokens from '@/design-system/tokens.json';

export default function KeywordsPage() {
  const router = useRouter();
  const params = useParams();
  const [isGenerating, setIsGenerating] = useState(true);
  const [keywords, setKeywords] = useState<any[]>([]);
  const [expandedKeywords, setExpandedKeywords] = useState<string[]>([]);
  const [isExpanding, setIsExpanding] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [detailKeyword, setDetailKeyword] = useState<any>(null);
  const [showToast, setShowToast] = useState(false);
  const isPremium = true; // TODO: Get from user session

  useEffect(() => {
    generateKeywords();
  }, [params.id]);

  const generateKeywords = async () => {
    setIsGenerating(true);
    
    try {
      // Get stored photo data
      const { OptimizationStorage } = await import('@/lib/optimizationState');
      const state = OptimizationStorage.get(params.id as string);
      
      if (!state) {
        console.error('No optimization state found');
        router.push('/upload');
        return;
      }

      // Call keyword generation API
      const response = await fetch('/api/keywords/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: state.title.current || 'Product photo',
          description: state.description.current || 'Based on uploaded photo',
          platform: 'etsy'
        })
      });

      if (!response.ok) {
        throw new Error('Keyword generation failed');
      }

      const data = await response.json();
      
      // Combine and sort all keywords by score
      const allKeywords = [
        ...(data.primaryKeywords || []),
        ...(data.secondaryKeywords || [])
      ].sort((a, b) => b.keywordScore - a.keywordScore);
      
      setKeywords(allKeywords);
      
      // Store in state
      OptimizationStorage.update(params.id as string, {
        keywords: {
          generated: allKeywords,
          selected: []
        }
      });
    } catch (error) {
      console.error('Keyword generation error:', error);
      alert('Failed to generate keywords. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Auto-select top 3 keywords for convenience
  useEffect(() => {
    if (keywords.length > 0 && selectedTags.length === 0) {
      const topThree = keywords.slice(0, 3).map(k => k.keyword);
      setSelectedTags(topThree);
    }
  }, [keywords]);

  const handleToggleKeyword = (keyword: string) => {
    setSelectedTags((prev) =>
      prev.includes(keyword)
        ? prev.filter((k) => k !== keyword)
        : [...prev, keyword]
    );
  };

  const handleCopyAll = () => {
    if (selectedTags.length === 0) {
      alert('No tags selected. Please select keywords first.');
      return;
    }
    navigator.clipboard.writeText(selectedTags.join(', '));
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  };

  const handleClearAll = () => {
    if (selectedTags.length > 0 && window.confirm(`Remove all ${selectedTags.length} selected tags?`)) {
      setSelectedTags([]);
    }
  };

  const handleExpandMore = async () => {
    setIsExpanding(true);
    
    try {
      // Extract product name from first keyword or state
      const { OptimizationStorage } = await import('@/lib/optimizationState');
      const state = OptimizationStorage.get(params.id as string);
      const productName = keywords[0]?.keyword?.split(' ').slice(-2).join(' ') || 'product';

      // Call expand API
      const response = await fetch('/api/keywords/expand', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product: productName,
          count: 20
        })
      });

      if (response.ok) {
        const data = await response.json();
        setExpandedKeywords(data.expansions || []);
      }
    } catch (error) {
      console.error('Expand error:', error);
    } finally {
      setIsExpanding(false);
    }
  };

  const handleContinue = () => {
    if (selectedTags.length === 0) {
      alert('Please select at least one keyword to continue');
      return;
    }
    
    // Save selected tags to state
    const { OptimizationStorage } = require('@/lib/optimizationState');
    OptimizationStorage.update(params.id as string, {
      keywords: {
        generated: keywords,
        selected: selectedTags
      }
    });
    
    // Continue to title/description
    router.push(`/title-description/${params.id}`);
  };

  if (isGenerating) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '64px',
            height: '64px',
            border: '4px solid #374151',
            borderTopColor: '#3B82F6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 24px'
          }} />
          <p style={{ fontSize: '18px', color: '#9CA3AF' }}>Generating perfect keywords for your product...</p>
        </div>
        <style jsx>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // Limit to 7 for free users
  const displayedKeywords = isPremium ? keywords : keywords.slice(0, 7);
  const lockedCount = isPremium ? 0 : Math.max(0, keywords.length - 7);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
      paddingTop: '40px',
      paddingBottom: '120px'
    }}>
      {/* Toast Notification */}
      {showToast && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          background: 'linear-gradient(135deg, #10B981, #059669)',
          color: 'white',
          padding: '16px 24px',
          borderRadius: '8px',
          boxShadow: '0 8px 24px rgba(16, 185, 129, 0.4)',
          zIndex: 9999,
          fontSize: '16px',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <span style={{ fontSize: '24px' }}>✓</span>
          Tags copied to clipboard!
        </div>
      )}

      <Container>
        <div style={{
          display: 'flex',
          gap: '32px',
          maxWidth: '1400px',
          margin: '0 auto'
        }}
        className="keywords-layout"
        >
          {/* Main Content - Keyword List */}
          <div style={{ flex: 1 }}>
            {/* Header */}
            <div style={{ marginBottom: '32px' }}>
              <h1 style={{
                fontSize: '36px',
                fontWeight: 'bold',
                color: '#F9FAFB',
                marginBottom: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                Step 4: Recommended Search Phrases
                <span
                  title="These are phrases shoppers often type when looking for products like yours"
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
                marginBottom: '16px'
              }}>
                Select the keywords that best describe your product. We've ranked them by quality.
              </p>

              {/* Quick Actions */}
              <div style={{
                display: 'flex',
                gap: '12px',
                flexWrap: 'wrap'
              }}>
                <button
                  onClick={() => {
                    const topSeven = keywords.slice(0, 7).map(k => k.keyword);
                    setSelectedTags(topSeven);
                  }}
                  title="Select the top 7 highest-scoring keywords"
                  style={{
                    padding: '10px 20px',
                    background: 'rgba(59, 130, 246, 0.1)',
                    color: '#60A5FA',
                    border: '1px solid #3B82F6',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    minHeight: '44px'
                  }}
                >
                  ⚡ Use Top 7
                </button>

                <button
                  onClick={() => {
                    const allKeywords = keywords.map(k => k.keyword);
                    setSelectedTags(allKeywords);
                  }}
                  title="Select all keywords at once"
                  style={{
                    padding: '10px 20px',
                    background: 'rgba(16, 185, 129, 0.1)',
                    color: '#34D399',
                    border: '1px solid #10B981',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    minHeight: '44px'
                  }}
                >
                  ✓ Select All
                </button>

                <button
                  onClick={handleCopyAll}
                  title="Copy all selected keywords to clipboard"
                  style={{
                    padding: '10px 20px',
                    background: 'rgba(139, 92, 246, 0.1)',
                    color: '#A78BFA',
                    border: '1px solid #8B5CF6',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    minHeight: '44px'
                  }}
                >
                  📋 Copy Selected
                </button>

                <button
                  onClick={handleExpandMore}
                  disabled={isExpanding}
                  title="Generate more keyword variations using Manus patterns"
                  style={{
                    padding: '10px 20px',
                    background: 'rgba(245, 158, 11, 0.1)',
                    color: '#FBBF24',
                    border: '1px solid #F59E0B',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: isExpanding ? 'not-allowed' : 'pointer',
                    minHeight: '44px',
                    opacity: isExpanding ? 0.6 : 1
                  }}
                >
                  {isExpanding ? '⏳ Expanding...' : '🔄 Expand More'}
                </button>
              </div>
            </div>

            {/* Keyword List */}
            <KeywordSimpleList
              keywords={displayedKeywords}
              selectedKeywords={selectedTags}
              onToggleKeyword={handleToggleKeyword}
              onShowDetails={setDetailKeyword}
            />

            {/* Locked Keywords for Free Users */}
            {!isPremium && lockedCount > 0 && (
              <div style={{
                marginTop: '24px',
                padding: '32px',
                background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(16, 185, 129, 0.1))',
                border: '2px dashed #3B82F6',
                borderRadius: '12px',
                textAlign: 'center'
              }}>
                <p style={{
                  fontSize: '20px',
                  fontWeight: 'bold',
                  color: '#60A5FA',
                  marginBottom: '12px'
                }}>
                  🔒 Unlock {lockedCount} More Keywords
                </p>
                <p style={{
                  fontSize: '16px',
                  color: '#9CA3AF',
                  marginBottom: '20px'
                }}>
                  Upgrade to premium to see the complete list and use the Etsy Tags Builder
                </p>
                <button style={{
                  padding: '12px 32px',
                  background: 'linear-gradient(135deg, #3B82F6, #10B981)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  minHeight: '48px'
                }}>
                  ⚡ Upgrade to Premium
                </button>
              </div>
            )}

            {/* Continue Button */}
            <div style={{
              marginTop: '40px',
              display: 'flex',
              justifyContent: 'center'
            }}>
              <button
                onClick={handleContinue}
                disabled={selectedTags.length === 0}
                style={{
                  padding: '16px 48px',
                  background: selectedTags.length === 0 
                    ? '#374151' 
                    : 'linear-gradient(135deg, #3B82F6, #10B981)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '18px',
                  fontWeight: 'bold',
                  cursor: selectedTags.length === 0 ? 'not-allowed' : 'pointer',
                  minHeight: '56px',
                  opacity: selectedTags.length === 0 ? 0.5 : 1,
                  boxShadow: selectedTags.length > 0 ? '0 4px 12px rgba(59, 130, 246, 0.3)' : 'none'
                }}
                title={selectedTags.length === 0 ? "Select at least one keyword to continue" : "Continue to title and description"}
              >
                Continue to Title & Description →
              </button>
            </div>
          </div>

          {/* Sidebar - Etsy Tags Builder */}
          <div style={{ width: '384px' }} className="tags-builder-sidebar">
            <EtsyTagsBuilder
              selectedTags={selectedTags}
              onRemoveTag={handleToggleKeyword}
              onCopyAll={handleCopyAll}
              onClearAll={handleClearAll}
              isPremium={isPremium}
            />
          </div>
        </div>
      </Container>

      {/* Details Modal */}
      <KeywordDetailsModal
        keyword={detailKeyword}
        onClose={() => setDetailKeyword(null)}
      />

      {/* Mobile Responsive */}
      <style jsx>{`
        @media (max-width: 1024px) {
          .keywords-layout {
            flex-direction: column !important;
          }
          
          .tags-builder-sidebar {
            width: 100% !important;
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            max-height: 50vh;
            overflow-y: auto;
            z-index: 1000;
            background: #1F2937;
            border-top: 2px solid #3B82F6;
            border-radius: 12px 12px 0 0;
            padding: 20px;
          }
        }
      `}</style>
    </div>
  );
}
