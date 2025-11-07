/**
 * 285-Point Etsy Listing Scoring System
 * Based on Etsy's 2025 Algorithm
 * Version: 1.0
 * Date: November 7, 2025
 */

export interface Score285Breakdown {
  title: ComponentScore;
  tags: ComponentScore;
  description: ComponentScore;
  images?: ComponentScore;
  attributes?: ComponentScore;
  pricing?: ComponentScore;
  conversion?: ComponentScore;
  shopHealth?: ComponentScore;
  totalScore: number;
  maxTotalScore: number;
  percentage: number;
  rating: 'Excellent' | 'Good' | 'Fair' | 'Poor';
}

export interface ComponentScore {
  score: number;
  maxScore: number;
  breakdown?: Record<string, number>;
  issues: string[];
  strengths: string[];
  recommendations?: string[];
}

/**
 * Calculate Title Optimization Score (50 points max)
 */
export function scoreTitleOptimization(title: string, primaryKeyword: string): ComponentScore {
  let score = 0;
  const issues: string[] = [];
  const strengths: string[] = [];
  const breakdown: Record<string, number> = {};

  // Rule 1: Primary keyword in first 5 words (15 pts)
  const words = title.split(/\s+/);
  const first5Words = words.slice(0, 5).join(' ').toLowerCase();
  const primaryKeywordLower = primaryKeyword.toLowerCase();
  
  if (first5Words.includes(primaryKeywordLower)) {
    breakdown.primaryKeywordPlacement = 15;
    score += 15;
    strengths.push('Primary keyword placed in first 5 words');
  } else {
    breakdown.primaryKeywordPlacement = 0;
    issues.push('🔴 CRITICAL: Primary keyword not in first 5 words - move to beginning');
  }

  // Rule 2: Buyer intent phrases (10 pts)
  const intentPhrases = ['gift for', 'personalized', 'custom', 'handmade', 'unique', 'wedding', 'birthday', 'anniversary', 'christmas', 'valentines'];
  const hasIntent = intentPhrases.some(phrase => title.toLowerCase().includes(phrase));
  
  if (hasIntent) {
    breakdown.buyerIntentPhrases = 10;
    score += 10;
    strengths.push('Includes buyer intent phrases (gift, personalized, etc.)');
  } else {
    breakdown.buyerIntentPhrases = 0;
    issues.push('Missing buyer intent phrases - add "gift for", "personalized", or occasion terms');
  }

  // Rule 3: Readability maintained (10 pts)
  const hasPipes = (title.match(/\|/g) || []).length;
  const wordCount = words.length;
  const avgWordLength = title.replace(/\s+/g, '').length / wordCount;
  const isReadable = avgWordLength < 8 && hasPipes <= 2;
  
  if (isReadable && !title.match(/\b(\w+)\s+\1\b/i)) {
    breakdown.readability = 10;
    score += 10;
    strengths.push('Title is readable and not keyword-stuffed');
  } else {
    breakdown.readability = 5;
    score += 5;
    issues.push('Title may be keyword-stuffed - make more readable');
  }

  // Rule 4: Character count 60-140 (5 pts)
  const length = title.length;
  if (length >= 60 && length <= 140) {
    breakdown.characterCount = 5;
    score += 5;
    strengths.push(`Title length optimal (${length} chars)`);
  } else if (length < 60) {
    breakdown.characterCount = 2;
    score += 2;
    issues.push(`Title too short (${length} chars) - expand to 60-140 characters`);
  } else {
    breakdown.characterCount = 0;
    issues.push(`Title too long (${length} chars) - shorten to 140 characters max`);
  }

  // Rule 5: Multi-word keyword phrases (5 pts)
  const multiWordKeywords = words.filter((word, i, arr) => 
    i < arr.length - 1 && word.length > 3 && arr[i + 1].length > 3
  ).length;
  
  if (multiWordKeywords >= 3) {
    breakdown.multiWordPhrases = 5;
    score += 5;
    strengths.push('Uses multi-word keyword phrases effectively');
  } else {
    breakdown.multiWordPhrases = 2;
    score += 2;
    issues.push('Use more multi-word phrases (e.g., "modern minimalist" vs "modern")');
  }

  // Rule 6: Uniqueness (5 pts) - placeholder (would need to check against other listings)
  breakdown.uniqueness = 5;
  score += 5;

  return {
    score,
    maxScore: 50,
    breakdown,
    issues,
    strengths
  };
}

/**
 * Calculate Tags Optimization Score (35 points max)
 */
export function scoreTagsOptimization(tags: string[], title: string, category?: string): ComponentScore {
  let score = 0;
  const issues: string[] = [];
  const strengths: string[] = [];
  const breakdown: Record<string, number> = {};

  // Rule 1: 13 tags used (10 pts)
  if (tags.length === 13) {
    breakdown.tagCount = 10;
    score += 10;
    strengths.push('All 13 tag slots used');
  } else if (tags.length >= 10) {
    breakdown.tagCount = 7;
    score += 7;
    issues.push(`Only ${tags.length} tags used - add ${13 - tags.length} more to maximize visibility`);
  } else {
    breakdown.tagCount = 0;
    issues.push(`🔴 CRITICAL: Only ${tags.length}/13 tags - missing major search opportunities`);
  }

  // Rule 2: Tags reinforce title keywords (8 pts)
  const titleWords = title.toLowerCase().split(/\s+/);
  const reinforcementCount = tags.filter(tag => 
    titleWords.some(word => tag.toLowerCase().includes(word) && word.length > 3)
  ).length;
  
  if (reinforcementCount >= 5) {
    breakdown.titleReinforcement = 8;
    score += 8;
    strengths.push('Tags effectively reinforce title keywords');
  } else if (reinforcementCount >= 3) {
    breakdown.titleReinforcement = 5;
    score += 5;
    issues.push('Add more tags that reinforce title keywords');
  } else {
    breakdown.titleReinforcement = 0;
    issues.push('Tags don\\'t reinforce title keywords - align with title');
  }

  // Rule 3: Long-tail variations (7 pts)
  const longTailCount = tags.filter(tag => tag.split(/\s+/).length >= 3).length;
  
  if (longTailCount >= 5) {
    breakdown.longTailVariations = 7;
    score += 7;
    strengths.push('Good use of long-tail keyword variations');
  } else if (longTailCount >= 3) {
    breakdown.longTailVariations = 4;
    score += 4;
    issues.push('Add more long-tail variations (3+ word phrases)');
  } else {
    breakdown.longTailVariations = 0;
    issues.push('🔴 CRITICAL: Too many single/double word tags - use long-tail phrases');
  }

  // Rule 4: No duplicates (5 pts)
  const uniqueTags = new Set(tags.map(t => t.toLowerCase()));
  const hasDuplicates = uniqueTags.size < tags.length;
  
  if (!hasDuplicates) {
    breakdown.noDuplicates = 5;
    score += 5;
    strengths.push('No duplicate tags');
  } else {
    breakdown.noDuplicates = 0;
    issues.push('Duplicate tags found - replace with unique keywords');
  }

  // Rule 5: Mix of broad + specific (5 pts)
  const broadTags = tags.filter(tag => tag.split(/\s+/).length <= 2).length;
  const specificTags = tags.filter(tag => tag.split(/\s+/).length >= 3).length;
  const hasGoodMix = broadTags >= 3 && specificTags >= 5;
  
  if (hasGoodMix) {
    breakdown.broadSpecificMix = 5;
    score += 5;
    strengths.push('Good mix of broad and specific tags');
  } else {
    breakdown.broadSpecificMix = 2;
    score += 2;
    issues.push('Balance broad terms (2 words) with specific long-tail (3+ words)');
  }

  return {
    score,
    maxScore: 35,
    breakdown,
    issues,
    strengths
  };
}

/**
 * Calculate Description Optimization Score (30 points max)
 */
export function scoreDescriptionOptimization(description: string, primaryKeyword: string): ComponentScore {
  let score = 0;
  const issues: string[] = [];
  const strengths: string[] = [];
  const breakdown: Record<string, number> = {};

  const length = description.length;

  // Rule 1: First 160 characters compelling + keyword-rich (10 pts)
  const first160 = description.substring(0, 160).toLowerCase();
  const hasKeywordInFirst160 = first160.includes(primaryKeyword.toLowerCase());
  const hasHook = /\b(perfect|beautiful|unique|handmade|custom|discover|transform|create)\b/.test(first160);
  
  if (hasKeywordInFirst160 && hasHook) {
    breakdown.first160Characters = 10;
    score += 10;
    strengths.push('Compelling hook with primary keyword in first 160 chars');
  } else if (hasKeywordInFirst160 || hasHook) {
    breakdown.first160Characters = 5;
    score += 5;
    issues.push('First 160 chars needs both keyword AND compelling hook (appears in search)');
  } else {
    breakdown.first160Characters = 0;
    issues.push('🔴 CRITICAL: First 160 chars missing keyword and hook - this appears in search results');
  }

  // Rule 2: Benefits highlighted (6 pts)
  const benefitWords = ['perfect for', 'great for', 'ideal', 'helps', 'solves', 'makes', 'creates', 'transforms', 'brings'];
  const benefitCount = benefitWords.filter(word => description.toLowerCase().includes(word)).length;
  
  if (benefitCount >= 3) {
    breakdown.benefitsHighlighted = 6;
    score += 6;
    strengths.push('Benefits clearly highlighted');
  } else if (benefitCount >= 1) {
    breakdown.benefitsHighlighted = 3;
    score += 3;
    issues.push('Add more benefit-focused language (how it helps buyers)');
  } else {
    breakdown.benefitsHighlighted = 0;
    issues.push('Highlight benefits over features (use "perfect for", "ideal for", etc.)');
  }

  // Rule 3: Answers common questions (6 pts)
  const hasSize = /\d+\s*(inch|cm|mm|x|\"|')/.test(description);
  const hasMaterial = /\b(made|material|fabric|wood|metal|ceramic|leather|cotton)\b/i.test(description);
  const hasShipping = /\b(ship|delivery|processing|arrives)\b/i.test(description);
  const questionAnswers = [hasSize, hasMaterial, hasShipping].filter(Boolean).length;
  
  if (questionAnswers === 3) {
    breakdown.questionsAnswered = 6;
    score += 6;
    strengths.push('Answers key buyer questions (size, material, shipping)');
  } else {
    breakdown.questionsAnswered = questionAnswers * 2;
    score += questionAnswers * 2;
    const missing = [];
    if (!hasSize) missing.push('size/dimensions');
    if (!hasMaterial) missing.push('materials');
    if (!hasShipping) missing.push('shipping info');
    if (missing.length > 0) {
      issues.push(`Add missing info: ${missing.join(', ')}`);
    }
  }

  // Rule 4: Natural keyword integration (5 pts)
  const words = description.toLowerCase().split(/\s+/);
  const keywordOccurrences = description.toLowerCase().split(primaryKeyword.toLowerCase()).length - 1;
  const keywordDensity = (keywordOccurrences / words.length) * 100;
  
  if (keywordDensity >= 1.5 && keywordDensity <= 3.0) {
    breakdown.naturalKeywords = 5;
    score += 5;
    strengths.push('Natural keyword density (1.5-3% optimal)');
  } else if (keywordDensity > 3.0) {
    breakdown.naturalKeywords = 0;
    issues.push('🔴 CRITICAL: Keyword stuffing detected - reduce keyword repetition');
  } else {
    breakdown.naturalKeywords = 2;
    score += 2;
    issues.push('Keyword density too low - naturally include primary keyword 1-2 more times');
  }

  // Rule 5: Clear size/dimension info (3 pts)
  if (hasSize) {
    breakdown.sizeInfo = 3;
    score += 3;
  } else {
    breakdown.sizeInfo = 0;
    issues.push('Add size/dimension information');
  }

  // Additional checks
  if (length < 500) {
    issues.push('Description too short - expand to 1000-2000 characters for better SEO');
  } else if (length >= 1000) {
    strengths.push('Description length optimal (1000+ characters)');
  }

  return {
    score,
    maxScore: 30,
    breakdown,
    issues,
    strengths
  };
}

/**
 * Calculate overall 285-point score from components
 */
export function calculate285Score(components: {
  title: ComponentScore;
  tags: ComponentScore;
  description: ComponentScore;
  images?: ComponentScore;
  attributes?: ComponentScore;
  pricing?: ComponentScore;
  conversion?: ComponentScore;
  shopHealth?: ComponentScore;
}): Score285Breakdown {
  const totalScore = 
    components.title.score +
    components.tags.score +
    components.description.score +
    (components.images?.score || 0) +
    (components.attributes?.score || 0) +
    (components.pricing?.score || 0) +
    (components.conversion?.score || 0) +
    (components.shopHealth?.score || 0);

  const maxTotalScore = 
    components.title.maxScore +
    components.tags.maxScore +
    components.description.maxScore +
    (components.images?.maxScore || 0) +
    (components.attributes?.maxScore || 0) +
    (components.pricing?.maxScore || 0) +
    (components.conversion?.maxScore || 0) +
    (components.shopHealth?.maxScore || 0);

  const percentage = Math.round((totalScore / maxTotalScore) * 100);

  let rating: 'Excellent' | 'Good' | 'Fair' | 'Poor';
  if (percentage >= 85) rating = 'Excellent';
  else if (percentage >= 70) rating = 'Good';
  else if (percentage >= 50) rating = 'Fair';
  else rating = 'Poor';

  return {
    ...components,
    totalScore,
    maxTotalScore,
    percentage,
    rating
  };
}

/**
 * Extract primary keyword from title
 */
export function extractPrimaryKeyword(title: string): string {
  // Take first 2-3 significant words
  const words = title.split(/\s+/).filter(w => w.length > 2);
  return words.slice(0, 3).join(' ').toLowerCase();
}

/**
 * Determine buyer intent from title and description
 */
export function determineBuyerIntent(title: string, description: string): string {
  const text = (title + ' ' + description).toLowerCase();
  
  if (/(gift|present|birthday|anniversary|wedding|christmas|valentines)/i.test(text)) {
    return 'gifting';
  }
  if (/(personalized|custom|made to order)/i.test(text)) {
    return 'personalized';
  }
  if (/(instant download|digital|printable|pdf)/i.test(text)) {
    return 'digital product';
  }
  if (/(handmade|artisan|crafted)/i.test(text)) {
    return 'handmade/artisan';
  }
  
  return 'general purchase';
}

/**
 * Generate tag strategy breakdown
 */
export function analyzeTagStrategy(tags: string[]): {
  primaryVariations: number;
  buyerIntent: number;
  styleAesthetic: number;
  occasion: number;
  materialFeature: number;
} {
  const strategy = {
    primaryVariations: 0,
    buyerIntent: 0,
    styleAesthetic: 0,
    occasion: 0,
    materialFeature: 0
  };

  const intentWords = ['gift', 'personalized', 'custom', 'for'];
  const styleWords = ['modern', 'minimalist', 'boho', 'vintage', 'rustic', 'scandinavian', 'farmhouse'];
  const occasionWords = ['wedding', 'birthday', 'christmas', 'anniversary', 'baby', 'shower'];
  const materialWords = ['wood', 'metal', 'leather', 'ceramic', 'cotton', 'canvas', 'paper'];

  tags.forEach(tag => {
    const tagLower = tag.toLowerCase();
    if (intentWords.some(w => tagLower.includes(w))) strategy.buyerIntent++;
    if (styleWords.some(w => tagLower.includes(w))) strategy.styleAesthetic++;
    if (occasionWords.some(w => tagLower.includes(w))) strategy.occasion++;
    if (materialWords.some(w => tagLower.includes(w))) strategy.materialFeature++;
  });

  strategy.primaryVariations = tags.length - (strategy.buyerIntent + strategy.styleAesthetic + strategy.occasion + strategy.materialFeature);

  return strategy;
}
