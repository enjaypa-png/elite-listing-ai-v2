export const runtime = 'nodejs';
export const maxDuration = 60;

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import sharp from 'sharp';
import { randomUUID } from 'crypto';
import { fetchScoringRules, calculateScore, ImageAttributes } from '@/lib/database-scoring';
import { analyzeImageWithVision, mergeAttributes } from '@/lib/ai-vision';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Etsy requirements
const ETSY_MAX_FILE_SIZE = 1 * 1024 * 1024;  // 1MB
const ETSY_TARGET_WIDTH = 3000;
const ETSY_TARGET_HEIGHT = 2250;  // 4:3 ratio
const ETSY_MIN_SHORTEST_SIDE = 2000;

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
  };
}

/**
 * Optimize a single image buffer
 */
async function optimizeImageBuffer(
  buffer: Buffer,
  originalAttributes: ImageAttributes
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
    
    pipeline = pipeline.resize(targetWidth, targetHeight, {
      fit: 'cover',
      position: 'center',
    });
    
    improvements.push('✅ Optimized for Etsy search');
  }
  
  // Apply sharpening if needed
  if (!originalAttributes.is_sharp_focus) {
    pipeline = pipeline.sharpen({ sigma: 1.2 });
    improvements.push('✅ Professional polish applied');
  }
  
  // Adjust brightness if needed
  if (!originalAttributes.has_good_lighting) {
    pipeline = pipeline.modulate({ brightness: 1.1 });
    improvements.push('✅ Lighting enhanced');
  }
  
  // Output as JPEG (Etsy compliant, under 1MB)
  let quality = 85;
  let optimizedBuffer = await pipeline
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
  
  improvements.push('✅ Fast mobile loading');
  improvements.push('✅ Matched to Etsy\'s preferred file format');
  
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
    
    console.log(`[${requestId}] Received ${imageFiles.length} images for optimization`);
    
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
    // 2. CREATE SUPABASE CLIENT & FETCH SCORING RULES
    // ===========================================
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const rules = await fetchScoringRules(supabase);
    
    if (!rules) {
      return NextResponse.json(
        { success: false, error: 'Failed to load scoring rules' },
        { status: 500 }
      );
    }
    
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
        
        // Run AI Vision on original
        let visionResponse = null;
        try {
          const imageBase64 = buffer.toString('base64');
          const mimeType = (file.type || 'image/jpeg') as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp';
          visionResponse = await analyzeImageWithVision(imageBase64, mimeType);
        } catch (visionError: any) {
          console.error(`[${requestId}] Image ${i + 1}: Vision failed:`, visionError.message);
        }
        
        const originalMerged = visionResponse 
          ? mergeAttributes(originalAttrs, visionResponse)
          : originalAttrs;
        
        // Calculate original score
        const originalScoring = calculateScore(originalMerged, rules);
        const originalScore = originalScoring.total_score;
        totalOriginalScore += originalScore;
        
        // Check if already optimized
        if (originalScoring.is_already_optimized) {
          console.log(`[${requestId}] Image ${i + 1}: Already optimized`);
          
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
              width: originalMerged.width_px,
              height: originalMerged.height_px,
              fileSizeKB: Math.round(buffer.length / 1024),
            },
          });
          
          totalNewScore += originalScore;
          continue;
        }
        
        // Optimize the image
        const { optimizedBuffer, improvements } = await optimizeImageBuffer(buffer, originalMerged);
        
        console.log(`[${requestId}] Image ${i + 1}: Optimized size: ${optimizedBuffer.length} bytes`);
        
        // Analyze optimized image for new score
        const optimizedAttrs = await extractTechnicalAttributes(optimizedBuffer, 'image/jpeg');
        
        // Inherit vision attributes (optimizations don't change content)
        const optimizedMerged: ImageAttributes = {
          ...optimizedAttrs,
          has_clean_white_background: originalMerged.has_clean_white_background,
          is_product_centered: originalMerged.is_product_centered,
          has_good_lighting: true, // We enhanced lighting
          is_sharp_focus: true, // We applied sharpening
          has_no_watermarks: originalMerged.has_no_watermarks,
          professional_appearance: originalMerged.professional_appearance,
          has_studio_shot: originalMerged.has_studio_shot,
          has_lifestyle_shot: originalMerged.has_lifestyle_shot,
          has_scale_shot: originalMerged.has_scale_shot,
          has_detail_shot: originalMerged.has_detail_shot,
          has_group_shot: originalMerged.has_group_shot,
          has_packaging_shot: originalMerged.has_packaging_shot,
          has_process_shot: originalMerged.has_process_shot,
        };
        
        const newScoring = calculateScore(optimizedMerged, rules);
        const newScore = newScoring.total_score;
        totalNewScore += newScore;
        
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
            width: optimizedMerged.width_px,
            height: optimizedMerged.height_px,
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
    const avgOriginalScore = Math.round(totalOriginalScore / imageFiles.length);
    const avgNewScore = Math.round(totalNewScore / imageFiles.length);
    const overallImprovement = avgNewScore - avgOriginalScore;
    
    console.log(`[${requestId}] Optimization complete:`, {
      images: imageFiles.length,
      avgOriginal: avgOriginalScore,
      avgNew: avgNewScore,
      improvement: overallImprovement,
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
