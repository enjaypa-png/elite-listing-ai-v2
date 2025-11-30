import sharp from 'sharp';

/**
 * R.A.N.K. 285™ DETERMINISTIC PHOTO SCORING SYSTEM
 * 10 sub-scores with weighted average = final 100-point score
 */

interface PhotoMetrics {
  lighting: number;
  sharpness: number;
  centering: number;
  alignment: number;
  background: number;
  color: number;
  contrast: number;
  noise: number;
  crop: number;
  presentation: number;
}

interface PhotoAnalysis {
  score: number;
  metrics: PhotoMetrics;
  suggestions: string[];
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * 1️⃣ Lighting Quality (0-20 points)
 */
async function analyzeLighting(buffer: Buffer): Promise<{ score: number; issues: string[] }> {
  const { data, info } = await sharp(buffer)
    .raw()
    .toBuffer({ resolveWithObject: true });

  let totalBrightness = 0;
  let overExposed = 0;
  let underExposed = 0;
  const pixelCount = info.width * info.height;

  // Calculate mean brightness and exposure issues
  for (let i = 0; i < data.length; i += info.channels) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    
    // Y channel brightness (perceived luminance)
    const brightness = 0.299 * r + 0.587 * g + 0.114 * b;
    totalBrightness += brightness;

    if (brightness > 204) overExposed++; // >80% of 255
    if (brightness < 51) underExposed++; // <20% of 255
  }

  const meanBrightness = (totalBrightness / pixelCount) / 255 * 100;
  const idealBrightness = 55;
  const brightnessDiff = Math.abs(meanBrightness - idealBrightness);
  
  const overExposureRatio = overExposed / pixelCount;
  const underExposureRatio = underExposed / pixelCount;
  
  const glarePenalty = overExposureRatio > 0.1 ? 8 : 0;
  const darkPenalty = underExposureRatio > 0.2 ? 6 : 0;
  
  let score = 20 - (brightnessDiff / 5) - glarePenalty - darkPenalty;
  score = clamp(score, 0, 20);

  const issues: string[] = [];
  if (glarePenalty > 0) issues.push('lighting');
  if (darkPenalty > 0) issues.push('brightness');
  
  return { score: Math.round(score), issues };
}

/**
 * 2️⃣ Sharpness & Clarity (0-20 points)
 */
async function analyzeSharpness(buffer: Buffer): Promise<{ score: number; issues: string[] }> {
  const { data, info } = await sharp(buffer)
    .greyscale()
    .raw()
    .toBuffer({ resolveWithObject: true });

  // Calculate Laplacian variance (edge detection)
  let laplacianSum = 0;
  const width = info.width;
  
  for (let y = 1; y < info.height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = y * width + x;
      const center = data[idx];
      const neighbors = [
        data[idx - 1], data[idx + 1],
        data[idx - width], data[idx + width]
      ];
      
      const laplacian = Math.abs(4 * center - neighbors.reduce((a, b) => a + b, 0));
      laplacianSum += laplacian * laplacian;
    }
  }

  const laplacianVariance = laplacianSum / (info.width * info.height);
  
  let score: number;
  if (laplacianVariance > 2200) score = 20;
  else if (laplacianVariance > 1800) score = 18;
  else if (laplacianVariance > 1400) score = 15;
  else if (laplacianVariance > 1000) score = 10;
  else score = 5;

  const issues: string[] = [];
  if (score < 15) issues.push('clarity');
  
  return { score, issues };
}

/**
 * 3️⃣ Subject Centering (0-10 points)
 * Simplified: assumes subject is in center region
 */
function analyzeSubjectCentering(): { score: number; issues: string[] } {
  // For now, assume decent centering (8/10)
  // Full implementation would use object detection
  return { score: 8, issues: [] };
}

/**
 * 4️⃣ Horizon Alignment (0-10 points)
 * Simplified: check if image is mostly aligned
 */
function analyzeAlignment(): { score: number; issues: string[] } {
  // For now, assume good alignment (8/10)
  // Full implementation would use Hough transform
  return { score: 8, issues: [] };
}

/**
 * 5️⃣ Background Cleanliness (0-10 points)
 */
async function analyzeBackground(buffer: Buffer): Promise<{ score: number; issues: string[] }> {
  const stats = await sharp(buffer).stats();
  
  // Check color variance - clean backgrounds have low variance
  const avgVariance = stats.channels.reduce((sum, ch) => sum + ch.stdev, 0) / stats.channels.length;
  
  let score: number;
  if (avgVariance < 30) score = 10; // Very clean
  else if (avgVariance < 50) score = 7; // Medium clutter
  else score = 4; // High clutter

  const issues: string[] = [];
  if (score < 7) issues.push('background');
  
  return { score, issues };
}

/**
 * 6️⃣ Color Accuracy (0-10 points)
 */
async function analyzeColor(buffer: Buffer): Promise<{ score: number; issues: string[] }> {
  const stats = await sharp(buffer).stats();
  
  // Check color balance (RGB channel balance)
  const [r, g, b] = stats.channels.map(ch => ch.mean);
  const avgMean = (r + g + b) / 3;
  const colorDeviation = Math.max(
    Math.abs(r - avgMean),
    Math.abs(g - avgMean),
    Math.abs(b - avgMean)
  );
  
  let score = 10 - (colorDeviation / 15);
  score = clamp(score, 0, 10);
  
  return { score: Math.round(score), issues: [] };
}

/**
 * 7️⃣ Contrast & Depth (0-5 points)
 */
async function analyzeContrast(buffer: Buffer): Promise<{ score: number; issues: string[] }> {
  const stats = await sharp(buffer).stats();
  
  // Calculate overall contrast from standard deviation
  const avgStdev = stats.channels.reduce((sum, ch) => sum + ch.stdev, 0) / stats.channels.length;
  const contrastLevel = avgStdev / 128; // Normalize to 0-1 range
  
  // Ideal range: 0.4-0.7
  let score: number;
  if (contrastLevel >= 0.4 && contrastLevel <= 0.7) {
    score = 5;
  } else if (contrastLevel >= 0.3 && contrastLevel <= 0.8) {
    score = 4;
  } else {
    score = 2;
  }
  
  return { score, issues: [] };
}

/**
 * 8️⃣ Noise Level (0-5 points)
 */
function analyzeNoise(): { score: number; issues: string[] } {
  // Simplified: assume moderate noise (4/5)
  // Full implementation would measure pixel variance at micro-level
  return { score: 4, issues: [] };
}

/**
 * 9️⃣ Cropping Ratio (0-5 points)
 */
async function analyzeCropRatio(buffer: Buffer): Promise<{ score: number; issues: string[] }> {
  const metadata = await sharp(buffer).metadata();
  const actualRatio = (metadata.width || 1) / (metadata.height || 1);
  const ratioDeviation = Math.abs(actualRatio - 1.0);
  
  let score = 5 - (ratioDeviation * 10);
  score = clamp(score, 0, 5);
  
  const issues: string[] = [];
  if (score < 3) issues.push('aspect ratio');
  
  return { score: Math.round(score), issues };
}

/**
 * 🔟 Presentation Quality (0-5 points)
 */
function analyzePresentation(): { score: number; issues: string[] } {
  // Simplified: assume good presentation (4/5)
  // Full implementation would detect shadows, glare, warping
  return { score: 4, issues: [] };
}

/**
 * Main scoring function
 */
export async function calculateDeterministicScore(buffer: Buffer): Promise<PhotoAnalysis> {
  const lighting = await analyzeLighting(buffer);
  const sharpness = await analyzeSharpness(buffer);
  const centering = analyzeSubjectCentering();
  const alignment = analyzeAlignment();
  const background = await analyzeBackground(buffer);
  const color = await analyzeColor(buffer);
  const contrast = await analyzeContrast(buffer);
  const noise = analyzeNoise();
  const crop = await analyzeCropRatio(buffer);
  const presentation = analyzePresentation();

  const metrics: PhotoMetrics = {
    lighting: lighting.score,
    sharpness: sharpness.score,
    centering: centering.score,
    alignment: alignment.score,
    background: background.score,
    color: color.score,
    contrast: contrast.score,
    noise: noise.score,
    crop: crop.score,
    presentation: presentation.score,
  };

  // Weighted final score
  const finalScore = Math.round(
    metrics.lighting * 0.20 +
    metrics.sharpness * 0.20 +
    metrics.centering * 0.10 +
    metrics.alignment * 0.10 +
    metrics.background * 0.10 +
    metrics.color * 0.10 +
    metrics.contrast * 0.05 +
    metrics.noise * 0.05 +
    metrics.crop * 0.05 +
    metrics.presentation * 0.05
  );

  // Collect all issues for suggestions
  const allIssues = [
    ...lighting.issues,
    ...sharpness.issues,
    ...background.issues,
    ...crop.issues
  ];

  const suggestions = generateSuggestions(allIssues, metrics);

  return {
    score: finalScore,
    metrics,
    suggestions,
  };
}

function generateSuggestions(issues: string[], metrics: PhotoMetrics): string[] {
  const suggestions: string[] = [];

  if (issues.includes('lighting')) {
    suggestions.push('Use diffused lighting to reduce glare');
  }
  if (issues.includes('brightness')) {
    suggestions.push('Increase overall brightness - image appears too dark');
  }
  if (issues.includes('clarity')) {
    suggestions.push('Ensure camera is focused and stable to improve sharpness');
  }
  if (issues.includes('background')) {
    suggestions.push('Use a cleaner, less cluttered background');
  }
  if (issues.includes('aspect ratio')) {
    suggestions.push('Crop image to 1:1 aspect ratio for optimal Etsy display');
  }

  // Add general suggestions based on scores
  if (metrics.color < 7) {
    suggestions.push('Adjust white balance for more accurate colors');
  }
  if (metrics.contrast < 3) {
    suggestions.push('Increase contrast to add depth and visual interest');
  }

  return suggestions;
}
