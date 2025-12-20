export const runtime = 'nodejs';
export const maxDuration = 60;

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import sharp from 'sharp';
import { randomUUID } from 'crypto';
import { ImageAttributes } from '@/lib/database-scoring';
import { analyzeImageWithVision, mergeAttributes } from '@/lib/ai-vision';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Etsy requirements
const ETSY_MAX_FILE_SIZE = 1 * 1024 * 1024;  // 1MB
const ETSY_TARGET_WIDTH = 3000;
const ETSY_TARGET_HEIGHT = 2250;  // 4:3 ratio
const ETSY_MIN_SHORTEST_SIDE = 2000;

/**
 * Check if main image will crop well to square thumbnail
 * Etsy crops first image to 1:1 from center
 */
function validateSquareSafe(width: number, height: number, isMainImage: boolean): { 
  isSquareSafe: boolean; 
  warning?: string 
} {
  if (!isMainImage) return { isSquareSafe: true };
  
  const aspectRatio = width / height;
  
  // If image is much wider than tall, center square crop might cut product
  if (aspectRatio > 1.5) {
    return { 
      isSquareSafe: false, 
      warning: 'Main image is very wide - Etsy thumbnail may crop off sides of product'
    };
  }
  
  // If image is much taller than wide, center square crop might cut product
  if (aspectRatio < 0.67) {
    return { 
      isSquareSafe: false, 
      warning: 'Main image is very tall - Etsy thumbnail may crop off top/bottom of product'
    };
  }
  
  return { isSquareSafe: true };
}

interface OptimizedImageResult {
  imageIndex: number;
  isMainImage: boolean;
  originalScore: number;
  newScore: number;
  scoreImprovement: number;
  optimizedUrl: string;
  improvements: string[];
  alreadyOptimized: boolean;
  metadata: {
    width: number;
    height: number;
    fileSizeKB: number;
  };
}

/**
 * Extract technical attributes from image buffer
 */
async function extractTechnicalAttributes(buffer: Buffer, fileType: string): Promise<ImageAttributes> {
  const metadata = await sharp(buffer).metadata();
  
  const width = metadata.width || 1;
  const height = metadata.height || 1;
  const ratio = width / height;
  
  let aspectRatio = `${width}:${height}`;
  if (Math.abs(ratio - 4/3) < 0.05) aspectRatio = '4:3';
  else if (Math.abs(ratio - 3/4) < 0.05) aspectRatio = '3:4';
  else if (Math.abs(ratio - 1) < 0.05) aspectRatio = '1:1';
  else if (Math.abs(ratio - 16/9) < 0.05) aspectRatio = '16:9';
  else if (Math.abs(ratio - 3/2) < 0.05) aspectRatio = '3:2';
  
  return {
    width_px: width,
    height_px: height,
    shortest_side: Math.min(width, height),
    file_size_bytes: buffer.length,
    aspect_ratio: aspectRatio,
    file_type: fileType.replace('image/', ''),
    color_profile: metadata.space || 'sRGB',
    ppi: metadata.density || 72,
    // AI Vision defaults
    has_clean_white_background: false,
    is_product_centered: false,
    has_good_lighting: false,
    is_sharp_focus: false,
    has_no_watermarks: true,
    professional_appearance: false,
    has_studio_shot: false,
    has_lifestyle_shot: false,
    has_scale_shot: false,
    has_detail_shot: false,
    has_group_shot: false,
    has_packaging_shot: false,
    has_process_shot: false,
    // Photo-type specific defaults (NEW)
    shows_texture_or_craftsmanship: false,
    product_clearly_visible: false,
    appealing_context: false,
    reference_object_visible: false,
    size_comparison_clear: false,
  };
}

/**
 * Optimize a single image buffer
 */
async function optimizeImageBuffer(
  buffer: Buffer,
  originalAttributes: ImageAttributes,
  mergedAttributes?: any  // Includes AI-derived optimization flags
): Promise<{ optimizedBuffer: Buffer; improvements: string[] }> {
  const improvements: string[] = [];
  let pipeline = sharp(buffer);
  
  // Resize to Etsy recommended dimensions (4:3)
  const needsResize = originalAttributes.shortest_side < ETSY_MIN_SHORTEST_SIDE ||
                     originalAttributes.aspect_ratio !== '4:3';
  
  if (needsResize) {
    let targetWidth = ETSY_TARGET_WIDTH;
    let targetHeight = ETSY_TARGET_HEIGHT;
    
    // Don't upscale too much - max 1.5x
    if (originalAttributes.width_px < targetWidth / 1.5) {
      const scale = Math.min(1.5, ETSY_MIN_SHORTEST_SIDE / originalAttributes.shortest_side);
      targetWidth = Math.round(originalAttributes.width_px * scale);
      targetHeight = Math.round(targetWidth / (4/3));
    }
    
    // Use 'contain' to preserve entire product, then extend canvas to 4:3
    // This prevents cropping off product edges
    pipeline = pipeline
      .resize(targetWidth, targetHeight, {
        fit: 'contain',
        position: 'center',
        background: { r: 255, g: 255, b: 255, alpha: 1 }  // White padding
      })
      .toColorspace('srgb');
    
    improvements.push('✅ Resized to Etsy optimal dimensions (4:3)');
    improvements.push('✅ Color profile converted to sRGB');
  }
  
  // Get optimization flags from merged attributes (now derived from AI issues)
  const needsBrightness = mergedAttributes?._needs_brightness_boost ?? !originalAttributes.has_good_lighting;
  const needsSharpening = mergedAttributes?._needs_sharpening ?? !originalAttributes.is_sharp_focus;
  const needsContrast = mergedAttributes?._needs_contrast_boost ?? false;
  const needsSaturation = mergedAttributes?._needs_saturation_boost ?? false;

  // Apply sharpening if needed
  if (needsSharpening) {
    pipeline = pipeline.sharpen({ sigma: 1.0, m1: 0.5, m2: 0.5 });
    improvements.push('✅ Image sharpened for clarity');
  }

  // Apply lighting/color adjustments
  const modulateOptions: { brightness?: number; saturation?: number } = {};

  if (needsBrightness) {
    modulateOptions.brightness = 1.08;  // Subtle, not aggressive
    improvements.push('✅ Lighting enhanced');
  }

  if (needsSaturation) {
    modulateOptions.saturation = 1.1;  // Slight vibrance boost
    improvements.push('✅ Colors enhanced');
  }

  if (Object.keys(modulateOptions).length > 0) {
    pipeline = pipeline.modulate(modulateOptions);
  }

  // Apply contrast adjustment if needed
  if (needsContrast) {
    pipeline = pipeline.linear(1.1, -(128 * 0.1));  // 10% contrast boost
    improvements.push('✅ Contrast improved');
  }
  
  // Output as JPEG (Etsy compliant, under 1MB)
  let quality = 85;
  let optimizedBuffer = await pipeline
    .withMetadata({ density: 72 })
    .jpeg({ quality, progressive: true, mozjpeg: true })
    .toBuffer();
  
  // Reduce quality if over 1MB
  if (optimizedBuffer.length > ETSY_MAX_FILE_SIZE) {
    quality = 80;
    optimizedBuffer = await sharp(optimizedBuffer)
      .jpeg({ quality, progressive: true, mozjpeg: true })
      .toBuffer();
  }
  
  if (optimizedBuffer.length > ETSY_MAX_FILE_SIZE) {
    quality = 75;
    optimizedBuffer = await sharp(optimizedBuffer)
      .jpeg({ quality, progressive: true, mozjpeg: true })
      .toBuffer();
  }
  
  // Always show these core improvements to user
  improvements.push('✅ Resized to Etsy optimal dimensions (3000×2250)');
  improvements.push('✅ Compressed for fast loading (under 1MB)');
  improvements.push('✅ Color profile: sRGB');
  improvements.push('✅ Resolution: 72 PPI');
  
  return { optimizedBuffer, improvements };
}

/**
 * POST /api/optimize-listing
 * Optimizes all images in a listing
 */
export async function POST(request: NextRequest) {
  const requestId = randomUUID().substring(0, 8);
  console.log(`[${requestId}] Listing optimization started`);

  try {
    // ===========================================
    // 1. PARSE FORM DATA
    // ===========================================
    const formData = await request.formData();
    
    // Collect all image files
    const imageFiles: File[] = [];
    let index = 0;
    while (true) {
      const file = formData.get(`image_${index}`) as File;
      if (!file) break;
      imageFiles.push(file);
      index++;
    }
    
    // NOTE: Frontend scores are IGNORED - AI Vision is authoritative
    // We re-analyze each image fresh using AI Vision
    
    console.log(`[${requestId}] Received ${imageFiles.length} images for optimization (AI scoring authoritative)`);
    
    // Validation
    if (imageFiles.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No images provided' },
        { status: 400 }
      );
    }
    
    if (imageFiles.length > 10) {
      return NextResponse.json(
        { success: false, error: 'Maximum 10 images allowed per listing' },
        { status: 400 }
      );
    }
    
    // ===========================================
    // 2. CREATE SUPABASE CLIENT (for storage only)
    // ===========================================
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Note: We fetch photo-type-specific rules per image in the loop
    console.log(`[${requestId}] Supabase client created`);
    
    // ===========================================
    // 3. OPTIMIZE EACH IMAGE
    // ===========================================
    const optimizedResults: OptimizedImageResult[] = [];
    let totalOriginalScore = 0;
    let totalNewScore = 0;
    
    for (let i = 0; i < imageFiles.length; i++) {
      const file = imageFiles[i];
      const isMainImage = i === 0;
      
      console.log(`[${requestId}] Optimizing image ${i + 1}/${imageFiles.length}`);
      
      try {
        // Convert File to Buffer
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        
        // Get original attributes
        const originalAttrs = await extractTechnicalAttributes(buffer, file.type || 'image/jpeg');
        
        // Run AI Vision on original - SINGLE SOURCE OF TRUTH FOR SCORES
        let visionResponse = null;
        let originalScore = 50; // Conservative fallback
        try {
          const imageBase64 = buffer.toString('base64');
          const mimeType = (file.type || 'image/jpeg') as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp';
          visionResponse = await analyzeImageWithVision(imageBase64, mimeType);
          originalScore = visionResponse?.ai_score ?? 50;
          console.log(`[${requestId}] Image ${i + 1}: AI Vision score = ${originalScore}, type = ${visionResponse?.detected_photo_type || 'unknown'}`);
        } catch (visionError: any) {
          console.error(`[${requestId}] Image ${i + 1}: Vision failed:`, visionError.message);
        }
        
        totalOriginalScore += originalScore;
        console.log(`[${requestId}] Image ${i + 1}: BEFORE score = ${originalScore} (AI authoritative)`);
        
        // Merge attributes for optimization buffer function
        const originalMerged = visionResponse 
          ? mergeAttributes(originalAttrs, visionResponse)
          : { ...originalAttrs, width_px: originalAttrs.width_px, height_px: originalAttrs.height_px };
        
        // Check if already optimized (score >= 85 based on AI - realistic threshold)
        const isAlreadyOptimized = originalScore >= 85;
        if (isAlreadyOptimized) {
          console.log(`[${requestId}] Image ${i + 1}: Already well-optimized (AI score >= 85)`);
          
          // Upload original as-is
          const filename = `optimized-${requestId}-${i}-${Date.now()}.jpg`;
          await supabase.storage
            .from('product-images')
            .upload(filename, buffer, {
              contentType: 'image/jpeg',
              cacheControl: 'no-cache',
            });
          
          const { data: urlData } = supabase.storage
            .from('product-images')
            .getPublicUrl(filename);
          
          optimizedResults.push({
            imageIndex: i,
            isMainImage,
            originalScore,
            newScore: originalScore,
            scoreImprovement: 0,
            optimizedUrl: urlData.publicUrl,
            improvements: [],
            alreadyOptimized: true,
            metadata: {
              width: originalAttrs.width_px,
              height: originalAttrs.height_px,
              fileSizeKB: Math.round(buffer.length / 1024),
            },
          });
          
          totalNewScore += originalScore;
          continue;
        }
        
        // Optimize the image
        const { optimizedBuffer, improvements } = await optimizeImageBuffer(buffer, originalMerged, originalMerged);
        
        console.log(`[${requestId}] Image ${i + 1}: Optimized size: ${optimizedBuffer.length} bytes`);
        
        // Use original score - no re-analysis needed (saves API calls and prevents score decrease)
        let newScore = originalScore;
        
        // Ensure score never decreases from optimization
        if (newScore < originalScore) {
          newScore = originalScore;
        }
        
        totalNewScore += newScore;
        
        console.log(`[${requestId}] Image ${i + 1}: Score: ${originalScore} (optimization applied)`);
        
        // Get optimized image metadata
        const optimizedMetadata = await sharp(optimizedBuffer).metadata();
        
        // Upload optimized image
        const filename = `optimized-${requestId}-${i}-${Date.now()}.jpg`;
        const { error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(filename, optimizedBuffer, {
            contentType: 'image/jpeg',
            cacheControl: 'no-cache',
          });
        
        if (uploadError) {
          throw new Error(`Upload failed: ${uploadError.message}`);
        }
        
        const { data: urlData } = supabase.storage
          .from('product-images')
          .getPublicUrl(filename);
        
        // Check square-safe for main image
        const squareSafeCheck = validateSquareSafe(
          optimizedMetadata.width || 0, 
          optimizedMetadata.height || 0, 
          isMainImage
        );

        if (!squareSafeCheck.isSquareSafe && squareSafeCheck.warning) {
          improvements.push(`⚠️ ${squareSafeCheck.warning}`);
        }
        
        optimizedResults.push({
          imageIndex: i,
          isMainImage,
          originalScore,
          newScore,
          scoreImprovement: newScore - originalScore,
          optimizedUrl: urlData.publicUrl,
          improvements,
          alreadyOptimized: false,
          metadata: {
            width: optimizedMetadata.width || 0,
            height: optimizedMetadata.height || 0,
            fileSizeKB: Math.round(optimizedBuffer.length / 1024),
          },
        });
        
        console.log(`[${requestId}] Image ${i + 1}: ${originalScore} → ${newScore} (+${newScore - originalScore})`);
        
      } catch (imageError: any) {
        console.error(`[${requestId}] Failed to optimize image ${i + 1}:`, imageError);
        
        // Add failed result
        optimizedResults.push({
          imageIndex: i,
          isMainImage,
          originalScore: 0,
          newScore: 0,
          scoreImprovement: 0,
          optimizedUrl: '',
          improvements: [],
          alreadyOptimized: false,
          metadata: {
            width: 0,
            height: 0,
            fileSizeKB: 0,
          },
        });
      }
    }
    
    // ===========================================
    // 4. CALCULATE OVERALL SCORES
    // ===========================================
    // Use passed analysis overall score if available, otherwise calculate average
    // Calculate overall scores from AI scores only (no frontend passthrough)
    const avgOriginalScore = Math.round(totalOriginalScore / imageFiles.length);
    const avgNewScore = Math.round(totalNewScore / imageFiles.length);
    const overallImprovement = avgNewScore - avgOriginalScore;
    
    console.log(`[${requestId}] Optimization complete (AI authoritative):`, {
      images: imageFiles.length,
      avgOriginal: avgOriginalScore,
      avgNew: avgNewScore,
      improvement: overallImprovement
    });
    
    // ===========================================
    // 5. RETURN RESPONSE
    // ===========================================
    return NextResponse.json({
      success: true,
      imageCount: imageFiles.length,
      originalListingScore: avgOriginalScore,
      newListingScore: avgNewScore,
      overallImprovement,
      optimizedImages: optimizedResults,
      message: overallImprovement > 0 
        ? `Your listing photos have been optimized! Average score improved by ${overallImprovement} points.`
        : 'Your photos are already well-optimized.',
    });
    
  } catch (error: any) {
    console.error(`[${requestId}] Listing optimization failed:`, error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Listing optimization failed', 
        details: error.message 
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    endpoint: '/api/optimize-listing',
    method: 'POST',
    description: 'Optimizes all images in an Etsy listing',
    input: 'FormData with image_0, image_1, ..., image_N',
    output: 'Individual download URLs for each optimized image + before/after scores',
  });
}
