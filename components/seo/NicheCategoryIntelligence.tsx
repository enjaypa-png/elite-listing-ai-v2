'use client';

import { useState } from 'react';
import { Card } from '@/components/ui';
import CategoryBenchmarks from './CategoryBenchmarks';
import NicheHunter from './NicheHunter';
import CategoryElasticityScore from './CategoryElasticityScore';
import TopPerformerAnalysis from './TopPerformerAnalysis';
import OpportunityBlueprint from './OpportunityBlueprint';
import tokens from '@/design-system/tokens.json';

interface NicheIntelligenceProps {
  keywords: {
    keyword: string;
    searches: number;
    results: number;
    score: number;
  }[];
  category: string;
  productType: string;
}

export function NicheCategoryIntelligence({
  keywords,
  category,
  productType,
}: NicheIntelligenceProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [intelligence, setIntelligence] = useState<any>(null);

  const analyzeNiches = async () => {
    if (intelligence) {
      setIsExpanded(!isExpanded);
      return;
    }

    setLoading(true);
    setIsExpanded(true);

    try {
      const response = await fetch('/api/niche-intelligence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          keywords,
          category,
          productType,
        }),
      });

      const data = await response.json();
      setIntelligence(data);
    } catch (error) {
      console.error('Failed to analyze niches:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <button
        onClick={analyzeNiches}
        style={{
          width: '100%',
          padding: tokens.spacing[6],
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          transition: `background ${tokens.motion.duration.fast}`
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = `${tokens.colors.background}80`;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'transparent';
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[4] }}>
          <div style={{
            width: tokens.spacing[12],
            height: tokens.spacing[12],
            background: `${tokens.colors.primary}1A`,
            borderRadius: tokens.radius.md,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <span style={{ fontSize: tokens.typography.fontSize['2xl'] }}>📈</span>
          </div>
          <div style={{ textAlign: 'left' }}>
            <h3 style={{
              fontSize: tokens.typography.fontSize.xl,
              fontWeight: tokens.typography.fontWeight.semibold,
              color: tokens.colors.text
            }}>
              Niche & Category Intelligence
            </h3>
            <p style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.textMuted }}>
              Powered by Etsy Marketplace Insights — real search volume, real opportunities
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[3] }}>
          {!intelligence && (
            <span style={{
              padding: `${tokens.spacing[2]} ${tokens.spacing[4]}`,
              background: tokens.colors.primary,
              color: tokens.colors.primaryForeground,
              borderRadius: tokens.radius.md,
              fontSize: tokens.typography.fontSize.sm,
              fontWeight: tokens.typography.fontWeight.semibold
            }}>
              Analyze Niches
            </span>
          )}
          <svg
            style={{
              width: '24px',
              height: '24px',
              color: tokens.colors.textMuted,
              transition: `transform ${tokens.motion.duration.normal}`,
              transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)'
            }}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </button>

      {isExpanded && (
        <div style={{ borderTop: `1px solid ${tokens.colors.border}` }}>
          {loading ? (
            <div style={{ padding: tokens.spacing[12], textAlign: 'center' }}>
              <div style={{
                display: 'inline-block',
                width: tokens.spacing[12],
                height: tokens.spacing[12],
                border: `4px solid ${tokens.colors.surface2}`,
                borderTopColor: tokens.colors.primary,
                borderRadius: tokens.radius.full,
                animation: 'spin 1s linear infinite',
                marginBottom: tokens.spacing[4]
              }} />
              <p style={{ color: tokens.colors.textMuted }}>Analyzing niche opportunities...</p>
              <style jsx>{`
                @keyframes spin {
                  from { transform: rotate(0deg); }
                  to { transform: rotate(360deg); }
                }
              `}</style>
            </div>
          ) : intelligence ? (
            <div style={{ padding: tokens.spacing[6], display: 'flex', flexDirection: 'column', gap: tokens.spacing[6] }}>
              <CategoryBenchmarks data={intelligence.benchmarks} />
              <NicheHunter niches={intelligence.niches} productType={productType} />
              <CategoryElasticityScore elasticity={intelligence.elasticity} />
              <TopPerformerAnalysis performers={intelligence.topPerformers} />
              <OpportunityBlueprint blueprint={intelligence.blueprint} />
            </div>
          ) : null}
        </div>
      )}
    </Card>
  );
}
