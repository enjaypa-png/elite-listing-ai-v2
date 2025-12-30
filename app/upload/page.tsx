'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Container, Button, Card } from '@/components/ui';
import { StepLayout, ProgressIndicator, InfoTooltip } from '@/components/workflow';
import { TopNav, Breadcrumbs } from '@/components/navigation';
import tokens from '@/design-system/tokens.json';
import { createClient } from '@supabase/supabase-js';
import { categorizeIssues, CATEGORY_EXPLANATIONS } from '@/lib/issue-categorization';

// Client-side Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Helper function to compress image before upload
// Aggressive compression for Vercel 4.5MB limit (multiple images must fit)
async function compressImage(file: File, maxWidthOrHeight = 2500): Promise<File> {
  return new Promise((resolve, reject) => {
    // Always compress files over 500KB to stay under Vercel limits
    if (file.size < 500 * 1024) {
      console.log('[Image Compression] Skipping - already under 500KB:', (file.size / 1024).toFixed(0) + 'KB');
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

      // Convert to blob with aggressive compression to fit Vercel 4.5MB limit
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
        0.65  // Aggressive compression to stay under Vercel limits
      );
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Failed to load image'));
    };
    
    img.src = objectUrl;
  });
}

// Helper function to convert technical deductions to plain English
function deductionToPlainEnglish(rule: string): { text: string; icon: string; autoFixable: boolean } {
  const lowerRule = rule.toLowerCase();

  if (lowerRule.includes('thumbnail') || lowerRule.includes('crop')) {
    return { text: 'Main photo is cropped poorly in search results', icon: '❌', autoFixable: true };
  }
  if (lowerRule.includes('blur') || lowerRule.includes('compression')) {
    return { text: 'Photo appears blurry or pixelated', icon: '❌', autoFixable: false };
  }
  if (lowerRule.includes('distinguishable') || lowerRule.includes('visible')) {
    return { text: 'Product is hard to see at a glance', icon: '❌', autoFixable: false };
  }
  if (lowerRule.includes('file size') || lowerRule.includes('1mb')) {
    return { text: 'Image file is too large, slowing down your listing', icon: '❌', autoFixable: true };
  }
  if (lowerRule.includes('lighting') || lowerRule.includes('dark') || lowerRule.includes('bright')) {
    return { text: 'Lighting issues (too dark or too bright)', icon: '❌', autoFixable: true };
  }
  if (lowerRule.includes('resolution') || lowerRule.includes('width') || lowerRule.includes('pixel')) {
    return { text: 'Image resolution is too low', icon: '❌', autoFixable: false };
  }
  if (lowerRule.includes('color') || lowerRule.includes('srgb')) {
    return { text: 'Color profile needs adjustment', icon: '✓', autoFixable: true };
  }

  // Default fallback
  return { text: rule, icon: '❌', autoFixable: false };
}

export default function UploadPage() {
  const router = useRouter();
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [compressedFiles, setCompressedFiles] = useState<File[]>([]); // Store compressed files for optimization
  const [previews, setPreviews] = useState<string[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<any>(null);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizedPhoto, setOptimizedPhoto] = useState<any>(null);
  const [optimizedScore, setOptimizedScore] = useState<number | null>(null);
  const [optimizedListing, setOptimizedListing] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [scoringMode, setScoringMode] = useState<'optimize_images' | 'evaluate_full_listing' | null>('optimize_images'); // Auto-default to simple mode

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

    // Validate: 1-10 images
    if (files.length < 1) {
      alert('Please select at least 1 image.');
      return;
    }
    if (files.length > 10) {
      alert('Maximum 10 images allowed per listing.');
      return;
    }

    // Cleanup old preview URLs
    previews.forEach(preview => URL.revokeObjectURL(preview));

    setSelectedFiles(files);
    setCompressedFiles([]); // Clear compressed files when new files are selected
    setAnalysisResults(null); // Clear analysis results when new files are selected
    setOptimizedListing(null); // Clear optimized results when new files are selected

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
      // Compress ALL images client-side to stay under Vercel 4.5MB limit
      const processedFiles: File[] = [];

      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        const fileSizeKB = file.size / 1024;
        console.log(`[Upload] Image ${i + 1}: ${fileSizeKB.toFixed(0)} KB`);

        // Compress all images over 500KB to ensure total stays under 4.5MB
        if (file.size > 500 * 1024) {
          console.log(`[Upload] Compressing image ${i + 1}...`);
          try {
            const compressedFile = await compressImage(file, 2500);
            const compressedSizeKB = compressedFile.size / 1024;
            console.log(`[Upload] Compressed ${i + 1}: ${fileSizeKB.toFixed(0)}KB → ${compressedSizeKB.toFixed(0)}KB`);
            processedFiles.push(compressedFile);
          } catch (compressionError) {
            console.error('[Upload] Compression failed:', compressionError);
            throw new Error(`Image ${i + 1} compression failed. Please try a different image.`);
          }
        } else {
          console.log(`[Upload] Image ${i + 1} already optimized, skipping compression`);
          processedFiles.push(file);
        }
      }

      console.log(`[Upload] Analyzing ${processedFiles.length} images (compressed for upload)...`);

      // Store compressed files for later optimization
      setCompressedFiles(processedFiles);

      // Call new listing analysis endpoint with processed images
      const formData = new FormData();
      processedFiles.forEach((file, index) => {
        formData.append(`image_${index}`, file);
      });
      formData.append('category', 'single_image_scoring');
      formData.append('mode', scoringMode);  // Pass scoring mode to API

      console.log(`[Upload] Calling /api/analyze-listing with ${processedFiles.length} images (mode: ${scoringMode})`);

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
    // Check if we have analysis results and compressed images
    if (!analysisResults || compressedFiles.length === 0) return;

    // REQUIRE analysis_id - scores are read from DB
    if (!analysisResults?.analysis_id) {
      alert('No analysis found. Please analyze your photos first.');
      return;
    }

    setIsOptimizing(true);
    try {
      console.log('[Listing Optimizer] Starting optimization of', compressedFiles.length, 'compressed images with analysis_id:', analysisResults.analysis_id);

      // Send compressed images (same as analyzed) to stay under Vercel 4.5MB limit
      const formData = new FormData();
      compressedFiles.forEach((file, index) => {
        formData.append(`image_${index}`, file);
      });

      // Pass only analysis_id - scores are read from DB (deterministic)
      formData.append('analysis_id', analysisResults.analysis_id);

      console.log('[Listing Optimizer] Sending compressed images with analysis_id (scores from DB)');

      const response = await fetch('/api/optimize-listing', {
        method: 'POST',
        body: formData
      });

      // Handle non-JSON responses (like 413 Payload Too Large)
      const contentType = response.headers.get('content-type');
      if (!response.ok) {
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Optimization failed');
        } else {
          // Non-JSON error (likely HTML error page)
          const errorText = await response.text();
          if (response.status === 413) {
            throw new Error('Images too large. Please use smaller images.');
          }
          throw new Error(`Optimization failed (${response.status}): ${errorText.substring(0, 100)}`);
        }
      }

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
            <InfoTooltip text="Upload your listing photos so we can find optimization opportunities" />
          </h1>
          <p style={{
            fontSize: tokens.typography.fontSize.lg,
            color: tokens.colors.textMuted
          }}>
            Our AI will analyze your listing images to find hidden opportunities for improvement
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
                      Select 1-10 images • PNG, JPG, or WEBP (max 10MB each)
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
                    disabled={isAnalyzing || selectedFiles.length < 1}
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
                        Analyzing your photos...
                      </>
                    ) : (
                      <>
                        ✨ Analyze My Photos ({selectedFiles.length})
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
                  marginBottom: tokens.spacing[2]
                }}>
                  📊 Listing Analysis Results
                </h2>

                {/* Mode Indicator */}
                {analysisResults.mode && (
                  <div style={{
                    fontSize: tokens.typography.fontSize.sm,
                    color: tokens.colors.textMuted,
                    marginBottom: tokens.spacing[6]
                  }}>
                    Mode: {analysisResults.mode === 'optimize_images' ? '📸 Optimize Images' : '📋 Evaluate Full Listing'}
                  </div>
                )}

                {/* NEW FORMAT: A/B/C Outputs (when MODE provided) */}
                {analysisResults.mode ? (
                  <>
                    {/* PRIMARY SCORECARD */}
                    <div style={{
                      padding: 'clamp(1.5rem, 4vw, 2.5rem)',
                      background: `linear-gradient(135deg, ${tokens.colors.primary}08, ${tokens.colors.primary}15)`,
                      borderRadius: tokens.radius.lg,
                      marginBottom: tokens.spacing[6],
                      border: `2px solid ${analysisResults.imageQualityScore >= 80 ? tokens.colors.success : analysisResults.imageQualityScore >= 60 ? tokens.colors.warning : tokens.colors.danger}`,
                      textAlign: 'center'
                    }}>
                      <div style={{
                        fontSize: 'clamp(3rem, 8vw, 5rem)',
                        fontWeight: tokens.typography.fontWeight.bold,
                        color: analysisResults.imageQualityScore >= 80 ? tokens.colors.success : analysisResults.imageQualityScore >= 60 ? tokens.colors.warning : tokens.colors.danger,
                        marginBottom: tokens.spacing[2],
                        lineHeight: 1
                      }}>
                        {analysisResults.imageQualityScore}/100
                      </div>
                      <div style={{
                        fontSize: 'clamp(1.25rem, 3vw, 1.75rem)',
                        fontWeight: tokens.typography.fontWeight.semibold,
                        color: analysisResults.imageQualityScore >= 80 ? tokens.colors.success : analysisResults.imageQualityScore >= 60 ? tokens.colors.warning : tokens.colors.danger,
                        marginBottom: tokens.spacing[4]
                      }}>
                        {analysisResults.imageQualityScore >= 80 ? '✓ Excellent' : analysisResults.imageQualityScore >= 60 ? '⚠ Good' : '✗ Needs Improvement'}
                      </div>

                      {/* Issue Summary */}
                      <div style={{
                        fontSize: 'clamp(1rem, 2.5vw, 1.125rem)',
                        color: tokens.colors.text,
                        marginBottom: tokens.spacing[5],
                        padding: `${tokens.spacing[3]} ${tokens.spacing[4]}`,
                        background: tokens.colors.surface,
                        borderRadius: tokens.radius.md,
                        maxWidth: '600px',
                        margin: `0 auto ${tokens.spacing[5]} auto`
                      }}>
                        {(() => {
                          const criticalCount = analysisResults.imageResults?.reduce((sum: number, img: any) =>
                            sum + (img.deductions?.length || 0), 0) || 0;
                          const opportunityCount = analysisResults.listingCompleteness?.missingPhotoTypes?.length || 0;
                          return criticalCount > 0 || opportunityCount > 0 ? (
                            <>
                              We found <strong style={{ color: tokens.colors.danger }}>{criticalCount} critical issue{criticalCount !== 1 ? 's' : ''}</strong>
                              {opportunityCount > 0 && <> and <strong style={{ color: tokens.colors.primary }}>{opportunityCount} opportunit{opportunityCount !== 1 ? 'ies' : 'y'}</strong></>} to improve your score.
                            </>
                          ) : (
                            <>Your photos look great! 🎉</>
                          );
                        })()}
                      </div>
                    </div>

                    {/* Per-Image Breakdown */}
                    {analysisResults.imageResults && analysisResults.imageResults.length > 0 && (
                      <div style={{ marginBottom: tokens.spacing[4] }}>
                        <h3 style={{
                          fontSize: tokens.typography.fontSize.base,
                          fontWeight: tokens.typography.fontWeight.semibold,
                          color: tokens.colors.text,
                          marginBottom: tokens.spacing[3]
                        }}>
                          🖼️ Per-Image Breakdown
                        </h3>
                        <div style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
                          gap: tokens.spacing[3]
                        }}>
                          {analysisResults.imageResults.map((result: any, index: number) => (
                            <div key={index} style={{
                              padding: tokens.spacing[4],
                              background: tokens.colors.surface,
                              border: `1px solid ${tokens.colors.border}`,
                              borderRadius: tokens.radius.md
                            }}>
                              <div style={{
                                fontSize: tokens.typography.fontSize['2xl'],
                                fontWeight: tokens.typography.fontWeight.bold,
                                color: result.score >= 80 ? tokens.colors.success : result.score >= 60 ? tokens.colors.warning : tokens.colors.danger,
                                marginBottom: tokens.spacing[2]
                              }}>
                                {result.score}/100
                              </div>
                              <div style={{
                                fontSize: tokens.typography.fontSize.xs,
                                color: tokens.colors.textMuted,
                                marginBottom: tokens.spacing[3]
                              }}>
                                Image {index + 1}
                              </div>

                              {/* Passed Gates */}
                              {result.passedGates && result.passedGates.length > 0 && (
                                <div style={{ marginBottom: tokens.spacing[2] }}>
                                  <div style={{
                                    fontSize: tokens.typography.fontSize.xs,
                                    color: tokens.colors.success,
                                    fontWeight: tokens.typography.fontWeight.medium,
                                    marginBottom: tokens.spacing[1]
                                  }}>
                                    Passed:
                                  </div>
                                  {result.passedGates.slice(0, 3).map((gate: string, i: number) => (
                                    <div key={i} style={{
                                      fontSize: tokens.typography.fontSize.xs,
                                      color: tokens.colors.textMuted
                                    }}>
                                      {gate}
                                    </div>
                                  ))}
                                </div>
                              )}

                              {/* Issues (Plain English) */}
                              {result.deductions && result.deductions.length > 0 && (
                                <div>
                                  <div style={{
                                    fontSize: tokens.typography.fontSize.xs,
                                    color: tokens.colors.danger,
                                    fontWeight: tokens.typography.fontWeight.medium,
                                    marginBottom: tokens.spacing[2]
                                  }}>
                                    Issues Found:
                                  </div>
                                  {result.deductions.map((ded: any, i: number) => {
                                    const plainEnglish = deductionToPlainEnglish(ded.rule);
                                    return (
                                      <div key={i} style={{
                                        fontSize: tokens.typography.fontSize.xs,
                                        color: tokens.colors.text,
                                        marginBottom: tokens.spacing[1.5],
                                        display: 'flex',
                                        alignItems: 'flex-start',
                                        gap: tokens.spacing[2],
                                        padding: tokens.spacing[1.5],
                                        background: tokens.colors.surface,
                                        borderRadius: tokens.radius.sm,
                                        border: `1px solid ${tokens.colors.border}`
                                      }}>
                                        <span style={{ fontSize: '14px' }}>{plainEnglish.icon}</span>
                                        <div style={{ flex: 1 }}>
                                          <div>{plainEnglish.text}</div>
                                          {plainEnglish.autoFixable && (
                                            <div style={{
                                              fontSize: '10px',
                                              color: tokens.colors.success,
                                              marginTop: tokens.spacing[0.5]
                                            }}>
                                              ✨ Auto-fixable
                                            </div>
                                          )}
                                        </div>
                                        <span style={{
                                          fontSize: '11px',
                                          color: tokens.colors.danger,
                                          fontWeight: tokens.typography.fontWeight.semibold
                                        }}>
                                          -{ded.penalty}
                                        </span>
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* B) LISTING COMPLETENESS */}
                    {analysisResults.listingCompleteness && (
                      <div style={{
                        padding: tokens.spacing[5],
                        background: `${tokens.colors.primary}08`,
                        borderRadius: tokens.radius.md,
                        marginBottom: tokens.spacing[4],
                        border: `1px solid ${tokens.colors.border}`
                      }}>
                        <div style={{
                          fontSize: tokens.typography.fontSize.lg,
                          fontWeight: tokens.typography.fontWeight.semibold,
                          color: tokens.colors.text,
                          marginBottom: tokens.spacing[3]
                        }}>
                          B) Listing Completeness
                        </div>
                        <div style={{
                          fontSize: tokens.typography.fontSize.sm,
                          color: tokens.colors.textMuted,
                          marginBottom: tokens.spacing[4]
                        }}>
                          Advisory only – no score impact
                        </div>

                        {/* Coverage Gaps */}
                        {analysisResults.listingCompleteness.coverageGaps && analysisResults.listingCompleteness.coverageGaps.length > 0 && (
                          <ul style={{ margin: 0, paddingLeft: tokens.spacing[5] }}>
                            {analysisResults.listingCompleteness.coverageGaps.map((gap: string, i: number) => (
                              <li key={i} style={{
                                fontSize: tokens.typography.fontSize.sm,
                                color: tokens.colors.text,
                                marginBottom: tokens.spacing[2]
                              }}>
                                {gap}
                              </li>
                            ))}
                          </ul>
                        )}

                        {analysisResults.listingCompleteness.coverageGaps?.length === 0 && (
                          <div style={{
                            fontSize: tokens.typography.fontSize.sm,
                            color: tokens.colors.success
                          }}>
                            ✅ No coverage gaps detected
                          </div>
                        )}
                      </div>
                    )}

                    {/* C) CONVERSION HEADROOM */}
                    {analysisResults.conversionHeadroom && (
                      <div style={{
                        padding: tokens.spacing[5],
                        background: `${tokens.colors.success}08`,
                        borderRadius: tokens.radius.md,
                        marginBottom: tokens.spacing[6],
                        border: `1px solid ${tokens.colors.success}30`
                      }}>
                        <div style={{
                          fontSize: tokens.typography.fontSize.lg,
                          fontWeight: tokens.typography.fontWeight.semibold,
                          color: tokens.colors.text,
                          marginBottom: tokens.spacing[3]
                        }}>
                          C) Conversion Headroom
                        </div>
                        <div style={{
                          fontSize: tokens.typography.fontSize.sm,
                          color: tokens.colors.textMuted,
                          marginBottom: tokens.spacing[4]
                        }}>
                          Prioritized actions to increase score – {analysisResults.conversionHeadroom.estimatedUplift}
                        </div>

                        {/* Prioritized Actions */}
                        {analysisResults.conversionHeadroom.prioritizedActions && analysisResults.conversionHeadroom.prioritizedActions.length > 0 && (
                          <div>
                            {analysisResults.conversionHeadroom.prioritizedActions.map((action: any, i: number) => (
                              <div key={i} style={{
                                padding: tokens.spacing[3],
                                background: tokens.colors.background,
                                borderRadius: tokens.radius.sm,
                                marginBottom: tokens.spacing[2],
                                borderLeft: `3px solid ${action.priority === 'high' ? tokens.colors.danger : action.priority === 'medium' ? tokens.colors.warning : tokens.colors.textMuted}`
                              }}>
                                <div style={{
                                  fontSize: tokens.typography.fontSize.sm,
                                  fontWeight: tokens.typography.fontWeight.medium,
                                  color: tokens.colors.text,
                                  marginBottom: tokens.spacing[1]
                                }}>
                                  {action.action}
                                </div>
                                <div style={{
                                  fontSize: tokens.typography.fontSize.xs,
                                  color: tokens.colors.textMuted
                                }}>
                                  {action.impact}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {analysisResults.conversionHeadroom.prioritizedActions?.length === 0 && (
                          <div style={{
                            fontSize: tokens.typography.fontSize.sm,
                            color: tokens.colors.success
                          }}>
                            ✅ No significant optimization opportunities
                          </div>
                        )}
                      </div>
                    )}                     {/* DETERMINISTIC MODE: Optimize All Photos Section */}
                    {!optimizedListing && (
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
                              Optimizing...
                            </>
                          ) : (
                            <>✨ Optimize All Photos</>
                          )}
                        </Button>
                      </div>
                    )}                     {/* DETERMINISTIC MODE: Optimized Results Display */}
                    {optimizedListing && (
                      <div style={{ marginTop: tokens.spacing[6] }}>
                        <div style={{ textAlign: 'center', marginBottom: tokens.spacing[6] }}>
                          <div style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', marginBottom: tokens.spacing[2] }}>✨</div>
                          <h3 style={{ fontSize: 'clamp(1.25rem, 3vw, 1.5rem)', fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.success, marginBottom: tokens.spacing[2] }}>
                            Listing Photos Optimized!
                          </h3>
                          <p style={{ fontSize: tokens.typography.fontSize.base, color: tokens.colors.textMuted }}>
                            {optimizedListing.message}
                          </p>
                        </div>

                        {/* Before/After Score Comparison */}
                        <div style={{ padding: 'clamp(1.5rem, 4vw, 2.5rem)', background: `linear-gradient(135deg, ${tokens.colors.primary}08, ${tokens.colors.success}15)`, borderRadius: tokens.radius.lg, border: `2px solid ${tokens.colors.success}`, marginBottom: tokens.spacing[6] }}>
                          <div style={{ fontSize: 'clamp(1.25rem, 3vw, 1.5rem)', fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.text, textAlign: 'center', marginBottom: tokens.spacing[5] }}>
                            Your Score Has Improved!
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'clamp(1rem, 3vw, 2rem)', flexWrap: 'wrap', marginBottom: tokens.spacing[4] }}>
                            {/* BEFORE Box */}
                            <div style={{ padding: 'clamp(1rem, 3vw, 1.5rem)', background: tokens.colors.surface, borderRadius: tokens.radius.md, border: `2px solid ${tokens.colors.border}`, minWidth: '140px', textAlign: 'center' }}>
                              <div style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.textMuted, marginBottom: tokens.spacing[1], textTransform: 'uppercase', fontWeight: tokens.typography.fontWeight.semibold }}>Before</div>
                              <div style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.danger, lineHeight: 1, marginBottom: tokens.spacing[1] }}>
                                {optimizedListing.originalScore}
                              </div>
                              <div style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.textMuted }}>
                                {optimizedListing.originalScore >= 80 ? 'Excellent' : optimizedListing.originalScore >= 60 ? 'Good' : 'Needs Work'}
                              </div>
                            </div>

                            {/* Arrow */}
                            <div style={{ fontSize: 'clamp(1.5rem, 4vw, 2.5rem)', color: tokens.colors.success }}>→</div>

                            {/* AFTER Box */}
                            <div style={{ padding: 'clamp(1rem, 3vw, 1.5rem)', background: `linear-gradient(135deg, ${tokens.colors.success}15, ${tokens.colors.success}25)`, borderRadius: tokens.radius.md, border: `2px solid ${tokens.colors.success}`, minWidth: '140px', textAlign: 'center' }}>
                              <div style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.textMuted, marginBottom: tokens.spacing[1], textTransform: 'uppercase', fontWeight: tokens.typography.fontWeight.semibold }}>After</div>
                              <div style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.success, lineHeight: 1, marginBottom: tokens.spacing[1] }}>
                                {optimizedListing.newScore}
                              </div>
                              <div style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.success, fontWeight: tokens.typography.fontWeight.semibold }}>
                                {optimizedListing.newScore >= 80 ? 'Excellent' : optimizedListing.newScore >= 60 ? 'Good' : 'Better'}
                              </div>
                            </div>
                          </div>

                          {/* Improvement Badge */}
                          <div style={{ textAlign: 'center', fontSize: 'clamp(1.125rem, 3vw, 1.5rem)', color: tokens.colors.success, fontWeight: tokens.typography.fontWeight.bold }}>
                            🎉 You gained +{optimizedListing.improvement} points!
                          </div>
                        </div>

                        <h4 style={{ fontSize: tokens.typography.fontSize.base, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.text, marginBottom: tokens.spacing[3] }}>
                          📥 Download Optimized Photos
                        </h4>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: tokens.spacing[3], marginBottom: tokens.spacing[6] }}>
                          {optimizedListing.images && optimizedListing.images.map((img: any, index: number) => (
                            <div key={index} style={{ padding: tokens.spacing[3], background: tokens.colors.surface, border: `2px solid ${img.isMainImage ? tokens.colors.primary : tokens.colors.border}`, borderRadius: tokens.radius.md }}>
                              {img.optimizedUrl && (
                                <div style={{ width: '100%', aspectRatio: '4/3', marginBottom: tokens.spacing[2], borderRadius: tokens.radius.sm, overflow: 'hidden', border: `1px solid ${tokens.colors.border}` }}>
                                  <img src={img.optimizedUrl} alt={`Optimized ${index + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                </div>
                              )}
                              {img.isMainImage && (
                                <div style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.primary, marginBottom: tokens.spacing[1] }}>MAIN IMAGE</div>
                              )}
                              <div style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.text, marginBottom: tokens.spacing[1] }}>Photo {index + 1}</div>
                              {img.originalScore !== undefined && img.newScore !== undefined && (
                                <div style={{
                                  fontSize: tokens.typography.fontSize.xs,
                                  marginBottom: tokens.spacing[2],
                                  padding: tokens.spacing[2],
                                  background: img.scoreImprovement > 0 ? `${tokens.colors.success}10` : img.scoreImprovement < 0 ? `${tokens.colors.danger}10` : `${tokens.colors.textMuted}10`,
                                  borderRadius: tokens.radius.sm,
                                  border: `1px solid ${img.scoreImprovement > 0 ? tokens.colors.success : img.scoreImprovement < 0 ? tokens.colors.danger : tokens.colors.border}30`
                                }}>
                                  <div style={{ fontWeight: tokens.typography.fontWeight.semibold, marginBottom: tokens.spacing[0.5] }}>
                                    {img.originalScore} → <span style={{ color: img.scoreImprovement > 0 ? tokens.colors.success : img.scoreImprovement < 0 ? tokens.colors.danger : tokens.colors.text, fontWeight: tokens.typography.fontWeight.bold }}>{img.newScore}</span>
                                  </div>
                                  {img.scoreImprovement !== 0 && (
                                    <div style={{ fontSize: '10px', color: img.scoreImprovement > 0 ? tokens.colors.success : tokens.colors.danger, fontWeight: tokens.typography.fontWeight.semibold }}>
                                      {img.scoreImprovement > 0 ? '↗' : '↘'} {img.scoreImprovement > 0 ? '+' : ''}{img.scoreImprovement} points
                                    </div>
                                  )}
                                  {img.scoreImprovement === 0 && (
                                    <div style={{ fontSize: '10px', color: tokens.colors.textMuted }}>
                                      No change
                                    </div>
                                  )}
                                </div>
                              )}
                              <Button variant="primary" size="sm" fullWidth onClick={() => downloadImage(img.optimizedUrl, `optimized-${index + 1}.jpg`)} style={{ fontSize: tokens.typography.fontSize.xs }}>
                                ⬇ Download
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}


                  </>
                ) : (
                  /* LEGACY FORMAT: Original Two-Engine Display */
                  <>
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
                            <>
                              <div style={{
                                fontSize: tokens.typography.fontSize.xs,
                                fontWeight: tokens.typography.fontWeight.semibold,
                                color: tokens.colors.primary,
                                marginBottom: tokens.spacing[2]
                              }}>
                                MAIN IMAGE
                              </div>

                              {/* Square Thumbnail Preview - How it appears in Etsy search */}
                              <div style={{
                                marginTop: tokens.spacing[2],
                                marginBottom: tokens.spacing[3],
                                padding: tokens.spacing[2],
                                background: `${tokens.colors.primary}05`,
                                borderRadius: tokens.radius.sm,
                                border: `1px solid ${tokens.colors.primary}20`
                              }}>
                                <div style={{
                                  fontSize: tokens.typography.fontSize.xs,
                                  fontWeight: tokens.typography.fontWeight.medium,
                                  color: tokens.colors.text,
                                  marginBottom: tokens.spacing[1]
                                }}>
                                  🔍 Search Result Preview (1:1)
                                </div>
                                <div style={{
                                  fontSize: '10px',
                                  color: tokens.colors.textMuted,
                                  marginBottom: tokens.spacing[2]
                                }}>
                                  How this will appear in Etsy search results
                                </div>

                                {previews[index] && (
                                  <div style={{
                                    width: '100%',
                                    aspectRatio: '1',
                                    borderRadius: tokens.radius.sm,
                                    overflow: 'hidden',
                                    border: `1px solid ${tokens.colors.border}`,
                                    position: 'relative'
                                  }}>
                                    <img
                                      src={previews[index]}
                                      alt="Square thumbnail preview"
                                      style={{
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'cover',
                                        objectPosition: 'center'
                                      }}
                                    />
                                  </div>
                                )}

                                <div style={{
                                  fontSize: '10px',
                                  color: tokens.colors.warning,
                                  marginTop: tokens.spacing[1],
                                  fontStyle: 'italic'
                                }}>
                                  ⚠️ 4:3 images get center-cropped to square in search. Ensure product stays centered!
                                </div>
                              </div>
                            </>
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
                          
                          {/* AI Issues - Categorized */}
                          {result.ai_issues && result.ai_issues.length > 0 && (() => {
                            const categorized = categorizeIssues(result.ai_issues);
                            return (
                              <>
                                {/* Auto-Fixable Issues */}
                                {categorized.autoFixable.length > 0 && (
                                  <div style={{
                                    marginTop: tokens.spacing[3],
                                    padding: tokens.spacing[2],
                                    background: `${tokens.colors.primary}10`,
                                    borderRadius: tokens.radius.sm,
                                    border: `1px solid ${tokens.colors.primary}30`
                                  }}>
                                    <div style={{
                                      fontSize: tokens.typography.fontSize.xs,
                                      fontWeight: tokens.typography.fontWeight.semibold,
                                      color: tokens.colors.primary,
                                      marginBottom: tokens.spacing[0.5]
                                    }}>
                                      ✨ Will Auto-Fix:
                                    </div>
                                    <div style={{
                                      fontSize: '10px',
                                      color: tokens.colors.textMuted,
                                      marginBottom: tokens.spacing[1],
                                      fontStyle: 'italic'
                                    }}>
                                      {CATEGORY_EXPLANATIONS.autoFixable}
                                    </div>
                                    {categorized.autoFixable.map((issue: string, i: number) => (
                                      <div key={i} style={{
                                        fontSize: tokens.typography.fontSize.xs,
                                        color: tokens.colors.text,
                                        marginBottom: i < categorized.autoFixable.length - 1 ? tokens.spacing[1] : 0
                                      }}>
                                        • {issue}
                                      </div>
                                    ))}
                                  </div>
                                )}

                                {/* Manual Issues */}
                                {categorized.manual.length > 0 && (
                                  <div style={{
                                    marginTop: tokens.spacing[2],
                                    padding: tokens.spacing[2],
                                    background: `${tokens.colors.warning}15`,
                                    borderRadius: tokens.radius.sm,
                                    border: `1px solid ${tokens.colors.warning}30`
                                  }}>
                                    <div style={{
                                      fontSize: tokens.typography.fontSize.xs,
                                      fontWeight: tokens.typography.fontWeight.semibold,
                                      color: tokens.colors.warning,
                                      marginBottom: tokens.spacing[0.5]
                                    }}>
                                      ⚠️ Requires Manual Editing:
                                    </div>
                                    <div style={{
                                      fontSize: '10px',
                                      color: tokens.colors.textMuted,
                                      marginBottom: tokens.spacing[1],
                                      fontStyle: 'italic'
                                    }}>
                                      {CATEGORY_EXPLANATIONS.manual}
                                    </div>
                                    {categorized.manual.map((issue: string, i: number) => (
                                      <div key={i} style={{
                                        fontSize: tokens.typography.fontSize.xs,
                                        color: tokens.colors.text,
                                        marginBottom: i < categorized.manual.length - 1 ? tokens.spacing[1] : 0
                                      }}>
                                        • {issue}
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </>
                            );
                          })()}
                          
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
                            fontSize: tokens.typography.fontSize.xs,
                            marginBottom: tokens.spacing[2],
                            padding: tokens.spacing[2],
                            background: img.scoreImprovement > 0 ? `${tokens.colors.success}10` : img.scoreImprovement < 0 ? `${tokens.colors.danger}10` : `${tokens.colors.textMuted}10`,
                            borderRadius: tokens.radius.sm,
                            border: `1px solid ${img.scoreImprovement > 0 ? tokens.colors.success : img.scoreImprovement < 0 ? tokens.colors.danger : tokens.colors.border}30`
                          }}>
                            <div style={{ fontWeight: tokens.typography.fontWeight.semibold, marginBottom: tokens.spacing[0.5] }}>
                              {img.originalScore} → <span style={{ color: img.scoreImprovement > 0 ? tokens.colors.success : img.scoreImprovement < 0 ? tokens.colors.danger : tokens.colors.text, fontWeight: tokens.typography.fontWeight.bold }}>{img.newScore}</span>
                            </div>
                            {img.scoreImprovement !== 0 ? (
                              <div style={{ fontSize: '10px', color: img.scoreImprovement > 0 ? tokens.colors.success : tokens.colors.danger, fontWeight: tokens.typography.fontWeight.semibold }}>
                                {img.scoreImprovement > 0 ? '↗' : '↘'} {img.scoreImprovement > 0 ? '+' : ''}{img.scoreImprovement} points
                              </div>
                            ) : (
                              <div style={{ fontSize: '10px', color: tokens.colors.textMuted }}>
                                No change
                              </div>
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
                  </>
                )}
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
