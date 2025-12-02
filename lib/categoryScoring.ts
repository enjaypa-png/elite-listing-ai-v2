/**
 * CATEGORY DETECTION AND SCORING SYSTEM
 */

export interface CategoryRules {
  keywords: string[];
  idealAspectRatio: string;
  preferredStyle: 'product' | 'lifestyle' | 'both';
  backgroundPreference: 'white' | 'neutral' | 'contextual';
}

export interface MetricWeights {
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

const CATEGORIES: Record<string, CategoryRules> = {
  wall_art: {
    keywords: ['canvas', 'print', 'poster', 'wall art', 'frame', 'painting', 'photo print'],
    idealAspectRatio: 'landscape',
    preferredStyle: 'lifestyle',
    backgroundPreference: 'contextual',
  },
  jewelry: {
    keywords: ['ring', 'necklace', 'bracelet', 'earring', 'pendant', 'jewelry', 'jewellery'],
    idealAspectRatio: 'square',
    preferredStyle: 'product',
    backgroundPreference: 'white',
  },
  home_decor: {
    keywords: ['pillow', 'blanket', 'throw', 'cushion', 'furniture', 'lamp', 'decor', 'vase'],
    idealAspectRatio: 'square',
    preferredStyle: 'both',
    backgroundPreference: 'contextual',
  },
  clothing: {
    keywords: ['shirt', 't-shirt', 'dress', 'hoodie', 'apparel', 'clothing', 'tee'],
    idealAspectRatio: 'portrait',
    preferredStyle: 'both',
    backgroundPreference: 'neutral',
  },
  handmade_small: {
    keywords: ['handmade', 'craft', 'ceramic', 'pottery', 'soap', 'candle', 'keychain'],
    idealAspectRatio: 'square',
    preferredStyle: 'product',
    backgroundPreference: 'white',
  },
  default: {
    keywords: [],
    idealAspectRatio: 'square',
    preferredStyle: 'both',
    backgroundPreference: 'neutral',
  },
};

export function detectCategory(listingTitle?: string, userCategory?: string): string {
  // Priority 1: User-selected category
  if (userCategory && CATEGORIES[userCategory]) {
    return userCategory;
  }

  // Priority 2: Detect from title
  if (listingTitle) {
    const lowerTitle = listingTitle.toLowerCase();
    for (const [category, rules] of Object.entries(CATEGORIES)) {
      if (category === 'default') continue;
      if (rules.keywords.some(keyword => lowerTitle.includes(keyword))) {
        return category;
      }
    }
  }

  // Priority 3: Default
  return 'default';
}

export function getWeightsByCategory(category: string): MetricWeights {
  const weightMap: Record<string, MetricWeights> = {
    wall_art: {
      lighting: 0.25,
      presentation: 0.20,
      sharpness: 0.15,
      color: 0.12,
      contrast: 0.08,
      background: 0.05,
      crop: 0.05,
      centering: 0.05,
      alignment: 0.03,
      noise: 0.02,
    },
    home_decor: {
      lighting: 0.22,
      presentation: 0.18,
      sharpness: 0.15,
      color: 0.12,
      background: 0.08,
      contrast: 0.08,
      centering: 0.07,
      crop: 0.05,
      alignment: 0.03,
      noise: 0.02,
    },
    jewelry: {
      sharpness: 0.25,
      background: 0.20,
      lighting: 0.20,
      centering: 0.12,
      color: 0.10,
      contrast: 0.05,
      crop: 0.03,
      presentation: 0.02,
      alignment: 0.02,
      noise: 0.01,
    },
    clothing: {
      lighting: 0.22,
      presentation: 0.18,
      sharpness: 0.15,
      color: 0.13,
      background: 0.10,
      contrast: 0.08,
      centering: 0.07,
      crop: 0.04,
      alignment: 0.02,
      noise: 0.01,
    },
    handmade_small: {
      sharpness: 0.23,
      background: 0.18,
      lighting: 0.20,
      color: 0.12,
      centering: 0.10,
      contrast: 0.07,
      crop: 0.04,
      presentation: 0.03,
      alignment: 0.02,
      noise: 0.01,
    },
    default: {
      lighting: 0.20,
      sharpness: 0.20,
      centering: 0.10,
      alignment: 0.10,
      background: 0.10,
      color: 0.10,
      contrast: 0.05,
      noise: 0.05,
      crop: 0.05,
      presentation: 0.05,
    },
  };

  return weightMap[category] || weightMap.default;
}

interface BonusRule {
  condition: (metrics: any, category: string) => boolean;
  points: number;
  reason: string;
}

export function applyBonusesAndPenalties(
  baseScore: number,
  metrics: any,
  category: string
): { finalScore: number; adjustments: string[] } {
  let totalAdjustment = 0;
  const adjustments: string[] = [];

  const bonusRules: BonusRule[] = [
    {
      condition: (m, cat) => 
        (cat === 'wall_art' || cat === 'home_decor') && m.backgroundVariance > 40,
      points: 12,
      reason: 'Natural background texture (contextual staging)',
    },
    {
      condition: (m, cat) => 
        cat === 'wall_art' && m.aspectRatio > 0.8 && m.aspectRatio < 2.5,
      points: 10,
      reason: 'Appropriate orientation for wall art',
    },
    {
      condition: (m) => 
        m.aspectRatio > 0.8 && m.aspectRatio < 1.3 && m.backgroundVariance > 40,
      points: 8,
      reason: 'Lifestyle staging context detected',
    },
    {
      condition: (m, cat) => 
        (cat === 'jewelry' || cat === 'handmade_small') && m.backgroundVariance < 50,
      points: 12,
      reason: 'Clean white/neutral background',
    },
    {
      condition: (m, cat) => 
        (cat === 'jewelry' || cat === 'handmade_small') && Math.abs(m.aspectRatio - 1.0) < 0.1,
      points: 6,
      reason: 'Square format optimal for product shots',
    },
    {
      condition: (m) => m.lighting >= 17 && m.contrast >= 4,
      points: 6,
      reason: 'Professional lighting setup',
    },
    {
      condition: (m) => m.sharpness >= 18 && m.color >= 8,
      points: 5,
      reason: 'Excellent image quality',
    },
  ];

  const penaltyRules: BonusRule[] = [
    {
      condition: (m, cat) => cat === 'jewelry' && m.backgroundVariance > 150,
      points: -10,
      reason: 'Distracting background for small product',
    },
    {
      condition: (m) => m.lighting < 10,
      points: -12,
      reason: 'Severely underlit',
    },
  ];

  // Apply bonuses
  for (const rule of bonusRules) {
    if (rule.condition(metrics, category)) {
      totalAdjustment += rule.points;
      adjustments.push(`+${rule.points}: ${rule.reason}`);
    }
  }

  // Apply penalties
  for (const rule of penaltyRules) {
    if (rule.condition(metrics, category)) {
      totalAdjustment += rule.points;
      adjustments.push(`${rule.points}: ${rule.reason}`);
    }
  }

  const finalScore = Math.min(100, Math.max(0, baseScore + totalAdjustment));

  return { finalScore, adjustments };
}
