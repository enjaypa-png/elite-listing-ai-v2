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
  // 4. COMPRESSION (always output as JPEG under 1MB)
  // ===========================================
  // Start with high quality, reduce if needed
  let quality = 92;
  if (needsCompress || meta.fileSizeKB > 800) {
    quality = 85;
  }
  
  console.log('[Optimizer] Compressing with quality:', quality);
  pipeline = pipeline.jpeg({
    quality,
    progressive: true,
    mozjpeg: true,
  });
  
  if (needsCompress) {
    improvements.push('Optimized file size for Etsy (under 1MB)');
  }
  
  // ===========================================
  // 5. EXECUTE PIPELINE
  // ===========================================
  let optimizedBuffer = await pipeline.toBuffer();
  
  // Check file size and recompress if still over 1MB
  if (optimizedBuffer.length > ETSY_IMAGE_SPECS.maxFileSize) {
    console.log('[Optimizer] Still over 1MB, recompressing with lower quality');
    optimizedBuffer = await sharp(optimizedBuffer)
      .jpeg({ quality: 80, progressive: true, mozjpeg: true })
      .toBuffer();
    
    // If still over, try even lower
    if (optimizedBuffer.length > ETSY_IMAGE_SPECS.maxFileSize) {
      optimizedBuffer = await sharp(optimizedBuffer)
        .jpeg({ quality: 75, progressive: true, mozjpeg: true })
        .toBuffer();
    }
  }
  
  // ===========================================
  // 6. ANALYZE OPTIMIZED IMAGE
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
    improvements,
    originalScore,
    newScore,
    scoreImprovement,
    analysis: newAnalysis,
    message,
  };
}
