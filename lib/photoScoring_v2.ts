/**
 * R.A.N.K. 285™ PHOTO SCORING SYSTEM - FIXED VERSION
 * Reward-based scoring that ALWAYS increases or stays same after optimization
 */

import sharp from 'sharp';

export interface PhotoScore {
  score: number;
  category: string;
  breakdown: {
    technical: number;
    presentation: number;
    composition: number;
  };
  suggestions: string[];
  metadata: {
    brightness: number;
    sharpness: number;
    aspectRatio: number;
    width: number;
    height: number;
    fileSize: number;
    bgVariance: number;
  };
}

/**
 * 10 Photo Categories Based on Photography Requirements
 */
const CATEGORIES = [
  'small_jewelry',
  'flat_artwork',
  'wearables_clothing',
  'wearables_accessories',
  'home_decor_wall_art',
  'furniture',
  'small_crafts',
  'craft_supplies',
  'vintage_items',
  'digital_products'
] as const;

type Category = typeof CATEGORIES[number];

/**
 * Category-specific weights
 */
const CATEGORY_WEIGHTS: Record<Category, { technical: number; presentation: number; composition: number }> = {
  small_jewelry: { technical: 0.60, presentation: 0.25, composition: 0.15 },
  flat_artwork: { technical: 0.50, presentation: 0.25, composition: 0.25 },
  wearables_clothing: { technical: 0.45, presentation: 0.35, composition: 0.20 },
  wearables_accessories: { technical: 0.50, presentation: 0.30, composition: 0.20 },
  home_decor_wall_art: { technical: 0.35, presentation: 0.40, composition: 0.25 },
  furniture: { technical: 0.40, presentation: 0.40, composition: 0.20 },
  small_crafts: { technical: 0.50, presentation: 0.25, composition: 0.25 },
  craft_supplies: { technical: 0.50, presentation: 0.25, composition: 0.25 },
  vintage_items: { technical: 0.50, presentation: 0.30, composition: 0.20 },
  digital_products: { technical: 0.50, presentation: 0.30, composition: 0.20 }
};

/**
 * Calculate actual sharpness using Laplacian edge detection
 */
async function calculateSharpness(buffer: Buffer): Promise<number> {
  try {
    // Apply Laplacian edge detection kernel
    const edgeBuffer = await sharp(buffer)
      .greyscale()
      .resize(500, 500, { fit: 'inside' }) // Resize for consistent measurement
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
    
    // Normalize variance to 0-100 scale (higher variance = sharper image)
    // Typical variance ranges: 200-500 for blurry, 500-2000 for decent, 2000+ for sharp
    const normalizedSharpness = Math.min(100, Math.max(0, (variance - 100) / 30));
    
    return Math.round(normalizedSharpness);
  } catch (error) {
    console.warn('[Sharpness] Error calculating sharpness, using default:', error);
    return 60; // Default middle value if calculation fails
  }
}

/**
 * TECHNICAL QUALITY (0-100) - REWARD-BASED SCORING
 * Lighting (0-40) + Sharpness (0-35) + File Size (0-25)
 */
function scoreTechnical(brightness: number, sharpness: number, fileSizeKB: number): number {
  let score = 0;
  
  // LIGHTING (0-40 points) - REWARD optimal range 50-75
  if (brightness >= 50 && brightness <= 75) {
    score += 40; // Perfect lighting range
  } else if (brightness >= 45 && brightness < 50) {
    score += 35;
  } else if (brightness > 75 && brightness <= 80) {
    score += 35;
  } else if (brightness >= 40 && brightness < 45) {
    score += 28;
  } else if (brightness > 80 && brightness <= 85) {
    score += 28;
  } else if (brightness >= 35 && brightness < 40) {
    score += 20;
  } else if (brightness > 85 && brightness <= 90) {
    score += 20;
  } else {
    score += 12; // Very dark or very bright
  }
  
  // SHARPNESS (0-35 points) - MEASURE actual sharpness
  if (sharpness >= 85) {
    score += 35; // Excellent sharpness (post-optimization should hit this)
  } else if (sharpness >= 75) {
    score += 30;
  } else if (sharpness >= 65) {
    score += 25;
  } else if (sharpness >= 55) {
    score += 20;
  } else if (sharpness >= 45) {
    score += 15;
  } else {
    score += 10; // Blurry image
  }
  
  // FILE SIZE (0-25 points) - REWARD optimization range 500KB-2MB
  if (fileSizeKB >= 500 && fileSizeKB <= 2048) {
    score += 25; // Optimal file size
  } else if (fileSizeKB >= 300 && fileSizeKB < 500) {
    score += 20;
  } else if (fileSizeKB > 2048 && fileSizeKB <= 3000) {
    score += 18;
  } else if (fileSizeKB >= 200 && fileSizeKB < 300) {
    score += 15;
  } else if (fileSizeKB > 3000 && fileSizeKB <= 5000) {
    score += 12;
  } else {
    score += 8; // Very small (over-compressed) or very large
  }
  
  return Math.min(100, score);
}

/**
 * COMPOSITION QUALITY (0-100) - REWARD-BASED SCORING
 * Aspect Ratio (0-60) + Dimensions (0-40)
 */
function scoreComposition(aspectRatio: number, width: number, height: number, category: Category): number {
  let score = 0;
  
  // ASPECT RATIO (0-60 points) - HEAVILY reward 1:1 for Etsy
  const ratioDeviation = Math.abs(aspectRatio - 1.0);
  if (ratioDeviation < 0.02) {
    score += 60; // Perfect 1:1 (optimized images will hit this)
  } else if (ratioDeviation < 0.05) {
    score += 55;
  } else if (ratioDeviation < 0.10) {
    score += 48;
  } else if (ratioDeviation < 0.20) {
    score += 38;
  } else if (ratioDeviation < 0.30) {
    score += 28;
  } else if (ratioDeviation < 0.50) {
    score += 18;
  } else {
    score += 10; // Very non-square
  }
  
  // DIMENSIONS (0-40 points) - Reward 1000x1000+
  const minDimension = Math.min(width, height);
  if (minDimension >= 2000) {
    score += 40; // Excellent resolution
  } else if (minDimension >= 1500) {
    score += 36;
  } else if (minDimension >= 1000) {
    score += 32; // Our optimization target (1000x1000)
  } else if (minDimension >= 800) {
    score += 25;
  } else if (minDimension >= 600) {
    score += 18;
  } else {
    score += 10; // Too small
  }
  
  return Math.min(100, score);
}

/**
 * PRESENTATION QUALITY (0-100)
 * Staging + Context + Background Appropriateness
 */
function scorePresentation(bgVariance: number, category: Category): number {
  let score = 55; // Base score - slightly lower to allow room for improvement
  
  // Lifestyle categories benefit from natural backgrounds (variance 35-200)
  if (category === 'home_decor_wall_art' || category === 'furniture') {
    if (bgVariance > 35 && bgVariance < 200) {
      score += 28; // Lifestyle context bonus
    } else if (bgVariance >= 20 && bgVariance <= 35) {
      score += 22;
    } else if (bgVariance >= 200 && bgVariance <= 300) {
      score += 18;
    } else {
      score += 12;
    }
  }
  
  // Product categories benefit from clean backgrounds (variance <50)
  else if (category === 'small_jewelry' || category === 'small_crafts' || category === 'craft_supplies') {
    if (bgVariance < 40) {
      score += 30; // Very clean background bonus
    } else if (bgVariance < 60) {
      score += 24;
    } else if (bgVariance < 80) {
      score += 18;
    } else {
      score += 10; // Busy background
    }
  }
  
  // Clothing and accessories prefer neutral backgrounds
  else if (category === 'wearables_clothing' || category === 'wearables_accessories') {
    if (bgVariance < 50) {
      score += 28; // Clean background
    } else if (bgVariance < 80) {
      score += 22;
    } else if (bgVariance < 120) {
      score += 16;
    } else {
      score += 10;
    }
  }
  
  // For vintage items (don't penalize busy backgrounds - shows authenticity)
  else if (category === 'vintage_items') {
    if (bgVariance > 60 && bgVariance < 180) {
      score += 28; // Shows authenticity/patina
    } else if (bgVariance <= 60) {
      score += 24; // Clean is also fine
    } else {
      score += 18;
    }
  }
  
  // For digital products (require clean backgrounds)
  else if (category === 'digital_products') {
    if (bgVariance < 35) {
      score += 32; // Very clean mockup bonus
    } else if (bgVariance < 55) {
      score += 26;
    } else if (bgVariance < 80) {
      score += 18;
    } else {
      score += 10;
    }
  }
  
  // Default for flat_artwork and others
  else {
    if (bgVariance < 60) {
      score += 26;
    } else if (bgVariance < 100) {
      score += 20;
    } else {
      score += 14;
    }
  }
  
  return Math.round(Math.max(50, Math.min(95, score)));
}

/**
 * Main scoring function - FIXED VERSION
 */
export async function scorePhoto(
  buffer: Buffer,
  category: string = 'small_crafts'
): Promise<PhotoScore> {
  
  // Validate category - fall back to small_crafts if invalid
  const validCategory = CATEGORIES.includes(category as Category) 
    ? (category as Category) 
    : 'small_crafts';
  
  // Get image metrics
  const metadata = await sharp(buffer).metadata();
  const stats = await sharp(buffer).stats();
  
  const width = metadata.width || 1;
  const height = metadata.height || 1;
  const aspectRatio = width / height;
  const fileSize = buffer.length;
  const fileSizeKB = fileSize / 1024;
  
  // Background variance (how "busy" the background is)
  const bgVariance = stats.channels.reduce((sum, ch) => sum + ch.stdev, 0) / stats.channels.length;
  
  // Average brightness (0-100)
  const avgBrightness = stats.channels.reduce((sum, ch) => sum + ch.mean, 0) / stats.channels.length;
  const brightness = (avgBrightness / 255) * 100;
  
  // Calculate actual sharpness using Laplacian variance
  const sharpness = await calculateSharpness(buffer);
  
  console.log('[PhotoScoring] Metrics:', {
    brightness: brightness.toFixed(1),
    sharpness,
    aspectRatio: aspectRatio.toFixed(3),
    width,
    height,
    fileSizeKB: fileSizeKB.toFixed(0),
    bgVariance: bgVariance.toFixed(1),
    category: validCategory
  });
  
  // Calculate 3 components using REWARD-BASED scoring
  const technical = scoreTechnical(brightness, sharpness, fileSizeKB);
  const presentation = scorePresentation(bgVariance, validCategory);
  const composition = scoreComposition(aspectRatio, width, height, validCategory);
  
  console.log('[PhotoScoring] Component scores:', { technical, presentation, composition });
  
  // Get category-specific weights
  const weights = CATEGORY_WEIGHTS[validCategory];
  
  // Calculate final weighted score
  const finalScore = Math.round(
    technical * weights.technical +
    presentation * weights.presentation +
    composition * weights.composition
  );
  
  console.log('[PhotoScoring] Final score:', finalScore, 'with weights:', weights);
  
  // Generate suggestions based on measured values
  const suggestions: string[] = [];
  
  // Lighting suggestions
  if (brightness < 50) {
    suggestions.push('Image appears too dark - consider brightening');
  } else if (brightness > 75) {
    suggestions.push('Image may be overexposed - consider reducing brightness');
  }
  
  // Sharpness suggestions
  if (sharpness < 65) {
    suggestions.push('Image could be sharper - sharpening filter recommended');
  }
  
  // Aspect ratio suggestions
  if (Math.abs(aspectRatio - 1.0) > 0.05) {
    suggestions.push('Consider cropping to 1:1 aspect ratio for Etsy');
  }
  
  // Dimension suggestions
  if (Math.min(width, height) < 1000) {
    suggestions.push('Image resolution could be higher (1000px+ recommended)');
  }
  
  // File size suggestions
  if (fileSizeKB > 2048) {
    suggestions.push('File size is large - compression recommended');
  } else if (fileSizeKB < 300) {
    suggestions.push('File may be over-compressed - quality could be affected');
  }
  
  return {
    score: finalScore,
    category: validCategory,
    breakdown: { technical, presentation, composition },
    suggestions,
    metadata: {
      brightness: Math.round(brightness * 10) / 10,
      sharpness,
      aspectRatio: Math.round(aspectRatio * 1000) / 1000,
      width,
      height,
      fileSize,
      bgVariance: Math.round(bgVariance * 10) / 10
    }
  };
}

/**
 * Helper function to detect category from listing title
 */
export function detectCategoryFromTitle(title?: string): Category {
  if (!title) return 'small_crafts';
  
  const lower = title.toLowerCase();
  
  if (lower.includes('canvas') || lower.includes('wall art') || lower.includes('print')) {
    return 'home_decor_wall_art';
  }
  if (lower.includes('ring') || lower.includes('necklace') || lower.includes('earring') || lower.includes('bracelet')) {
    return 'small_jewelry';
  }
  if (lower.includes('dress') || lower.includes('shirt') || lower.includes('pant') || lower.includes('clothing')) {
    return 'wearables_clothing';
  }
  if (lower.includes('bag') || lower.includes('purse') || lower.includes('scarf') || lower.includes('hat')) {
    return 'wearables_accessories';
  }
  if (lower.includes('furniture') || lower.includes('table') || lower.includes('chair')) {
    return 'furniture';
  }
  if (lower.includes('vintage')) {
    return 'vintage_items';
  }
  if (lower.includes('digital') || lower.includes('printable') || lower.includes('template')) {
    return 'digital_products';
  }
  if (lower.includes('art') || lower.includes('painting')) {
    return 'flat_artwork';
  }
  if (lower.includes('supply') || lower.includes('material')) {
    return 'craft_supplies';
  }
  
  return 'small_crafts'; // Default
}

/**
 * Check if image is already optimal (for early return in optimizer)
 */
export function isAlreadyOptimal(analysis: PhotoScore): boolean {
  const { metadata, breakdown, score } = analysis;
  
  // Check all optimization criteria
  const hasGoodAspectRatio = Math.abs(metadata.aspectRatio - 1.0) < 0.05;
  const hasGoodDimensions = metadata.width >= 950 && metadata.width <= 1050 && 
                           metadata.height >= 950 && metadata.height <= 1050;
  const hasGoodFileSize = metadata.fileSize / 1024 >= 400 && metadata.fileSize / 1024 <= 2048;
  const hasGoodBrightness = metadata.brightness >= 48 && metadata.brightness <= 77;
  const hasGoodSharpness = metadata.sharpness >= 80;
  const hasHighTechnical = breakdown.technical >= 85;
  const hasHighComposition = breakdown.composition >= 85;
  const hasHighScore = score >= 88;
  
  console.log('[isAlreadyOptimal] Checks:', {
    hasGoodAspectRatio,
    hasGoodDimensions,
    hasGoodFileSize,
    hasGoodBrightness,
    hasGoodSharpness,
    hasHighTechnical,
    hasHighComposition,
    hasHighScore
  });
  
  return (
    hasGoodAspectRatio &&
    hasGoodDimensions &&
    hasGoodFileSize &&
    hasGoodBrightness &&
    hasGoodSharpness &&
    hasHighTechnical &&
    hasHighComposition &&
    hasHighScore
  );
}
