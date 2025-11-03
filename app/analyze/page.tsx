'use client'

import { useState } from 'react'
import { Container, Input, Button, Card, Alert, Navbar, Footer } from '@/components/ui'
import tokens from '@/design-system/tokens.json'

interface AnalysisResult {
  ok: boolean
  score: number
  lighting: number
  composition: number
  clarity: number
  appeal: number
  technicalCompliance: number
  algorithmFit: number
  productDominance: number
  backgroundQuality: number
  colorBalance: number
  estimatedResolution: string
  aspectRatioEstimate: string
  feedback: string
  complianceIssues: string[]
  suggestions: string[]
  platformRequirements: any
}

export default function AnalyzePage() {
  const [imageUrl, setImageUrl] = useState('')
  const [platform, setPlatform] = useState('etsy')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [error, setError] = useState('')

  const handleAnalyze = async () => {
    if (!imageUrl.trim()) {
      setError('Please enter an image URL')
      return
    }

    setIsAnalyzing(true)
    setError('')
    setResult(null)

    try {
      const response = await fetch('/api/optimize/image/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl: imageUrl.trim(), platform }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error?.message || 'Analysis failed')
      }

      setResult(data)
    } catch (err: any) {
      setError(err.message || 'Failed to analyze image')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return tokens.colors.success
    if (score >= 60) return tokens.colors.warning
    return tokens.colors.danger
  }

  return (
    <>
      <Navbar showAuth={false} />
      
      <main style={{ padding: `${tokens.spacing[8]} 0`, minHeight: 'calc(100vh - 200px)' }}>
        <Container>
          <div style={{ marginBottom: tokens.spacing[8] }}>
            <h1 style={{
              fontSize: tokens.typography.fontSize['3xl'],
              fontWeight: tokens.typography.fontWeight.bold,
              color: tokens.colors.text,
              marginBottom: tokens.spacing[2]
            }}>
              📸 Image Analysis
            </h1>
            <p style={{ color: tokens.colors.textMuted }}>
              Analyze your product photos with AI-powered insights
            </p>
          </div>

          <Card padding="8">
            <div style={{ marginBottom: tokens.spacing[6] }}>
              <label style={{
                display: 'block',
                fontSize: tokens.typography.fontSize.sm,
                fontWeight: tokens.typography.fontWeight.medium,
                color: tokens.colors.text,
                marginBottom: tokens.spacing[2]
              }}>
                Platform
              </label>
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
                style={{
                  width: '100%',
                  padding: tokens.spacing[3],
                  backgroundColor: tokens.colors.background,
                  border: `1px solid ${tokens.colors.border}`,
                  borderRadius: tokens.radius.md,
                  color: tokens.colors.text,
                  fontSize: tokens.typography.fontSize.sm,
                  outline: 'none'
                }}
              >
                <option value="etsy">Etsy</option>
                <option value="shopify">Shopify</option>
                <option value="ebay">eBay</option>
              </select>
            </div>

            <Input
              id="imageUrl"
              name="imageUrl"
              type="url"
              label="Image URL"
              placeholder="https://example.com/product-image.jpg"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              required
            />

            {error && <Alert variant="danger">{error}</Alert>}

            <Button
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              fullWidth
            >
              {isAnalyzing ? 'Analyzing...' : 'Analyze Image'}
            </Button>
          </Card>

          {imageUrl && (
            <Card padding="8" style={{ marginTop: tokens.spacing[6] }}>
              <h3 style={{
                fontSize: tokens.typography.fontSize.lg,
                fontWeight: tokens.typography.fontWeight.semibold,
                color: tokens.colors.text,
                marginBottom: tokens.spacing[4]
              }}>
                Preview
              </h3>
              <div style={{
                maxWidth: '400px',
                margin: '0 auto',
                backgroundColor: tokens.colors.background,
                borderRadius: tokens.radius.lg,
                overflow: 'hidden'
              }}>
                <img
                  src={imageUrl}
                  alt="Product preview"
                  style={{ width: '100%', height: 'auto', objectFit: 'contain' }}
                  onError={() => setError('Failed to load image')}
                />
              </div>
            </Card>
          )}

          {result && (
            <div style={{ marginTop: tokens.spacing[8], display: 'grid', gap: tokens.spacing[6] }}>
              <Card padding="8" style={{ textAlign: 'center' }}>
                <h2 style={{
                  fontSize: tokens.typography.fontSize.xl,
                  fontWeight: tokens.typography.fontWeight.semibold,
                  color: tokens.colors.text,
                  marginBottom: tokens.spacing[4]
                }}>
                  Overall Score
                </h2>
                <p style={{
                  fontSize: '4rem',
                  fontWeight: tokens.typography.fontWeight.bold,
                  color: getScoreColor(result.score)
                }}>
                  {result.score}
                  <span style={{ fontSize: '2rem' }}>/100</span>
                </p>
              </Card>

              <Card padding="8">
                <h3 style={{
                  fontSize: tokens.typography.fontSize.xl,
                  fontWeight: tokens.typography.fontWeight.semibold,
                  color: tokens.colors.text,
                  marginBottom: tokens.spacing[6]
                }}>
                  Detailed Scores
                </h3>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: tokens.spacing[4]
                }}>
                  {[
                    { label: 'Lighting', value: result.lighting },
                    { label: 'Composition', value: result.composition },
                    { label: 'Clarity', value: result.clarity },
                    { label: 'Appeal', value: result.appeal },
                    { label: 'Technical Compliance', value: result.technicalCompliance },
                    { label: 'Algorithm Fit', value: result.algorithmFit },
                    { label: 'Product Dominance', value: result.productDominance },
                    { label: 'Background Quality', value: result.backgroundQuality },
                    { label: 'Color Balance', value: result.colorBalance },
                  ].map((item) => (
                    <div
                      key={item.label}
                      style={{
                        backgroundColor: tokens.colors.background,
                        border: `1px solid ${tokens.colors.border}`,
                        borderRadius: tokens.radius.lg,
                        padding: tokens.spacing[4]
                      }}
                    >
                      <p style={{
                        fontSize: tokens.typography.fontSize.sm,
                        color: tokens.colors.textMuted,
                        marginBottom: tokens.spacing[1]
                      }}>
                        {item.label}
                      </p>
                      <p style={{
                        fontSize: tokens.typography.fontSize['2xl'],
                        fontWeight: tokens.typography.fontWeight.bold,
                        color: getScoreColor(item.value)
                      }}>
                        {item.value}
                      </p>
                    </div>
                  ))}
                </div>
              </Card>

              <Card padding="8">
                <h3 style={{
                  fontSize: tokens.typography.fontSize.xl,
                  fontWeight: tokens.typography.fontWeight.semibold,
                  color: tokens.colors.text,
                  marginBottom: tokens.spacing[4]
                }}>
                  AI Feedback
                </h3>
                <p style={{
                  color: tokens.colors.text,
                  lineHeight: tokens.typography.lineHeight.relaxed
                }}>
                  {result.feedback}
                </p>
              </Card>

              {result.complianceIssues.length > 0 && (
                <Alert variant="danger">
                  <strong>Compliance Issues:</strong>
                  <ul style={{ marginTop: tokens.spacing[2], paddingLeft: tokens.spacing[5] }}>
                    {result.complianceIssues.map((issue, index) => (
                      <li key={index}>{issue}</li>
                    ))}
                  </ul>
                </Alert>
              )}

              {result.suggestions.length > 0 && (
                <Alert variant="info">
                  <strong>💡 Improvement Suggestions:</strong>
                  <ul style={{ marginTop: tokens.spacing[2], paddingLeft: tokens.spacing[5] }}>
                    {result.suggestions.map((suggestion, index) => (
                      <li key={index}>{suggestion}</li>
                    ))}
                  </ul>
                </Alert>
              )}
            </div>
          )}
        </Container>
      </main>

      <Footer />
    </>
  )
}
