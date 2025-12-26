/**
 * ETSY TECHNICAL COMPLIANCE SCORING
 *
 * Deterministic, measurable scoring based on Etsy's official image specifications.
 * This score is SEPARATE from AI visual quality and can be recalculated after optimization.
 *
 * Official Etsy Requirements:
 * - Recommended Size: 3000 × 2250 pixels
 * - Aspect Ratio: 4:3
 * - Quality Benchmark: Shortest side ≥ 2000 pixels
 * - File Size: Under 1MB
 * - Resolution: 72 PPI
 * - Color Profile: sRGB
 * - File Types: JPG, PNG, GIF
 */

export interface EtsyComplianceResult {
  overallCompliance: number; // 0-100
  breakdown: {
    aspectRatio: { score: number; status: string; message: string };
    resolution: { score: number; status: string; message: string };
    fileSize: { score: number; status: string; message: string };
    colorProfile: { score: number; status: string; message: string };
    format: { score: number; status: string; message: string };
  };
}

export interface ImageTechnicalSpecs {
  width: number;
  height: number;
  fileSizeBytes: number;
  colorProfile: string;
  format: string;
  ppi?: number;
}

/**
 * Calculate Etsy technical compliance score (0-100)
 * This is deterministic and based purely on measurable properties
 */
export function calculateEtsyCompliance(specs: ImageTechnicalSpecs): EtsyComplianceResult {
  const breakdown = {
    aspectRatio: scoreAspectRatio(specs.width, specs.height),
    resolution: scoreResolution(specs.width, specs.height),
    fileSize: scoreFileSize(specs.fileSizeBytes),
    colorProfile: scoreColorProfile(specs.colorProfile),
    format: scoreFormat(specs.format),
  };

  // Equal weight to all compliance factors
  const overallCompliance = Math.round(
    (breakdown.aspectRatio.score +
      breakdown.resolution.score +
      breakdown.fileSize.score +
      breakdown.colorProfile.score +
      breakdown.format.score) / 5
  );

  return {
    overallCompliance,
    breakdown,
  };
}

/**
 * Score aspect ratio compliance
 * Etsy recommends 4:3 (3000×2250)
 */
function scoreAspectRatio(width: number, height: number): { score: number; status: string; message: string } {
  const ratio = width / height;
  const targetRatio = 4 / 3; // 1.333...

  // Calculate deviation from ideal 4:3
  const deviation = Math.abs(ratio - targetRatio);

  if (deviation < 0.01) {
    // Perfect 4:3
    return { score: 100, status: 'perfect', message: 'Perfect 4:3 aspect ratio (recommended by Etsy)' };
  } else if (deviation < 0.05) {
    // Very close to 4:3
    return { score: 95, status: 'excellent', message: 'Near-perfect 4:3 aspect ratio' };
  } else if (deviation < 0.15) {
    // Close to 4:3
    return { score: 85, status: 'good', message: 'Close to 4:3 aspect ratio' };
  } else if (ratio >= 0.67 && ratio <= 1.5) {
    // Within acceptable range (won't be heavily cropped in thumbnail)
    return { score: 70, status: 'acceptable', message: 'Acceptable aspect ratio, but not optimal for Etsy' };
  } else {
    // Will be heavily cropped
    return { score: 40, status: 'poor', message: 'Non-standard aspect ratio - will be cropped in thumbnails' };
  }
}

/**
 * Score resolution compliance
 * Etsy recommends shortest side ≥ 2000px
 * Recommended size is 3000×2250
 */
function scoreResolution(width: number, height: number): { score: number; status: string; message: string } {
  const shortestSide = Math.min(width, height);

  if (shortestSide >= 3000) {
    return { score: 100, status: 'perfect', message: 'Exceeds Etsy recommended resolution (3000px+)' };
  } else if (shortestSide >= 2000) {
    return { score: 90, status: 'excellent', message: 'Meets Etsy quality benchmark (≥2000px shortest side)' };
  } else if (shortestSide >= 1500) {
    return { score: 75, status: 'good', message: 'Good resolution, but below Etsy quality benchmark' };
  } else if (shortestSide >= 1000) {
    return { score: 60, status: 'acceptable', message: 'Meets Etsy minimum (1000px), but not quality benchmark' };
  } else {
    return { score: 30, status: 'poor', message: 'Below Etsy minimum width requirement (1000px)' };
  }
}

/**
 * Score file size compliance
 * Etsy requires < 1MB
 */
function scoreFileSize(fileSizeBytes: number): { score: number; status: string; message: string } {
  const fileSizeMB = fileSizeBytes / (1024 * 1024);

  if (fileSizeMB <= 0.5) {
    return { score: 100, status: 'perfect', message: 'Optimal file size (<500KB) - fast loading' };
  } else if (fileSizeMB <= 0.8) {
    return { score: 95, status: 'excellent', message: 'Excellent file size - under Etsy limit with room to spare' };
  } else if (fileSizeMB < 1.0) {
    return { score: 90, status: 'good', message: 'Good file size - under Etsy 1MB limit' };
  } else if (fileSizeMB < 2.0) {
    return { score: 40, status: 'critical', message: 'Exceeds Etsy 1MB limit - will be rejected' };
  } else {
    return { score: 20, status: 'critical', message: 'Far exceeds Etsy 1MB limit - will be rejected' };
  }
}

/**
 * Score color profile compliance
 * Etsy recommends sRGB
 */
function scoreColorProfile(colorProfile: string): { score: number; status: string; message: string } {
  const profile = colorProfile.toLowerCase();

  if (profile === 'srgb') {
    return { score: 100, status: 'perfect', message: 'Correct sRGB color profile (Etsy recommended)' };
  } else if (profile.includes('rgb')) {
    return { score: 80, status: 'acceptable', message: 'RGB color space - should convert to sRGB for consistency' };
  } else if (profile === 'cmyk') {
    return { score: 50, status: 'poor', message: 'CMYK color space - must convert to sRGB for web display' };
  } else {
    return { score: 70, status: 'acceptable', message: `${colorProfile} color profile - recommend sRGB` };
  }
}

/**
 * Score format compliance
 * Etsy accepts JPG, PNG, GIF
 * JPG is most common and efficient
 */
function scoreFormat(format: string): { score: number; status: string; message: string } {
  const fmt = format.toLowerCase();

  if (fmt === 'jpeg' || fmt === 'jpg') {
    return { score: 100, status: 'perfect', message: 'JPEG format - optimal for photos' };
  } else if (fmt === 'png') {
    return { score: 95, status: 'excellent', message: 'PNG format - acceptable, but larger file sizes' };
  } else if (fmt === 'gif') {
    return { score: 90, status: 'good', message: 'GIF format - acceptable for simple graphics' };
  } else if (fmt === 'webp') {
    return { score: 85, status: 'good', message: 'WebP format - excellent quality, but convert to JPG for Etsy' };
  } else {
    return { score: 40, status: 'critical', message: `${format} format not supported by Etsy - must convert` };
  }
}

/**
 * Combine AI Visual Quality and Etsy Compliance into final score
 *
 * @param visualQuality - AI-scored visual quality (0-100, immutable)
 * @param etsyCompliance - Technical compliance score (0-100, mutable)
 * @param weights - Optional custom weights (default: 60% visual, 40% compliance)
 */
export function calculateFinalScore(
  visualQuality: number,
  etsyCompliance: number,
  weights: { visual: number; compliance: number } = { visual: 0.6, compliance: 0.4 }
): number {
  return Math.round(visualQuality * weights.visual + etsyCompliance * weights.compliance);
}
