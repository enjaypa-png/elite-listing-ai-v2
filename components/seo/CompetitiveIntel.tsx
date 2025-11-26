'use client';

import { Card } from '@/components/ui';
import { estimateRanking } from '@/lib/ranking-estimator';
import tokens from '@/design-system/tokens.json';

interface CompetitiveIntelProps {
  currentScore: number;
  optimizedScore: number;
  maxScore: number;
  category: string;
  averagePrice?: number;
}

export function CompetitiveIntel({
  currentScore,
  optimizedScore,
  maxScore,
  category,
  averagePrice = 25,
}: CompetitiveIntelProps) {
  
  const estimate = estimateRanking(
    currentScore,
    optimizedScore,
    maxScore,
    category,
    averagePrice
  );

  return (
    <Card>
      <div style={{ padding: tokens.spacing[8] }}>
        <h2 style={{
          fontSize: tokens.typography.fontSize['2xl'],
          fontWeight: tokens.typography.fontWeight.semibold,
          color: tokens.colors.text,
          marginBottom: tokens.spacing[6]
        }}>
          📊 Competitive Intelligence
        </h2>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: tokens.spacing[6],
          marginBottom: tokens.spacing[8]
        }}>
          {/* Current Performance */}
          <div style={{
            background: tokens.colors.background,
            border: `1px solid ${tokens.colors.danger}33`,
            borderRadius: tokens.radius.md,
            padding: tokens.spacing[6]
          }}>
            <div style={{
              color: tokens.colors.danger,
              fontWeight: tokens.typography.fontWeight.semibold,
              marginBottom: tokens.spacing[4],
              fontSize: tokens.typography.fontSize.sm
            }}>
              ⚠️ CURRENT PERFORMANCE
            </div>
            
            <div style={{ marginBottom: tokens.spacing[4] }}>
              <div style={{ color: tokens.colors.textMuted, fontSize: tokens.typography.fontSize.sm, marginBottom: tokens.spacing[1] }}>Search Ranking:</div>
              <div style={{
                fontSize: tokens.typography.fontSize['3xl'],
                fontWeight: tokens.typography.fontWeight.bold,
                color: tokens.colors.text
              }}>
                #{estimate.currentRanking.min}-{estimate.currentRanking.max}
              </div>
              <div style={{ color: tokens.colors.textMuted, fontSize: tokens.typography.fontSize.xs, marginTop: tokens.spacing[1] }}>
                for "{category}" searches
              </div>
            </div>

            <div style={{ marginBottom: tokens.spacing[4] }}>
              <div style={{ color: tokens.colors.textMuted, fontSize: tokens.typography.fontSize.sm, marginBottom: tokens.spacing[1] }}>Click Probability:</div>
              <div style={{
                fontSize: tokens.typography.fontSize['2xl'],
                fontWeight: tokens.typography.fontWeight.bold,
                color: tokens.colors.text
              }}>
                {estimate.trafficEstimate.current.clickProbability}
              </div>
            </div>

            <div>
              <div style={{ color: tokens.colors.textMuted, fontSize: tokens.typography.fontSize.sm, marginBottom: tokens.spacing[1] }}>Est. Monthly Views:</div>
              <div style={{
                fontSize: tokens.typography.fontSize['2xl'],
                fontWeight: tokens.typography.fontWeight.bold,
                color: tokens.colors.text
              }}>
                {estimate.trafficEstimate.current.monthlyViews.min.toLocaleString()}-
                {estimate.trafficEstimate.current.monthlyViews.max.toLocaleString()}
              </div>
            </div>
          </div>

          {/* After Optimization */}
          <div style={{
            background: tokens.colors.background,
            border: `1px solid ${tokens.colors.success}33`,
            borderRadius: tokens.radius.md,
            padding: tokens.spacing[6]
          }}>
            <div style={{
              color: tokens.colors.success,
              fontWeight: tokens.typography.fontWeight.semibold,
              marginBottom: tokens.spacing[4],
              fontSize: tokens.typography.fontSize.sm
            }}>
              ✅ AFTER OPTIMIZATION
            </div>
            
            <div style={{ marginBottom: tokens.spacing[4] }}>
              <div style={{ color: tokens.colors.textMuted, fontSize: tokens.typography.fontSize.sm, marginBottom: tokens.spacing[1] }}>Search Ranking:</div>
              <div style={{
                fontSize: tokens.typography.fontSize['3xl'],
                fontWeight: tokens.typography.fontWeight.bold,
                color: tokens.colors.success
              }}>
                #{estimate.optimizedRanking.min}-{estimate.optimizedRanking.max}
              </div>
              <div style={{ color: tokens.colors.textMuted, fontSize: tokens.typography.fontSize.xs, marginTop: tokens.spacing[1] }}>
                for "{category}" searches
              </div>
            </div>

            <div style={{ marginBottom: tokens.spacing[4] }}>
              <div style={{ color: tokens.colors.textMuted, fontSize: tokens.typography.fontSize.sm, marginBottom: tokens.spacing[1] }}>Click Probability:</div>
              <div style={{
                fontSize: tokens.typography.fontSize['2xl'],
                fontWeight: tokens.typography.fontWeight.bold,
                color: tokens.colors.success
              }}>
                {estimate.trafficEstimate.optimized.clickProbability}
              </div>
            </div>

            <div>
              <div style={{ color: tokens.colors.textMuted, fontSize: tokens.typography.fontSize.sm, marginBottom: tokens.spacing[1] }}>Est. Monthly Views:</div>
              <div style={{
                fontSize: tokens.typography.fontSize['2xl'],
                fontWeight: tokens.typography.fontWeight.bold,
                color: tokens.colors.success
              }}>
                {estimate.trafficEstimate.optimized.monthlyViews.min.toLocaleString()}-
                {estimate.trafficEstimate.optimized.monthlyViews.max.toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        {/* Revenue Impact */}
        <div style={{
          background: `${tokens.colors.primary}1A`,
          border: `1px solid ${tokens.colors.primary}33`,
          borderRadius: tokens.radius.md,
          padding: tokens.spacing[6]
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ color: tokens.colors.textMuted, marginBottom: tokens.spacing[2] }}>💰 ESTIMATED MONTHLY REVENUE IMPACT</div>
            <div style={{
              fontSize: tokens.typography.fontSize['5xl'],
              fontWeight: tokens.typography.fontWeight.bold,
              color: tokens.colors.primary,
              marginBottom: tokens.spacing[2]
            }}>
              +${estimate.revenueImpact.min.toLocaleString()}-${estimate.revenueImpact.max.toLocaleString()}
            </div>
            <div style={{ color: tokens.colors.textMuted, fontSize: tokens.typography.fontSize.sm }}>
              Based on 2% conversion rate and ${averagePrice} average order value
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
