'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Container, Button, Card } from '@/components/ui';
import tokens from '@/design-system/tokens.json';

export default function UploadPage() {
  const router = useRouter();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

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
    if (!selectedFile) return;

    setIsAnalyzing(true);

    try {
      // Create optimization ID
      const optimizationId = `opt_${Date.now()}`;
      
      // Upload photo and get analysis
      const formData = new FormData();
      formData.append('image', selectedFile);

      const response = await fetch('/api/optimize/image/analyze', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Analysis failed');
      }

      const analysisData = await response.json();

      // Store in session storage
      const { OptimizationStorage } = await import('@/lib/optimizationState');
      const state = OptimizationStorage.create(optimizationId);
      
      OptimizationStorage.update(optimizationId, {
        photo: {
          original: preview!,
          selected: 'original',
          analysis: analysisData
        }
      });

      // Redirect to photo checkup
      router.push(`/photo-checkup/${optimizationId}`);
    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload failed. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
      paddingTop: '40px'
    }}>
      <Container>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          {/* Progress Indicator */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '16px',
            marginBottom: '40px'
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: '#3B82F6',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold',
              fontSize: '18px'
            }}>
              1
            </div>
            <div style={{ width: '60px', height: '2px', background: '#374151' }} />
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: '#374151',
              color: '#6B7280',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold',
              fontSize: '18px'
            }}>
              2
            </div>
            <div style={{ width: '60px', height: '2px', background: '#374151' }} />
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: '#374151',
              color: '#6B7280',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold',
              fontSize: '18px'
            }}>
              3
            </div>
          </div>

          {/* Header */}
          <div style={{
            textAlign: 'center',
            marginBottom: '40px'
          }}>
            <h1 style={{
              fontSize: '36px',
              fontWeight: 'bold',
              color: '#F9FAFB',
              marginBottom: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px'
            }}>
              Step 1: Upload Your Product Photo
              <span
                title="Upload a photo of your product so we can analyze it"
                style={{
                  width: '28px',
                  height: '28px',
                  background: '#3B82F6',
                  borderRadius: '50%',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '16px',
                  cursor: 'help'
                }}
              >{"ℹ"}</span>
            </h1>
            <p style={{
              fontSize: '18px',
              color: '#9CA3AF'
            }}>
              Our AI will analyze your photo for quality, lighting, and composition
            </p>
          </div>

          {/* Upload Area */}
          <Card>
            <div style={{ padding: '48px' }}>
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
                    border: '3px dashed #3B82F6',
                    borderRadius: '12px',
                    padding: '60px',
                    textAlign: 'center',
                    background: 'rgba(59, 130, 246, 0.05)',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(59, 130, 246, 0.1)';
                    e.currentTarget.style.borderColor = '#60A5FA';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(59, 130, 246, 0.05)';
                    e.currentTarget.style.borderColor = '#3B82F6';
                  }}
                  >
                    <div style={{
                      fontSize: '64px',
                      marginBottom: '16px'
                    }}>
                      📤
                    </div>
                    <p style={{
                      fontSize: '20px',
                      fontWeight: 'bold',
                      color: '#F9FAFB',
                      marginBottom: '8px'
                    }}>
                      Click to upload or drag and drop
                    </p>
                    <p style={{
                      fontSize: '16px',
                      color: '#9CA3AF'
                    }}>
                      PNG, JPG, or WEBP (max 10MB)
                    </p>
                  </div>
                </label>
              ) : (
                <div>
                  {/* Preview */}
                  <div style={{
                    marginBottom: '24px',
                    position: 'relative'
                  }}>
                    <img
                      src={preview}
                      alt="Product preview"
                      style={{
                        width: '100%',
                        maxHeight: '400px',
                        objectFit: 'contain',
                        borderRadius: '8px',
                        background: '#000'
                      }}
                    />
                    <button
                      onClick={() => {
                        setSelectedFile(null);
                        setPreview(null);
                      }}
                      style={{
                        position: 'absolute',
                        top: '12px',
                        right: '12px',
                        width: '36px',
                        height: '36px',
                        background: 'rgba(0, 0, 0, 0.8)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '50%',
                        cursor: 'pointer',
                        fontSize: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      ×
                    </button>
                  </div>

                  {/* Analyze Button */}
                  <button
                    onClick={handleAnalyze}
                    disabled={isAnalyzing}
                    style={{
                      width: '100%',
                      padding: '16px',
                      background: isAnalyzing 
                        ? '#374151' 
                        : 'linear-gradient(135deg, #3B82F6, #10B981)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '18px',
                      fontWeight: 'bold',
                      cursor: isAnalyzing ? 'not-allowed' : 'pointer',
                      minHeight: '56px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '12px'
                    }}
                  >
                    {isAnalyzing ? (
                      <>
                        <span style={{
                          width: '20px',
                          height: '20px',
                          border: '3px solid rgba(255,255,255,0.3)',
                          borderTopColor: 'white',
                          borderRadius: '50%',
                          animation: 'spin 1s linear infinite'
                        }} />
                        Analyzing your photo...
                      </>
                    ) : (
                      <>
                        ✨ Analyze My Photo
                      </>
                    )}
                  </button>

                  {/* Change Photo */}
                  <label style={{
                    display: 'block',
                    marginTop: '12px',
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
                      fontSize: '14px',
                      color: '#60A5FA',
                      textDecoration: 'underline'
                    }}>
                      Upload a different photo
                    </span>
                  </label>
                </div>
              )}
            </div>
          </Card>
        </div>
      </Container>

      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
