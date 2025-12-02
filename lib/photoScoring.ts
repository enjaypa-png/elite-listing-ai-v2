import sharp from 'sharp';
import { detectCategory, getWeightsByCategory } from './categoryScoring';

export interface PhotoAnalysis {
  score: number;
  components: {
    technical: number;
    presentation: number;
    composition: number;
  };
  suggestions: string[];
  category: string;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * TECHNICAL QUALITY (0-100)
 * Lighting + Sharpness + Color
 */
async function analyzeTechnicalQuality(buffer: Buffer): Promise<number> {
  const stats = await sharp(buffer).stats();
  const metadata = await sharp(buffer).metadata();
  
  // Lighting (0-40)
  const [r, g, b] = stats.channels.map(ch => ch.mean);
  const avgBrightness = (r + g + b) / 3;
  const brightness = (avgBrightness / 255) * 100;
  
  let lightingScore = 40;
  const brightnessDiff = Math.abs(brightness - 55);
  lightingScore -= brightnessDiff / 5;
  lightingScore = clamp(lightingScore, 30, 40);
  
  // Sharpness (0-35)
  const { data, info } = await sharp(buffer).greyscale().raw().toBuffer({ resolveWithObject: true });
  let laplacianSum = 0;
  
  for (let y = 1; y < info.height - 1; y++) {
    for (let x = 1; x < info.width - 1; x++) {
      const idx = y * info.width + x;
      const center = data[idx];
      const neighbors = [
        data[idx - 1], data[idx + 1],
        data[idx - info.width], data[idx + info.width]
      ];
      const laplacian = Math.abs(4 * center - neighbors.reduce((a, b) => a + b, 0));
      laplacianSum += laplacian * laplacian;
    }
  }
  
  const laplacianVariance = laplacianSum / (info.width * info.height);
  let sharpnessScore = 35;
  if (laplacianVariance > 150) sharpnessScore = 35;
  else if (laplacianVariance > 100) sharpnessScore = 33;
  else if (laplacianVariance > 70) sharpnessScore = 31;
  else if (laplacianVariance > 40) sharpnessScore = 28;
  else sharpnessScore = 25;
  
  // Color (0-25)
  const colorDeviation = Math.max(
    Math.abs(r - avgBrightness),
    Math.abs(g - avgBrightness),
    Math.abs(b - avgBrightness)
  );
  
  let colorScore = 25 - (colorDeviation / 10);
  colorScore = clamp(colorScore, 20, 25);
  
  const total = lightingScore + sharpnessScore + colorScore;
  console.log('[Technical] Lighting:', lightingScore.toFixed(1), 'Sharpness:', sharpnessScore.toFixed(1), 'Color:', colorScore.toFixed(1), 'Total:', total.toFixed(1));
  
  return Math.round(total);
}

/**
 * PRESENTATION QUALITY (0-100)
 * Lifestyle context + staging + appeal
 */
async function analyzePresentationQuality(buffer: Buffer, category: string): Promise<number> {
  const stats = await sharp(buffer).stats();
  const avgVariance = stats.channels.reduce((sum, ch) => sum + ch.stdev, 0) / stats.channels.length;
  
  let score = 62; // Base presentation score
  
  // For wall art/home decor: natural backgrounds are GOOD
  if (category === 'wall_art' || category === 'home_decor') {
    if (avgVariance > 40 && avgVariance < 150) {
      score += 13; // Lifestyle staging bonus
    }
  }
  
  // For jewelry/handmade: clean backgrounds are GOOD
  if (category === 'jewelry' || category === 'handmade_small') {
    if (avgVariance < 40) {
      score += 15; // Clean product shot bonus
    } else {
      score -= 10; // Cluttered background penalty
    }
  }
  
  score = clamp(score, 55, 85); // Max 85
  console.log('[Presentation] Score:', score, '(variance:', avgVariance.toFixed(1), ')');
  
  return Math.round(score);
}

/**
 * COMPOSITION QUALITY (0-100)
 * Framing + background appropriateness + aspect ratio
 */
async function analyzeCompositionQuality(buffer: Buffer, category: string): Promise<number> {
  const metadata = await sharp(buffer).metadata();
  const aspectRatio = (metadata.width || 1) / (metadata.height || 1);
  
  let score = 70; // Base composition score (reduced from 75)
  
  // Aspect ratio scoring by category
  if (category === 'wall_art') {
    if (aspectRatio > 1.2 && aspectRatio < 2.5) {
      score += 15; // Perfect landscape for wall art (increased from 10)
    } else if (aspectRatio > 0.8 && aspectRatio < 1.2) {
      score += 10; // Square is acceptable (increased from 5)
    }
  } else if (category === 'jewelry' || category === 'handmade_small') {
    if (Math.abs(aspectRatio - 1.0) < 0.15) {
      score += 10; // Perfect square for products
    }
  }
  
  score = clamp(score, 65, 90);
  console.log('[Composition] Score:', score, '(aspect:', aspectRatio.toFixed(2), ')');
  
  return Math.round(score);
}

/**
 * MAIN SCORING FUNCTION - SIMPLIFIED 3-COMPONENT SYSTEM
 */
export async function calculateDeterministicScore(
  buffer: Buffer,
  listingTitle?: string,
  userCategory?: string
): Promise<PhotoAnalysis> {
  console.log('[Scoring] Starting analysis...');
  
  // Detect category
  const category = detectCategory(listingTitle, userCategory);
  console.log('[Scoring] Category:', category);
  
  // Calculate 3 main components
  const technical = await analyzeTechnicalQuality(buffer);
  const presentation = await analyzePresentationQuality(buffer, category);
  const composition = await analyzeCompositionQuality(buffer, category);
  
  // Get category-specific weights
  let weights;
  if (category === 'wall_art') {
    weights = { technical: 0.40, presentation: 0.35, composition: 0.25 };
  } else if (category === 'jewelry') {
    weights = { technical: 0.60, presentation: 0.25, composition: 0.15 };
  } else {
    weights = { technical: 0.50, presentation: 0.30, composition: 0.20 };
  }
  
  // Calculate final weighted score
  const finalScore = Math.round(
    technical * weights.technical +
    presentation * weights.presentation +
    composition * weights.composition
  );
  
  console.log('[Scoring] Technical:', technical, 'Presentation:', presentation, 'Composition:', composition);
  console.log('[Scoring] Final:', finalScore, '/100');
  
  // Generate simple suggestions
  const suggestions: string[] = [];
  if (technical < 80) suggestions.push('Improve lighting and camera focus');
  if (presentation < 75) suggestions.push('Consider lifestyle staging or cleaner background');
  if (composition < 75) suggestions.push('Adjust framing and composition');
  
  return {
    score: finalScore,
    components: { technical, presentation, composition },
    suggestions,
    category
  };
}
