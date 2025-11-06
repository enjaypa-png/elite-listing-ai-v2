'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Container, Input, Button, Card, Alert, Navbar, Footer } from '@/components/ui'
import tokens from '@/design-system/tokens.json'

function OptimizeContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialTool = searchParams.get('tool') || 'listing'
  const [activeTool, setActiveTool] = useState(initialTool)
  
  // Listing Optimizer State
  const [listingTitle, setListingTitle] = useState('')
  const [listingDescription, setListingDescription] = useState('')
  const [isOptimizing, setIsOptimizing] = useState(false)
  
  // Image Analyzer State
  const [imageUrl, setImageUrl] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  
  // Keyword Generator State
  const [productDescription, setProductDescription] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  
  // SEO Audit State
  const [seoUrl, setSeoUrl] = useState('')
  const [isAuditing, setIsAuditing] = useState(false)
  
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState('')

  const tools = {
    listing: {
      title: 'Optimize Listing',
      icon: '✨',
      description: 'AI-powered listing optimization that generates 3 unique title and description variants with quality scores to maximize your Etsy visibility and conversions.',
      action: 'Optimize'
    },
    images: {
      title: 'Analyze Images',
      icon: '📸',
      description: 'Get detailed image quality analysis with 10+ metrics including lighting, composition, and compliance checks to ensure your photos meet platform standards.',
      action: 'Analyze'
    },
    keywords: {
      title: 'Generate Keywords',
      icon: '🔑',
      description: 'Discover high-performing SEO keywords tailored to your product that help customers find your listings in search results.',
      action: 'Generate'
    },
    seo: {
      title: 'SEO Audit',
      icon: '🎯',
      description: 'Comprehensive SEO health check that analyzes your listing structure, keyword usage, and provides actionable recommendations to improve rankings.',
      action: 'Audit'
    }
  }

  const currentTool = tools[activeTool as keyof typeof tools] || tools.listing

  const handleOptimize = async () => {
    setIsOptimizing(true)
    setError('')
    setResult(null)

    try {
      const response = await fetch('/api/optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: listingTitle,
          description: listingDescription,
          platform: 'etsy'
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error?.message || 'Optimization failed')
      }

      setResult(data)
    } catch (err: any) {
      setError(err.message || 'Failed to optimize listing')
    } finally {
      setIsOptimizing(false)
    }
  }

  const handleAnalyze = async () => {
    setIsAnalyzing(true)
    setError('')
    setResult(null)

    try {
      const response = await fetch('/api/optimize/image/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl: imageUrl.trim(), platform: 'etsy' }),
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

  const handleGenerateKeywords = async () => {
    setIsGenerating(true)
    setError('')
    setResult(null)

    try {
      const response = await fetch('/api/keywords/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productDescription: productDescription,
          platform: 'etsy'
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error?.message || 'Keyword generation failed')
      }

      setResult(data)
    } catch (err: any) {
      setError(err.message || 'Failed to generate keywords')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSeoAudit = async () => {
    setIsAuditing(true)
    setError('')
    setResult(null)

    try {
      const response = await fetch('/api/seo/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: seoUrl,
          platform: 'etsy'
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error?.message || 'SEO audit failed')
      }

      setResult(data)
    } catch (err: any) {
      setError(err.message || 'Failed to run SEO audit')
    } finally {
      setIsAuditing(false)
    }
  }

  const isProcessing = isOptimizing || isAnalyzing || isGenerating || isAuditing

  return (
    <>
      <Navbar showAuth={false} />
      
      <main style={{ padding: `${tokens.spacing[8]} 0`, minHeight: 'calc(100vh - 200px)', backgroundColor: tokens.colors.background }}>
        <Container>
          {/* Header */}
          <div style={{ marginBottom: tokens.spacing[8] }}>
            <h1 style={{
              fontSize: tokens.typography.fontSize['3xl'],
              fontWeight: tokens.typography.fontWeight.bold,
              color: tokens.colors.text,
              marginBottom: tokens.spacing[2]
            }}>
              {currentTool.icon} {currentTool.title}
            </h1>
            <p style={{ 
              color: tokens.colors.textMuted,
              fontSize: tokens.typography.fontSize.base,
              maxWidth: '800px'
            }}>
              {currentTool.description}
            </p>
          </div>

          {/* Tool Tabs */}
          <div style={{
            display: 'flex',
            gap: tokens.spacing[2],
            marginBottom: tokens.spacing[6],
            overflowX: 'auto',
            paddingBottom: tokens.spacing[2]
          }}>
            {Object.entries(tools).map(([key, tool]) => (
              <button
                key={key}
                onClick={() => {
                  setActiveTool(key)
                  setResult(null)
                  setError('')
                }}
                style={{
                  padding: `${tokens.spacing[3]} ${tokens.spacing[4]}`,
                  borderRadius: tokens.radius.lg,
                  border: activeTool === key ? `2px solid ${tokens.colors.primary}` : `1px solid ${tokens.colors.border}`,
                  backgroundColor: activeTool === key ? `${tokens.colors.primary}15` : tokens.colors.background,
                  color: activeTool === key ? tokens.colors.primary : tokens.colors.text,
                  fontSize: tokens.typography.fontSize.sm,
                  fontWeight: tokens.typography.fontWeight.medium,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.2s'
                }}
              >
                {tool.icon} {tool.title}
              </button>
            ))}
          </div>

          {error && (
            <Alert variant="danger" style={{ marginBottom: tokens.spacing[6] }}>
              {error}
            </Alert>
          )}

          {/* Tool Content */}
          <Card padding="8">
            {activeTool === 'listing' && (
              <div>
                <div style={{ marginBottom: tokens.spacing[6] }}>
                  <label style={{
                    display: 'block',
                    fontSize: tokens.typography.fontSize.sm,
                    fontWeight: tokens.typography.fontWeight.medium,
                    color: tokens.colors.text,
                    marginBottom: tokens.spacing[2]
                  }}>
                    Listing Title
                  </label>
                  <Input
                    value={listingTitle}
                    onChange={(e) => setListingTitle(e.target.value)}
                    placeholder="Enter your product title..."
                    disabled={isProcessing}
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
                    Description
                  </label>
                  <textarea
                    value={listingDescription}
                    onChange={(e) => setListingDescription(e.target.value)}
                    placeholder="Enter your product description..."
                    disabled={isProcessing}
                    rows={6}
                    style={{
                      width: '100%',
                      padding: tokens.spacing[3],
                      borderRadius: tokens.radius.lg,
                      border: `1px solid ${tokens.colors.border}`,
                      backgroundColor: tokens.colors.background,
                      color: tokens.colors.text,
                      fontSize: tokens.typography.fontSize.base,
                      fontFamily: 'inherit',
                      resize: 'vertical'
                    }}
                  />
                </div>

                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleOptimize}
                  disabled={isProcessing || !listingTitle.trim() || !listingDescription.trim()}
                >
                  {isOptimizing ? 'Optimizing...' : 'Optimize Listing'}
                </Button>
              </div>
            )}

            {activeTool === 'images' && (
              <div>
                <div style={{ marginBottom: tokens.spacing[6] }}>
                  <label style={{
                    display: 'block',
                    fontSize: tokens.typography.fontSize.sm,
                    fontWeight: tokens.typography.fontWeight.medium,
                    color: tokens.colors.text,
                    marginBottom: tokens.spacing[2]
                  }}>
                    Image URL
                  </label>
                  <Input
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    disabled={isProcessing}
                  />
                </div>

                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleAnalyze}
                  disabled={isProcessing || !imageUrl.trim()}
                >
                  {isAnalyzing ? 'Analyzing...' : 'Analyze Image'}
                </Button>
              </div>
            )}

            {activeTool === 'keywords' && (
              <div>
                <div style={{ marginBottom: tokens.spacing[6] }}>
                  <label style={{
                    display: 'block',
                    fontSize: tokens.typography.fontSize.sm,
                    fontWeight: tokens.typography.fontWeight.medium,
                    color: tokens.colors.text,
                    marginBottom: tokens.spacing[2]
                  }}>
                    Product Description
                  </label>
                  <textarea
                    value={productDescription}
                    onChange={(e) => setProductDescription(e.target.value)}
                    placeholder="Describe your product to generate relevant keywords..."
                    disabled={isProcessing}
                    rows={6}
                    style={{
                      width: '100%',
                      padding: tokens.spacing[3],
                      borderRadius: tokens.radius.lg,
                      border: `1px solid ${tokens.colors.border}`,
                      backgroundColor: tokens.colors.background,
                      color: tokens.colors.text,
                      fontSize: tokens.typography.fontSize.base,
                      fontFamily: 'inherit',
                      resize: 'vertical'
                    }}
                  />
                </div>

                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleGenerateKeywords}
                  disabled={isProcessing || !productDescription.trim()}
                >
                  {isGenerating ? 'Generating...' : 'Generate Keywords'}
                </Button>
              </div>
            )}

            {activeTool === 'seo' && (
              <div>
                <div style={{ marginBottom: tokens.spacing[6] }}>
                  <label style={{
                    display: 'block',
                    fontSize: tokens.typography.fontSize.sm,
                    fontWeight: tokens.typography.fontWeight.medium,
                    color: tokens.colors.text,
                    marginBottom: tokens.spacing[2]
                  }}>
                    Listing URL
                  </label>
                  <Input
                    value={seoUrl}
                    onChange={(e) => setSeoUrl(e.target.value)}
                    placeholder="https://etsy.com/listing/..."
                    disabled={isProcessing}
                  />
                </div>

                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleSeoAudit}
                  disabled={isProcessing || !seoUrl.trim()}
                >
                  {isAuditing ? 'Auditing...' : 'Run SEO Audit'}
                </Button>
              </div>
            )}
          </Card>

          {/* Results Section */}
          {result && (
            <Card padding="8" style={{ marginTop: tokens.spacing[6] }}>
              <h3 style={{
                fontSize: tokens.typography.fontSize.xl,
                fontWeight: tokens.typography.fontWeight.semibold,
                color: tokens.colors.text,
                marginBottom: tokens.spacing[4]
              }}>
                Results
              </h3>
              <pre style={{
                backgroundColor: tokens.colors.backgroundAlt,
                padding: tokens.spacing[4],
                borderRadius: tokens.radius.lg,
                overflow: 'auto',
                fontSize: tokens.typography.fontSize.sm,
                color: tokens.colors.text
              }}>
                {JSON.stringify(result, null, 2)}
              </pre>
            </Card>
          )}
        </Container>
      </main>

      <Footer />
    </>
  )
}

export default function OptimizePage() {
  return (
    <Suspense fallback={
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#0B0F14'
      }}>
        <div style={{
          width: '3rem',
          height: '3rem',
          border: '3px solid #2A3441',
          borderTop: '3px solid #00B3FF',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
      </div>
    }>
      <OptimizeContent />
    </Suspense>
  )
}
