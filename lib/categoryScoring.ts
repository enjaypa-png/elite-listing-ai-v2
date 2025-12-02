export interface CategoryRules {
  keywords: string[];
  idealAspectRatio: string;
  preferredStyle: 'product' | 'lifestyle' | 'both';
  backgroundPreference: 'white' | 'neutral' | 'contextual';
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
  if (userCategory && CATEGORIES[userCategory]) {
    return userCategory;
  }
  
  if (listingTitle) {
    const lowerTitle = listingTitle.toLowerCase();
    for (const [category, rules] of Object.entries(CATEGORIES)) {
      if (category === 'default') continue;
      if (rules.keywords.some(keyword => lowerTitle.includes(keyword))) {
        return category;
      }
    }
  }
  
  return 'default';
}

export function getWeightsByCategory(category: string) {
  // Not used in new simplified system, kept for compatibility
  return {};
}
