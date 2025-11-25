'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Container, Card, Button } from '@/components/ui';
import { TopNav, Breadcrumbs } from '@/components/navigation';
import tokens from '@/design-system/tokens.json';

export default function KeywordsAnalysisPage() {
  const router = useRouter();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [productInfo, setProductInfo] = useState({
    title: '',
    category: 'Home & Living',
    description: '',
    tags: ''
  });
  const [analysisResult, setAnalysisResult] = useState<any>(null);

  const categories = [
    'Home & Living',
    'Jewelry & Accessories',
    'Clothing',
    'Wedding & Party',
    'Toys & Games',
    'Art & Collectibles',
    'Craft Supplies',
    'Pet Supplies'
  ];

  const handleAnalyze = async () => {
    if (!productInfo.title || !productInfo.description) {
      alert('Please enter at least a title and description');
      return;
    }

    setIsAnalyzing(true);

    try {
      const response = await fetch('/api/seo/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform: 'Etsy',
          title: productInfo.title,
          description: productInfo.description,
          tags: productInfo.tags,
          category: productInfo.category,
          keywords: productInfo.title.split(' ').slice(0, 3)
        })
      });

      if (!response.ok) {
        throw new Error('Analysis failed');
      }

      const data = await response.json();
      setAnalysisResult(data);
    } catch (error) {
      console.error('Analysis error:', error);
      alert('Failed to analyze. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: tokens.colors.background }}>
      <TopNav />
      <Breadcrumbs />

      <Container>
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
          paddingTop: tokens.spacing[8],
          paddingBottom: tokens.spacing[12]
        }}>
          <div style={{
            textAlign: 'center',
            marginBottom: tokens.spacing[12]
          }}>
            <h1 style={{
              fontSize: tokens.typography.fontSize['4xl'],
              fontWeight: tokens.typography.fontWeight.bold,
              color: tokens.colors.text,
              marginBottom: tokens.spacing[3]
            }}>
              🔍 R.A.N.K. 285™ Analysis
            </h1>
            <p style={{
              fontSize: tokens.typography.fontSize.lg,
              color: tokens.colors.textMuted
            }}>
              Powered by our proprietary 285-point algorithm
            </p>
          </div>

          {!analysisResult ? (
            <Card>
              <div style={{ padding: tokens.spacing[8] }}>
                <h2 style={{
                  fontSize: tokens.typography.fontSize['2xl'],
                  fontWeight: tokens.typography.fontWeight.bold,
                  color: tokens.colors.text,
                  marginBottom: tokens.spacing[6]
                }}>
                  Enter Your Product Information
                </h2>

                <div style={{ marginBottom: tokens.spacing[6] }}>
                  <label style={{
                    display: 'block',
                    fontSize: tokens.typography.fontSize.sm,
                    fontWeight: tokens.typography.fontWeight.medium,
                    color: tokens.colors.text,
                    marginBottom: tokens.spacing[2]
                  }}>
                    Product Title
                  </label>
                  <input
                    type="text"
                    value={productInfo.title}
                    onChange={(e) => setProductInfo({ ...productInfo, title: e.target.value })}
                    placeholder="Handmade Ceramic Coffee Mug..."
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

                <div style={{ marginBottom: tokens.spacing[6] }}>
                  <label style={{
                    display: 'block',
                    fontSize: tokens.typography.fontSize.sm,
                    fontWeight: tokens.typography.fontWeight.medium,
                    color: tokens.colors.text,
                    marginBottom: tokens.spacing[2]
                  }}>
                    Category
                  </label>
                  <select
                    value={productInfo.category}
                    onChange={(e) => setProductInfo({ ...productInfo, category: e.target.value })}
                    style={{
                      width: '100%',
                      padding: tokens.spacing[3],
                      background: tokens.colors.surface,
                      border: `1px solid ${tokens.colors.border}`,
                      borderRadius: tokens.radius.md,
                      color: tokens.colors.text,
                      fontSize: tokens.typography.fontSize.base
                    }}
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div style={{ marginBottom: tokens.spacing[6] }}>
                  <label style={{
                    display: 'block',
                    fontSize: tokens.typography.fontSize.sm,
                    fontWeight: tokens.typography.fontWeight.medium,
                    color: tokens.colors.text,
                    marginBottom: tokens.spacing[2]
                  }}>
                    Description
                  </label>
                  <textarea
                    value={productInfo.description}
                    onChange={(e) => setProductInfo({ ...productInfo, description: e.target.value })}
                    placeholder="Describe your product in detail..."
                    rows={6}
                    style={{
                      width: '100%',
                      padding: tokens.spacing[3],
                      background: tokens.colors.surface,
                      border: `1px solid ${tokens.colors.border}`,
                      borderRadius: tokens.radius.md,
                      color: tokens.colors.text,
                      fontSize: tokens.typography.fontSize.base,
                      fontFamily: 'inherit',
                      resize: 'vertical'
                    }}
                  />
                </div>

                <div style={{ marginBottom: tokens.spacing[8] }}>
                  <label style={{
                    display: 'block',
                    fontSize: tokens.typography.fontSize.sm,
                    fontWeight: tokens.typography.fontWeight.medium,
                    color: tokens.colors.text,
                    marginBottom: tokens.spacing[2]
                  }}>
                    Tags (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={productInfo.tags}
                    onChange={(e) => setProductInfo({ ...productInfo, tags: e.target.value })}
                    placeholder="ceramic mug, handmade pottery, coffee gift..."
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

                <Button
                  variant="primary"
                  size="lg"
                  fullWidth
                  onClick={handleAnalyze}
                  disabled={isAnalyzing}
                >
                  {isAnalyzing ? 'Analyzing...' : '📊 Analyze with R.A.N.K. 285™'}
                </Button>
              </div>
            </Card>
          ) : (
            <div>
              <Card>
                <div style={{
                  padding: tokens.spacing[8],
                  textAlign: 'center',
                  marginBottom: tokens.spacing[8]
                }}>
                  <div style={{
                    fontSize: tokens.typography.fontSize['6xl'],
                    fontWeight: tokens.typography.fontWeight.bold,
                    color: tokens.colors.primary,
                    marginBottom: tokens.spacing[4]
                  }}>
                    {analysisResult.totalPoints} / 285
                  </div>
                  <div style={{
                    fontSize: tokens.typography.fontSize['2xl'],
                    color: tokens.colors.text,
                    marginBottom: tokens.spacing[2]
                  }}>
                    {analysisResult.overallScore}% Optimization
                  </div>
                  <div style={{
                    fontSize: tokens.typography.fontSize.lg,
                    color: tokens.colors.textMuted
                  }}>
                    ⚡ {analysisResult.opportunityScore}% Improvement Potential
                  </div>
                </div>
              </Card>

              <Card>
                <div style={{ padding: tokens.spacing[8] }}>
                  <h2 style={{
                    fontSize: tokens.typography.fontSize['2xl'],
                    fontWeight: tokens.typography.fontWeight.bold,
                    color: tokens.colors.text,
                    marginBottom: tokens.spacing[6]
                  }}>
                    Component Scores
                  </h2>

                  {Object.entries(analysisResult.breakdown).map(([component, data]: [string, any]) => {
                    const icons: Record<string, string> = {
                      title: '📝',
                      tags: '🏷️',
                      description: '📄',
                      photos: '📸',
                      attributes: '🎯',
                      category: '📁'
                    };
                    const color = data.percentage >= 70 ? tokens.colors.success : data.percentage >= 50 ? tokens.colors.warning : tokens.colors.danger;
                    
                    return (
                      <div key={component} style={{ marginBottom: tokens.spacing[4] }}>
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          marginBottom: tokens.spacing[2]
                        }}>
                          <span style={{
                            fontSize: tokens.typography.fontSize.base,
                            color: tokens.colors.text,
                            fontWeight: tokens.typography.fontWeight.medium
                          }}>
                            {icons[component]} {component.charAt(0).toUpperCase() + component.slice(1)}
                          </span>
                          <span style={{
                            fontSize: tokens.typography.fontSize.sm,
                            color: color,
                            fontWeight: tokens.typography.fontWeight.bold
                          }}>
                            {data.score}/{data.maxScore} ({data.percentage}%)
                          </span>
                        </div>
                        <div style={{
                          width: '100%',
                          height: '8px',
                          background: tokens.colors.surface2,
                          borderRadius: tokens.radius.full,
                          overflow: 'hidden'
                        }}>
                          <div style={{
                            width: `${data.percentage}%`,
                            height: '100%',
                            background: color,
                            transition: `width ${tokens.motion.duration.slow}`
                          }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>

              {analysisResult.priorityIssues && analysisResult.priorityIssues.length > 0 && (
                <Card>
                  <div style={{ padding: tokens.spacing[8], marginTop: tokens.spacing[6] }}>
                    <h2 style={{
                      fontSize: tokens.typography.fontSize['2xl'],
                      fontWeight: tokens.typography.fontWeight.bold,
                      color: tokens.colors.danger,
                      marginBottom: tokens.spacing[6]
                    }}>
                      🚨 PRIORITY ISSUES
                    </h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[4] }}>
                      {analysisResult.priorityIssues.map((issue: string, index: number) => (
                        <div
                          key={index}
                          style={{
                            padding: tokens.spacing[4],
                            background: `${tokens.colors.danger}1A`,
                            border: `1px solid ${tokens.colors.danger}33`,
                            borderRadius: tokens.radius.md
                          }}
                        >
                          <div style={{
                            fontSize: tokens.typography.fontSize.base,
                            color: tokens.colors.text,
                            fontWeight: tokens.typography.fontWeight.medium
                          }}>
                            {index + 1}. {issue}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>
              )}

              {analysisResult.quickWins && analysisResult.quickWins.length > 0 && (
                <Card>
                  <div style={{ padding: tokens.spacing[8], marginTop: tokens.spacing[6] }}>
                    <h2 style={{
                      fontSize: tokens.typography.fontSize['2xl'],
                      fontWeight: tokens.typography.fontWeight.bold,
                      color: tokens.colors.success,
                      marginBottom: tokens.spacing[6]
                    }}>
                      ⚡ QUICK WINS
                    </h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[4] }}>
                      {analysisResult.quickWins.map((win: string, index: number) => (
                        <div
                          key={index}
                          style={{
                            padding: tokens.spacing[4],
                            background: `${tokens.colors.success}1A`,
                            border: `1px solid ${tokens.colors.success}33`,
                            borderRadius: tokens.radius.md,
                            display: 'flex',
                            alignItems: 'center',
                            gap: tokens.spacing[3]
                          }}
                        >
                          <span style={{ fontSize: tokens.typography.fontSize['2xl'] }}>✓</span>
                          <div style={{
                            fontSize: tokens.typography.fontSize.base,
                            color: tokens.colors.text
                          }}>
                            {win}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>
              )}

              <div style={{
                display: 'flex',
                justifyContent: 'center',
                gap: tokens.spacing[4],
                marginTop: tokens.spacing[8]
              }}>
                <Button
                  variant="secondary"
                  size="lg"
                  onClick={() => setAnalysisResult(null)}
                >
                  ← Analyze Another
                </Button>
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => router.push('/dashboard')}
                >
                  Back to Dashboard
                </Button>
              </div>
            </div>
          )}
        </div>
      </Container>
    </div>
  );
}
