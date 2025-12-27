/**
 * LISTING-LEVEL SCORING
 * Analyzes multiple images as a complete Etsy listing
 * 
 * KEY INSIGHT: Photo count is a listing-level multiplier, not an image-level score
 * - Extra photos only help if they add NEW information (scale, use, detail, variation)
 * - Redundant angles/duplicates trigger diminishing returns penalty
 * - Rewards coverage diversity, not raw count (aligns with Etsy's conversion-first ranking)
 */

export interface ImageAnalysisResult {
  imageIndex: number;
  score: number;  // Final combined score
  visualQuality?: number;  // AI visual quality score (immutable)
  etsyCompliance?: number;  // Technical compliance score (mutable)
  feedback: { rule: string; status: 'critical' | 'warning' | 'passed'; message: string }[];
  photoTypes: string[];
  technicalPoints: number;  // Deprecated
  photoTypePoints: number;  // Deprecated
  compositionPoints: number;  // Deprecated
  isMainImage: boolean;
  etsyComplianceBreakdown?: any;  // Breakdown of compliance scores

  // AI Vision Analysis Fields
  ai_issues?: string[];
  ai_strengths?: string[];
  ai_caps_applied?: string[];
  ai_optimization_recommendations?: string[];

  // Etsy Preference Fields (Phase 1 Quick Wins)
  ai_alt_text?: string;  // SEO-optimized alt text for accessibility
  has_text_elements?: boolean;  // Image contains readable text
  text_readable?: boolean;  // Text is clearly legible (Paper & Party)
  has_wrinkles?: boolean;  // Fabric shows wrinkles (Clothing)
}

export interface ListingScoreResult {
  overallListingScore: number;
  rawAverageScore: number;
  mainImageScore: number;
  averageImageScore: number;
  varietyScore: number;
  photoCountMultiplier: number;
  redundancyPenalty: number;
  completenessBonus: boolean;
  detectedPhotoTypes: string[];
  missingPhotoTypes: string[];
  photoCountAnalysis: {
    count: number;
    status: 'penalty' | 'baseline' | 'optimal';
    message: string;
  };
  breakdown: {
    mainImageWeight: number;
    averageWeight: number;
    varietyWeight: number;
    completenessWeight: number;
  };
}

const PHOTO_TYPE_LABELS: Record<string, string> = {
  'studio_shot': 'Studio shot',
  'lifestyle_shot': 'Lifestyle shot',
  'detail_shot': 'Detail/close-up shot',
  'scale_shot': 'Scale reference shot',
  'group_shot': 'Multiple products/variations',
  'packaging_shot': 'Packaging shot',
  'process_shot': 'Behind-the-scenes shot'
};

// ===========================================
// PHOTO COUNT MULTIPLIERS (Etsy ranking signal)
// ===========================================
// 0-4 photos: Hard penalty → trust + conversion suppression
// 5-7 photos: Baseline compliant → no boost, no penalty
// 8-10 photos: Optimal → soft ranking + conversion lift

const PHOTO_COUNT_MULTIPLIERS: Record<number, number> = {
  1: 0.82,
  2: 0.82,
  3: 0.82,
  4: 0.82,
  5: 1.00,  // Baseline
  6: 1.03,
  7: 1.03,
  8: 1.06,
  9: 1.08,
  10: 1.10  // Optimal
};

// Penalty per redundant/duplicate image type (-2%)
const REDUNDANCY_PENALTY_PER_IMAGE = 0.02;

/**
 * Get photo count multiplier based on Etsy's ranking logic
 */
function getPhotoCountMultiplier(count: number): number {
  if (count <= 0) return 0.82;
  if (count > 10) return 1.10; // Cap at 10
  return PHOTO_COUNT_MULTIPLIERS[count] || 1.00;
}

/**
 * Get photo count status message
 */
function getPhotoCountStatus(count: number): { status: 'penalty' | 'baseline' | 'optimal'; message: string } {
  if (count <= 4) {
    return {
      status: 'penalty',
      message: `Only ${count} photo${count === 1 ? '' : 's'} - Etsy penalizes listings with fewer than 5 photos. Add ${5 - count} more for baseline compliance.`
    };
  }
  if (count <= 7) {
    return {
      status: 'baseline',
      message: `${count} photos - Meets Etsy's minimum. Adding ${10 - count} more quality photos could boost visibility.`
    };
  }
  return {
    status: 'optimal',
    message: `${count} photos - Optimal range for Etsy's algorithm. Good photo coverage increases conversion.`
  };
}

/**
 * Detect which photo types are present across all images
 */
export function detectPhotoTypeVariety(imageResults: ImageAnalysisResult[]): string[] {
  const detectedTypes = new Set<string>();
  
  imageResults.forEach(result => {
    result.photoTypes.forEach(type => detectedTypes.add(type));
  });
  
  return Array.from(detectedTypes);
}

/**
 * Calculate redundancy penalty
 * Penalizes listings where multiple images have the SAME photo type without adding value
 * -2% per redundant image (beyond the first of each type)
 */
function calculateRedundancyPenalty(imageResults: ImageAnalysisResult[]): { penalty: number; redundantCount: number } {
  // Count how many images have each photo type
  const typeCount: Record<string, number> = {};
  
  imageResults.forEach(result => {
    result.photoTypes.forEach(type => {
      typeCount[type] = (typeCount[type] || 0) + 1;
    });
  });
  
  // Calculate redundant images (more than 2 of the same type is considered redundant)
  // Allow 2 of each type before penalizing (e.g., 2 lifestyle shots is fine, 3+ is redundant)
  let redundantCount = 0;
  Object.values(typeCount).forEach(count => {
    if (count > 2) {
      redundantCount += (count - 2);
    }
  });
  
  // Also check for images with NO detected type (likely filler)
  const noTypeImages = imageResults.filter(r => r.photoTypes.length === 0).length;
  redundantCount += noTypeImages;
  
  const penalty = redundantCount * REDUNDANCY_PENALTY_PER_IMAGE;
  
  return { penalty: Math.min(penalty, 0.20), redundantCount }; // Cap at 20% max penalty
}

/**
 * Determine which photo types are missing
 */
export function getMissingPhotoTypes(detectedTypes: string[]): string[] {
  const importantTypes = ['studio_shot', 'lifestyle_shot', 'detail_shot', 'scale_shot'];
  const missing: string[] = [];
  
  importantTypes.forEach(type => {
    if (!detectedTypes.includes(type)) {
      const label = PHOTO_TYPE_LABELS[type] || type;
      missing.push(`No ${label.toLowerCase()} detected`);
    }
  });
  
  return missing;
}

/**
 * Calculate variety score based on photo type diversity
 */
function calculateVarietyScore(detectedTypes: string[]): number {
  // Max 100 points for variety
  // Studio shot: 30 points (most important for main image)
  // Lifestyle: 25 points (shows product in context)
  // Detail: 25 points (builds trust)
  // Scale: 20 points (reduces returns)
  
  let varietyPoints = 0;
  
  if (detectedTypes.includes('studio_shot')) varietyPoints += 30;
  if (detectedTypes.includes('lifestyle_shot')) varietyPoints += 25;
  if (detectedTypes.includes('detail_shot')) varietyPoints += 25;
  if (detectedTypes.includes('scale_shot')) varietyPoints += 20;
  
  return varietyPoints;
}

/**
 * Calculate overall listing score from multiple images
 * 
 * SIMPLE FORMULA: Just use the average of image scores
 * Photo count and variety are INFORMATIONAL only, not score penalties
 */
export function calculateListingScore(imageResults: ImageAnalysisResult[]): ListingScoreResult {
  if (imageResults.length === 0) {
    throw new Error('No image results provided');
  }
  
  // 1. Main image score (first image)
  const mainImageResult = imageResults[0];
  const mainImageScore = mainImageResult.score;
  
  // 2. Average of all image scores - THIS IS THE LISTING SCORE
  const totalScore = imageResults.reduce((sum, result) => sum + result.score, 0);
  const rawAverageScore = totalScore / imageResults.length;
  const overallListingScore = Math.round(rawAverageScore);
  
  // 3. Photo count info (for display only - NO PENALTY)
  const photoCount = imageResults.length;
  const photoCountMultiplier = 1.0; // No penalty
  const photoCountAnalysis = getPhotoCountStatus(photoCount);
  
  // 4. Redundancy info (for display only - NO PENALTY)
  const redundancyPenalty = 0;
  
  // 5. Variety score (for display purposes)
  const detectedPhotoTypes = detectPhotoTypeVariety(imageResults);
  const varietyScore = calculateVarietyScore(detectedPhotoTypes);
  
  // 6. Completeness bonus flag
  const completenessBonus = photoCount >= 5 && detectedPhotoTypes.length >= 3;
  
  // 7. Missing photo types
  const missingPhotoTypes = getMissingPhotoTypes(detectedPhotoTypes);
  
  console.log('[Listing Scoring] Calculated:', {
    rawAverageScore: rawAverageScore.toFixed(1),
    photoCount,
    overallListingScore,
    detectedPhotoTypes,
    missingPhotoTypes
  });
  
  return {
    overallListingScore,
    rawAverageScore: Math.round(rawAverageScore),
    mainImageScore,
    averageImageScore: Math.round(rawAverageScore),
    varietyScore,
    photoCountMultiplier,
    redundancyPenalty,
    completenessBonus,
    detectedPhotoTypes,
    missingPhotoTypes,
    photoCountAnalysis: {
      count: photoCount,
      ...photoCountAnalysis
    },
    breakdown: {
      mainImageWeight: mainImageScore,
      averageWeight: Math.round(rawAverageScore),
      varietyWeight: varietyScore,
      completenessWeight: completenessBonus ? 100 : Math.round((photoCount / 5) * 100)
    }
  };
}
