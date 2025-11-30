'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Container, Button, Card } from '@/components/ui';
import { StepLayout, ProgressIndicator, InfoTooltip } from '@/components/workflow';
import { TopNav, Breadcrumbs } from '@/components/navigation';
import tokens from '@/design-system/tokens.json';

export default function UploadPage() {
  const router = useRouter();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<any>(null);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizedPhoto, setOptimizedPhoto] = useState<any>(null);
  const [optimizedScore, setOptimizedScore] = useState<number | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedFile || !preview) return;

    setIsAnalyzing(true);

    try {
      // Create optimization ID
      const optimizationId = `opt_${Date.now()}`;
      
      // Step 1: Upload file to storage
      const formData = new FormData();
      formData.append('image', selectedFile);

      const uploadResponse = await fetch('/api/upload/image', {
        method: 'POST',
        body: formData
      });

      // Handle non-JSON responses (like 413 Payload Too Large)
      const contentType = uploadResponse.headers.get('content-type');
      if (!uploadResponse.ok) {
        if (contentType && contentType.includes('application/json')) {
          const errorData = await uploadResponse.json();
          throw new Error(errorData.error?.message || 'Upload failed');
        } else {
          // Non-JSON error (likely HTML error page)
          const errorText = await uploadResponse.text();
          if (uploadResponse.status === 413) {
            throw new Error('Image is too large. Please try a smaller image (max 10MB).');
          }
          throw new Error(`Upload failed (${uploadResponse.status}): ${errorText.substring(0, 100)}`);
        }
      }

      const uploadData = await uploadResponse.json();
      const imageUrl = uploadData.imageUrl;

      // Step 2: Analyze the uploaded image
      const analyzeResponse = await fetch('/api/optimize/image/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl: imageUrl,
          platform: 'etsy'
        })
      });

      // Handle non-JSON responses
      const analyzeContentType = analyzeResponse.headers.get('content-type');
      if (!analyzeResponse.ok) {
        if (analyzeContentType && analyzeContentType.includes('application/json')) {
          const errorData = await analyzeResponse.json();
          throw new Error(errorData.error?.message || 'Analysis failed');
        } else {
          // Non-JSON error
          const errorText = await analyzeResponse.text();
          if (analyzeResponse.status === 413) {
            throw new Error('Image analysis payload too large. Please contact support.');
          }
          throw new Error(`Analysis failed (${analyzeResponse.status}): ${errorText.substring(0, 100)}`);
        }
      }

      const analysisData = await analyzeResponse.json();

      // Show results inline instead of redirecting
      setAnalysisResults(analysisData);
      setIsAnalyzing(false);
    } catch (error: any) {
      console.error('Upload error:', error);
      alert(error.message || 'Upload failed. Please try again.');
      setIsAnalyzing(false);
    }
  };

  const handleOptimizePhoto = async () => {
    if (!analysisResults || !analysisResults.imageUrl) return;
    
    setIsOptimizing(true);
    try {
      console.log('[Photo Optimizer] Starting optimization...');
      
      // Extract issues from analysis
      const issues: string[] = [];
      if (analysisResults.suggestions) {
        analysisResults.suggestions.forEach((suggestion: string) => {
          const lower = suggestion.toLowerCase();
          if (lower.includes('lighting') || lower.includes('bright')) issues.push('lighting');
          if (lower.includes('clarity') || lower.includes('sharp') || lower.includes('blur')) issues.push('clarity');
        });
      }
      
      const response = await fetch('/api/optimize/photo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl: analysisResults.imageUrl,
          issues
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setOptimizedPhoto({
          url: data.optimizedUrl,
          improvements: data.improvements
        });
        
        console.log('[Photo Optimizer] Optimization complete, re-analyzing...');
        
        // Re-analyze optimized photo to show improved score
        const reanalysisResponse = await fetch('/api/optimize/image/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageUrl: data.optimizedUrl })
        });
        
        const reanalysisData = await reanalysisResponse.json();
        if (reanalysisData.success) {
          setOptimizedScore(reanalysisData.score);
          console.log('[Photo Optimizer] New score:', reanalysisData.score);
        }
      } else {
        alert('Failed to optimize photo: ' + data.error);
      }
    } catch (error: any) {
      console.error('Optimization failed:', error);
      alert('Failed to optimize photo. Please try again.');
    } finally {
      setIsOptimizing(false);
    }
  };

  const downloadImage = async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('Download failed:', error);
      alert('Failed to download image. Please try again.');
    }
  };

  const resetOptimization = () => {
    setOptimizedPhoto(null);
    setOptimizedScore(null);
    setAnalysisResults(null);
    setPreview(null);
    setSelectedFile(null);
  };

  return (
    <>
      <TopNav />
      <Breadcrumbs />
      
      <StepLayout
      header={
        <>
          <h1 style={{
            fontSize: tokens.typography.fontSize['3xl'],
            fontWeight: tokens.typography.fontWeight.bold,
            color: tokens.colors.text,
            marginBottom: tokens.spacing[3],
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: tokens.spacing[3]
          }}>
            Photo Analysis
            <InfoTooltip text="Upload a photo of your product so we can analyze it" />
          </h1>
          <p style={{
            fontSize: tokens.typography.fontSize.lg,
            color: tokens.colors.textMuted
          }}>
            Our AI will analyze your photo for quality, lighting, and composition
          </p>
        </>
      }
    >
      <Container>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          {/* Upload Area */}
          <Card>
            <div style={{ padding: tokens.spacing[12] }}>
              {!preview ? (
                <label style={{
                  display: 'block',
                  cursor: 'pointer'
                }}>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    style={{ display: 'none' }}
                  />
                  <div style={{
                    border: `3px dashed ${tokens.colors.primary}`,
                    borderRadius: tokens.radius.xl,
                    padding: tokens.spacing[12],
                    textAlign: 'center',
                    background: `${tokens.colors.primary}0D`,
                    transition: `all ${tokens.motion.duration.normal} ${tokens.motion.easing.easeInOut}`
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = `${tokens.colors.primary}1A`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = `${tokens.colors.primary}0D`;
                  }}
                  >
                    <div style={{
                      fontSize: tokens.typography.fontSize['6xl'],
                      marginBottom: tokens.spacing[4]
                    }}>
                      📤
                    </div>
                    <p style={{
                      fontSize: tokens.typography.fontSize.xl,
                      fontWeight: tokens.typography.fontWeight.bold,
                      color: tokens.colors.text,
                      marginBottom: tokens.spacing[2]
                    }}>
                      Click to upload or drag and drop
                    </p>
                    <p style={{
                      fontSize: tokens.typography.fontSize.base,
                      color: tokens.colors.textMuted
                    }}>
                      PNG, JPG, or WEBP (max 10MB)
                    </p>
                  </div>
                </label>
              ) : (
                <div>
                  {/* Preview */}
                  <div style={{
                    marginBottom: tokens.spacing[6],
                    position: 'relative'
                  }}>
                    <img
                      src={preview}
                      alt="Product preview"
                      style={{
                        width: '100%',
                        maxHeight: '400px',
                        objectFit: 'contain',
                        borderRadius: tokens.radius.lg,
                        background: tokens.colors.background
                      }}
                    />
                    <button
                      onClick={() => {
                        setSelectedFile(null);
                        setPreview(null);
                      }}
                      style={{
                        position: 'absolute',
                        top: tokens.spacing[3],
                        right: tokens.spacing[3],
                        width: tokens.spacing[10],
                        height: tokens.spacing[10],
                        background: 'rgba(0, 0, 0, 0.8)',
                        color: tokens.colors.text,
                        border: 'none',
                        borderRadius: tokens.radius.full,
                        cursor: 'pointer',
                        fontSize: tokens.typography.fontSize.xl,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      ×
                    </button>
                  </div>

                  {/* Analyze Button */}
                  <Button
                    variant="primary"
                    size="lg"
                    fullWidth
                    onClick={handleAnalyze}
                    disabled={isAnalyzing}
                  >
                    {isAnalyzing ? (
                      <>
                        <span style={{
                          width: tokens.spacing[5],
                          height: tokens.spacing[5],
                          border: `3px solid rgba(255,255,255,0.3)`,
                          borderTopColor: 'white',
                          borderRadius: tokens.radius.full,
                          animation: 'spin 1s linear infinite'
                        }} />
                        Analyzing your photo...
                      </>
                    ) : (
                      <>
                        ✨ Analyze My Photo
                      </>
                    )}
                  </Button>

                  {/* Change Photo */}
                  <label style={{
                    display: 'block',
                    marginTop: tokens.spacing[3],
                    textAlign: 'center',
                    cursor: 'pointer'
                  }}>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      style={{ display: 'none' }}
                    />
                    <span style={{
                      fontSize: tokens.typography.fontSize.sm,
                      color: tokens.colors.primary,
                      textDecoration: 'underline'
                    }}>
                      Upload a different photo
                    </span>
                  </label>
                  
                  {/* Skip to Dashboard */}
                  <div style={{
                    marginTop: tokens.spacing[6],
                    textAlign: 'center',
                    paddingTop: tokens.spacing[6],
                    borderTop: `1px solid ${tokens.colors.border}`
                  }}>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => router.push('/dashboard')}
                    >
                      ← Back to Dashboard
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </Card>
          
          {/* Analysis Results */}
          {analysisResults && (
            <Card>
              <div style={{ padding: tokens.spacing[8], marginTop: tokens.spacing[6] }}>
                <h2 style={{
                  fontSize: tokens.typography.fontSize['2xl'],
                  fontWeight: tokens.typography.fontWeight.semibold,
                  color: tokens.colors.text,
                  marginBottom: tokens.spacing[6]
                }}>
                  📊 Analysis Results
                </h2>
                <div style={{
                  padding: tokens.spacing[6],
                  background: tokens.colors.background,
                  borderRadius: tokens.radius.md,
                  marginBottom: tokens.spacing[4]
                }}>
                  <div style={{
                    fontSize: tokens.typography.fontSize['4xl'],
                    fontWeight: tokens.typography.fontWeight.bold,
                    color: tokens.colors.primary,
                    textAlign: 'center',
                    marginBottom: tokens.spacing[2]
                  }}>
                    {analysisResults.score || 0}/100
                  </div>
                  <div style={{
                    textAlign: 'center',
                    color: tokens.colors.textMuted
                  }}>
                    Overall Photo Quality Score
                  </div>
                </div>
                {analysisResults.suggestions && analysisResults.suggestions.length > 0 && (
                  <div>
                    <h3 style={{
                      fontWeight: tokens.typography.fontWeight.semibold,
                      color: tokens.colors.text,
                      marginBottom: tokens.spacing[3]
                    }}>
                      💡 Suggestions for Improvement:
                    </h3>
                    <ul style={{ margin: 0, paddingLeft: tokens.spacing[6] }}>
                      {analysisResults.suggestions.map((suggestion: string, index: number) => (
                        <li key={index} style={{
                          color: tokens.colors.textMuted,
                          marginBottom: tokens.spacing[2]
                        }}>
                          {suggestion}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {/* Photo Optimization Section */}
                {!optimizedPhoto ? (
                  <div style={{
                    marginTop: tokens.spacing[6],
                    padding: 'clamp(1rem, 3vw, 1.5rem)',
                    background: `linear-gradient(135deg, ${tokens.colors.primary}15, ${tokens.colors.success}15)`,
                    borderRadius: tokens.radius.md,
                    border: `2px solid ${tokens.colors.primary}`
                  }}>
                    <h3 style={{
                      fontSize: 'clamp(1rem, 3vw, 1.25rem)',
                      fontWeight: tokens.typography.fontWeight.bold,
                      color: tokens.colors.text,
                      marginBottom: tokens.spacing[3]
                    }}>
                      AI Photo Optimization
                    </h3>
                    <p style={{
                      fontSize: 'clamp(0.875rem, 2.5vw, 1rem)',
                      color: tokens.colors.textMuted,
                      marginBottom: tokens.spacing[4]
                    }}>
                      Let our AI automatically optimize your photo based on the suggestions above. We'll enhance lighting, improve clarity, and crop to the perfect 1:1 ratio.
                    </p>
                    <Button
                      variant="primary"
                      size="lg"
                      fullWidth
                      onClick={handleOptimizePhoto}
                      disabled={isOptimizing}
                      style={{
                        minHeight: '56px',
                        fontSize: 'clamp(1rem, 3vw, 1.125rem)',
                        fontWeight: tokens.typography.fontWeight.bold
                      }}
                    >
                      {isOptimizing ? (
                        <>
                          <div style={{
                            display: 'inline-block',
                            width: '20px',
                            height: '20px',
                            border: '3px solid rgba(255,255,255,0.3)',
                            borderTopColor: '#FFFFFF',
                            borderRadius: '50%',
                            animation: 'spin 1s linear infinite',
                            marginRight: tokens.spacing[2]
                          }} />
                          Optimizing Photo...
                        </>
                      ) : (
                        'Optimize My Photo with AI'
                      )}
                    </Button>
                  </div>
                ) : (
                  <div style={{
                    marginTop: tokens.spacing[6]
                  }}>
                    <h3 style={{
                      fontSize: 'clamp(1rem, 3vw, 1.25rem)',
                      fontWeight: tokens.typography.fontWeight.bold,
                      color: tokens.colors.success,
                      marginBottom: tokens.spacing[4],
                      textAlign: 'center'
                    }}>
                      Photo Optimized Successfully
                    </h3>
                    
                    {/* Before/After Comparison */}
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                      gap: tokens.spacing[4],
                      marginBottom: tokens.spacing[6]
                    }}>
                      {/* Before */}
                      <div style={{
                        padding: tokens.spacing[4],
                        background: tokens.colors.surface,
                        borderRadius: tokens.radius.md,
                        border: `1px solid ${tokens.colors.border}`
                      }}>
                        <div style={{
                          fontSize: 'clamp(0.875rem, 2.5vw, 1rem)',
                          fontWeight: tokens.typography.fontWeight.semibold,
                          color: tokens.colors.text,
                          marginBottom: tokens.spacing[2],
                          textAlign: 'center'
                        }}>
                          Original ({analysisResults.score}/100)
                        </div>
                        <img
                          src={analysisResults.imageUrl}
                          alt="Original"
                          style={{
                            width: '100%',
                            borderRadius: tokens.radius.md,
                            marginBottom: tokens.spacing[3]
                          }}
                        />
                      </div>
                      
                      {/* After */}
                      <div style={{
                        padding: tokens.spacing[4],
                        background: tokens.colors.surface,
                        borderRadius: tokens.radius.md,
                        border: `2px solid ${tokens.colors.success}`
                      }}>
                        <div style={{
                          fontSize: 'clamp(0.875rem, 2.5vw, 1rem)',
                          fontWeight: tokens.typography.fontWeight.semibold,
                          color: tokens.colors.success,
                          marginBottom: tokens.spacing[2],
                          textAlign: 'center'
                        }}>
                          Optimized {optimizedScore ? `(${optimizedScore}/100)` : '(Analyzing...)'}
                        </div>
                        <img
                          src={optimizedPhoto.url}
                          alt="Optimized"
                          style={{
                            width: '100%',
                            borderRadius: tokens.radius.md,
                            marginBottom: tokens.spacing[3]
                          }}
                        />
                      </div>
                    </div>
                    
                    {/* Improvements List */}
                    <div style={{
                      padding: 'clamp(1rem, 3vw, 1.5rem)',
                      background: `${tokens.colors.success}1A`,
                      border: `1px solid ${tokens.colors.success}33`,
                      borderRadius: tokens.radius.md,
                      marginBottom: tokens.spacing[6]
                    }}>
                      <h4 style={{
                        fontSize: 'clamp(0.875rem, 2.5vw, 1rem)',
                        fontWeight: tokens.typography.fontWeight.semibold,
                        color: tokens.colors.text,
                        marginBottom: tokens.spacing[3]
                      }}>
                        Improvements Applied:
                      </h4>
                      <ul style={{
                        margin: 0,
                        paddingLeft: 'clamp(1rem, 4vw, 1.5rem)',
                        fontSize: 'clamp(0.75rem, 2vw, 0.875rem)',
                        color: tokens.colors.textMuted
                      }}>
                        {optimizedPhoto.improvements.map((imp: string, i: number) => (
                          <li key={i} style={{ marginBottom: tokens.spacing[2] }}>
                            {imp}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    {/* Action Buttons */}
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: tokens.spacing[3]
                    }}>
                      <Button
                        variant="primary"
                        size="lg"
                        fullWidth
                        onClick={() => downloadImage(optimizedPhoto.url, `optimized-photo-${Date.now()}.jpg`)}
                        style={{
                          minHeight: '56px',
                          fontSize: 'clamp(1rem, 3vw, 1.125rem)',
                          fontWeight: tokens.typography.fontWeight.bold
                        }}
                      >
                        📥 Download Optimized Photo
                      </Button>
                      <Button
                        variant="secondary"
                        size="md"
                        fullWidth
                        onClick={resetOptimization}
                      >
                        Upload & Optimize Another Photo
                      </Button>
                    </div>
                  </div>
                )}
                <div style={{ marginTop: tokens.spacing[6], display: 'flex', gap: tokens.spacing[3] }}>
                  <Button
                    variant="secondary"
                    size="md"
                    onClick={() => {
                      setAnalysisResults(null);
                      setSelectedFile(null);
                      setPreview(null);
                    }}
                  >
                    Analyze Another Photo
                  </Button>
                  <Button
                    variant="primary"
                    size="md"
                    onClick={() => router.push('/dashboard')}
                  >
                    Back to Dashboard
                  </Button>
                </div>
              </div>
            </Card>
          )}
        </div>
      </Container>

      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </StepLayout>
    </>
  );
}
