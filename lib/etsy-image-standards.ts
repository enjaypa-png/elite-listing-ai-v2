/**
 * ETSY IMAGE STANDARDS - Official Requirements
 * Source: ImageFinal.docx - The definitive rulebook
 */

// ===========================================
// GENERAL IMAGE SPECIFICATIONS
// ===========================================
export const ETSY_IMAGE_SPECS = {
  // Recommended dimensions
  recommended: {
    width: 3000,
    height: 2250,
    aspectRatio: 4 / 3,  // 4:3 is Etsy's recommended
  },
  
  // Minimum requirements
  minimum: {
    width: 1000,
    shortestSide: 2000,  // Quality benchmark
  },
  
  // Thumbnail (first photo gets cropped)
  thumbnail: {
    aspectRatio: 1,  // 1:1 square crop
  },
  
  // Technical specs
  resolution: 72,  // PPI
  maxFileSize: 1 * 1024 * 1024,  // 1MB in bytes
  colorProfile: 'sRGB',
  allowedTypes: ['jpg', 'jpeg', 'gif', 'png'],
  
  // Listing requirements
  maxPhotos: 10,
  minRecommendedPhotos: 5,
};

// ===========================================
// PHOTO TYPES
// ===========================================
export const PHOTO_TYPES = [
  'studio',      // Product on clean, simple, well-lit background
  'lifestyle',   // Product shown in use or natural habitat
  'scale',       // Product next to common object or on model for size
  'detail',      // Close-up highlighting quality, texture, unique details
  'group',       // Display products in sets or variations
  'packaging',   // Image of product packaging
  'process',     // Behind-the-scenes of item being made
] as const;

export type PhotoType = typeof PHOTO_TYPES[number];

// ===========================================
// ETSY CATEGORIES WITH SPECIFIC REQUIREMENTS
// ===========================================
export const ETSY_CATEGORIES = {
  home_living: {
    name: 'Home & Living',
    requirements: [
      'Lifestyle context',
      'Scale reference',
      'Styled with props',
      'Natural warm lighting',
      'Clean background',
      'Color harmony',
    ],
    preferredPhotoTypes: ['lifestyle', 'scale', 'detail'],
    backgroundPreference: 'lifestyle',  // Can have styled backgrounds
    lightingPreference: 'natural_warm',
  },
  
  jewelry_accessories: {
    name: 'Jewelry & Accessories',
    requirements: [
      'Clean white background',
      'Sharp focus on details',
      'Proper lighting (no harsh shadows)',
      'Size reference (model or coin/ruler)',
      'Multiple angles',
      'Product fills 70-80% of frame',
    ],
    preferredPhotoTypes: ['studio', 'detail', 'scale'],
    backgroundPreference: 'white',
    lightingPreference: 'soft_even',
    frameFillTarget: { min: 0.70, max: 0.80 },
  },
  
  clothing_apparel: {
    name: 'Clothing & Apparel',
    requirements: [
      'On model or flat lay',
      'Full garment visible',
      'Fabric texture visible',
      'Natural lighting',
      'Neutral background',
      'Wrinkle-free',
    ],
    preferredPhotoTypes: ['studio', 'lifestyle', 'detail'],
    backgroundPreference: 'neutral',
    lightingPreference: 'natural',
  },
  
  craft_supplies: {
    name: 'Craft Supplies & Tools',
    requirements: [
      'Clean product shot',
      'Detail shots',
      'Scale reference',
      'Texture visible',
      'Lifestyle context (in use)',
      'Handmade quality visible',
    ],
    preferredPhotoTypes: ['studio', 'detail', 'lifestyle', 'scale'],
    backgroundPreference: 'clean',
    lightingPreference: 'even',
  },
  
  paper_party: {
    name: 'Paper & Party Supplies',
    requirements: [
      'Flat lay styling',
      'Clean white background',
      'Text clearly readable',
      'Styled with props',
      'Even lighting',
      'Color accuracy',
    ],
    preferredPhotoTypes: ['studio', 'group', 'detail'],
    backgroundPreference: 'white',
    lightingPreference: 'even',
  },
  
  art_collectibles: {
    name: 'Art & Collectibles',
    requirements: [
      'Straight-on shot (no distortion)',
      'Even lighting (no glare)',
      'True colors',
      'Frame/mockup shown',
      'High resolution',
      'White or neutral background',
    ],
    preferredPhotoTypes: ['studio', 'detail', 'scale'],
    backgroundPreference: 'white_neutral',
    lightingPreference: 'even_no_glare',
  },
  
  bath_beauty: {
    name: 'Bath & Beauty',
    requirements: [
      'Clean/spa-like aesthetic',
      'Packaging visible',
      'Ingredients/texture shown',
      'Lifestyle context',
      'Natural/organic vibe',
      'Professional lighting',
    ],
    preferredPhotoTypes: ['studio', 'lifestyle', 'detail', 'packaging'],
    backgroundPreference: 'clean_spa',
    lightingPreference: 'professional',
  },
  
  pet_supplies: {
    name: 'Pet Supplies',
    requirements: [
      'Pet in photo using the product',
      'Product clearly visible',
      'Scale reference',
      'Clean background',
      'Lifestyle context',
      'Emotional appeal',
    ],
    preferredPhotoTypes: ['lifestyle', 'studio', 'scale'],
    backgroundPreference: 'clean',
    lightingPreference: 'natural',
  },
  
  toys_games: {
    name: 'Toys & Games',
    requirements: [
      'In-use shot (child playing)',
      'Bright/cheerful lighting',
      'Clean background',
      'Scale reference',
      'Safety visible',
      'Fun/playful styling',
    ],
    preferredPhotoTypes: ['lifestyle', 'studio', 'scale', 'detail'],
    backgroundPreference: 'clean_bright',
    lightingPreference: 'bright_cheerful',
  },
  
  vintage: {
    name: 'Vintage Items',
    requirements: [
      'Condition clearly visible (show wear/patina)',
      'Multiple angles',
      'Scale reference',
      'Natural lighting',
      'Authenticity visible (labels/marks)',
    ],
    preferredPhotoTypes: ['studio', 'detail', 'scale'],
    backgroundPreference: 'neutral',
    lightingPreference: 'natural',
  },
} as const;

export type EtsyCategory = keyof typeof ETSY_CATEGORIES;

// ===========================================
// CATEGORY MAPPING (from old to new)
// ===========================================
export const CATEGORY_MAPPING: Record<string, EtsyCategory> = {
  // Old category names -> New Etsy category
  'small_jewelry': 'jewelry_accessories',
  'flat_artwork': 'art_collectibles',
  'wearables_clothing': 'clothing_apparel',
  'wearables_accessories': 'jewelry_accessories',
  'home_decor_wall_art': 'home_living',
  'furniture': 'home_living',
  'small_crafts': 'craft_supplies',
  'craft_supplies': 'craft_supplies',
  'vintage_items': 'vintage',
  'digital_products': 'paper_party',  // Closest match for digital mockups
  
  // Direct matches
  'home_living': 'home_living',
  'jewelry_accessories': 'jewelry_accessories',
  'clothing_apparel': 'clothing_apparel',
  'paper_party': 'paper_party',
  'art_collectibles': 'art_collectibles',
  'bath_beauty': 'bath_beauty',
  'pet_supplies': 'pet_supplies',
  'toys_games': 'toys_games',
  'vintage': 'vintage',
};

/**
 * Get the Etsy category from any category string
 */
export function getEtsyCategory(category: string): EtsyCategory {
  const mapped = CATEGORY_MAPPING[category.toLowerCase().replace(/[\s-]/g, '_')];
  return mapped || 'craft_supplies';  // Default fallback
}
