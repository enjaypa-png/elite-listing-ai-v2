/**
 * LISTING-LEVEL SCORING
 * Analyzes multiple images as a complete Etsy listing
 */

export interface ImageAnalysisResult {
  imageIndex: number;
  score: number;
  feedback: { rule: string; status: 'critical' | 'warning' | 'passed'; message: string }[];
  photoTypes: string[];
  technicalPoints: number;
  photoTypePoints: number;
  compositionPoints: number;
  isMainImage: boolean;
}

export interface ListingScoreResult {
  overallListingScore: number;
  mainImageScore: number;
  averageImageScore: number;
  varietyScore: number;
  completenessBonus: boolean;
  detectedPhotoTypes: string[];
  missingPhotoTypes: string[];
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
  // Studio shot: 30 points (most important)
  // Lifestyle: 25 points
  // Detail: 25 points
  // Scale: 20 points
  
  let varietyPoints = 0;
  
  if (detectedTypes.includes('studio_shot')) varietyPoints += 30;
  if (detectedTypes.includes('lifestyle_shot')) varietyPoints += 25;
  if (detectedTypes.includes('detail_shot')) varietyPoints += 25;
  if (detectedTypes.includes('scale_shot')) varietyPoints += 20;
  
  return varietyPoints;
}

/**
 * Calculate overall listing score from multiple images
 */
export function calculateListingScore(imageResults: ImageAnalysisResult[]): ListingScoreResult {
  if (imageResults.length === 0) {
    throw new Error('No image results provided');
  }
  
  // 1. Main image score (first image)
  const mainImageResult = imageResults[0];
  const mainImageScore = mainImageResult.score;
  
  // 2. Average of all image scores
  const totalScore = imageResults.reduce((sum, result) => sum + result.score, 0);
  const averageImageScore = Math.round(totalScore / imageResults.length);
  
  // 3. Variety score
  const detectedPhotoTypes = detectPhotoTypeVariety(imageResults);
  const varietyScore = calculateVarietyScore(detectedPhotoTypes);
  
  // 4. Completeness bonus
  const completenessBonus = imageResults.length >= 5;
  const completenessScore = completenessBonus ? 100 : (imageResults.length / 5) * 100;
  
  // 5. Calculate weighted overall score
  const mainImageWeight = 0.40;      // 40% - Most important
  const averageWeight = 0.30;        // 30% - Quality matters
  const varietyWeight = 0.20;        // 20% - Diversity
  const completenessWeight = 0.10;   // 10% - Completeness
  
  const overallListingScore = Math.round(
    (mainImageScore * mainImageWeight) +
    (averageImageScore * averageWeight) +
    (varietyScore * varietyWeight) +
    (completenessScore * completenessWeight)
  );
  
  // 6. Detect missing photo types
  const missingPhotoTypes = getMissingPhotoTypes(detectedPhotoTypes);
  
  console.log('[Listing Scoring] Calculated:', {
    overallListingScore,
    mainImageScore,
    averageImageScore,
    varietyScore,
    completenessScore,
    detectedPhotoTypes,
    missingPhotoTypes,
    imageCount: imageResults.length
  });
  
  return {
    overallListingScore,
    mainImageScore,
    averageImageScore,
    varietyScore,
    completenessBonus,
    detectedPhotoTypes,
    missingPhotoTypes,
    breakdown: {
      mainImageWeight: Math.round(mainImageScore * mainImageWeight),
      averageWeight: Math.round(averageImageScore * averageWeight),
      varietyWeight: Math.round(varietyScore * varietyWeight),
      completenessWeight: Math.round(completenessScore * completenessWeight)
    }
  };
}
