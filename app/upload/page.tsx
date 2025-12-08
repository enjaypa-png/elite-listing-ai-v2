'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Container, Button, Card } from '@/components/ui';
import { StepLayout, ProgressIndicator, InfoTooltip } from '@/components/workflow';
import { TopNav, Breadcrumbs } from '@/components/navigation';
import tokens from '@/design-system/tokens.json';
import { createClient } from '@supabase/supabase-js';

// Client-side Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Helper function to compress image before upload
// IMPORTANT: Keep maxWidthOrHeight high to preserve quality for Etsy (3000x2250 recommended)
async function compressImage(file: File, maxWidthOrHeight = 4000): Promise<File> {
  return new Promise((resolve, reject) => {
    // If file is already small enough, skip compression
    if (file.size < 1.5 * 1024 * 1024) {  // Under 1.5MB
      console.log('[Image Compression] Skipping - file already small:', (file.size / 1024).toFixed(0) + 'KB');
      resolve(file);
      return;
    }
    
    // Create object URL from blob (no base64)
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();
    
    img.onload = () => {
      // Clean up object URL
      URL.revokeObjectURL(objectUrl);
      
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;

      // Calculate new dimensions while maintaining aspect ratio
      // Only resize if larger than maxWidthOrHeight
      if (width > height) {
        if (width > maxWidthOrHeight) {
          height = (height * maxWidthOrHeight) / width;
          width = maxWidthOrHeight;
        }
      } else {
        if (height > maxWidthOrHeight) {
          width = (width * maxWidthOrHeight) / height;
          height = maxWidthOrHeight;
        }
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }
      
      ctx.drawImage(img, 0, 0, width, height);

      // Convert to blob with quality 0.85 to preserve detail for Etsy
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const compressedFile = new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now(),
            });
            console.log('[Image Compression]', {
              originalSize: `${(file.size / 1024).toFixed(0)}KB`,
              compressedSize: `${(compressedFile.size / 1024).toFixed(0)}KB`,
              originalDimensions: `${img.width}x${img.height}`,
              newDimensions: `${Math.round(width)}x${Math.round(height)}`,
              reduction: `${(((file.size - compressedFile.size) / file.size) * 100).toFixed(1)}%`
            });
            resolve(compressedFile);
          } else {
            reject(new Error('Failed to compress image'));
          }
        },
        'image/jpeg',
        0.85  // Higher quality to preserve detail for Etsy optimization
      );
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Failed to load image'));
    };
    
    img.src = objectUrl;
  });
}

export default function UploadPage() {
  const router = useRouter();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('home_decor_wall_art'); // Default for testing
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<any>(null);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizedPhoto, setOptimizedPhoto] = useState<any>(null);
  const [optimizedScore, setOptimizedScore] = useState<number | null>(null);
  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Check auth status on mount
  useEffect(() => {
    if (!supabaseUrl || !supabaseAnonKey) {
      setAuthLoading(false);
      return;
    }
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user || null);
      } catch (error) {
        console.error('[Auth] Error checking session:', error);
      } finally {
        setAuthLoading(false);
      }
    };
    
    checkAuth();
    
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });
    
    return () => subscription.unsubscribe();
  }, []);

  // Cleanup preview URL on unmount
  useEffect(() => {
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Cleanup old preview URL
      if (preview) {
        URL.revokeObjectURL(preview);
      }
      
      setSelectedFile(file);
      
      // Create preview using URL.createObjectURL (no base64)
      const objectUrl = URL.createObjectURL(file);
      setPreview(objectUrl);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedFile || !preview) return;

    setIsAnalyzing(true);

    try {
      // Compress image before upload (especially important for iPhone photos)
      console.log('[Upload] Original file size:', (selectedFile.size / 1024 / 1024).toFixed(2), 'MB');
      const compressedFile = await compressImage(selectedFile);
      
      // Verify compressed size is reasonable
      const compressedSizeMB = compressedFile.size / 1024 / 1024;
      console.log('[Upload] Compressed file size:', compressedSizeMB.toFixed(2), 'MB');
      
      if (compressedSizeMB > 4) {
        throw new Error('Compressed image is still too large. Please use a smaller photo.');
      }
      
      // Analyze image directly with new endpoint
      const formData = new FormData();
      formData.append('image', compressedFile);
      formData.append('category', selectedCategory);

      const analyzeResponse = await fetch('/api/analyze-image', {
        method: 'POST',
        body: formData
      });

      // Handle non-JSON responses (like 413 Payload Too Large)
      const contentType = analyzeResponse.headers.get('content-type');
      if (!analyzeResponse.ok) {
        if (contentType && contentType.includes('application/json')) {
          const errorData = await analyzeResponse.json();
          throw new Error(errorData.error || 'Analysis failed');
        } else {
          // Non-JSON error (likely HTML error page)
          const errorText = await analyzeResponse.text();
          if (analyzeResponse.status === 413) {
            throw new Error('Image still too large after compression. Please use a smaller image.');
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
      
      const response = await fetch('/api/optimize/photo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl: analysisResults.imageUrl,
          category: selectedCategory
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setOptimizedPhoto({
          url: data.optimizedUrl,
          improvements: data.improvements || [],
          alreadyOptimized: data.alreadyOptimized || false,
          scoreImprovement: data.scoreImprovement || 0,
          message: data.message || ''
        });
        
        // Use the score returned from the optimizer directly
        setOptimizedScore(data.newScore);
        console.log('[Photo Optimizer] Complete - New score:', data.newScore, 
                   'Improvement:', data.scoreImprovement);
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
          {/* Category Selector */}
          <Card>
            <div style={{ padding: tokens.spacing[6], marginBottom: tokens.spacing[4] }}>
              <label style={{
                display: 'block',
                fontSize: tokens.typography.fontSize.sm,
                fontWeight: tokens.typography.fontWeight.semibold,
                color: tokens.colors.text,
                marginBottom: tokens.spacing[2]
              }}>
                Product Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                style={{
                  width: '100%',
                  padding: tokens.spacing[3],
                  fontSize: tokens.typography.fontSize.base,
                  color: tokens.colors.text,
                  background: tokens.colors.surface,
                  border: `1px solid ${tokens.colors.border}`,
                  borderRadius: tokens.radius.md,
                  cursor: 'pointer'
                }}
              >
                <option value="small_jewelry">Small Jewelry</option>
                <option value="flat_artwork">Flat Artwork (Prints/Paintings)</option>
                <option value="wearables_clothing">Clothing</option>
                <option value="wearables_accessories">Accessories (Bags/Scarves)</option>
                <option value="home_decor_wall_art">Home Decor & Wall Art</option>
                <option value="furniture">Furniture</option>
                <option value="small_crafts">Small Crafts</option>
                <option value="craft_supplies">Craft Supplies</option>
                <option value="vintage_items">Vintage Items</option>
                <option value="digital_products">Digital Products</option>
              </select>
            </div>
          </Card>
          
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
                  <div 
                    contentEditable={false}
                    tabIndex={-1}
                    style={{
                      marginBottom: tokens.spacing[6],
                      position: 'relative',
                      caretColor: 'transparent',
                      cursor: 'default',
                      userSelect: 'none',
                      WebkitUserSelect: 'none',
                      MozUserSelect: 'none',
                      msUserSelect: 'none'
                    }}>
                    <img
                      src={preview}
                      alt="Product preview"
                      draggable={false}
                      style={{
                        width: '100%',
                        maxHeight: '400px',
                        objectFit: 'contain',
                        borderRadius: tokens.radius.lg,
                        background: tokens.colors.background,
                        display: 'block',
                        pointerEvents: 'none'
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
                      {optimizedPhoto.alreadyOptimized 
                        ? 'Image Fully Optimized' 
                        : 'Photo Optimized Successfully'}
                    </h3>
                    
                    {optimizedPhoto.alreadyOptimized && (
                      <p style={{
                        fontSize: 'clamp(1rem, 3vw, 1.125rem)',
                        color: tokens.colors.textMuted,
                        textAlign: 'center',
                        marginBottom: tokens.spacing[6],
                        padding: tokens.spacing[4],
                        background: `${tokens.colors.primary}15`,
                        borderRadius: tokens.radius.md
                      }}>
                        This image is optimized to the maximum quality achievable.
                      </p>
                    )}
                    
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
                    
                    {/* Improvements List - only show if improvements were actually made */}
                    {optimizedPhoto.improvements && optimizedPhoto.improvements.length > 0 && !optimizedPhoto.alreadyOptimized && (
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
                    )}
                    
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
