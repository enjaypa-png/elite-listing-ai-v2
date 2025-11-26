'use client';

import tokens from '@/design-system/tokens.json';

interface Benchmark {
  keyword: string;
  searchVolume: number;
  listingCount: number;
  competitionTier: 'Low' | 'Medium' | 'High' | 'Extreme';
  difficultyTier: 'Easy' | 'Moderate' | 'Hard' | 'Very Hard';
  categoryRelevance: number;
  demandSupplyRatio: number;
}

interface CategoryBenchmarksProps {
  data: Benchmark[];
}

export default function CategoryBenchmarks({ data }: CategoryBenchmarksProps) {
  const getTierColor = (tier: string) => {
    if (tier === 'Low' || tier === 'Easy') return tokens.colors.success;
    if (tier === 'Medium' || tier === 'Moderate') return tokens.colors.warning;
    return tokens.colors.danger;
  };

  const getTierBg = (tier: string) => {
    if (tier === 'Low' || tier === 'Easy') return `${tokens.colors.success}1A`;
    if (tier === 'Medium' || tier === 'Moderate') return `${tokens.colors.warning}1A`;
    return `${tokens.colors.danger}1A`;
  };

  return (
    <div style={{
      background: tokens.colors.background,
      border: `1px solid ${tokens.colors.border}`,
      borderRadius: tokens.radius.md,
      padding: tokens.spacing[6]
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2], marginBottom: tokens.spacing[4] }}>
        <h4 style={{
          fontSize: tokens.typography.fontSize.lg,
          fontWeight: tokens.typography.fontWeight.semibold,
          color: tokens.colors.text
        }}>
          📊 Category-Specific Keyword Benchmarks
        </h4>
        <span style={{
          fontSize: tokens.typography.fontSize.xs,
          color: tokens.colors.textMuted,
          padding: `${tokens.spacing[1]} ${tokens.spacing[2]}`,
          background: `${tokens.colors.primary}1A`,
          borderRadius: tokens.radius.sm
        }}>
          Using Real Etsy Data
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[3] }}>
        {data.map((benchmark, index) => (
          <div
            key={index}
            style={{
              background: tokens.colors.surface,
              border: `1px solid ${tokens.colors.border}`,
              borderRadius: tokens.radius.md,
              padding: tokens.spacing[4]
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: tokens.spacing[3] }}>
              <div style={{ fontWeight: tokens.typography.fontWeight.medium, color: tokens.colors.text }}>
                "{benchmark.keyword}"
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                <span style={{
                  padding: `${tokens.spacing[1]} ${tokens.spacing[3]}`,
                  borderRadius: tokens.radius.sm,
                  fontSize: tokens.typography.fontSize.xs,
                  fontWeight: tokens.typography.fontWeight.semibold,
                  border: `1px solid ${getTierColor(benchmark.competitionTier)}33`,
                  background: getTierBg(benchmark.competitionTier),
                  color: getTierColor(benchmark.competitionTier)
                }}>
                  {benchmark.competitionTier} Competition
                </span>
                <span style={{
                  padding: `${tokens.spacing[1]} ${tokens.spacing[3]}`,
                  borderRadius: tokens.radius.sm,
                  fontSize: tokens.typography.fontSize.xs,
                  fontWeight: tokens.typography.fontWeight.semibold,
                  border: `1px solid ${getTierColor(benchmark.difficultyTier)}33`,
                  background: getTierBg(benchmark.difficultyTier),
                  color: getTierColor(benchmark.difficultyTier)
                }}>
                  {benchmark.difficultyTier}
                </span>
              </div>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(5, 1fr)',
              gap: tokens.spacing[4],
              fontSize: tokens.typography.fontSize.sm
            }}>
              <div>
                <div style={{ color: tokens.colors.textMuted, fontSize: tokens.typography.fontSize.xs, marginBottom: tokens.spacing[1] }}>Search Volume</div>
                <div style={{ fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.text }}>
                  {benchmark.searchVolume.toLocaleString()}
                </div>
                <div style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.textMuted }}>Real Etsy data</div>
              </div>
              <div>
                <div style={{ color: tokens.colors.textMuted, fontSize: tokens.typography.fontSize.xs, marginBottom: tokens.spacing[1] }}>Listings</div>
                <div style={{ fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.text }}>
                  {benchmark.listingCount.toLocaleString()}
                </div>
              </div>
              <div>
                <div style={{ color: tokens.colors.textMuted, fontSize: tokens.typography.fontSize.xs, marginBottom: tokens.spacing[1] }}>D/S Ratio</div>
                <div style={{ fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.text }}>
                  {benchmark.demandSupplyRatio.toFixed(5)}
                </div>
              </div>
              <div>
                <div style={{ color: tokens.colors.textMuted, fontSize: tokens.typography.fontSize.xs, marginBottom: tokens.spacing[1] }}>Category Fit</div>
                <div style={{ fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.text }}>
                  {benchmark.categoryRelevance}%
                </div>
              </div>
              <div>
                <div style={{ color: tokens.colors.textMuted, fontSize: tokens.typography.fontSize.xs, marginBottom: tokens.spacing[1] }}>Competition</div>
                <div style={{ fontWeight: tokens.typography.fontWeight.semibold, color: getTierColor(benchmark.competitionTier) }}>
                  {benchmark.competitionTier}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{
        marginTop: tokens.spacing[4],
        padding: tokens.spacing[3],
        background: `${tokens.colors.primary}1A`,
        border: `1px solid ${tokens.colors.primary}33`,
        borderRadius: tokens.radius.md
      }}>
        <div style={{ display: 'flex', alignItems: 'start', gap: tokens.spacing[2], fontSize: tokens.typography.fontSize.sm }}>
          <span style={{ color: tokens.colors.primary }}>💡</span>
          <p style={{ color: tokens.colors.textMuted }}>
            These benchmarks use <strong>real search volume from Etsy Marketplace Insights</strong>, 
            not estimates. Target keywords with "Low" or "Medium" competition for best results.
          </p>
        </div>
      </div>
    </div>
  );
}
