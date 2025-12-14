/**
 * SCORING ANCHORS SYSTEM
 * Calibrates AI scoring using real Etsy examples
 * 
 * This file will be populated with anchor data from Manus AI collection
 */

// ===========================================
// TYPE DEFINITIONS
// ===========================================

export interface ScoringAnchor {
  id: string;
  category: EtsyCategory;
  photo_type: PhotoType;
  score: number;
  image_url: string;
  seller_type: 'best_seller' | 'star_seller' | 'regular' | 'new_seller';
  reasoning: {
    score_justification: string;
    strengths: string[];
    weaknesses: string[];
    etsy_alignment: string;
  };
  technical_notes: {
    background_type: BackgroundType;
    lighting_quality: LightingQuality;
    composition: CompositionQuality;
    has_props: boolean;
    shows_scale: boolean;
    image_position: 'main_image' | 'secondary' | 'detail';
  };
}

export type EtsyCategory = 
  | 'home_living'
  | 'jewelry'
  | 'clothing'
  | 'craft_supplies'
  | 'paper_party'
  | 'art_collectibles'
  | 'bath_beauty'
  | 'pet_supplies'
  | 'toys_games'
  | 'vintage';

export type PhotoType = 
  | 'studio'
  | 'lifestyle'
  | 'detail'
  | 'scale'
  | 'group'
  | 'packaging'
  | 'process';

export type BackgroundType = 
  | 'clean_white'
  | 'clean_neutral'
  | 'lifestyle_clean'
  | 'lifestyle_busy'
  | 'textured_minimal'
  | 'cluttered_home'
  | 'outdoor'
  | 'other';

export type LightingQuality = 
  | 'professional_soft'
  | 'professional_dramatic'
  | 'natural_good'
  | 'natural_harsh'
  | 'poor_indoor'
  | 'mixed';

export type CompositionQuality = 
  | 'centered_balanced'
  | 'rule_of_thirds'
  | 'slightly_off'
  | 'off_center'
  | 'poor';

// ===========================================
// CATEGORY REQUIREMENTS (From your doc)
// ===========================================

export const CATEGORY_REQUIREMENTS: Record<EtsyCategory, {
  name: string;
  requirements: string[];
  ideal_photo_types: PhotoType[];
  scoring_emphasis: string;
}> = {
  home_living: {
    name: 'Home & Living',
    requirements: [
      'Lifestyle context showing product in a real room setting',
      'Scale reference (next to common objects or furniture)',
      'Styled with complementary props that enhance, not distract',
      'Natural warm lighting that feels inviting',
      'Clean background or intentional lifestyle setting',
      'Color harmony between product and environment'
    ],
    ideal_photo_types: ['lifestyle', 'studio', 'scale', 'detail'],
    scoring_emphasis: 'Lifestyle context and warm, inviting presentation'
  },
  jewelry: {
    name: 'Jewelry & Accessories',
    requirements: [
      'Clean white or neutral background',
      'Sharp focus on fine details and gemstones',
      'Proper lighting without harsh shadows or glare',
      'Size reference (model hand, coin, or ruler)',
      'Multiple angles to show all aspects',
      'Product fills 70-80% of frame'
    ],
    ideal_photo_types: ['studio', 'detail', 'scale', 'lifestyle'],
    scoring_emphasis: 'Detail clarity and professional clean presentation'
  },
  clothing: {
    name: 'Clothing/Apparel',
    requirements: [
      'On model OR professional flat lay presentation',
      'Full garment visible in at least one shot',
      'Fabric texture clearly visible',
      'Natural lighting preferred',
      'Neutral background that doesn\'t compete',
      'Wrinkle-free, steamed/ironed presentation'
    ],
    ideal_photo_types: ['studio', 'lifestyle', 'detail'],
    scoring_emphasis: 'Fit visualization and fabric quality visibility'
  },
  craft_supplies: {
    name: 'Craft Supplies & Tools',
    requirements: [
      'Clean product shot showing all items',
      'Detail shots highlighting quality',
      'Scale reference for size understanding',
      'Texture and material clearly visible',
      'Lifestyle context showing product in use',
      'Handmade quality visible if applicable'
    ],
    ideal_photo_types: ['studio', 'detail', 'scale', 'process'],
    scoring_emphasis: 'Quantity clarity and material quality'
  },
  paper_party: {
    name: 'Paper & Party Supplies',
    requirements: [
      'Flat lay styling for paper goods',
      'Clean white background for clarity',
      'Text must be clearly readable',
      'Styled with relevant props',
      'Even lighting without shadows on text',
      'Color accuracy is critical'
    ],
    ideal_photo_types: ['studio', 'lifestyle', 'detail'],
    scoring_emphasis: 'Text readability and color accuracy'
  },
  art_collectibles: {
    name: 'Art & Collectibles',
    requirements: [
      'Straight-on shot without perspective distortion',
      'Even lighting without glare or reflections',
      'True color representation',
      'Frame or mockup context shown',
      'High resolution for detail appreciation',
      'White or neutral background'
    ],
    ideal_photo_types: ['studio', 'detail', 'scale', 'lifestyle'],
    scoring_emphasis: 'Color accuracy and no distortion'
  },
  bath_beauty: {
    name: 'Bath & Beauty',
    requirements: [
      'Clean, spa-like aesthetic',
      'Packaging clearly visible and readable',
      'Ingredients or texture shown where relevant',
      'Lifestyle context suggesting use',
      'Natural/organic vibe in styling',
      'Professional, even lighting'
    ],
    ideal_photo_types: ['studio', 'lifestyle', 'detail', 'packaging'],
    scoring_emphasis: 'Clean aesthetic and ingredient/texture visibility'
  },
  pet_supplies: {
    name: 'Pet Supplies',
    requirements: [
      'Pet shown using the product (when possible)',
      'Product clearly visible even with pet',
      'Scale reference for sizing',
      'Clean background',
      'Lifestyle context',
      'Emotional appeal and cuteness factor'
    ],
    ideal_photo_types: ['lifestyle', 'studio', 'scale'],
    scoring_emphasis: 'Pet engagement and clear product visibility'
  },
  toys_games: {
    name: 'Toys & Games',
    requirements: [
      'In-use shot showing play value',
      'Bright, cheerful lighting',
      'Clean background',
      'Scale reference for size',
      'Safety features visible if applicable',
      'Fun, playful styling'
    ],
    ideal_photo_types: ['lifestyle', 'studio', 'scale', 'detail'],
    scoring_emphasis: 'Play value demonstration and safety visibility'
  },
  vintage: {
    name: 'Vintage Items',
    requirements: [
      'Condition clearly visible (show wear honestly)',
      'Multiple angles',
      'Scale reference',
      'Natural lighting preferred',
      'Authenticity marks visible (labels, stamps)',
      'Patina/character shown authentically'
    ],
    ideal_photo_types: ['studio', 'detail', 'scale'],
    scoring_emphasis: 'Honest condition representation and authenticity'
  }
};

// ===========================================
// PLACEHOLDER: ANCHOR DATA
// (Will be populated from Manus AI collection)
// ===========================================

export const SCORING_ANCHORS: ScoringAnchor[] = [
  // PLACEHOLDER - These will be replaced with real anchors from Manus AI
  // Example structure:
  /*
  {
    id: "anchor_001",
    category: "jewelry",
    photo_type: "studio",
    score: 92,
    image_url: "https://i.etsystatic.com/...",
    seller_type: "best_seller",
    reasoning: {
      score_justification: "Professional studio setup with clean white background...",
      strengths: ["Flawless white background", "Sharp focus", "Perfect lighting"],
      weaknesses: ["No scale reference in this shot"],
      etsy_alignment: "Exceeds Etsy jewelry photography guidelines"
    },
    technical_notes: {
      background_type: "clean_white",
      lighting_quality: "professional_soft",
      composition: "centered_balanced",
      has_props: false,
      shows_scale: false,
      image_position: "main_image"
    }
  }
  */
];

// ===========================================
// HELPER FUNCTIONS
// ===========================================

/**
 * Get anchors for a specific category
 */
export function getAnchorsForCategory(category: EtsyCategory): ScoringAnchor[] {
  return SCORING_ANCHORS.filter(a => a.category === category);
}

/**
 * Get anchors within a score range
 */
export function getAnchorsInScoreRange(min: number, max: number): ScoringAnchor[] {
  return SCORING_ANCHORS.filter(a => a.score >= min && a.score <= max);
}

/**
 * Get reference anchors for AI prompt
 * Returns a curated set of anchors across the score spectrum
 */
export function getReferenceAnchorsForPrompt(category?: EtsyCategory): string {
  let anchors = SCORING_ANCHORS;
  
  if (category) {
    anchors = anchors.filter(a => a.category === category);
  }
  
  // Get representative samples across score ranges
  const samples: ScoringAnchor[] = [];
  const ranges = [
    { min: 90, max: 100, label: 'Exceptional' },
    { min: 80, max: 89, label: 'Excellent' },
    { min: 70, max: 79, label: 'Good' },
    { min: 55, max: 69, label: 'Needs Work' },
    { min: 0, max: 54, label: 'Poor' }
  ];
  
  for (const range of ranges) {
    const inRange = anchors.filter(a => a.score >= range.min && a.score <= range.max);
    if (inRange.length > 0) {
      // Take up to 2 samples per range
      samples.push(...inRange.slice(0, 2));
    }
  }
  
  // Format for prompt
  return samples.map(a => 
    `[${a.score}/100 - ${a.category}] ${a.reasoning.score_justification}\n` +
    `Strengths: ${a.reasoning.strengths.join(', ')}\n` +
    `Weaknesses: ${a.reasoning.weaknesses.join(', ')}`
  ).join('\n\n');
}

/**
 * Get category requirements for AI prompt
 */
export function getCategoryRequirementsForPrompt(category: EtsyCategory): string {
  const req = CATEGORY_REQUIREMENTS[category];
  return `
CATEGORY: ${req.name}
REQUIREMENTS:
${req.requirements.map((r, i) => `${i + 1}. ${r}`).join('\n')}

IDEAL PHOTO TYPES: ${req.ideal_photo_types.join(', ')}
SCORING EMPHASIS: ${req.scoring_emphasis}
`;
}

// ===========================================
// SCORE CALIBRATION
// ===========================================

export const SCORE_CALIBRATION = {
  // Recalibrated ranges based on real Etsy best-sellers
  ranges: {
    exceptional: { min: 90, max: 98, description: 'Top 1-5% of Etsy - Professional photography, perfect execution' },
    best_seller: { min: 85, max: 89, description: 'Best-seller quality - Strong photos that drive sales' },
    good: { min: 75, max: 84, description: 'Solid listings - Minor improvements possible' },
    average: { min: 65, max: 74, description: 'Average Etsy quality - Several areas to improve' },
    needs_work: { min: 50, max: 64, description: 'Below average - Multiple issues affecting sales' },
    poor: { min: 0, max: 49, description: 'Poor quality - Significant problems, rebuild needed' }
  },
  
  // What each score range means for the seller
  guidance: {
    '90+': 'Your photos are exceptional! Focus on maintaining consistency across all listings.',
    '85-89': 'Excellent photos that compete with best-sellers. Minor tweaks could push to exceptional.',
    '75-84': 'Good foundation. Addressing the issues noted could significantly boost visibility.',
    '65-74': 'Average for Etsy. Prioritize the top 2-3 improvements for biggest impact.',
    '50-64': 'Below average. Consider reshooting with focus on lighting and background.',
    'below 50': 'Photos are likely hurting sales. A full reshoot following Etsy guidelines is recommended.'
  }
};
