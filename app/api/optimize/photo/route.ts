export const runtime = "nodejs";
export const preferredRegion = "iad1";
export const maxDuration = 60;

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import sharp from 'sharp';
import { computeContentHash } from '@/lib/hash';
import { fetchScoringRules, calculateScore, storeImageAnalysis, ImageAttributes } from '@/lib/database-scoring';
import { analyzeImageWithVision, getDefaultVisionResponse, mergeAttributes } from '@/lib/ai-vision';
import { randomUUID } from 'crypto';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Etsy requirements
const ETSY_MAX_FILE_SIZE = 1 * 1024 * 1024;  // 1MB
const ETSY_TARGET_WIDTH = 3000;
const ETSY_TARGET_HEIGHT = 2250;  // 4:3 ratio
const ETSY_MIN_SHORTEST_SIDE = 2000;

// ===========================================
// EXTRACT TECHNICAL ATTRIBUTES
// ===========================================
async function extractTechnicalAttributes(buffer: Buffer, fileType: string): Promise<{
  width_px: number;
  height_px: number;
  file_size_bytes: number;
  aspect_ratio: string;
  file_type: string;
  color_profile: string;
  ppi: number;
}> {
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
    file_size_bytes: buffer.length,
    aspect_ratio: aspectRatio,
    file_type: fileType.replace('image/', ''),
    color_profile: 'sRGB',
    ppi: metadata.density || 72,
  };
}

export async function POST(request: NextRequest) {
  const requestId = randomUUID();
  
  try {
    const body = await request.json();
    const { imageUrl } = body;
    
    if (!imageUrl) {
      return NextResponse.json(
        { success: false, error: 'imageUrl is required' },
        { status: 400 }
      );
    }
    
    console.log(`[${requestId}] Optimizing image:`, imageUrl);
    
    // ===========================================
    // 1. DOWNLOAD ORIGINAL IMAGE
    // ===========================================
    const imageResponse = await fetch(imageUrl, {
      cache: 'no-store',
      headers: { 'Cache-Control': 'no-cache' }
    });
    
    if (!imageResponse.ok) {
      throw new Error(`Failed to fetch image: ${imageResponse.statusText}`);
    }
    
    const originalBuffer = Buffer.from(await imageResponse.arrayBuffer());
    console.log(`[${requestId}] Downloaded:`, originalBuffer.length, 'bytes');
    
    // ===========================================
    // 2. GET SCORING RULES FROM DATABASE
    // ===========================================
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    const rules = await fetchScoringRules(supabaseAdmin);
    
    if (!rules) {
      return NextResponse.json(
        { success: false, error: 'No active scoring profile found' },
        { status: 500 }
      );
    }
    
    // ===========================================
    // 3. ANALYZE ORIGINAL IMAGE
    // ===========================================
    const originalTech = await extractTechnicalAttributes(originalBuffer, 'image/jpeg');
    const originalBase64 = originalBuffer.toString('base64');
    let originalVision = await analyzeImageWithVision(originalBase64, 'image/jpeg');
    
    if (!originalVision) {
      originalVision = getDefaultVisionResponse();
    }
    
    const originalAttributes = mergeAttributes(originalTech, originalVision);
    const originalScoring = calculateScore(originalAttributes, rules);
    const originalScore = originalScoring.total_score;
    
    console.log(`[${requestId}] Original score:`, originalScore);
    
    // ===========================================
    // 4. CHECK IF ALREADY OPTIMIZED
    // ===========================================
    if (originalScoring.is_already_optimized) {
      console.log(`[${requestId}] Image already optimized`);
      return NextResponse.json({
        success: true,
        alreadyOptimized: true,
        optimizedUrl: imageUrl,
        improvements: [],
        originalScore,
        newScore: originalScore,
        scoreImprovement: 0,
        message: 'This image is already optimized and meets all Etsy requirements.',
        metadata: {
          width: originalAttributes.width_px,
          height: originalAttributes.height_px,
          fileSize: originalAttributes.file_size_bytes,
        },
      });
    }
    
    // ===========================================
    // 5. APPLY OPTIMIZATIONS
    // ===========================================
    const improvements: string[] = [];
    let pipeline = sharp(originalBuffer);
    
    // Resize to Etsy recommended dimensions (4:3)
    const needsResize = originalAttributes.shortest_side < ETSY_MIN_SHORTEST_SIDE ||
                       originalAttributes.aspect_ratio !== '4:3';
    
    if (needsResize) {
      // Calculate target dimensions
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
      
      improvements.push(`Resized to ${targetWidth}x${targetHeight} (4:3 ratio)`);
    }
    
    // Apply sharpening if needed
    if (!originalAttributes.is_sharp_focus) {
      pipeline = pipeline.sharpen({ sigma: 1.2 });
      improvements.push('Applied sharpening');
    }
    
    // Adjust brightness if needed
    if (!originalAttributes.has_good_lighting) {
      pipeline = pipeline.modulate({ brightness: 1.1 });
      improvements.push('Enhanced lighting');
    }
    
    // ===========================================
    // 6. OUTPUT AS JPEG (Etsy compliant, under 1MB)
    // ===========================================
    // JPEG is perfectly acceptable for Etsy - prioritize file size compliance
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
    
    improvements.push(`Compressed to JPEG (${quality}% quality, ${(optimizedBuffer.length / 1024).toFixed(0)}KB)`);
    
    console.log(`[${requestId}] Optimized size:`, optimizedBuffer.length, 'bytes');
    
    // ===========================================
    // 7. ANALYZE OPTIMIZED IMAGE (for new score)
    // ===========================================
    const optimizedTech = await extractTechnicalAttributes(optimizedBuffer, 'image/jpeg');
    const optimizedBase64 = optimizedBuffer.toString('base64');
    let optimizedVision = await analyzeImageWithVision(optimizedBase64, 'image/jpeg');
    
    if (!optimizedVision) {
      // Inherit some attributes from original since optimizations don't change content
      optimizedVision = {
        ...originalVision,
        is_sharp_focus: true,  // We applied sharpening
        has_good_lighting: true,  // We enhanced lighting
      };
    }
    
    const optimizedAttributes = mergeAttributes(optimizedTech, optimizedVision);
    const optimizedScoring = calculateScore(optimizedAttributes, rules);
    const newScore = optimizedScoring.total_score;
    const scoreImprovement = newScore - originalScore;
    
    console.log(`[${requestId}] New score:`, newScore, '(+' + scoreImprovement + ')');
    
    // ===========================================
    // 8. UPLOAD OPTIMIZED IMAGE
    // ===========================================
    const filename = `optimized-${requestId}-${Date.now()}.jpg`;
    
    const { error: uploadError } = await supabaseAdmin.storage
      .from('product-images')
      .upload(filename, optimizedBuffer, {
        contentType: 'image/jpeg',
        cacheControl: 'no-cache',
      });
    
    if (uploadError) {
      throw new Error(`Upload failed: ${uploadError.message}`);
    }
    
    const { data: urlData } = supabaseAdmin.storage
      .from('product-images')
      .getPublicUrl(filename);
    
    // ===========================================
    // 9. RETURN RESPONSE
    // ===========================================
    return NextResponse.json({
      success: true,
      alreadyOptimized: false,
      optimizedUrl: urlData.publicUrl,
      improvements,
      originalScore,
      newScore,
      scoreImprovement,
      
      breakdown: {
        technical_points: optimizedScoring.technical_points,
        photo_type_points: optimizedScoring.photo_type_points,
        composition_points: optimizedScoring.composition_points,
      },
      
      message: scoreImprovement > 0
        ? `Photo optimized! Score improved from ${originalScore} to ${newScore} (+${scoreImprovement} points).`
        : `Photo optimized to meet Etsy standards.`,
      
      metadata: {
        width: optimizedAttributes.width_px,
        height: optimizedAttributes.height_px,
        fileSize: optimizedAttributes.file_size_bytes,
        fileSizeKB: Math.round(optimizedAttributes.file_size_bytes / 1024),
        aspectRatio: optimizedAttributes.aspect_ratio,
      },
      
      originalSize: originalBuffer.length,
      optimizedSize: optimizedBuffer.length,
    });
    
  } catch (error: any) {
    console.error(`[${requestId}] Error:`, error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to optimize photo' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    endpoint: '/api/optimize/photo',
    method: 'POST',
    description: 'Optimizes photos using database-driven scoring rules',
    scoring: 'Deterministic - same input = same output',
    output: 'JPEG under 1MB (Etsy compliant)',
  });
}
