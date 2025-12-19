/**
 * ETSY IMAGE OPTIMIZER
 * Optimizes images to meet Etsy's requirements
 * Based on ImageFinal.docx specifications
 */

import sharp from 'sharp';
import { ETSY_IMAGE_SPECS, getEtsyCategory, ETSY_CATEGORIES, type EtsyCategory } from './etsy-image-standards';
import { analyzeImage, isEtsyOptimized, type ImageAnalysis } from './photoScoring';

export interface OptimizationResult {
  success: boolean;
  alreadyOptimized: boolean;
  
  // The optimized image buffer
  buffer: Buffer;
  
  // Output format ('png' for lossless, 'jpeg' if PNG was too large)
  outputFormat?: 'png' | 'jpeg';
  
  // What was done
  improvements: string[];
  
  // Scores
  originalScore: number;
  newScore: number;
  scoreImprovement: number;
  
  // Analysis of optimized image
  analysis: ImageAnalysis;
  
  // Message for user
  message: string;
}

export interface OptimizationOptions {
  // Target dimensions (default: maintain aspect ratio, ensure min 2000px shortest side)
  targetWidth?: number;
  targetHeight?: number;
  
  // Target aspect ratio (default: 4:3 per Etsy recommendation)
  targetAspectRatio?: number;
  
  // Force specific optimizations
  forceResize?: boolean;
  forceCrop?: boolean;
  forceSharpen?: boolean;
  forceBrightness?: boolean;
  forceCompress?: boolean;
}

/**
 * Optimize an image to meet Etsy standards
 */
export async function optimizeImage(
  buffer: Buffer,
  categoryInput: string = 'craft_supplies',
  options: OptimizationOptions = {}
): Promise<OptimizationResult> {
  
  const category = getEtsyCategory(categoryInput);
  const categoryInfo = ETSY_CATEGORIES[category];
  
  console.log('[Optimizer] Starting optimization for category:', categoryInfo.name);
  
  // Analyze original image
  const originalAnalysis = await analyzeImage(buffer, categoryInput);
  const originalScore = originalAnalysis.score;
  
  console.log('[Optimizer] Original score:', originalScore);
  console.log('[Optimizer] Original dimensions:', originalAnalysis.metadata.width, 'x', originalAnalysis.metadata.height);
  
  // Check if already optimized
  if (isEtsyOptimized(originalAnalysis) && !options.forceResize && !options.forceCrop) {
    console.log('[Optimizer] Image already meets Etsy standards');
    return {
      success: true,
      alreadyOptimized: true,
      buffer,
      improvements: [],
      originalScore,
      newScore: originalScore,
      scoreImprovement: 0,
      analysis: originalAnalysis,
      message: 'Image already meets Etsy standards - no optimization needed.',
    };
  }
  
  // Determine what optimizations are needed
  const meta = originalAnalysis.metadata;
  const breakdown = originalAnalysis.breakdown;
  
  const needsResize = meta.shortestSide < 2000 || options.forceResize;
  const needsCrop = breakdown.aspectRatio < 80 || options.forceCrop;
  const needsSharpen = breakdown.sharpness < 75 || options.forceSharpen;
  const needsBrighten = meta.brightness < 45 || options.forceBrightness;
  const needsDarken = meta.brightness > 75 && !needsBrighten;
  const needsCompress = meta.fileSizeKB > 1024 || options.forceCompress;
  
  console.log('[Optimizer] Needs:', { needsResize, needsCrop, needsSharpen, needsBrighten, needsDarken, needsCompress });
  
  // Start building the optimization pipeline
  let pipeline = sharp(buffer);
  const improvements: string[] = [];
  
  // ===========================================
  // 1. RESIZE / CROP TO 4:3
  // ===========================================
  if (needsCrop || needsResize) {
    // Target: 4:3 aspect ratio, minimum 2000px shortest side
    // Etsy recommended: 3000 x 2250
    
    const targetAspect = options.targetAspectRatio || (4 / 3);
    let targetWidth = options.targetWidth || 3000;
    let targetHeight = options.targetHeight || Math.round(targetWidth / targetAspect);
    
    // If original is smaller, don't upscale beyond original
    if (meta.width < targetWidth && meta.height < targetHeight) {
      // Scale to ensure shortest side is at least 2000 (if possible)
      const scale = Math.min(
        targetWidth / meta.width,
        targetHeight / meta.height,
        2000 / meta.shortestSide
      );
      
      if (scale < 1) {
        // Original is larger than target, just crop to 4:3
        targetWidth = Math.round(meta.width);
        targetHeight = Math.round(meta.width / targetAspect);
      } else if (scale <= 1.5) {
        // Mild upscale is OK
        targetWidth = Math.round(meta.width * scale);
        targetHeight = Math.round(targetWidth / targetAspect);
      }
      // Don't upscale more than 1.5x
    }
    
    // Ensure minimum dimensions
    targetWidth = Math.max(targetWidth, 2000);
    targetHeight = Math.max(targetHeight, 1500);
    
    // Ensure we don't exceed reasonable limits
    targetWidth = Math.min(targetWidth, 4000);
    targetHeight = Math.min(targetHeight, 3000);
    
    console.log('[Optimizer] Resizing to:', targetWidth, 'x', targetHeight);
    
    pipeline = pipeline.resize(targetWidth, targetHeight, {
      fit: 'cover',
      position: 'center',
      withoutEnlargement: false,  // Allow upscaling if needed
    });
    
    improvements.push(`Resized to ${targetWidth}x${targetHeight} (4:3 ratio)`);
  }
  
  // ===========================================
  // 2. SHARPENING
  // ===========================================
  if (needsSharpen) {
    console.log('[Optimizer] Applying sharpening');
    pipeline = pipeline.sharpen({
      sigma: 1.5,  // Moderate sharpening
      m1: 1.0,
      m2: 0.5,
    });
    improvements.push('Applied sharpening for better clarity');
  }
  
  // ===========================================
  // 3. BRIGHTNESS / EXPOSURE
  // ===========================================
  if (needsBrighten) {
    console.log('[Optimizer] Brightening image');
    // Increase brightness for dark images
    const brightnessBoost = meta.brightness < 35 ? 1.3 : 1.2;
    pipeline = pipeline
      .modulate({ brightness: brightnessBoost, saturation: 1.05 })
      .gamma(1.1);
    improvements.push('Enhanced brightness and lighting');
  } else if (needsDarken) {
    console.log('[Optimizer] Reducing brightness');
    pipeline = pipeline
      .modulate({ brightness: 0.9 })
      .gamma(0.95);
    improvements.push('Balanced exposure');
  }
  
  // ===========================================
  // 4. OUTPUT FORMAT - PNG preferred (lossless), JPEG fallback
  // ===========================================
  // Etsy accepts: jpg, gif, png (max 1MB)
  // PNG preserves exact pixels - no quality loss on re-download
  // JPEG is lossy - degrades on each save cycle
  
  console.log('[Optimizer] Generating PNG output (lossless)...');
  
  // First try PNG (lossless, preserves exact pixels)
  let optimizedBuffer = await pipeline
    .png({ compressionLevel: 9 })  // Max compression for smallest PNG
    .toBuffer();
  
  let outputFormat = 'png';
  
  // If PNG is over 1MB, fall back to high-quality JPEG
  if (optimizedBuffer.length > ETSY_IMAGE_SPECS.maxFileSize) {
    console.log('[Optimizer] PNG too large (' + (optimizedBuffer.length / 1024).toFixed(0) + 'KB), falling back to JPEG');
    
    // Try JPEG at 92% quality
    optimizedBuffer = await sharp(buffer)  // Start fresh from original
      .resize(targetWidth || meta.width, targetHeight || meta.height, {
        fit: 'cover',
        position: 'center',
      })
      .sharpen(needsSharpen ? { sigma: 1.5, m1: 1.0, m2: 0.5 } : undefined)
      .jpeg({ quality: 92, progressive: true, mozjpeg: true })
      .toBuffer();
    
    outputFormat = 'jpeg';
    
    // If still over 1MB, reduce quality
    if (optimizedBuffer.length > ETSY_IMAGE_SPECS.maxFileSize) {
      console.log('[Optimizer] JPEG 92% still over 1MB, trying 85%');
      optimizedBuffer = await sharp(optimizedBuffer)
        .jpeg({ quality: 85, progressive: true, mozjpeg: true })
        .toBuffer();
    }
    
    // Last resort: 80% quality
    if (optimizedBuffer.length > ETSY_IMAGE_SPECS.maxFileSize) {
      console.log('[Optimizer] JPEG 85% still over 1MB, trying 80%');
      optimizedBuffer = await sharp(optimizedBuffer)
        .jpeg({ quality: 80, progressive: true, mozjpeg: true })
        .toBuffer();
    }
    
    improvements.push('Compressed to JPEG for Etsy file size limit');
  } else {
    improvements.push('Saved as PNG (lossless) for maximum quality');
  }
  
  console.log('[Optimizer] Final format:', outputFormat, '| Size:', (optimizedBuffer.length / 1024).toFixed(0) + 'KB');
  
  // ===========================================
  // 5. ANALYZE OPTIMIZED IMAGE
  // ===========================================
  const newAnalysis = await analyzeImage(optimizedBuffer, categoryInput);
  const newScore = newAnalysis.score;
  const scoreImprovement = newScore - originalScore;
  
  console.log('[Optimizer] New score:', newScore, '(improvement:', scoreImprovement, ')');
  console.log('[Optimizer] New dimensions:', newAnalysis.metadata.width, 'x', newAnalysis.metadata.height);
  console.log('[Optimizer] New file size:', (optimizedBuffer.length / 1024).toFixed(0), 'KB');
  
  // Build message
  let message: string;
  if (scoreImprovement > 0) {
    message = `Photo optimized for Etsy! Score improved from ${originalScore} to ${newScore} (+${scoreImprovement} points).`;
  } else if (improvements.length > 0) {
    message = `Photo optimized to meet Etsy standards.`;
  } else {
    message = `Photo processed but minimal changes were needed.`;
  }
  
  return {
    success: true,
    alreadyOptimized: false,
    buffer: optimizedBuffer,
    outputFormat,  // 'png' or 'jpeg'
    improvements,
    originalScore,
    newScore,
    scoreImprovement,
    analysis: newAnalysis,
    message,
  };
}
