'use client'

import { useState, useEffect } from 'react'
import { Card, Button, Alert } from '@/components/ui'
import tokens from '@/design-system/tokens.json'

interface PhotoAnalysis {
  photoNumber: number
  url: string
  score: number
  productDominance: number
  backgroundQuality: number
  lighting: number
  clarity: number
  colorBalance: number
  estimatedWidth: number
  estimatedHeight: number
  isSquare: boolean
  meetsMinimum: boolean
  feedback: string
  suggestions: string[]
  error?: string
}

interface PhotoAnalysisPanelProps {
  photoUrls: string[]
  onAnalysisComplete?: (result: any) => void
  autoAnalyze?: boolean
}

export function PhotoAnalysisPanel({ 
  photoUrls, 
  onAnalysisComplete,
  autoAnalyze = false 
}: PhotoAnalysisPanelProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<any>(null)
  const [error, setError] = useState('')

  // Auto-trigger analysis when photos are provided
  useEffect(() => {
    if (autoAnalyze && photoUrls.length > 0 && !analysisResult && !isAnalyzing) {
      handleAnalyze()
    }
  }, [photoUrls, autoAnalyze])

  const handleAnalyze = async () => {
    if (photoUrls.length === 0) {
      setError('No photos to analyze')
      return
    }

    setIsAnalyzing(true)
    setError('')

    try {
      const response = await fetch('/api/optimize/images/batch-analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          photos: photoUrls,
          platform: 'etsy'
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error?.message || 'Analysis failed')
      }

      setAnalysisResult(data)
      if (onAnalysisComplete) {
        onAnalysisComplete(data)
      }
    } catch (err: any) {
      setError(err.message || 'Failed to analyze photos')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 85) return tokens.colors.success
    if (score >= 70) return tokens.colors.primary
    if (score >= 50) return tokens.colors.warning
    return tokens.colors.danger
  }

  const getScoreLabel = (score: number) => {
    if (score >= 85) return 'Excellent'
    if (score >= 70) return 'Good'
    if (score >= 50) return 'Fair'
    return 'Needs Work'
  }

  if (photoUrls.length === 0) {
    return (
      <Card padding="8">
        <p style={{ 
          color: tokens.colors.textMuted,
          textAlign: 'center',
          padding: `${tokens.spacing[8]} 0`
        }}>
          No photos to analyze. Import an Etsy listing first.
        </p>
      </Card>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[6] }}>
      {/* Overall Score Card */}
      {analysisResult && (
        <Card padding="6" style={{
          background: `linear-gradient(135deg, ${tokens.colors.primary}15 0%, ${tokens.colors.background} 100%)`,
          border: `2px solid ${tokens.colors.primary}30`
        }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: tokens.spacing[4]
          }}>
            <div>
              <p style={{
                fontSize: tokens.typography.fontSize.sm,
                fontWeight: tokens.typography.fontWeight.medium,
                color: tokens.colors.textMuted,
                marginBottom: tokens.spacing[2]
              }}>
                Overall Photo Score
              </p>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: tokens.spacing[2] }}>
                <span style={{
                  fontSize: tokens.typography.fontSize['4xl'],
                  fontWeight: tokens.typography.fontWeight.bold,
                  color: getScoreColor(analysisResult.overallScore)
                }}>
                  {analysisResult.overallScore}
                </span>
                <span style={{
                  fontSize: tokens.typography.fontSize.xl,
                  color: tokens.colors.textMuted
                }}>
                  /100
                </span>
                <span style={{
                  fontSize: tokens.typography.fontSize.sm,
                  fontWeight: tokens.typography.fontWeight.medium,
                  color: getScoreColor(analysisResult.overallScore),
                  marginLeft: tokens.spacing[2]
                }}>
                  {getScoreLabel(analysisResult.overallScore)}
                </span>
              </div>
            </div>

            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
              gap: tokens.spacing[4]
            }}>
              <div>
                <p style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.textMuted }}>
                  Photos Analyzed
                </p>
                <p style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.text }}>
                  {analysisResult.analyzedCount}/{analysisResult.photoCount}
                </p>
              </div>
              <div>
                <p style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.textMuted }}>
                  Excellent
                </p>
                <p style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.success }}>
                  {analysisResult.summary.excellent}
                </p>
              </div>
              <div>
                <p style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.textMuted }}>
                  Good
                </p>
                <p style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.primary }}>
                  {analysisResult.summary.good}
                </p>
              </div>
              <div>
                <p style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.textMuted }}>
                  Needs Work
                </p>
                <p style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.warning }}>
                  {analysisResult.summary.needsImprovement}
                </p>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Action Button / Loading State */}
      {!analysisResult && !isAnalyzing && (
        <Button
          variant="primary"
          size="lg"
          onClick={handleAnalyze}
          fullWidth
        >
          📸 Analyze {photoUrls.length} Photo{photoUrls.length !== 1 ? 's' : ''}
        </Button>
      )}

      {isAnalyzing && (
        <Card padding="8">
          <div style={{ textAlign: 'center', padding: `${tokens.spacing[8]} 0` }}>
            <div style={{
              width: '3rem',
              height: '3rem',
              border: `3px solid ${tokens.colors.border}`,
              borderTop: `3px solid ${tokens.colors.primary}`,
              borderRadius: tokens.radius.full,
              animation: 'spin 1s linear infinite',
              margin: '0 auto',
              marginBottom: tokens.spacing[4]
            }}></div>
            <p style={{ color: tokens.colors.text, fontSize: tokens.typography.fontSize.lg, marginBottom: tokens.spacing[2] }}>
              Analyzing {photoUrls.length} photos with AI...
            </p>
            <p style={{ color: tokens.colors.textMuted, fontSize: tokens.typography.fontSize.sm }}>
              This may take 10-20 seconds
            </p>
          </div>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </Card>
      )}

      {/* Error Message */}
      {error && (
        <Alert variant="danger">
          {error}
        </Alert>
      )}

      {/* Photo Grid */}
      {analysisResult && analysisResult.analyses && (
        <Card padding="6">
          <h3 style={{
            fontSize: tokens.typography.fontSize.xl,
            fontWeight: tokens.typography.fontWeight.semibold,
            color: tokens.colors.text,
            marginBottom: tokens.spacing[4]
          }}>
            Individual Photo Scores
          </h3>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: tokens.spacing[4]
          }}>
            {analysisResult.analyses.map((photo: PhotoAnalysis) => (
              <div
                key={photo.photoNumber}
                style={{
                  position: 'relative',
                  borderRadius: tokens.radius.lg,
                  overflow: 'hidden',
                  border: `2px solid ${photo.error ? tokens.colors.danger : tokens.colors.border}`,
                  transition: 'transform 0.2s',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.02)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)'
                }}
              >
                {/* Photo Image */}
                <div style={{
                  position: 'relative',
                  paddingTop: '100%',
                  backgroundColor: tokens.colors.backgroundAlt
                }}>
                  {!photo.error && (
                    <img
                      src={photo.url}
                      alt={`Photo ${photo.photoNumber}`}
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }}
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none'
                      }}
                    />
                  )}
                  
                  {/* Score Badge */}
                  <div style={{
                    position: 'absolute',
                    top: tokens.spacing[2],
                    right: tokens.spacing[2],
                    backgroundColor: photo.error ? tokens.colors.danger : getScoreColor(photo.score),
                    color: tokens.colors.background,
                    padding: `${tokens.spacing[1]} ${tokens.spacing[2]}`,
                    borderRadius: tokens.radius.md,
                    fontSize: tokens.typography.fontSize.sm,
                    fontWeight: tokens.typography.fontWeight.bold,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                  }}>
                    {photo.error ? '✗' : photo.score}
                  </div>

                  {/* Photo Number */}
                  <div style={{
                    position: 'absolute',
                    top: tokens.spacing[2],
                    left: tokens.spacing[2],
                    backgroundColor: 'rgba(0,0,0,0.6)',
                    color: tokens.colors.background,
                    padding: `${tokens.spacing[1]} ${tokens.spacing[2]}`,
                    borderRadius: tokens.radius.md,
                    fontSize: tokens.typography.fontSize.xs,
                    fontWeight: tokens.typography.fontWeight.medium
                  }}>
                    #{photo.photoNumber}
                  </div>
                </div>

                {/* Photo Details */}
                <div style={{ padding: tokens.spacing[3], backgroundColor: tokens.colors.background }}>
                  {!photo.error ? (
                    <>
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between',
                        marginBottom: tokens.spacing[2]
                      }}>
                        <span style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.textMuted }}>
                          Resolution
                        </span>
                        <span style={{ 
                          fontSize: tokens.typography.fontSize.xs, 
                          fontWeight: tokens.typography.fontWeight.medium,
                          color: photo.meetsMinimum ? tokens.colors.success : tokens.colors.warning
                        }}>
                          {photo.estimatedWidth}×{photo.estimatedHeight}
                          {!photo.meetsMinimum && ' ⚠️'}
                        </span>
                      </div>
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between',
                        marginBottom: tokens.spacing[2]
                      }}>
                        <span style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.textMuted }}>
                          Square
                        </span>
                        <span style={{ fontSize: tokens.typography.fontSize.xs }}>
                          {photo.isSquare ? '✅' : '❌'}
                        </span>
                      </div>
                      <p style={{
                        fontSize: tokens.typography.fontSize.xs,
                        color: tokens.colors.textMuted,
                        marginTop: tokens.spacing[2],
                        lineHeight: '1.4'
                      }}>
                        {photo.feedback.substring(0, 80)}{photo.feedback.length > 80 ? '...' : ''}
                      </p>
                    </>
                  ) : (
                    <p style={{ 
                      fontSize: tokens.typography.fontSize.xs, 
                      color: tokens.colors.danger 
                    }}>
                      Failed to analyze
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Issues List */}
      {analysisResult && analysisResult.issues && analysisResult.issues.length > 0 && (
        <Card padding="6" style={{ borderLeft: `4px solid ${tokens.colors.warning}` }}>
          <h3 style={{
            fontSize: tokens.typography.fontSize.lg,
            fontWeight: tokens.typography.fontWeight.semibold,
            color: tokens.colors.text,
            marginBottom: tokens.spacing[3],
            display: 'flex',
            alignItems: 'center',
            gap: tokens.spacing[2]
          }}>
            ⚠️ Issues Found
          </h3>
          <ul style={{ 
            listStyle: 'none',
            padding: 0,
            margin: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: tokens.spacing[2]
          }}>
            {analysisResult.issues.map((issue: string, index: number) => (
              <li
                key={index}
                style={{
                  fontSize: tokens.typography.fontSize.sm,
                  color: tokens.colors.text,
                  paddingLeft: tokens.spacing[4],
                  position: 'relative'
                }}
              >
                <span style={{
                  position: 'absolute',
                  left: 0,
                  color: tokens.colors.warning
                }}>•</span>
                {issue}
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* Suggestions List */}
      {analysisResult && analysisResult.suggestions && analysisResult.suggestions.length > 0 && (
        <Card padding="6" style={{ borderLeft: `4px solid ${tokens.colors.primary}` }}>
          <h3 style={{
            fontSize: tokens.typography.fontSize.lg,
            fontWeight: tokens.typography.fontWeight.semibold,
            color: tokens.colors.text,
            marginBottom: tokens.spacing[3],
            display: 'flex',
            alignItems: 'center',
            gap: tokens.spacing[2]
          }}>
            💡 Recommendations
          </h3>
          <ul style={{ 
            listStyle: 'none',
            padding: 0,
            margin: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: tokens.spacing[2]
          }}>
            {analysisResult.suggestions.slice(0, 8).map((suggestion: string, index: number) => (
              <li
                key={index}
                style={{
                  fontSize: tokens.typography.fontSize.sm,
                  color: tokens.colors.text,
                  paddingLeft: tokens.spacing[4],
                  position: 'relative'
                }}
              >
                <span style={{
                  position: 'absolute',
                  left: 0,
                  color: tokens.colors.primary
                }}>•</span>
                {suggestion}
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* Re-analyze Button */}
      {analysisResult && (
        <Button
          variant="secondary"
          size="md"
          onClick={handleAnalyze}
          disabled={isAnalyzing}
        >
          🔄 Re-analyze Photos
        </Button>
      )}
    </div>
  )
}