/**
 * DETERMINISTIC SCORING ENGINE
 * Implements the exact Etsy Image Preference specification
 *
 * Rules:
 * - Start at 100, apply ONLY specified deductions
 * - No fuzzy logic, no guessing, no interpretation
 * - Three separate outputs: A) Image Quality, B) Completeness, C) Headroom
 */

import { ImageAttributes } from './database-scoring';

// ===========================================
// CONFIGURATION
// ===========================================

// Technical Gate Penalties (fixed deductions)
const PENALTIES = {
  WIDTH_BELOW_1000: 15,           // Hard failure: minimum width
  SHORTEST_SIDE_BELOW_2000: 10,   // Hard failure: quality benchmark
  FILE_SIZE_OVER_1MB: 8,          // Hard failure: file size
  NOT_SRGB: 5,                    // Hard failure: color profile
  PPI_NOT_72: 3,                  // Hard failure: resolution
  THUMBNAIL_CROP_UNSAFE: 25,      // HUGE: first photo crop safety
  SEVERE_BLUR: 20,                // Gradual: image clarity
  SEVERE_LIGHTING: 15,            // Gradual: lighting quality
  NOT_DISTINGUISHABLE: 12,        // Gradual: product visibility
} as const;

// Photo Count Multipliers (listing-level only)
const PHOTO_COUNT_MULTIPLIERS: Record<number, number> = {
  1: 0.82, 2: 0.82, 3: 0.82, 4: 0.82,
  5: 1.00,
  6: 1.03, 7: 1.03,
  8: 1.06,
  9: 1.08,
  10: 1.10
};

// ===========================================
// TYPES
// ===========================================

export type ScoringMode = 'optimize_images' | 'evaluate_full_listing';

export interface ImageQualityResult {
  imageIndex: number;
  score: number;  // 0-100
  deductions: Deduction[];
  passedGates: string[];
  altText: string;
}

export interface Deduction {
  rule: string;
  penalty: number;
  explanation: string;
}

export interface ListingCompletenessResult {
  photoCount: number;
  recommendedMin: number;
  recommendedMax: number;
  missingPhotoTypes: string[];
  coverageGaps: string[];
}

export interface ConversionHeadroomResult {
  prioritizedActions: Action[];
  estimatedUplift: string;
}

export interface Action {
  priority: 'high' | 'medium' | 'low';
  action: string;
  impact: string;
}

export interface DeterministicScoreResult {
  mode: ScoringMode;

  // A) Image Quality Score (0-100)
  imageQualityScore: number;
  imageResults: ImageQualityResult[];

  // B) Listing Completeness (advisory only)
  listingCompleteness: ListingCompletenessResult;

  // C) Conversion Headroom (advisory only)
  conversionHeadroom: ConversionHeadroomResult;

  // Listing-level multipliers (only in evaluate_full_listing mode)
  photoCountMultiplier?: number;
  redundancyPenalty?: number;
  finalListingScore?: number;
}

// ===========================================
// CORE SCORING FUNCTIONS
// ===========================================

/**
 * Score a single image deterministically
 * Start at 100, apply ONLY specified deductions
 */
export function scoreImage(
  imageIndex: number,
  attributes: ImageAttributes,
  aiAnalysis: {
    hasSevereBlur: boolean;
    hasSevereLighting: boolean;
    isProductDistinguishable: boolean;
    thumbnailCropSafe?: boolean;  // Only for first photo
    altText: string;
  }
): ImageQualityResult {
  let score = 100;
  const deductions: Deduction[] = [];
  const passedGates: string[] = [];

  // ===========================================
  // TECHNICAL GATES (MUST DEDUCT IF FAILED)
  // ===========================================

  // 1. Minimum width
  if (attributes.width_px < 1000) {
    deductions.push({
      rule: 'Minimum width < 1000px',
      penalty: PENALTIES.WIDTH_BELOW_1000,
      explanation: 'Etsy requires minimum 1000px width for clarity in search results and product pages.'
    });
    score -= PENALTIES.WIDTH_BELOW_1000;
  } else {
    passedGates.push('✓ Width ≥ 1000px');
  }

  // 2. Quality benchmark (shortest side)
  const shortestSide = Math.min(attributes.width_px, attributes.height_px);
  if (shortestSide < 2000) {
    deductions.push({
      rule: 'Shortest side < 2000px',
      penalty: PENALTIES.SHORTEST_SIDE_BELOW_2000,
      explanation: 'Etsy quality benchmark: shortest side should be ≥ 2000px for zoom functionality and print quality.'
    });
    score -= PENALTIES.SHORTEST_SIDE_BELOW_2000;
  } else {
    passedGates.push('✓ Shortest side ≥ 2000px');
  }

  // 3. File size
  const fileSizeMB = attributes.file_size_bytes / (1024 * 1024);
  if (fileSizeMB > 1) {
    deductions.push({
      rule: 'File size > 1MB',
      penalty: PENALTIES.FILE_SIZE_OVER_1MB,
      explanation: 'Etsy requires files under 1MB for fast page load and mobile performance.'
    });
    score -= PENALTIES.FILE_SIZE_OVER_1MB;
  } else {
    passedGates.push('✓ File size < 1MB');
  }

  // 4. Color profile
  if (attributes.color_profile?.toLowerCase() !== 'srgb') {
    deductions.push({
      rule: 'Color profile is not sRGB',
      penalty: PENALTIES.NOT_SRGB,
      explanation: 'Etsy recommends sRGB color profile for accurate color display across all devices.'
    });
    score -= PENALTIES.NOT_SRGB;
  } else {
    passedGates.push('✓ sRGB color profile');
  }

  // 5. PPI (if available)
  if (attributes.ppi && attributes.ppi !== 72) {
    deductions.push({
      rule: 'PPI not 72',
      penalty: PENALTIES.PPI_NOT_72,
      explanation: 'Etsy standard is 72 PPI for web display.'
    });
    score -= PENALTIES.PPI_NOT_72;
  } else if (attributes.ppi === 72) {
    passedGates.push('✓ 72 PPI');
  }

  // ===========================================
  // FIRST PHOTO ONLY: THUMBNAIL CROP SAFETY
  // ===========================================

  if (imageIndex === 0 && aiAnalysis.thumbnailCropSafe === false) {
    deductions.push({
      rule: 'First photo not thumbnail-safe',
      penalty: PENALTIES.THUMBNAIL_CROP_UNSAFE,
      explanation: 'Etsy displays your first photo as a square thumbnail in search results. A centered 1:1 crop would cut off the product, reducing visibility and click-through rate.'
    });
    score -= PENALTIES.THUMBNAIL_CROP_UNSAFE;
  } else if (imageIndex === 0 && aiAnalysis.thumbnailCropSafe === true) {
    passedGates.push('✓ Thumbnail-safe (1:1 crop preserves product)');
  }

  // ===========================================
  // SOFT QUALITY (GRADUAL DEDUCTIONS)
  // ===========================================

  // 1. Severe blur
  if (aiAnalysis.hasSevereBlur) {
    deductions.push({
      rule: 'Severe blur / compression artifacts',
      penalty: PENALTIES.SEVERE_BLUR,
      explanation: 'Image lacks sharpness and clarity. Blurry photos reduce buyer confidence and conversion.'
    });
    score -= PENALTIES.SEVERE_BLUR;
  } else {
    passedGates.push('✓ Sharp and clear');
  }

  // 2. Severe lighting failure
  if (aiAnalysis.hasSevereLighting) {
    deductions.push({
      rule: 'Severe lighting failure',
      penalty: PENALTIES.SEVERE_LIGHTING,
      explanation: 'Lighting is too dark, too bright, or has harsh shadows that make the product hard to see clearly.'
    });
    score -= PENALTIES.SEVERE_LIGHTING;
  } else {
    passedGates.push('✓ Good lighting quality');
  }

  // 3. Product not distinguishable
  if (!aiAnalysis.isProductDistinguishable) {
    deductions.push({
      rule: 'Product not clearly distinguishable',
      penalty: PENALTIES.NOT_DISTINGUISHABLE,
      explanation: 'Product is difficult to identify or see clearly at thumbnail size.'
    });
    score -= PENALTIES.NOT_DISTINGUISHABLE;
  } else {
    passedGates.push('✓ Product clearly visible');
  }

  // Ensure score doesn't go below 0
  score = Math.max(0, Math.round(score));

  return {
    imageIndex,
    score,
    deductions,
    passedGates,
    altText: aiAnalysis.altText
  };
}

/**
 * Calculate listing completeness (advisory only)
 */
export function calculateListingCompleteness(
  imageCount: number,
  detectedPhotoTypes: string[]
): ListingCompletenessResult {
  const allPhotoTypes = [
    'Studio Shot',
    'Lifestyle Shot',
    'Scale Reference',
    'Detail/Close-up',
    'Group/Variations',
    'Packaging',
    'Process/Behind-the-scenes'
  ];

  const missingPhotoTypes = allPhotoTypes.filter(
    type => !detectedPhotoTypes.some(detected => detected.toLowerCase().includes(type.toLowerCase().split('/')[0]))
  );

  const coverageGaps: string[] = [];

  if (imageCount < 5) {
    coverageGaps.push(`Only ${imageCount} photo${imageCount === 1 ? '' : 's'} - Etsy recommends minimum 5 for baseline compliance`);
  }

  if (imageCount < 10) {
    coverageGaps.push(`${10 - imageCount} photo slot${10 - imageCount === 1 ? '' : 's'} unused - optimal range is 8-10 photos`);
  }

  if (missingPhotoTypes.length > 0) {
    coverageGaps.push(`Missing photo types: ${missingPhotoTypes.join(', ')}`);
  }

  return {
    photoCount: imageCount,
    recommendedMin: 5,
    recommendedMax: 10,
    missingPhotoTypes,
    coverageGaps
  };
}

/**
 * Calculate conversion headroom (quantified upside actions)
 */
export function calculateConversionHeadroom(
  imageCount: number,
  missingPhotoTypes: string[],
  imageResults: ImageQualityResult[]
): ConversionHeadroomResult {
  const actions: Action[] = [];

  // Photo count upside
  if (imageCount < 5) {
    actions.push({
      priority: 'high',
      action: `Add ${5 - imageCount} more photos to reach baseline (5 photos)`,
      impact: 'Etsy penalizes listings with <5 photos; expected +18% score boost'
    });
  } else if (imageCount < 8) {
    actions.push({
      priority: 'medium',
      action: `Add ${8 - imageCount} more photos to reach optimal range (8-10 photos)`,
      impact: `Expected +${(8 - imageCount) * 3}% listing score boost`
    });
  }

  // Missing photo types
  const highValueTypes = ['Lifestyle Shot', 'Scale Reference', 'Detail/Close-up'];
  const missingHighValue = missingPhotoTypes.filter(t => highValueTypes.includes(t));

  if (missingHighValue.length > 0) {
    actions.push({
      priority: 'high',
      action: `Add ${missingHighValue.join(', ')}`,
      impact: 'Increases conversion by showing product context, size, and quality'
    });
  }

  // Technical fixes
  const technicalIssues = imageResults.filter(r => r.deductions.length > 0);
  if (technicalIssues.length > 0) {
    const topIssue = technicalIssues[0].deductions[0];
    actions.push({
      priority: 'high',
      action: `Fix: ${topIssue.rule}`,
      impact: `+${topIssue.penalty} points per affected image`
    });
  }

  return {
    prioritizedActions: actions,
    estimatedUplift: actions.length > 0
      ? `Up to +${actions.reduce((sum, a) => sum + parseInt(a.impact.match(/\d+/)?.[0] || '0'), 0)} points available`
      : 'No significant optimization opportunities'
  };
}

/**
 * Main scoring function - routes to correct workflow
 */
export function scoreListing(
  mode: ScoringMode,
  images: Array<{
    attributes: ImageAttributes;
    aiAnalysis: {
      hasSevereBlur: boolean;
      hasSevereLighting: boolean;
      isProductDistinguishable: boolean;
      thumbnailCropSafe?: boolean;
      altText: string;
      detectedPhotoType?: string;
    };
  }>
): DeterministicScoreResult {
  // Score each image
  const imageResults = images.map((img, index) =>
    scoreImage(index, img.attributes, img.aiAnalysis)
  );

  // A) Image Quality Score = average of per-image scores
  const imageQualityScore = Math.round(
    imageResults.reduce((sum, r) => sum + r.score, 0) / imageResults.length
  );

  // B) Listing Completeness
  const detectedPhotoTypes = images
    .map(img => img.aiAnalysis.detectedPhotoType)
    .filter(Boolean) as string[];

  const listingCompleteness = calculateListingCompleteness(
    images.length,
    detectedPhotoTypes
  );

  // C) Conversion Headroom
  const conversionHeadroom = calculateConversionHeadroom(
    images.length,
    listingCompleteness.missingPhotoTypes,
    imageResults
  );

  // ===========================================
  // MODE-SPECIFIC LOGIC
  // ===========================================

  if (mode === 'optimize_images') {
    // optimize_images: NO listing-level multipliers
    return {
      mode,
      imageQualityScore,
      imageResults,
      listingCompleteness,
      conversionHeadroom
    };
  } else {
    // evaluate_full_listing: Apply listing-level multipliers
    const photoCountMultiplier = PHOTO_COUNT_MULTIPLIERS[Math.min(images.length, 10)] || 1.0;

    // Redundancy dampener (simplified - would need AI to detect duplicates)
    const redundancyPenalty = 0; // TODO: Implement duplicate detection

    const finalListingScore = Math.round(
      imageQualityScore * photoCountMultiplier * (1 - redundancyPenalty)
    );

    return {
      mode,
      imageQualityScore,
      imageResults,
      listingCompleteness,
      conversionHeadroom,
      photoCountMultiplier,
      redundancyPenalty,
      finalListingScore
    };
  }
}
