/**
 * ETSY IMAGE ANALYZER & SCORER
 * Based on official Etsy image requirements from ImageFinal.docx
 */

import sharp from 'sharp';
import { 
  ETSY_IMAGE_SPECS, 
  ETSY_CATEGORIES, 
  getEtsyCategory,
  type EtsyCategory 
} from './etsy-image-standards';

// ===========================================
// TYPES
// ===========================================
export interface ImageAnalysis {
  // Overall score (0-100)
  score: number;
  
  // Category used for analysis
  category: EtsyCategory;
  categoryName: string;
  
  // Compliance checks
  compliance: {
    meetsDimensions: boolean;      // >= 1000px width, ideally 2000px shortest side
    meetsAspectRatio: boolean;     // 4:3 recommended
    meetsFileSize: boolean;        // Under 1MB
    meetsResolution: boolean;      // 72 PPI
    meetsColorProfile: boolean;    // sRGB
    thumbnailReady: boolean;       // Can crop to 1:1 for thumbnail
  };
  
  // Detailed scores (0-100 each)
  breakdown: {
    dimensions: number;      // Size/resolution score
    aspectRatio: number;     // 4:3 compliance
    fileSize: number;        // Under 1MB optimization
    lighting: number;        // Brightness/exposure
    sharpness: number;       // Focus quality
    background: number;      // Background appropriateness for category
  };
  
  // Image metadata
  metadata: {
    width: number;
    height: number;
    aspectRatio: number;
    fileSize: number;
    fileSizeKB: number;
    shortestSide: number;
    format: string;
    brightness: number;      // 0-100
    sharpness: number;       // 0-100
    backgroundVariance: number;
  };
  
  // Category-specific requirements check
  categoryRequirements: {
    requirement: string;
    status: 'met' | 'not_met' | 'unknown';
  }[];
  
  // Actionable suggestions
  suggestions: string[];
  
  // What optimization can improve
  optimizationPotential: {
    canImprove: boolean;
    improvements: string[];
    estimatedScoreGain: number;
  };
}

// ===========================================
// SCORING FUNCTIONS
// ===========================================

/**
 * Score dimensions based on Etsy requirements
 * - Recommended: 3000x2250
 * - Minimum width: 1000px
 * - Quality benchmark: shortest side >= 2000px
 */
function scoreDimensions(width: number, height: number): number {
  const shortestSide = Math.min(width, height);
  const longestSide = Math.max(width, height);
  
  // Below minimum = major penalty
  if (width < ETSY_IMAGE_SPECS.minimum.width) {
    return Math.max(20, (width / ETSY_IMAGE_SPECS.minimum.width) * 50);
  }
  
  // Score based on shortest side (quality benchmark)
  let score = 50;  // Base score for meeting minimum
  
  if (shortestSide >= 2000) {
    score = 100;  // Meets quality benchmark
  } else if (shortestSide >= 1500) {
    score = 85;
  } else if (shortestSide >= 1200) {
    score = 75;
  } else if (shortestSide >= 1000) {
    score = 65;
  }
  
  // Bonus for hitting recommended dimensions
  if (width >= 2800 && width <= 3200 && height >= 2100 && height <= 2400) {
    score = 100;  // Near perfect Etsy dimensions
  }
  
  return score;
}

/**
 * Score aspect ratio based on Etsy's 4:3 recommendation
 */
function scoreAspectRatio(aspectRatio: number): number {
  const targetRatio = ETSY_IMAGE_SPECS.recommended.aspectRatio;  // 4:3 = 1.333
  const deviation = Math.abs(aspectRatio - targetRatio);
  
  // Perfect 4:3
  if (deviation < 0.02) return 100;
  
  // Close to 4:3
  if (deviation < 0.05) return 95;
  if (deviation < 0.10) return 85;
  if (deviation < 0.15) return 75;
  if (deviation < 0.25) return 65;
  
  // 1:1 square (good for thumbnails, acceptable)
  if (Math.abs(aspectRatio - 1.0) < 0.05) return 70;
  
  // 3:2 (common camera ratio, acceptable)
  if (Math.abs(aspectRatio - 1.5) < 0.05) return 75;
  
  // Other ratios
  if (deviation < 0.40) return 55;
  
  return 40;  // Very unusual aspect ratio
}

/**
 * Score file size - Etsy wants under 1MB
 */
function scoreFileSize(fileSizeBytes: number): number {
  const fileSizeKB = fileSizeBytes / 1024;
  const maxKB = ETSY_IMAGE_SPECS.maxFileSize / 1024;  // 1024 KB
  
  // Under 1MB = good
  if (fileSizeKB <= maxKB) {
    // Optimal range: 400KB - 900KB (good quality without being too small)
    if (fileSizeKB >= 400 && fileSizeKB <= 900) {
      return 100;
    }
    // Slightly under optimal
    if (fileSizeKB >= 200 && fileSizeKB < 400) {
      return 85;  // Might be over-compressed
    }
    // Very small (likely too compressed)
    if (fileSizeKB < 200) {
      return 70;
    }
    // 900KB - 1MB (close to limit but OK)
    return 90;
  }
  
  // Over 1MB = needs compression
  if (fileSizeKB <= 1500) return 60;  // Slightly over
  if (fileSizeKB <= 2000) return 45;  // Needs compression
  if (fileSizeKB <= 3000) return 30;  // Definitely needs compression
  
  return 20;  // Way too large
}

/**
 * Score lighting/brightness
 * Good product photos need proper exposure
 */
function scoreLighting(brightness: number): number {
  // Optimal brightness range: 45-70 (well-lit but not overexposed)
  if (brightness >= 45 && brightness <= 70) {
    return 100;
  }
  
  // Slightly outside optimal
  if (brightness >= 40 && brightness < 45) return 85;
  if (brightness > 70 && brightness <= 75) return 85;
  
  // Moderate issues
  if (brightness >= 35 && brightness < 40) return 70;
  if (brightness > 75 && brightness <= 80) return 70;
  
  // Significant issues
  if (brightness >= 25 && brightness < 35) return 50;  // Too dark
  if (brightness > 80 && brightness <= 90) return 50;  // Too bright
  
  // Severe issues
  if (brightness < 25) return 30;  // Very dark
  if (brightness > 90) return 30;  // Very overexposed
  
  return 50;
}

/**
 * Score sharpness/focus
 * Etsy requires sharp focus, especially for detail shots
 */
function scoreSharpness(sharpness: number): number {
  if (sharpness >= 80) return 100;  // Excellent
  if (sharpness >= 70) return 90;   // Very good
  if (sharpness >= 60) return 80;   // Good
  if (sharpness >= 50) return 70;   // Acceptable
  if (sharpness >= 40) return 55;   // Needs improvement
  if (sharpness >= 30) return 40;   // Poor
  return 25;  // Very blurry
}

/**
 * Score background based on category requirements
 */
function scoreBackground(
  backgroundVariance: number, 
  category: EtsyCategory
): number {
  const categoryInfo = ETSY_CATEGORIES[category];
  const bgPref = categoryInfo.backgroundPreference;
  
  // White/clean background categories (low variance is good)
  if (bgPref === 'white' || bgPref === 'white_neutral' || bgPref === 'clean') {
    if (backgroundVariance < 30) return 100;  // Very clean
    if (backgroundVariance < 45) return 85;
    if (backgroundVariance < 60) return 70;
    if (backgroundVariance < 80) return 55;
    return 40;  // Too busy
  }
  
  // Lifestyle/styled backgrounds (moderate variance is good)
  if (bgPref === 'lifestyle' || bgPref === 'clean_spa') {
    if (backgroundVariance >= 30 && backgroundVariance <= 100) return 100;
    if (backgroundVariance >= 20 && backgroundVariance < 30) return 80;
    if (backgroundVariance > 100 && backgroundVariance <= 150) return 80;
    if (backgroundVariance < 20) return 60;  // Too plain for lifestyle
    return 50;  // Too chaotic
  }
  
  // Neutral backgrounds (moderate-low variance)
  if (bgPref === 'neutral') {
    if (backgroundVariance >= 20 && backgroundVariance <= 70) return 100;
    if (backgroundVariance < 20) return 75;
    if (backgroundVariance > 70 && backgroundVariance <= 100) return 75;
    return 50;
  }
  
  // Default scoring
  if (backgroundVariance < 50) return 85;
  if (backgroundVariance < 80) return 70;
  return 55;
}

/**
 * Calculate sharpness using Laplacian variance
 */
async function calculateSharpness(buffer: Buffer): Promise<number> {
  try {
    // Resize for consistent measurement
    const resized = await sharp(buffer)
      .greyscale()
      .resize(500, 500, { fit: 'inside' })
      .raw()
      .toBuffer({ resolveWithObject: true });
    
    // Apply Laplacian kernel for edge detection
    const edgeBuffer = await sharp(buffer)
      .greyscale()
      .resize(500, 500, { fit: 'inside' })
      .convolve({
        width: 3,
        height: 3,
        kernel: [0, -1, 0, -1, 4, -1, 0, -1, 0]
      })
      .raw()
      .toBuffer({ resolveWithObject: true });
    
    const pixels = new Uint8Array(edgeBuffer.data);
    const mean = pixels.reduce((sum, val) => sum + val, 0) / pixels.length;
    const variance = pixels.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / pixels.length;
    
    // Normalize to 0-100 scale
    // Higher variance = sharper image
    const normalizedSharpness = Math.min(100, Math.max(0, (variance - 50) / 25));
    
    return Math.round(normalizedSharpness);
  } catch (error) {
    console.warn('[Sharpness] Calculation error, using default:', error);
    return 50;  // Default middle value
  }
}

// ===========================================
// MAIN ANALYSIS FUNCTION
// ===========================================

export async function analyzeImage(
  buffer: Buffer,
  categoryInput: string = 'craft_supplies'
): Promise<ImageAnalysis> {
  
  // Resolve category
  const category = getEtsyCategory(categoryInput);
  const categoryInfo = ETSY_CATEGORIES[category];
  
  // Get image metadata
  const metadata = await sharp(buffer).metadata();
  const stats = await sharp(buffer).stats();
  
  const width = metadata.width || 1;
  const height = metadata.height || 1;
  const aspectRatio = width / height;
  const fileSize = buffer.length;
  const fileSizeKB = fileSize / 1024;
  const shortestSide = Math.min(width, height);
  
  // Calculate brightness (0-100)
  const avgBrightness = stats.channels.reduce((sum, ch) => sum + ch.mean, 0) / stats.channels.length;
  const brightness = (avgBrightness / 255) * 100;
  
  // Calculate background variance
  const backgroundVariance = stats.channels.reduce((sum, ch) => sum + ch.stdev, 0) / stats.channels.length;
  
  // Calculate sharpness
  const sharpness = await calculateSharpness(buffer);
  
  console.log('[Analysis] Image metrics:', {
    width, height, aspectRatio: aspectRatio.toFixed(3),
    fileSizeKB: fileSizeKB.toFixed(0),
    brightness: brightness.toFixed(1),
    sharpness,
    backgroundVariance: backgroundVariance.toFixed(1),
    category
  });
  
  // ===========================================
  // CALCULATE SCORES
  // ===========================================
  const dimensionsScore = scoreDimensions(width, height);
  const aspectRatioScore = scoreAspectRatio(aspectRatio);
  const fileSizeScore = scoreFileSize(fileSize);
  const lightingScore = scoreLighting(brightness);
  const sharpnessScore = scoreSharpness(sharpness);
  const backgroundScore = scoreBackground(backgroundVariance, category);
  
  // Weighted overall score
  // Dimensions and aspect ratio are critical for Etsy
  const overallScore = Math.round(
    dimensionsScore * 0.20 +
    aspectRatioScore * 0.15 +
    fileSizeScore * 0.15 +
    lightingScore * 0.20 +
    sharpnessScore * 0.20 +
    backgroundScore * 0.10
  );
  
  // ===========================================
  // COMPLIANCE CHECKS
  // ===========================================
  const compliance = {
    meetsDimensions: width >= ETSY_IMAGE_SPECS.minimum.width,
    meetsAspectRatio: Math.abs(aspectRatio - (4/3)) < 0.15,
    meetsFileSize: fileSize <= ETSY_IMAGE_SPECS.maxFileSize,
    meetsResolution: true,  // 72 PPI is standard for web
    meetsColorProfile: true,  // Assume sRGB (canvas outputs sRGB)
    thumbnailReady: shortestSide >= 1000,  // Can crop to 1:1
  };
  
  // ===========================================
  // CATEGORY REQUIREMENTS CHECK
  // ===========================================
  const categoryRequirements = categoryInfo.requirements.map(req => {
    // Auto-detect what we can
    let status: 'met' | 'not_met' | 'unknown' = 'unknown';
    
    const reqLower = req.toLowerCase();
    
    // Check lighting-related requirements
    if (reqLower.includes('lighting') || reqLower.includes('well-lit')) {
      status = lightingScore >= 70 ? 'met' : 'not_met';
    }
    
    // Check background requirements
    if (reqLower.includes('white background') || reqLower.includes('clean background')) {
      status = backgroundVariance < 50 ? 'met' : 'not_met';
    }
    
    // Check sharpness requirements
    if (reqLower.includes('sharp') || reqLower.includes('focus')) {
      status = sharpnessScore >= 70 ? 'met' : 'not_met';
    }
    
    // Check resolution requirements
    if (reqLower.includes('high resolution')) {
      status = shortestSide >= 2000 ? 'met' : 'not_met';
    }
    
    return { requirement: req, status };
  });
  
  // ===========================================
  // GENERATE SUGGESTIONS
  // ===========================================
  const suggestions: string[] = [];
  const improvements: string[] = [];
  let estimatedScoreGain = 0;
  
  // Dimension suggestions
  if (dimensionsScore < 80) {
    if (shortestSide < 2000) {
      suggestions.push(`Increase image resolution. Shortest side is ${shortestSide}px, Etsy recommends at least 2000px.`);
    }
    if (width < 3000 || height < 2250) {
      suggestions.push(`Consider using 3000x2250px for optimal Etsy display.`);
    }
  }
  
  // Aspect ratio suggestions
  if (aspectRatioScore < 80) {
    suggestions.push(`Crop image to 4:3 aspect ratio (Etsy's recommended ratio).`);
    improvements.push('Crop to 4:3 aspect ratio');
    estimatedScoreGain += 10;
  }
  
  // File size suggestions
  if (fileSizeScore < 80) {
    if (fileSizeKB > 1024) {
      suggestions.push(`Compress image to under 1MB. Current size: ${fileSizeKB.toFixed(0)}KB.`);
      improvements.push('Compress to under 1MB');
      estimatedScoreGain += 8;
    } else if (fileSizeKB < 200) {
      suggestions.push(`Image may be over-compressed (${fileSizeKB.toFixed(0)}KB). Consider using higher quality.`);
    }
  }
  
  // Lighting suggestions
  if (lightingScore < 80) {
    if (brightness < 45) {
      suggestions.push(`Image is too dark (brightness: ${brightness.toFixed(0)}%). Increase exposure or add lighting.`);
      improvements.push('Brighten image');
      estimatedScoreGain += 10;
    } else if (brightness > 70) {
      suggestions.push(`Image is overexposed (brightness: ${brightness.toFixed(0)}%). Reduce exposure.`);
      improvements.push('Reduce brightness');
      estimatedScoreGain += 8;
    }
  }
  
  // Sharpness suggestions
  if (sharpnessScore < 70) {
    suggestions.push(`Image lacks sharpness. Use a tripod or apply sharpening filter.`);
    improvements.push('Apply sharpening');
    estimatedScoreGain += 12;
  }
  
  // Background suggestions (category-specific)
  if (backgroundScore < 70) {
    const bgPref = categoryInfo.backgroundPreference;
    if (bgPref === 'white' || bgPref === 'clean') {
      suggestions.push(`Use a cleaner, simpler background for ${categoryInfo.name} photos.`);
    } else if (bgPref === 'lifestyle') {
      suggestions.push(`Add lifestyle context or styled props for ${categoryInfo.name} photos.`);
    }
  }
  
  // Category-specific suggestions
  if (category === 'jewelry_accessories') {
    suggestions.push(`For jewelry: ensure product fills 70-80% of frame with size reference.`);
  }
  
  const canImprove = improvements.length > 0;
  
  return {
    score: overallScore,
    category,
    categoryName: categoryInfo.name,
    compliance,
    breakdown: {
      dimensions: dimensionsScore,
      aspectRatio: aspectRatioScore,
      fileSize: fileSizeScore,
      lighting: lightingScore,
      sharpness: sharpnessScore,
      background: backgroundScore,
    },
    metadata: {
      width,
      height,
      aspectRatio,
      fileSize,
      fileSizeKB,
      shortestSide,
      format: metadata.format || 'unknown',
      brightness: Math.round(brightness * 10) / 10,
      sharpness,
      backgroundVariance: Math.round(backgroundVariance * 10) / 10,
    },
    categoryRequirements,
    suggestions,
    optimizationPotential: {
      canImprove,
      improvements,
      estimatedScoreGain: Math.min(30, estimatedScoreGain),  // Cap at 30
    },
  };
}

/**
 * Check if image already meets Etsy standards
 */
export function isEtsyOptimized(analysis: ImageAnalysis): boolean {
  return (
    analysis.score >= 85 &&
    analysis.compliance.meetsDimensions &&
    analysis.compliance.meetsFileSize &&
    analysis.breakdown.sharpness >= 75 &&
    analysis.breakdown.lighting >= 75
  );
}
