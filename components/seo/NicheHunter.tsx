'use client';

import tokens from '@/design-system/tokens.json';

interface Niche {
  name: string;
  angle: string;
  searchVolume: number;
  listingCount: number;
  demandSupplyRatio: number;
  opportunityScore: number;
  trend: 'Rising' | 'Stable' | 'Declining';
  profitPotential: 'Low' | 'Medium' | 'High';
  exampleKeywords: string[];
  recommendation: string;
}

interface NicheHunterProps {
  niches: Niche[];
  productType: string;
}

export default function NicheHunter({ niches, productType }: NicheHunterProps) {
  const getScoreColor = (score: number) => {
    if (score >= 7) return tokens.colors.success;
    if (score >= 4) return tokens.colors.warning;
    return tokens.colors.danger;
  };

  const getTrendIcon = (trend: string) => {
    if (trend === 'Rising') return '📈';
    if (trend === 'Stable') return '➡️';
    return '📉';
  };

  return (
    <div style={{
      background: tokens.colors.background,
      border: `1px solid ${tokens.colors.border}`,
      borderRadius: tokens.radius.md,
      padding: tokens.spacing[6]
    }}>
      <div style={{ marginBottom: tokens.spacing[6] }}>
        <h4 style={{
          fontSize: tokens.typography.fontSize.lg,
          fontWeight: tokens.typography.fontWeight.semibold,
          color: tokens.colors.text,
          marginBottom: tokens.spacing[2]
        }}>
          🎯 Niche Hunter: Underserved Opportunities
        </h4>
        <p style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.textMuted }}>
          We analyzed {niches.length} niche variations for "{productType}" using real Etsy search data.
          Here are the best opportunities ranked by our 285-point scoring system.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[4] }}>
        {niches.map((niche, index) => (
          <div
            key={index}
            style={{
              border: `1px solid ${getScoreColor(niche.opportunityScore)}33`,
              borderRadius: tokens.radius.md,
              padding: tokens.spacing[5],
              background: `${getScoreColor(niche.opportunityScore)}0D`
            }}
          >
            <div style={{ display: 'flex', alignItems: 'start', justifyContent: 'space-between', marginBottom: tokens.spacing[4] }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[3], marginBottom: tokens.spacing[2] }}>
                  <h5 style={{
                    fontSize: tokens.typography.fontSize.lg,
                    fontWeight: tokens.typography.fontWeight.semibold,
                    color: tokens.colors.text
                  }}>
                    {niche.name}
                  </h5>
                  <span style={{
                    padding: `${tokens.spacing[1]} ${tokens.spacing[2]}`,
                    background: tokens.colors.background,
                    border: `1px solid ${tokens.colors.border}`,
                    borderRadius: tokens.radius.sm,
                    fontSize: tokens.typography.fontSize.xs,
                    fontWeight: tokens.typography.fontWeight.medium,
                    color: tokens.colors.textMuted
                  }}>
                    {niche.angle}
                  </span>
                  <span style={{ fontSize: tokens.typography.fontSize.lg }}>{getTrendIcon(niche.trend)}</span>
                </div>
                <p style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.textMuted }}>
                  {niche.recommendation}
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{
                  fontSize: tokens.typography.fontSize['4xl'],
                  fontWeight: tokens.typography.fontWeight.bold,
                  marginBottom: tokens.spacing[1],
                  color: getScoreColor(niche.opportunityScore)
                }}>
                  {niche.opportunityScore}/10
                </div>
                <div style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.textMuted }}>Opportunity</div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: tokens.spacing[4], marginBottom: tokens.spacing[4] }}>
              <div style={{ background: tokens.colors.surface, borderRadius: tokens.radius.sm, padding: tokens.spacing[3] }}>
                <div style={{ color: tokens.colors.textMuted, fontSize: tokens.typography.fontSize.xs, marginBottom: tokens.spacing[1] }}>Search Volume</div>
                <div style={{ fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.text, fontSize: tokens.typography.fontSize.lg }}>
                  {niche.searchVolume.toLocaleString()}
                </div>
                <div style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.textMuted }}>Real Etsy data</div>
              </div>
              <div style={{ background: tokens.colors.surface, borderRadius: tokens.radius.sm, padding: tokens.spacing[3] }}>
                <div style={{ color: tokens.colors.textMuted, fontSize: tokens.typography.fontSize.xs, marginBottom: tokens.spacing[1] }}>Competition</div>
                <div style={{ fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.text, fontSize: tokens.typography.fontSize.lg }}>
                  {niche.listingCount.toLocaleString()}
                </div>
                <div style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.textMuted }}>listings</div>
              </div>
              <div style={{ background: tokens.colors.surface, borderRadius: tokens.radius.sm, padding: tokens.spacing[3] }}>
                <div style={{ color: tokens.colors.textMuted, fontSize: tokens.typography.fontSize.xs, marginBottom: tokens.spacing[1] }}>D/S Ratio</div>
                <div style={{ fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.text, fontSize: tokens.typography.fontSize.lg }}>
                  {niche.demandSupplyRatio.toFixed(5)}
                </div>
              </div>
              <div style={{ background: tokens.colors.surface, borderRadius: tokens.radius.sm, padding: tokens.spacing[3] }}>
                <div style={{ color: tokens.colors.textMuted, fontSize: tokens.typography.fontSize.xs, marginBottom: tokens.spacing[1] }}>Profit Potential</div>
                <div style={{
                  fontWeight: tokens.typography.fontWeight.semibold,
                  fontSize: tokens.typography.fontSize.lg,
                  color: niche.profitPotential === 'High' ? tokens.colors.success :
                         niche.profitPotential === 'Medium' ? tokens.colors.warning : tokens.colors.textMuted
                }}>
                  {niche.profitPotential}
                </div>
              </div>
            </div>

            <div style={{ marginBottom: tokens.spacing[4] }}>
              <div style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.textMuted, marginBottom: tokens.spacing[2] }}>Example Keywords:</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: tokens.spacing[2] }}>
                {niche.exampleKeywords.map((keyword, i) => (
                  <span
                    key={i}
                    style={{
                      padding: `${tokens.spacing[1]} ${tokens.spacing[3]}`,
                      background: tokens.colors.background,
                      border: `1px solid ${tokens.colors.border}`,
                      borderRadius: tokens.radius.sm,
                      fontSize: tokens.typography.fontSize.sm,
                      color: tokens.colors.text
                    }}
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: tokens.spacing[3] }}>
              <button style={{
                flex: 1,
                padding: `${tokens.spacing[2]} ${tokens.spacing[4]}`,
                background: tokens.colors.primary,
                color: tokens.colors.primaryForeground,
                borderRadius: tokens.radius.md,
                fontWeight: tokens.typography.fontWeight.semibold,
                border: 'none',
                cursor: 'pointer',
                fontSize: tokens.typography.fontSize.sm
              }}>
                Generate Listing for This Niche
              </button>
              <button style={{
                padding: `${tokens.spacing[2]} ${tokens.spacing[4]}`,
                border: `2px solid ${tokens.colors.primary}`,
                color: tokens.colors.primary,
                borderRadius: tokens.radius.md,
                fontWeight: tokens.typography.fontWeight.semibold,
                background: 'transparent',
                cursor: 'pointer',
                fontSize: tokens.typography.fontSize.sm
              }}>
                Check on Etsy
              </button>
            </div>
          </div>
        ))}
      </div>

      <div style={{
        marginTop: tokens.spacing[6],
        padding: tokens.spacing[4],
        background: `${tokens.colors.primary}1A`,
        border: `1px solid ${tokens.colors.primary}33`,
        borderRadius: tokens.radius.md
      }}>
        <div style={{ display: 'flex', alignItems: 'start', gap: tokens.spacing[3] }}>
          <span style={{ fontSize: tokens.typography.fontSize['2xl'] }}>💡</span>
          <div>
            <h5 style={{
              fontWeight: tokens.typography.fontWeight.semibold,
              color: tokens.colors.text,
              marginBottom: tokens.spacing[1]
            }}>
              What to Make Next
            </h5>
            <p style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.textMuted }}>
              Focus on niches with 7+ opportunity scores (green). These have the best 
              demand/supply ratio and are underserved by competitors. Avoid red niches 
              (1-3 score) — they're oversaturated red oceans.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
