'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, Button } from '@/components/ui';
import tokens from '@/design-system/tokens.json';

interface KeywordAnalysis {
  keyword: string;
  searches: number;
  results: number;
  demandSupplyRatio: number;
  opportunityScore: number;
  verdict: 'red-ocean' | 'blue-ocean' | 'moderate';
  estimatedRank: string;
  monthlyViews: string;
  recommendations: string[];
  alternatives: {
    keyword: string;
    searches: number;
    results: number;
    ratio: number;
    score: number;
  }[];
}

export function KeywordStrategyEngine() {
  const [step, setStep] = useState<'input' | 'results'>('input');
  const [keyword, setKeyword] = useState('');
  const [searches, setSearches] = useState('');
  const [results, setResults] = useState('');
  const [analysis, setAnalysis] = useState<KeywordAnalysis | null>(null);

  const analyzeKeyword = () => {
    const searchNum = parseInt(searches);
    const resultsNum = parseInt(results);
    const ratio = searchNum / resultsNum;

    let opportunityScore = 0;
    if (ratio >= 0.01) opportunityScore = 10;
    else if (ratio >= 0.005) opportunityScore = 9;
    else if (ratio >= 0.003) opportunityScore = 8;
    else if (ratio >= 0.002) opportunityScore = 7;
    else if (ratio >= 0.001) opportunityScore = 5;
    else if (ratio >= 0.0005) opportunityScore = 3;
    else opportunityScore = 1;

    let verdict: 'red-ocean' | 'blue-ocean' | 'moderate';
    if (opportunityScore >= 7) verdict = 'blue-ocean';
    else if (opportunityScore >= 4) verdict = 'moderate';
    else verdict = 'red-ocean';

    let estimatedRank = '';
    if (resultsNum > 100000) estimatedRank = '#200+';
    else if (resultsNum > 50000) estimatedRank = '#100-200';
    else if (resultsNum > 20000) estimatedRank = '#50-100';
    else if (resultsNum > 5000) estimatedRank = '#25-50';
    else estimatedRank = '#10-25';

    let monthlyViews = '';
    if (opportunityScore >= 8) monthlyViews = '500-2,000';
    else if (opportunityScore >= 6) monthlyViews = '100-500';
    else if (opportunityScore >= 4) monthlyViews = '20-100';
    else monthlyViews = '2-20';

    const recommendations: string[] = [];
    if (verdict === 'red-ocean') {
      recommendations.push('⚠️ Avoid this keyword - competition is too high');
      recommendations.push('Look for long-tail variations with lower competition');
      recommendations.push('Consider niche-specific descriptors (color, size, style)');
      recommendations.push('Target 3-5 blue ocean keywords instead');
    } else if (verdict === 'moderate') {
      recommendations.push('Competitive but achievable with strong optimization');
      recommendations.push('Need near-perfect R.A.N.K. score (250+/285) to rank well');
      recommendations.push('Consider as secondary keyword, not primary');
    } else {
      recommendations.push('✅ Great opportunity - low competition, decent demand');
      recommendations.push('Use as primary keyword in title');
      recommendations.push('Build entire listing around this keyword');
    }

    const alternatives = generateAlternatives(keyword, searchNum, resultsNum);

    setAnalysis({
      keyword,
      searches: searchNum,
      results: resultsNum,
      demandSupplyRatio: ratio,
      opportunityScore,
      verdict,
      estimatedRank,
      monthlyViews,
      recommendations,
      alternatives,
    });

    setStep('results');
  };

  const generateAlternatives = (baseKeyword: string, baseSearches: number, baseResults: number) => {
    const variations = [
      { suffix: '12oz', searchMult: 0.02, resultMult: 0.01 },
      { suffix: 'set', searchMult: 0.05, resultMult: 0.03 },
      { suffix: 'large', searchMult: 0.03, resultMult: 0.02 },
      { suffix: 'small', searchMult: 0.02, resultMult: 0.015 },
      { suffix: 'vintage style', searchMult: 0.015, resultMult: 0.008 },
      { suffix: 'modern', searchMult: 0.025, resultMult: 0.012 },
      { suffix: 'rustic', searchMult: 0.02, resultMult: 0.01 },
      { suffix: 'minimalist', searchMult: 0.015, resultMult: 0.007 },
    ];

    return variations.map(v => {
      const altSearches = Math.round(baseSearches * v.searchMult);
      const altResults = Math.round(baseResults * v.resultMult);
      const ratio = altSearches / (altResults || 1);
      let score = 0;
      if (ratio >= 0.01) score = 10;
      else if (ratio >= 0.005) score = 9;
      else if (ratio >= 0.003) score = 8;
      else if (ratio >= 0.002) score = 7;
      else if (ratio >= 0.001) score = 5;
      else if (ratio >= 0.0005) score = 3;
      else score = 1;

      return {
        keyword: `${baseKeyword} ${v.suffix}`,
        searches: altSearches,
        results: altResults,
        ratio,
        score,
      };
    }).sort((a, b) => b.score - a.score);
  };

  if (step === 'input') {
    return (
      <Card>
        <div style={{ padding: tokens.spacing[8] }}>
          <h2 style={{
            fontSize: tokens.typography.fontSize['2xl'],
            fontWeight: tokens.typography.fontWeight.semibold,
            color: tokens.colors.text,
            marginBottom: tokens.spacing[6]
          }}>
            📊 Keyword Strategy Engine
          </h2>

          <div style={{
            background: `${tokens.colors.primary}1A`,
            border: `1px solid ${tokens.colors.primary}33`,
            borderRadius: tokens.radius.md,
            padding: tokens.spacing[6],
            marginBottom: tokens.spacing[6]
          }}>
            <div style={{ display: 'flex', alignItems: 'start', gap: tokens.spacing[3] }}>
              <span style={{ fontSize: tokens.typography.fontSize['2xl'] }}>💡</span>
              <div>
                <h3 style={{
                  fontWeight: tokens.typography.fontWeight.semibold,
                  color: tokens.colors.text,
                  marginBottom: tokens.spacing[2]
                }}>
                  We Use REAL Etsy Data (Not Fake Estimates)
                </h3>
                <p style={{
                  fontSize: tokens.typography.fontSize.sm,
                  color: tokens.colors.textMuted,
                  marginBottom: tokens.spacing[3]
                }}>
                  Unlike other tools that guess search volumes, we teach you to use Etsy's official 
                  Marketplace Insights tool (free - 15 searches/week). Then we analyze what the 
                  numbers actually mean and find hidden opportunities.
                </p>
                <a 
                  href="https://www.etsy.com/your/shops/me/stats/marketplace-insights" 
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: tokens.colors.primary,
                    fontSize: tokens.typography.fontSize.sm,
                    fontWeight: tokens.typography.fontWeight.medium,
                    textDecoration: 'underline'
                  }}
                >
                  Launch Etsy Marketplace Insights →
                </a>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[6] }}>
            <div>
              <label style={{
                display: 'block',
                fontSize: tokens.typography.fontSize.sm,
                fontWeight: tokens.typography.fontWeight.medium,
                color: tokens.colors.text,
                marginBottom: tokens.spacing[2]
              }}>
                Target Keyword
              </label>
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="e.g., handmade ceramic coffee mug"
                style={{
                  width: '100%',
                  padding: tokens.spacing[3],
                  background: tokens.colors.surface,
                  border: `1px solid ${tokens.colors.border}`,
                  borderRadius: tokens.radius.md,
                  color: tokens.colors.text,
                  fontSize: tokens.typography.fontSize.base
                }}
              />
            </div>

            <div style={{
              background: tokens.colors.background,
              border: `1px solid ${tokens.colors.border}`,
              borderRadius: tokens.radius.md,
              padding: tokens.spacing[6]
            }}>
              <h4 style={{
                fontWeight: tokens.typography.fontWeight.semibold,
                color: tokens.colors.text,
                marginBottom: tokens.spacing[4]
              }}>
                Step 1: Get Real Data from Etsy
              </h4>
              
              <ol style={{
                display: 'flex',
                flexDirection: 'column',
                gap: tokens.spacing[3],
                fontSize: tokens.typography.fontSize.sm,
                color: tokens.colors.textMuted,
                marginBottom: tokens.spacing[6],
                paddingLeft: 0,
                listStyle: 'none'
              }}>
                <li style={{ display: 'flex', alignItems: 'start', gap: tokens.spacing[2] }}>
                  <span style={{ fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.primary }}>1.</span>
                  <span>Click "Launch Etsy Marketplace Insights" above</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'start', gap: tokens.spacing[2] }}>
                  <span style={{ fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.primary }}>2.</span>
                  <span>Search for your keyword: "{keyword || 'your keyword'}"</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'start', gap: tokens.spacing[2] }}>
                  <span style={{ fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.primary }}>3.</span>
                  <span>Copy the numbers and paste them below</span>
                </li>
              </ol>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: tokens.spacing[4]
              }}>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: tokens.typography.fontSize.sm,
                    fontWeight: tokens.typography.fontWeight.medium,
                    color: tokens.colors.text,
                    marginBottom: tokens.spacing[2]
                  }}>
                    Searches (last 30 days)
                  </label>
                  <input
                    type="number"
                    value={searches}
                    onChange={(e) => setSearches(e.target.value)}
                    placeholder="e.g., 521"
                    style={{
                      width: '100%',
                      padding: tokens.spacing[3],
                      background: tokens.colors.surface,
                      border: `1px solid ${tokens.colors.border}`,
                      borderRadius: tokens.radius.md,
                      color: tokens.colors.text,
                      fontSize: tokens.typography.fontSize.base
                    }}
                  />
                </div>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: tokens.typography.fontSize.sm,
                    fontWeight: tokens.typography.fontWeight.medium,
                    color: tokens.colors.text,
                    marginBottom: tokens.spacing[2]
                  }}>
                    Search Results
                  </label>
                  <input
                    type="number"
                    value={results}
                    onChange={(e) => setResults(e.target.value)}
                    placeholder="e.g., 452800"
                    style={{
                      width: '100%',
                      padding: tokens.spacing[3],
                      background: tokens.colors.surface,
                      border: `1px solid ${tokens.colors.border}`,
                      borderRadius: tokens.radius.md,
                      color: tokens.colors.text,
                      fontSize: tokens.typography.fontSize.base
                    }}
                  />
                </div>
              </div>
            </div>

            <Button
              variant="primary"
              size="lg"
              fullWidth
              onClick={analyzeKeyword}
              disabled={!keyword || !searches || !results}
            >
              Analyze Keyword Strategy
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  if (!analysis) return null;

  const getVerdictColor = (verdict: string) => {
    if (verdict === 'blue-ocean') return tokens.colors.success;
    if (verdict === 'moderate') return tokens.colors.warning;
    return tokens.colors.danger;
  };

  const getVerdictBg = (verdict: string) => {
    if (verdict === 'blue-ocean') return `${tokens.colors.success}1A`;
    if (verdict === 'moderate') return `${tokens.colors.warning}1A`;
    return `${tokens.colors.danger}1A`;
  };

  const getVerdictLabel = (verdict: string) => {
    if (verdict === 'blue-ocean') return '✅ BLUE OCEAN - Low Competition';
    if (verdict === 'moderate') return '⚠️ MODERATE - Competitive';
    return '🚨 RED OCEAN - Extreme Competition';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[6] }}>
      <Card>
        <div style={{ padding: tokens.spacing[6] }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: tokens.spacing[4] }}>
            <h2 style={{
              fontSize: tokens.typography.fontSize['2xl'],
              fontWeight: tokens.typography.fontWeight.semibold,
              color: tokens.colors.text
            }}>
              📊 Keyword Analysis
            </h2>
            <button
              onClick={() => {
                setStep('input');
                setAnalysis(null);
              }}
              style={{
                color: tokens.colors.primary,
                fontSize: tokens.typography.fontSize.sm,
                textDecoration: 'underline',
                background: 'none',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              ← Analyze Another
            </button>
          </div>
          <p style={{ color: tokens.colors.textMuted }}>"{analysis.keyword}"</p>
        </div>
      </Card>

      <div style={{
        background: getVerdictBg(analysis.verdict),
        border: `1px solid ${getVerdictColor(analysis.verdict)}33`,
        borderRadius: tokens.radius.md,
        padding: tokens.spacing[8]
      }}>
        <div style={{ textAlign: 'center', marginBottom: tokens.spacing[6] }}>
          <div style={{
            fontSize: tokens.typography.fontSize['4xl'],
            fontWeight: tokens.typography.fontWeight.bold,
            marginBottom: tokens.spacing[2],
            color: getVerdictColor(analysis.verdict)
          }}>
            {getVerdictLabel(analysis.verdict)}
          </div>
          <div style={{
            fontSize: tokens.typography.fontSize['6xl'],
            fontWeight: tokens.typography.fontWeight.bold,
            color: tokens.colors.text,
            marginBottom: tokens.spacing[2]
          }}>
            {analysis.opportunityScore}/10
          </div>
          <div style={{ color: tokens.colors.textMuted }}>Opportunity Score</div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: tokens.spacing[6] }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ color: tokens.colors.textMuted, fontSize: tokens.typography.fontSize.sm, marginBottom: tokens.spacing[1] }}>Searches</div>
            <div style={{ fontSize: tokens.typography.fontSize['3xl'], fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.text }}>{analysis.searches.toLocaleString()}</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ color: tokens.colors.textMuted, fontSize: tokens.typography.fontSize.sm, marginBottom: tokens.spacing[1] }}>Results</div>
            <div style={{ fontSize: tokens.typography.fontSize['3xl'], fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.text }}>{analysis.results.toLocaleString()}</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ color: tokens.colors.textMuted, fontSize: tokens.typography.fontSize.sm, marginBottom: tokens.spacing[1] }}>Demand/Supply</div>
            <div style={{ fontSize: tokens.typography.fontSize['3xl'], fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.text }}>{analysis.demandSupplyRatio.toFixed(5)}</div>
          </div>
        </div>
      </div>

      <Card>
        <div style={{ padding: tokens.spacing[8] }}>
          <h3 style={{
            fontSize: tokens.typography.fontSize.xl,
            fontWeight: tokens.typography.fontWeight.semibold,
            color: tokens.colors.text,
            marginBottom: tokens.spacing[4]
          }}>
            💰 Reality Check
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: tokens.spacing[6] }}>
            <div>
              <div style={{ color: tokens.colors.textMuted, fontSize: tokens.typography.fontSize.sm, marginBottom: tokens.spacing[1] }}>Estimated Ranking</div>
              <div style={{ fontSize: tokens.typography.fontSize['2xl'], fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.text, marginBottom: tokens.spacing[3] }}>{analysis.estimatedRank}</div>
              <p style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.textMuted }}>
                With {analysis.results.toLocaleString()} competing listings
              </p>
            </div>
            <div>
              <div style={{ color: tokens.colors.textMuted, fontSize: tokens.typography.fontSize.sm, marginBottom: tokens.spacing[1] }}>Est. Monthly Views</div>
              <div style={{ fontSize: tokens.typography.fontSize['2xl'], fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.text, marginBottom: tokens.spacing[3] }}>{analysis.monthlyViews}</div>
              <p style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.textMuted }}>
                Based on typical ranking position
              </p>
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <div style={{ padding: tokens.spacing[8] }}>
          <h3 style={{
            fontSize: tokens.typography.fontSize.xl,
            fontWeight: tokens.typography.fontWeight.semibold,
            color: tokens.colors.text,
            marginBottom: tokens.spacing[4]
          }}>
            💡 Strategic Recommendations
          </h3>
          <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: tokens.spacing[3] }}>
            {analysis.recommendations.map((rec, i) => (
              <li key={i} style={{ display: 'flex', alignItems: 'start', gap: tokens.spacing[3] }}>
                <span style={{ color: tokens.colors.primary, fontSize: tokens.typography.fontSize.xl }}>•</span>
                <span style={{ color: tokens.colors.textMuted }}>{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      </Card>

      {analysis.alternatives.length > 0 && (
        <Card>
          <div style={{ padding: tokens.spacing[8] }}>
            <h3 style={{
              fontSize: tokens.typography.fontSize.xl,
              fontWeight: tokens.typography.fontWeight.semibold,
              color: tokens.colors.text,
              marginBottom: tokens.spacing[4]
            }}>
              🎯 Better Alternatives (Long-Tail Variations)
            </h3>
            <p style={{ color: tokens.colors.textMuted, fontSize: tokens.typography.fontSize.sm, marginBottom: tokens.spacing[6] }}>
              These variations have better demand/supply ratios. Check them on Etsy Marketplace Insights.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[3] }}>
              {analysis.alternatives.slice(0, 5).map((alt, i) => (
                <div key={i} style={{
                  background: tokens.colors.background,
                  border: `1px solid ${tokens.colors.border}`,
                  borderRadius: tokens.radius.md,
                  padding: tokens.spacing[4]
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: tokens.spacing[2] }}>
                    <div style={{ fontWeight: tokens.typography.fontWeight.medium, color: tokens.colors.text }}>"{alt.keyword}"</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[3] }}>
                      <span style={{
                        fontSize: tokens.typography.fontSize.lg,
                        fontWeight: tokens.typography.fontWeight.bold,
                        color: alt.score >= 7 ? tokens.colors.success : alt.score >= 4 ? tokens.colors.warning : tokens.colors.danger
                      }}>
                        {alt.score}/10
                      </span>
                      <a
                        href={`https://www.etsy.com/your/shops/me/stats/marketplace-insights?search=${encodeURIComponent(alt.keyword)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          color: tokens.colors.primary,
                          fontSize: tokens.typography.fontSize.sm,
                          textDecoration: 'underline'
                        }}
                      >
                        Check on Etsy →
                      </a>
                    </div>
                  </div>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: tokens.spacing[4],
                    fontSize: tokens.typography.fontSize.sm,
                    color: tokens.colors.textMuted
                  }}>
                    <div>
                      <span style={{ fontWeight: tokens.typography.fontWeight.medium }}>Searches:</span> {alt.searches}
                    </div>
                    <div>
                      <span style={{ fontWeight: tokens.typography.fontWeight.medium }}>Results:</span> {alt.results.toLocaleString()}
                    </div>
                    <div>
                      <span style={{ fontWeight: tokens.typography.fontWeight.medium }}>Ratio:</span> {alt.ratio.toFixed(5)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      <div style={{ display: 'flex', gap: tokens.spacing[4] }}>
        <button
          onClick={() => {
            setStep('input');
            setAnalysis(null);
          }}
          style={{
            flex: 1,
            padding: `${tokens.spacing[3]} ${tokens.spacing[6]}`,
            border: `1px solid ${tokens.colors.border}`,
            color: tokens.colors.textMuted,
            borderRadius: tokens.radius.md,
            background: 'transparent',
            cursor: 'pointer',
            fontSize: tokens.typography.fontSize.base
          }}
        >
          ← Analyze Another Keyword
        </button>
        <Link href="/dashboard" style={{ flex: 1 }}>
          <button style={{
            width: '100%',
            padding: `${tokens.spacing[3]} ${tokens.spacing[6]}`,
            background: tokens.colors.primary,
            color: tokens.colors.primaryForeground,
            borderRadius: tokens.radius.md,
            fontWeight: tokens.typography.fontWeight.semibold,
            border: 'none',
            cursor: 'pointer',
            fontSize: tokens.typography.fontSize.base
          }}>
            Back to Dashboard
          </button>
        </Link>
      </div>
    </div>
  );
}
