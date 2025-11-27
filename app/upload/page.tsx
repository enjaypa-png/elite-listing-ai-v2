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

  return (
    <>
      <TopNav />
      <Breadcrumbs />
      
      <StepLayout
      header={
        <>
          <ProgressIndicator currentStep={1} />
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
            Step 1: Upload Your Product Photo
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
                      💡 Suggestions:
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
                <div style={{ marginTop: tokens.spacing[6] }}>
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
