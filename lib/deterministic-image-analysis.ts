/**
 * DETERMINISTIC IMAGE ANALYSIS
 * Uses computer vision algorithms (Sharp) for OBJECTIVE measurements
 * NO AI, NO VARIABILITY - same image always returns same result
 */

import sharp from 'sharp';

export interface DeterministicImageAnalysis {
  // Blur detection (Laplacian variance)
  hasSevereBlur: boolean;
  blurScore: number;  // 0-100, higher = sharper

  // Lighting detection (histogram analysis)
  hasSevereLighting: boolean;
  brightnessScore: number;  // 0-100, 50 = optimal

  // Product visibility (edge/contrast detection)
  isProductDistinguishable: boolean;
  contrastScore: number;  // 0-100, higher = better contrast

  // Metadata
  width: number;
  height: number;
  format: string;
  size: number;
  colorSpace: string;
  hasAlpha: boolean;
}

/**
 * Analyze image using deterministic computer vision algorithms
 * CRITICAL: This function MUST be deterministic - same input = same output
 */
export async function analyzeImageDeterministic(buffer: Buffer): Promise<DeterministicImageAnalysis> {
  const image = sharp(buffer);
  const metadata = await image.metadata();

  // Get image stats for analysis
  const stats = await image.stats();

  // 1. BLUR DETECTION (Laplacian variance method)
  // Convert to grayscale and calculate edge detection
  const { data: edges } = await image
    .grayscale()
    .convolve({
      width: 3,
      height: 3,
      kernel: [-1, -1, -1, -1, 8, -1, -1, -1, -1]  // Laplacian kernel
    })
    .raw()
    .toBuffer({ resolveWithObject: true });

  // Calculate variance of Laplacian (measure of blur)
  const laplacianVariance = calculateVariance(edges);

  // Blur score: Higher variance = sharper image
  // Empirical thresholds:
  // > 500 = very sharp
  // 200-500 = acceptable
  // < 200 = blurry
  // < 100 = severely blurred
  const blurScore = Math.min(100, (laplacianVariance / 5));  // Normalize to 0-100
  const hasSevereBlur = laplacianVariance < 100;  // FIXED THRESHOLD

  // 2. LIGHTING DETECTION (Histogram analysis)
  // Check if image is too dark, too bright, or has harsh shadows
  const channelMeans = stats.channels.map(ch => ch.mean);
  const averageBrightness = channelMeans.reduce((a, b) => a + b, 0) / channelMeans.length;

  // Brightness score: 0 = black, 255 = white, 128 = ideal
  // Map to 0-100 where 50 = optimal
  const brightnessScore = 100 - Math.abs(averageBrightness - 128) / 1.28;

  // Check for blown highlights or crushed shadows
  const channelMaxs = stats.channels.map(ch => ch.max);
  const channelMins = stats.channels.map(ch => ch.min);
  const hasBlownHighlights = channelMaxs.some(max => max > 250);
  const hasCrushedShadows = channelMins.some(min => min < 5);

  // Severe lighting if too dark (<30), too bright (>225), or clipped
  const hasSevereLighting =
    averageBrightness < 30 ||
    averageBrightness > 225 ||
    hasBlownHighlights ||
    hasCrushedShadows;

  // 3. PRODUCT DISTINGUISHABILITY (Contrast/edge detection)
  // Calculate standard deviation across channels (measure of contrast)
  const channelStdDevs = stats.channels.map(ch => ch.stdev);
  const averageStdDev = channelStdDevs.reduce((a, b) => a + b, 0) / channelStdDevs.length;

  // Contrast score: Higher std dev = better contrast
  const contrastScore = Math.min(100, (averageStdDev / 0.6));  // Normalize to 0-100

  // Product distinguishable if sufficient contrast and not too blurry
  const isProductDistinguishable = averageStdDev > 20 && !hasSevereBlur;

  return {
    hasSevereBlur,
    blurScore: Math.round(blurScore),
    hasSevereLighting,
    brightnessScore: Math.round(brightnessScore),
    isProductDistinguishable,
    contrastScore: Math.round(contrastScore),
    width: metadata.width || 0,
    height: metadata.height || 0,
    format: metadata.format || 'unknown',
    size: buffer.length,
    colorSpace: metadata.space || 'unknown',
    hasAlpha: metadata.hasAlpha || false,
  };
}

/**
 * Calculate variance of pixel values
 */
function calculateVariance(buffer: Buffer): number {
  const values = Array.from(buffer);
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const squaredDiffs = values.map(v => Math.pow(v - mean, 2));
  const variance = squaredDiffs.reduce((a, b) => a + b, 0) / values.length;
  return variance;
}

/**
 * Check if first photo is thumbnail-safe (centered 1:1 crop won't cut off product)
 * This requires object detection - return true by default for now
 * Will be enhanced with Google Vision API object detection
 */
export async function isThumbnailCropSafe(
  buffer: Buffer,
  productBoundingBox?: { x: number; y: number; width: number; height: number }
): Promise<boolean> {
  if (!productBoundingBox) {
    // If no bounding box provided, assume safe
    return true;
  }

  const metadata = await sharp(buffer).metadata();
  const imageWidth = metadata.width || 0;
  const imageHeight = metadata.height || 0;

  // Calculate centered 1:1 crop dimensions
  const cropSize = Math.min(imageWidth, imageHeight);
  const cropX = (imageWidth - cropSize) / 2;
  const cropY = (imageHeight - cropSize) / 2;

  // Check if product bounding box fits within the crop
  const productLeft = productBoundingBox.x;
  const productRight = productBoundingBox.x + productBoundingBox.width;
  const productTop = productBoundingBox.y;
  const productBottom = productBoundingBox.y + productBoundingBox.height;

  const cropLeft = cropX;
  const cropRight = cropX + cropSize;
  const cropTop = cropY;
  const cropBottom = cropY + cropSize;

  // Product is safe if fully contained within crop with 10% margin
  const margin = cropSize * 0.1;
  const isSafe =
    productLeft >= (cropLeft + margin) &&
    productRight <= (cropRight - margin) &&
    productTop >= (cropTop + margin) &&
    productBottom <= (cropBottom - margin);

  return isSafe;
}
