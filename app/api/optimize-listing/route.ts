export const runtime = 'nodejs';
export const maxDuration = 60;

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import sharp from 'sharp';
import { randomUUID } from 'crypto';
import { ImageAttributes } from '@/lib/database-scoring';
import { AIVisionResponse } from '@/lib/ai-vision';
import { calculateEtsyCompliance, calculateFinalScore, ImageTechnicalSpecs } from '@/lib/etsy-compliance-scoring';
import { prisma } from '@/lib/prisma';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const ETSY_MAX_FILE_SIZE = 1 * 1024 * 1024;
const ETSY_TARGET_WIDTH = 3000;
const ETSY_TARGET_HEIGHT = 2250;
const ETSY_MIN_SHORTEST_SIDE = 2000;
const ETSY_PPI = 72;

interface OptimizedImageResult {
  imageIndex: number;
  isMainImage: boolean;
  originalScore: number;
  newScore: number;
  scoreImprovement: number;
  optimizedUrl: string;
  improvements: string[];
  warnings: string[];
  alreadyOptimized: boolean;
  metadata: {
    width: number;
    height: number;
    fileSizeKB: number;
    colorProfile: string;
    ppi: number;
  };
}

function validateSquareSafe(width: number, height: number, isMainImage: boolean): { isSquareSafe: boolean; warning?: string } {
  if (!isMainImage) return { isSquareSafe: true };
  const aspectRatio = width / height;
  if (aspectRatio > 1.5) return { isSquareSafe: false, warning: 'Main image is very wide - Etsy thumbnail may crop off sides of product' };
  if (aspectRatio < 0.67) return { isSquareSafe: false, warning: 'Main image is very tall - Etsy thumbnail may crop off top/bottom of product' };
  return { isSquareSafe: true };
}

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
    width_px: width, height_px: height, shortest_side: Math.min(width, height),
    file_size_bytes: buffer.length, aspect_ratio: aspectRatio,
    file_type: fileType.replace('image/', ''), color_profile: metadata.space || 'sRGB',
    ppi: metadata.density || 72, has_clean_white_background: false, is_product_centered: false,
    has_good_lighting: false, is_sharp_focus: false, has_no_watermarks: true,
    professional_appearance: false, has_studio_shot: false, has_lifestyle_shot: false,
    has_scale_shot: false, has_detail_shot: false, has_group_shot: false,
    has_packaging_shot: false, has_process_shot: false, shows_texture_or_craftsmanship: false,
    product_clearly_visible: false, appealing_context: false, reference_object_visible: false,
    size_comparison_clear: false,
  };
}

async function optimizeImageBuffer(
  buffer: Buffer,
  originalAttributes: ImageAttributes,
  mergedAttributes?: AIVisionResponse & { _needs_brightness_boost?: boolean; _needs_sharpening?: boolean; _needs_contrast_boost?: boolean; _needs_saturation_boost?: boolean }
): Promise<{ optimizedBuffer: Buffer; improvements: string[] }> {
  const improvements: string[] = [];
  let pipeline = sharp(buffer);
  
  const needsResize = originalAttributes.shortest_side < ETSY_MIN_SHORTEST_SIDE || originalAttributes.aspect_ratio !== '4:3';
  if (needsResize) {
    let targetWidth = ETSY_TARGET_WIDTH;
    let targetHeight = ETSY_TARGET_HEIGHT;
    if (originalAttributes.width_px < targetWidth / 1.5) {
      const scale = Math.min(1.5, ETSY_MIN_SHORTEST_SIDE / originalAttributes.shortest_side);
      targetWidth = Math.round(originalAttributes.width_px * scale);
      targetHeight = Math.round(targetWidth / (4/3));
    }
    // Use 'cover' to crop edges instead of adding white padding
    // This preserves product fill percentage (70-80% recommended by Etsy)
    // 'entropy' strategy keeps important visual areas (product)
    pipeline = pipeline.resize(targetWidth, targetHeight, { fit: 'cover', position: 'entropy' });
    improvements.push('✅ Resized to Etsy optimal dimensions (4:3, cropped to fill)');
  }
  
  pipeline = pipeline.toColorspace('srgb');
  improvements.push('✅ Color profile: sRGB');
  
  const needsBrightness = mergedAttributes?._needs_brightness_boost ?? false;
  const needsSharpening = mergedAttributes?._needs_sharpening ?? false;
  const needsContrast = mergedAttributes?._needs_contrast_boost ?? false;
  const needsSaturation = mergedAttributes?._needs_saturation_boost ?? false;
  
  if (needsSharpening) {
    pipeline = pipeline.sharpen({ sigma: 1.0, m1: 0.5, m2: 0.5 });
    improvements.push('✅ Image sharpened for clarity');
  }
  
  const modulateOptions: { brightness?: number; saturation?: number } = {};
  if (needsBrightness) { modulateOptions.brightness = 1.08; improvements.push('✅ Lighting enhanced'); }
  if (needsSaturation) { modulateOptions.saturation = 1.1; improvements.push('✅ Colors enhanced'); }
  if (Object.keys(modulateOptions).length > 0) pipeline = pipeline.modulate(modulateOptions);
  
  if (needsContrast) { pipeline = pipeline.linear(1.1, -(128 * 0.1)); improvements.push('✅ Contrast improved'); }
  
  let quality = 85;
  let optimizedBuffer = await pipeline.withMetadata({ density: ETSY_PPI }).jpeg({ quality, progressive: true, mozjpeg: true }).toBuffer();
  
  if (optimizedBuffer.length > ETSY_MAX_FILE_SIZE) { quality = 80; optimizedBuffer = await sharp(optimizedBuffer).withMetadata({ density: ETSY_PPI }).jpeg({ quality, progressive: true, mozjpeg: true }).toBuffer(); }
  if (optimizedBuffer.length > ETSY_MAX_FILE_SIZE) { quality = 75; optimizedBuffer = await sharp(optimizedBuffer).withMetadata({ density: ETSY_PPI }).jpeg({ quality, progressive: true, mozjpeg: true }).toBuffer(); }
  if (optimizedBuffer.length > ETSY_MAX_FILE_SIZE) { quality = 70; optimizedBuffer = await sharp(optimizedBuffer).withMetadata({ density: ETSY_PPI }).jpeg({ quality, progressive: true, mozjpeg: true }).toBuffer(); improvements.push('⚠️ Compressed to meet Etsy 1MB limit'); }
  else { improvements.push('✅ Optimized file size for fast loading'); }
  
  improvements.push('✅ Etsy-compliant JPEG format');
  return { optimizedBuffer, improvements };
}

export async function POST(request: NextRequest) {
  const requestId = randomUUID().substring(0, 8);
  console.log(`[${requestId}] Listing optimization started`);

  try {
    const formData = await request.formData();
    
    // ===========================================
    // REQUIRE analysis_id - NO CLIENT-SIDE SCORES
    // ===========================================
    const analysis_id = formData.get('analysis_id') as string | null;
    if (!analysis_id) {
      return NextResponse.json(
        { success: false, error: 'analysis_id required' },
        { status: 400 }
      );
    }
    
    // ===========================================
    // FETCH PERSISTED ANALYSIS FROM DATABASE
    // ===========================================
    const analysis = await prisma.listingAnalysis.findUnique({
      where: { id: analysis_id }
    });
    
    if (!analysis) {
      return NextResponse.json(
        { success: false, error: 'Analysis not found', details: `No analysis with id ${analysis_id}` },
        { status: 404 }
      );
    }
    
    const analysisImageScores = analysis.imageScores as number[];
    const analysisListingScore = analysis.overallListingScore;
    const analysisImageResults = analysis.imageResults as any[];
    
    console.log(`[${requestId}] Loaded analysis ${analysis_id}: listing=${analysisListingScore}, images=${analysisImageScores.join(',')}`);
    
    // ===========================================
    // COLLECT IMAGE FILES
    // ===========================================
    const imageFiles: File[] = [];
    let index = 0;
    while (true) {
      const file = formData.get(`image_${index}`) as File;
      if (!file) break;
      imageFiles.push(file);
      index++;
    }
    
    if (imageFiles.length === 0) {
      return NextResponse.json({ success: false, error: 'No images provided' }, { status: 400 });
    }
    if (imageFiles.length > 10) {
      return NextResponse.json({ success: false, error: 'Maximum 10 images allowed' }, { status: 400 });
    }
    
    // Validate image count matches analysis
    if (imageFiles.length !== analysisImageScores.length) {
      return NextResponse.json(
        { success: false, error: 'Image count mismatch', details: `Expected ${analysisImageScores.length} images but received ${imageFiles.length}` },
        { status: 400 }
      );
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const optimizedResults: OptimizedImageResult[] = [];
    
    for (let i = 0; i < imageFiles.length; i++) {
      const file = imageFiles[i];
      const isMainImage = i === 0;
      
      try {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const originalAttrs = await extractTechnicalAttributes(buffer, file.type || 'image/jpeg');
        
        // READ SCORE VERBATIM FROM PERSISTED ANALYSIS - NO FALLBACK
        const originalScore = analysisImageScores[i];
        if (originalScore === undefined) {
          throw new Error(`No score found for image ${i} in analysis ${analysis_id}`);
        }
        
        // Get optimization flags from persisted analysis results
        const imageAnalysis = analysisImageResults[i];
        
        const { optimizedBuffer, improvements } = await optimizeImageBuffer(buffer, originalAttrs, imageAnalysis);

        const optimizedMetadata = await sharp(optimizedBuffer).metadata();
        const warnings: string[] = [];
        const squareSafeCheck = validateSquareSafe(optimizedMetadata.width || 0, optimizedMetadata.height || 0, isMainImage);
        if (!squareSafeCheck.isSquareSafe && squareSafeCheck.warning) warnings.push(squareSafeCheck.warning);

        // ===========================================
        // TWO-ENGINE MODEL: RECALCULATE ETSY COMPLIANCE ONLY
        // ===========================================
        // Visual quality is IMMUTABLE - we keep the original AI score
        // Only technical compliance changes during optimization

        const originalVisualQuality = imageAnalysis.visualQuality || originalScore; // Fallback for old data
        const originalEtsyCompliance = imageAnalysis.etsyCompliance || 0;

        console.log(`[${requestId}] Image ${i + 1}: Original scores - Visual: ${originalVisualQuality}, Compliance: ${originalEtsyCompliance}`);

        // Extract new technical specs from optimized image
        const newSpecs: ImageTechnicalSpecs = {
          width: optimizedMetadata.width || 0,
          height: optimizedMetadata.height || 0,
          fileSizeBytes: optimizedBuffer.length,
          colorProfile: optimizedMetadata.space || 'srgb',
          format: 'jpeg',
          ppi: ETSY_PPI,
        };

        const newEtsyCompliance = calculateEtsyCompliance(newSpecs);
        console.log(`[${requestId}] Image ${i + 1}: New Etsy compliance = ${newEtsyCompliance.overallCompliance}% (was ${originalEtsyCompliance}%)`);

        // Calculate new final score: Visual quality (unchanged) + New compliance
        const newScore = calculateFinalScore(originalVisualQuality, newEtsyCompliance.overallCompliance);
        const scoreImprovement = newScore - originalScore;

        console.log(`[${requestId}] Image ${i + 1}: ${originalScore} → ${newScore} (${scoreImprovement >= 0 ? '+' : ''}${scoreImprovement}) [Visual: ${originalVisualQuality} unchanged, Compliance: ${originalEtsyCompliance} → ${newEtsyCompliance.overallCompliance}]`);

        const filename = `optimized-${requestId}-${i}-${Date.now()}.jpg`;
        await supabase.storage.from('product-images').upload(filename, optimizedBuffer, { contentType: 'image/jpeg', cacheControl: 'no-cache' });
        const { data: urlData } = supabase.storage.from('product-images').getPublicUrl(filename);

        optimizedResults.push({
          imageIndex: i,
          isMainImage,
          originalScore,
          newScore,
          scoreImprovement,
          optimizedUrl: urlData.publicUrl,
          improvements,
          warnings,
          alreadyOptimized: scoreImprovement <= 0, // If no improvement, already optimized
          metadata: {
            width: optimizedMetadata.width || 0,
            height: optimizedMetadata.height || 0,
            fileSizeKB: Math.round(optimizedBuffer.length / 1024),
            colorProfile: 'sRGB',
            ppi: ETSY_PPI
          },
        });
      } catch (imageError: any) {
        optimizedResults.push({
          imageIndex: i,
          isMainImage,
          originalScore: analysisImageScores[i] || 0,
          newScore: analysisImageScores[i] || 0,
          scoreImprovement: 0,
          optimizedUrl: '',
          improvements: [],
          warnings: [`Failed: ${imageError.message}`],
          alreadyOptimized: false,
          metadata: { width: 0, height: 0, fileSizeKB: 0, colorProfile: 'unknown', ppi: 0 }
        });
      }
    }

    // ===========================================
    // CALCULATE NEW LISTING SCORE
    // ===========================================
    // Calculate average of new scores (same formula as initial analysis)
    const totalNewScore = optimizedResults.reduce((sum, result) => sum + result.newScore, 0);
    const newListingScore = Math.round(totalNewScore / optimizedResults.length);
    const overallImprovement = newListingScore - analysisListingScore;

    console.log(`[${requestId}] Listing optimization complete: ${analysisListingScore} → ${newListingScore} (${overallImprovement >= 0 ? '+' : ''}${overallImprovement})`);

    return NextResponse.json({
      success: true,
      analysis_id,
      imageCount: imageFiles.length,
      originalListingScore: analysisListingScore,
      newListingScore,
      overallImprovement,
      optimizedImages: optimizedResults,
      etsyCompliance: { colorProfile: 'sRGB', ppi: ETSY_PPI, aspectRatio: '4:3', maxFileSize: '1MB' },
      message: overallImprovement > 0
        ? `Photos optimized! Score improved by ${overallImprovement} points.`
        : 'Photos optimized for Etsy compliance (sRGB, 72 PPI, 4:3, compressed).',
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: 'Optimization failed', details: error.message }, { status: 500 });
  }
}
