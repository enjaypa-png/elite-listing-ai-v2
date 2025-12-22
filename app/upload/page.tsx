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
// Keep dimensions reasonable for Etsy (3000x2250 recommended max)
async function compressImage(file: File, maxWidthOrHeight = 3000): Promise<File> {
  return new Promise((resolve, reject) => {
    // If file is already under 1MB, skip compression (Etsy limit)
    if (file.size < 1 * 1024 * 1024) {
      console.log('[Image Compression] Skipping - already under 1MB:', (file.size / 1024).toFixed(0) + 'KB');
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
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<any>(null);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizedPhoto, setOptimizedPhoto] = useState<any>(null);
  const [optimizedScore, setOptimizedScore] = useState<number | null>(null);
  const [optimizedListing, setOptimizedListing] = useState<any>(null);
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

  // Cleanup preview URLs on unmount
  useEffect(() => {
    return () => {
      previews.forEach(preview => URL.revokeObjectURL(preview));
    };
  }, [previews]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    // Validate: 2-10 images
    if (files.length < 2) {
      alert('Please select at least 2 images for your listing.');
      return;
    }
    if (files.length > 10) {
      alert('Maximum 10 images allowed per listing.');
      return;
    }
    
    // Cleanup old preview URLs
    previews.forEach(preview => URL.revokeObjectURL(preview));
    
    setSelectedFiles(files);
    
    // Create previews for all files
    const objectUrls = files.map(file => URL.createObjectURL(file));
    setPreviews(objectUrls);
  };
  
  const handleRemoveImage = (index: number) => {
    // Revoke URL for removed image
    URL.revokeObjectURL(previews[index]);
    
    // Remove from arrays
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    const newPreviews = previews.filter((_, i) => i !== index);
    
    setSelectedFiles(newFiles);
    setPreviews(newPreviews);
    
    // Clear results if all images removed
    if (newFiles.length === 0) {
      setAnalysisResults(null);
      setOptimizedPhoto(null);
    }
  };

  const handleAnalyze = async () => {
    if (selectedFiles.length === 0) return;

    setIsAnalyzing(true);

    try {
      // Compress all images before upload
      console.log(`[Upload] Compressing ${selectedFiles.length} images...`);
      const compressedFiles: File[] = [];
      
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        console.log(`[Upload] Image ${i + 1}: Original size ${(file.size / 1024 / 1024).toFixed(2)} MB`);
        
        const compressed = await compressImage(file);
        const compressedSizeMB = compressed.size / 1024 / 1024;
        console.log(`[Upload] Image ${i + 1}: Compressed size ${compressedSizeMB.toFixed(2)} MB`);
        
        if (compressedSizeMB > 4) {
          throw new Error(`Image ${i + 1} is too large. Please use smaller photos.`);
        }
        
        compressedFiles.push(compressed);
      }
      
      // Call new listing analysis endpoint with ALL images
      const formData = new FormData();
      compressedFiles.forEach((file, index) => {
        formData.append(`image_${index}`, file);
      });
      formData.append('category', 'single_image_scoring');

      console.log(`[Upload] Calling /api/analyze-listing with ${compressedFiles.length} images`);

      const analyzeResponse = await fetch('/api/analyze-listing', {
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

  const handleOptimizeListing = async () => {
    // Check if we have analysis results and images
    if (!analysisResults || selectedFiles.length === 0) return;
    
    // REQUIRE analysis_id - scores are read from DB
    if (!analysisResults?.analysis_id) {
      alert('No analysis found. Please analyze your photos first.');
      return;
    }
    
    setIsOptimizing(true);
    try {
      console.log('[Listing Optimizer] Starting optimization of', selectedFiles.length, 'images with analysis_id:', analysisResults.analysis_id);
      
      // Compress all images before sending
      const compressedFiles: File[] = [];
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        const compressed = await compressImage(file);
        compressedFiles.push(compressed);
      }
      
      // Build FormData with all images
      const formData = new FormData();
      compressedFiles.forEach((file, index) => {
        formData.append(`image_${index}`, file);
      });
      
      // Pass only analysis_id - scores are read from DB (deterministic)
      formData.append('analysis_id', analysisResults.analysis_id);
      
      console.log('[Listing Optimizer] Sending images with analysis_id (scores from DB)');
      
      const response = await fetch('/api/optimize-listing', {
        method: 'POST',
        body: formData
      });
      
      const data = await response.json();
      
      if (data.success) {
        console.log('[Listing Optimizer] Complete:', data);
        setOptimizedListing({
          originalScore: data.originalListingScore,
          newScore: data.newListingScore,
          improvement: data.overallImprovement,
          images: data.optimizedImages,
          message: data.message
        });
      } else {
        alert('Failed to optimize listing: ' + data.error);
      }
    } catch (error: any) {
      console.error('Listing optimization failed:', error);
      alert('Failed to optimize listing. Please try again.');
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
    setOptimizedListing(null);
    setAnalysisResults(null);
    setPreviews([]);
    setSelectedFiles([]);
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
              {previews.length === 0 ? (
                <label style={{
                  display: 'block',
                  cursor: 'pointer'
                }}>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
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
                      Upload Your Listing Photos
                    </p>
                    <p style={{
                      fontSize: tokens.typography.fontSize.base,
                      color: tokens.colors.textMuted
                    }}>
                      Select 2-10 images • PNG, JPG, or WEBP (max 10MB each)
                    </p>
                    <p style={{
                      fontSize: tokens.typography.fontSize.sm,
                      color: tokens.colors.textMuted,
                      marginTop: tokens.spacing[2]
                    }}>
                      First image will be your main listing photo
                    </p>
                  </div>
                </label>
              ) : (
                <div>
                  {/* Thumbnail Grid */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
                    gap: tokens.spacing[3],
                    marginBottom: tokens.spacing[6]
                  }}>
                    {previews.map((preview, index) => (
                      <div key={index} style={{
                        position: 'relative',
                        aspectRatio: '1',
                        border: `2px solid ${index === 0 ? tokens.colors.primary : tokens.colors.border}`,
                        borderRadius: tokens.radius.md,
                        overflow: 'hidden',
                        background: tokens.colors.surface
                      }}>
                        {/* Main Image Badge */}
                        {index === 0 && (
                          <div style={{
                            position: 'absolute',
                            top: tokens.spacing[2],
                            left: tokens.spacing[2],
                            background: tokens.colors.primary,
                            color: 'white',
                            padding: `${tokens.spacing[1]} ${tokens.spacing[2]}`,
                            borderRadius: tokens.radius.sm,
                            fontSize: tokens.typography.fontSize.xs,
                            fontWeight: tokens.typography.fontWeight.semibold,
                            zIndex: 2
                          }}>
                            Main Image
                          </div>
                        )}
                        
                        {/* Image */}
                        <img
                          src={preview}
                          alt={`Product ${index + 1}`}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover'
                          }}
                        />
                        
                        {/* Remove Button */}
                        <button
                          onClick={() => handleRemoveImage(index)}
                          style={{
                            position: 'absolute',
                            top: tokens.spacing[2],
                            right: tokens.spacing[2],
                            background: 'rgba(0,0,0,0.7)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '50%',
                            width: '24px',
                            height: '24px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            fontSize: '14px',
                            zIndex: 2
                          }}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                  
                  {/* Original single image preview removed - now using grid above */}
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
                      msUserSelect: 'none',
                      display: 'none'
                    }}>
                    <img
                      src={previews[0] || ''}
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
                  </div>

                  {/* Upload More Button */}
                  <label style={{
                    display: 'block',
                    marginBottom: tokens.spacing[4]
                  }}>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleFileSelect}
                      style={{ display: 'none' }}
                    />
                    <Button
                      variant="secondary"
                      size="md"
                      fullWidth
                      onClick={(e: any) => e.preventDefault()}
                      style={{ cursor: 'pointer' }}
                    >
                      📤 Add More Images ({selectedFiles.length}/10)
                    </Button>
                  </label>

                  {/* Analyze Listing Button */}
                  <Button
                    variant="primary"
                    size="lg"
                    fullWidth
                    onClick={handleAnalyze}
                    disabled={isAnalyzing || selectedFiles.length < 2}
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
                        Analyzing your listing...
                      </>
                    ) : (
                      <>
                        {'Analyze Listing (' + selectedFiles.length + ' images)'}
                      </>
                    )}
                  </Button>

                  {/* Hidden - keeping for compatibility */}
                  <label style={{
                    display: 'none',
                    marginTop: tokens.spacing[3],
                    textAlign: 'center',
                    cursor: 'pointer'
                  }}>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
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
                  📊 Listing Analysis Results
                </h2>
                
                {/* Overall Listing Score */}
                <div style={{
                  padding: tokens.spacing[6],
                  background: tokens.colors.background,
                  borderRadius: tokens.radius.md,
                  marginBottom: tokens.spacing[6],
                  border: `2px solid ${tokens.colors.primary}`
                }}>
                  <div style={{
                    fontSize: tokens.typography.fontSize['4xl'],
                    fontWeight: tokens.typography.fontWeight.bold,
                    color: tokens.colors.primary,
                    textAlign: 'center',
                    marginBottom: tokens.spacing[2]
                  }}>
                    {analysisResults.overallListingScore || analysisResults.score || 0}/100
                  </div>
                  <div style={{
                    textAlign: 'center',
                    color: tokens.colors.textMuted,
                    fontSize: tokens.typography.fontSize.base,
                    marginBottom: tokens.spacing[4]
                  }}>
                    Overall Listing Score
                  </div>
                  {analysisResults.imageCount && (
                    <div style={{
                      textAlign: 'center',
                      fontSize: tokens.typography.fontSize.sm,
                      color: tokens.colors.textMuted
                    }}>
                      {analysisResults.imageCount} images analyzed
                    </div>
                  )}
                </div>
                
                {/* Photo Type Variety */}
                {analysisResults.detectedPhotoTypes && (
                  <div style={{
                    padding: tokens.spacing[5],
                    background: tokens.colors.surface,
                    borderRadius: tokens.radius.md,
                    marginBottom: tokens.spacing[6]
                  }}>
                    <h3 style={{
                      fontSize: tokens.typography.fontSize.base,
                      fontWeight: tokens.typography.fontWeight.semibold,
                      color: tokens.colors.text,
                      marginBottom: tokens.spacing[3]
                    }}>
                      📷 Photo Variety
                    </h3>
                    
                    {/* Detected Types */}
                    {analysisResults.detectedPhotoTypes.length > 0 && (
                      <div style={{ marginBottom: tokens.spacing[3] }}>
                        <div style={{
                          fontSize: tokens.typography.fontSize.sm,
                          color: tokens.colors.success,
                          marginBottom: tokens.spacing[2]
                        }}>
                          ✅ Detected:
                        </div>
                        <div style={{
                          display: 'flex',
                          flexWrap: 'wrap',
                          gap: tokens.spacing[2]
                        }}>
                          {analysisResults.detectedPhotoTypes.map((type: string) => (
                            <span key={type} style={{
                              padding: `${tokens.spacing[1]} ${tokens.spacing[3]}`,
                              background: `${tokens.colors.success}15`,
                              border: `1px solid ${tokens.colors.success}30`,
                              borderRadius: tokens.radius.sm,
                              fontSize: tokens.typography.fontSize.sm,
                              color: tokens.colors.text
                            }}>
                              {type.replace('_', ' ')}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Missing Types */}
                    {analysisResults.missingPhotoTypes && analysisResults.missingPhotoTypes.length > 0 && (
                      <div>
                        <div style={{
                          fontSize: tokens.typography.fontSize.sm,
                          color: tokens.colors.warning,
                          marginBottom: tokens.spacing[2]
                        }}>
                          ⚠️ Missing:
                        </div>
                        <ul style={{
                          margin: 0,
                          paddingLeft: tokens.spacing[5],
                          fontSize: tokens.typography.fontSize.sm,
                          color: tokens.colors.textMuted
                        }}>
                          {analysisResults.missingPhotoTypes.map((missing: string, i: number) => (
                            <li key={i}>{missing}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
                
                {/* Individual Image Scores */}
                {analysisResults.imageResults && analysisResults.imageResults.length > 0 && (
                  <div style={{ marginBottom: tokens.spacing[6] }}>
                    <h3 style={{
                      fontSize: tokens.typography.fontSize.base,
                      fontWeight: tokens.typography.fontWeight.semibold,
                      color: tokens.colors.text,
                      marginBottom: tokens.spacing[3]
                    }}>
                      🖼️ Individual Image Scores
                    </h3>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                      gap: tokens.spacing[3]
                    }}>
                      {analysisResults.imageResults.map((result: any, index: number) => (
                        <div key={index} style={{
                          padding: tokens.spacing[4],
                          background: tokens.colors.surface,
                          border: `2px solid ${result.isMainImage ? tokens.colors.primary : tokens.colors.border}`,
                          borderRadius: tokens.radius.md
                        }}>
                          {/* Thumbnail */}
                          {previews[index] && (
                            <div style={{
                              width: '100%',
                              aspectRatio: '1',
                              marginBottom: tokens.spacing[3],
                              borderRadius: tokens.radius.sm,
                              overflow: 'hidden',
                              border: `1px solid ${tokens.colors.border}`
                            }}>
                              <img
                                src={previews[index]}
                                alt={`Image ${index + 1}`}
                                style={{
                                  width: '100%',
                                  height: '100%',
                                  objectFit: 'cover'
                                }}
                              />
                            </div>
                          )}
                          
                          {result.isMainImage && (
                            <div style={{
                              fontSize: tokens.typography.fontSize.xs,
                              fontWeight: tokens.typography.fontWeight.semibold,
                              color: tokens.colors.primary,
                              marginBottom: tokens.spacing[2]
                            }}>
                              MAIN IMAGE
                            </div>
                          )}
                          <div style={{
                            fontSize: tokens.typography.fontSize['2xl'],
                            fontWeight: tokens.typography.fontWeight.bold,
                            color: tokens.colors.text,
                            marginBottom: tokens.spacing[1]
                          }}>
                            {result.score}/100
                          </div>
                          <div style={{
                            fontSize: tokens.typography.fontSize.xs,
                            color: tokens.colors.textMuted
                          }}>
                            Image {index + 1}
                          </div>
                          {result.photoTypes && result.photoTypes.length > 0 && (
                            <div style={{
                              marginTop: tokens.spacing[2],
                              fontSize: tokens.typography.fontSize.xs,
                              color: tokens.colors.textMuted
                            }}>
                              {result.photoTypes.join(', ').replace(/_/g, ' ')}
                            </div>
                          )}
                          
                          {/* AI Issues */}
                          {result.ai_issues && result.ai_issues.length > 0 && (
                            <div style={{
                              marginTop: tokens.spacing[3],
                              padding: tokens.spacing[2],
                              background: `${tokens.colors.warning}15`,
                              borderRadius: tokens.radius.sm,
                              border: `1px solid ${tokens.colors.warning}30`
                            }}>
                              <div style={{
                                fontSize: tokens.typography.fontSize.xs,
                                fontWeight: tokens.typography.fontWeight.semibold,
                                color: tokens.colors.warning,
                                marginBottom: tokens.spacing[1]
                              }}>
                                Issues:
                              </div>
                              {result.ai_issues.map((issue: string, i: number) => (
                                <div key={i} style={{
                                  fontSize: tokens.typography.fontSize.xs,
                                  color: tokens.colors.text,
                                  marginBottom: i < result.ai_issues.length - 1 ? tokens.spacing[1] : 0
                                }}>
                                  • {issue}
                                </div>
                              ))}
                            </div>
                          )}
                          
                          {/* AI Strengths */}
                          {result.ai_strengths && result.ai_strengths.length > 0 && (
                            <div style={{
                              marginTop: tokens.spacing[2],
                              padding: tokens.spacing[2],
                              background: `${tokens.colors.success}15`,
                              borderRadius: tokens.radius.sm,
                              border: `1px solid ${tokens.colors.success}30`
                            }}>
                              <div style={{
                                fontSize: tokens.typography.fontSize.xs,
                                fontWeight: tokens.typography.fontWeight.semibold,
                                color: tokens.colors.success,
                                marginBottom: tokens.spacing[1]
                              }}>
                                Strengths:
                              </div>
                              {result.ai_strengths.slice(0, 3).map((strength: string, i: number) => (
                                <div key={i} style={{
                                  fontSize: tokens.typography.fontSize.xs,
                                  color: tokens.colors.text,
                                  marginBottom: i < Math.min(result.ai_strengths.length, 3) - 1 ? tokens.spacing[1] : 0
                                }}>
                                  ✓ {strength}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Detailed Feedback - 18 Etsy Checks */}
                {analysisResults?.feedback && analysisResults.feedback.length > 0 && (
                  <div style={{ marginBottom: tokens.spacing[6] }}>
                    <h3 style={{
                      fontSize: tokens.typography.fontSize.lg,
                      fontWeight: tokens.typography.fontWeight.semibold,
                      color: tokens.colors.text,
                      marginBottom: tokens.spacing[2]
                    }}>
                      📊 R.A.N.K. 285™ Analysis Complete
                    </h3>
                    <p style={{
                      fontSize: tokens.typography.fontSize.sm,
                      color: tokens.colors.textMuted,
                      marginBottom: tokens.spacing[4]
                    }}>
                      {analysisResults.feedback.length} Etsy optimization checks performed
                    </p>
                    
                    {/* Critical Issues */}
                    {analysisResults.feedback.filter((f: any) => f.status === 'critical').length > 0 && (
                      <div style={{ marginBottom: tokens.spacing[4] }}>
                        <h4 style={{
                          fontSize: tokens.typography.fontSize.sm,
                          fontWeight: tokens.typography.fontWeight.semibold,
                          color: tokens.colors.error,
                          marginBottom: tokens.spacing[2],
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em'
                        }}>
                          ❌ Critical Issues ({analysisResults.feedback.filter((f: any) => f.status === 'critical').length})
                        </h4>
                        <ul style={{ margin: 0, paddingLeft: 0, listStyle: 'none' }}>
                          {analysisResults.feedback
                            .filter((f: any) => f.status === 'critical')
                            .map((f: any, i: number) => (
                              <li key={i} style={{
                                padding: tokens.spacing[3],
                                marginBottom: tokens.spacing[2],
                                background: `${tokens.colors.error}10`,
                                border: `1px solid ${tokens.colors.error}30`,
                                borderRadius: tokens.radius.sm,
                                color: tokens.colors.text,
                                fontSize: tokens.typography.fontSize.sm
                              }}>
                                {f.message}
                              </li>
                            ))}
                        </ul>
                      </div>
                    )}
                    
                    {/* Recommendations */}
                    {analysisResults.feedback.filter((f: any) => f.status === 'warning').length > 0 && (
                      <div style={{ marginBottom: tokens.spacing[4] }}>
                        <h4 style={{
                          fontSize: tokens.typography.fontSize.sm,
                          fontWeight: tokens.typography.fontWeight.semibold,
                          color: tokens.colors.warning,
                          marginBottom: tokens.spacing[2],
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em'
                        }}>
                          ⚠️ Recommendations ({analysisResults.feedback.filter((f: any) => f.status === 'warning').length})
                        </h4>
                        <ul style={{ margin: 0, paddingLeft: 0, listStyle: 'none' }}>
                          {analysisResults.feedback
                            .filter((f: any) => f.status === 'warning')
                            .map((f: any, i: number) => (
                              <li key={i} style={{
                                padding: tokens.spacing[3],
                                marginBottom: tokens.spacing[2],
                                background: `${tokens.colors.warning}10`,
                                border: `1px solid ${tokens.colors.warning}30`,
                                borderRadius: tokens.radius.sm,
                                color: tokens.colors.text,
                                fontSize: tokens.typography.fontSize.sm
                              }}>
                                {f.message}
                              </li>
                            ))}
                        </ul>
                      </div>
                    )}
                    
                    {/* What's Working */}
                    {analysisResults.feedback.filter((f: any) => f.status === 'passed').length > 0 && (
                      <div style={{ marginBottom: tokens.spacing[4] }}>
                        <h4 style={{
                          fontSize: tokens.typography.fontSize.sm,
                          fontWeight: tokens.typography.fontWeight.semibold,
                          color: tokens.colors.success,
                          marginBottom: tokens.spacing[2],
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em'
                        }}>
                          ✅ What's Working ({analysisResults.feedback.filter((f: any) => f.status === 'passed').length})
                        </h4>
                        <ul style={{ margin: 0, paddingLeft: 0, listStyle: 'none' }}>
                          {analysisResults.feedback
                            .filter((f: any) => f.status === 'passed')
                            .map((f: any, i: number) => (
                              <li key={i} style={{
                                padding: tokens.spacing[3],
                                marginBottom: tokens.spacing[2],
                                background: `${tokens.colors.success}10`,
                                border: `1px solid ${tokens.colors.success}30`,
                                borderRadius: tokens.radius.sm,
                                color: tokens.colors.text,
                                fontSize: tokens.typography.fontSize.sm
                              }}>
                                {f.message}
                              </li>
                            ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
                
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
                {/* Listing Optimization Section */}
                {!optimizedListing ? (
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
                      🚀 Optimize All Photos
                    </h3>
                    <p style={{
                      fontSize: 'clamp(0.875rem, 2.5vw, 1rem)',
                      color: tokens.colors.textMuted,
                      marginBottom: tokens.spacing[4]
                    }}>
                      Automatically optimize all {selectedFiles.length} photos for Etsy. We'll resize to 3000×2250, enhance lighting, sharpen details, and compress for fast loading.
                    </p>
                    <Button
                      variant="primary"
                      size="lg"
                      fullWidth
                      onClick={handleOptimizeListing}
                      disabled={isOptimizing || selectedFiles.length === 0}
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
                          Optimizing {selectedFiles.length} photos...
                        </>
                      ) : (
                        `Optimize All ${selectedFiles.length} Photos`
                      )}
                    </Button>
                  </div>
                ) : (
                  <div style={{
                    marginTop: tokens.spacing[6]
                  }}>
                    {/* Listing Optimization Results Header */}
                    <div style={{
                      textAlign: 'center',
                      marginBottom: tokens.spacing[6]
                    }}>
                      <div style={{
                        fontSize: 'clamp(2rem, 4vw, 3rem)',
                        marginBottom: tokens.spacing[2]
                      }}>
                        ✨
                      </div>
                      <h3 style={{
                        fontSize: 'clamp(1.25rem, 3vw, 1.5rem)',
                        fontWeight: tokens.typography.fontWeight.bold,
                        color: tokens.colors.success,
                        marginBottom: tokens.spacing[2]
                      }}>
                        Listing Photos Optimized!
                      </h3>
                      <p style={{
                        fontSize: tokens.typography.fontSize.base,
                        color: tokens.colors.textMuted
                      }}>
                        {optimizedListing.message}
                      </p>
                    </div>
                    
                    {/* Overall Score Comparison */}
                    <div style={{
                      padding: tokens.spacing[5],
                      background: `${tokens.colors.primary}10`,
                      borderRadius: tokens.radius.md,
                      border: `1px solid ${tokens.colors.primary}30`,
                      textAlign: 'center',
                      marginBottom: tokens.spacing[6]
                    }}>
                      <div style={{
                        fontSize: tokens.typography.fontSize.sm,
                        color: tokens.colors.textMuted,
                        marginBottom: tokens.spacing[2]
                      }}>
                        Your Listing Score
                      </div>
                      <div style={{
                        fontSize: 'clamp(1.5rem, 4vw, 2rem)',
                        fontWeight: tokens.typography.fontWeight.bold,
                        color: tokens.colors.text,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: tokens.spacing[3]
                      }}>
                        <span>{optimizedListing.originalScore}</span>
                        <span style={{ color: tokens.colors.textMuted }}>→</span>
                        <span style={{ color: tokens.colors.success }}>{optimizedListing.newScore}</span>
                        {optimizedListing.improvement > 0 && (
                          <span style={{ 
                            fontSize: tokens.typography.fontSize.lg,
                            color: tokens.colors.success,
                            fontWeight: tokens.typography.fontWeight.semibold
                          }}>
                            (+{optimizedListing.improvement})
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {/* Individual Image Results */}
                    <h4 style={{
                      fontSize: tokens.typography.fontSize.base,
                      fontWeight: tokens.typography.fontWeight.semibold,
                      color: tokens.colors.text,
                      marginBottom: tokens.spacing[3]
                    }}>
                      📥 Download Optimized Photos
                    </h4>
                    
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                      gap: tokens.spacing[3],
                      marginBottom: tokens.spacing[6]
                    }}>
                      {optimizedListing.images && optimizedListing.images.map((img: any, index: number) => (
                        <div key={index} style={{
                          padding: tokens.spacing[3],
                          background: tokens.colors.surface,
                          border: `2px solid ${img.isMainImage ? tokens.colors.primary : tokens.colors.border}`,
                          borderRadius: tokens.radius.md
                        }}>
                          {/* Thumbnail */}
                          {img.optimizedUrl && (
                            <div style={{
                              width: '100%',
                              aspectRatio: '4/3',
                              marginBottom: tokens.spacing[2],
                              borderRadius: tokens.radius.sm,
                              overflow: 'hidden',
                              border: `1px solid ${tokens.colors.border}`
                            }}>
                              <img
                                src={img.optimizedUrl}
                                alt={`Optimized ${index + 1}`}
                                style={{
                                  width: '100%',
                                  height: '100%',
                                  objectFit: 'cover'
                                }}
                              />
                            </div>
                          )}
                          
                          {/* Badge */}
                          {img.isMainImage && (
                            <div style={{
                              fontSize: tokens.typography.fontSize.xs,
                              fontWeight: tokens.typography.fontWeight.semibold,
                              color: tokens.colors.primary,
                              marginBottom: tokens.spacing[1]
                            }}>
                              MAIN IMAGE
                            </div>
                          )}
                          
                          {/* Score Change */}
                          <div style={{
                            fontSize: tokens.typography.fontSize.sm,
                            color: tokens.colors.text,
                            marginBottom: tokens.spacing[2]
                          }}>
                            {img.alreadyOptimized ? (
                              <span style={{ color: tokens.colors.success }}>
                                ✓ Already optimized ({img.newScore}/100)
                              </span>
                            ) : (
                              <>
                                {img.originalScore} → <span style={{ color: tokens.colors.success, fontWeight: 600 }}>{img.newScore}</span>
                                {img.scoreImprovement > 0 && (
                                  <span style={{ color: tokens.colors.success, fontSize: tokens.typography.fontSize.xs }}>
                                    {' '}(+{img.scoreImprovement})
                                  </span>
                                )}
                              </>
                            )}
                          </div>
                          
                          {/* File info */}
                          <div style={{
                            fontSize: tokens.typography.fontSize.xs,
                            color: tokens.colors.textMuted,
                            marginBottom: tokens.spacing[2]
                          }}>
                            {img.metadata?.width}×{img.metadata?.height} • {img.metadata?.fileSizeKB}KB
                          </div>
                          
                          {/* Improvements Applied */}
                          {img.improvements && img.improvements.length > 0 && (
                            <div style={{
                              marginBottom: tokens.spacing[2],
                              padding: tokens.spacing[2],
                              background: `${tokens.colors.success}10`,
                              borderRadius: tokens.radius.sm,
                              border: `1px solid ${tokens.colors.success}30`
                            }}>
                              {img.improvements.map((improvement: string, i: number) => (
                                <div key={i} style={{
                                  fontSize: tokens.typography.fontSize.xs,
                                  color: tokens.colors.text,
                                  marginBottom: i < img.improvements.length - 1 ? tokens.spacing[1] : 0
                                }}>
                                  {improvement}
                                </div>
                              ))}
                            </div>
                          )}
                          
                          {/* Download Button */}
                          {img.optimizedUrl && (
                            <Button
                              variant="secondary"
                              size="sm"
                              fullWidth
                              onClick={() => downloadImage(img.optimizedUrl, `optimized-${index + 1}-${Date.now()}.jpg`)}
                            >
                              📥 Download
                            </Button>
                          )}
                        </div>
                      ))}
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
                        onClick={() => {
                          // Download all images
                          optimizedListing.images?.forEach((img: any, index: number) => {
                            if (img.optimizedUrl) {
                              setTimeout(() => {
                                downloadImage(img.optimizedUrl, `optimized-${index + 1}-${Date.now()}.jpg`);
                              }, index * 500); // Stagger downloads
                            }
                          });
                        }}
                        style={{
                          minHeight: '56px',
                          fontSize: 'clamp(1rem, 3vw, 1.125rem)',
                          fontWeight: tokens.typography.fontWeight.bold
                        }}
                      >
                        📥 Download All {optimizedListing.images?.length || 0} Photos
                      </Button>
                      <Button
                        variant="secondary"
                        size="md"
                        fullWidth
                        onClick={resetOptimization}
                      >
                        Upload & Optimize Another Listing
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
                      setSelectedFiles([]);
                      setPreviews([]);
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
