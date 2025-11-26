import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

// ==============================================
// ETSY 285-POINT OPTIMIZATION SYSTEM
// ==============================================
interface EtsyScoreResult {
  score: number;
  maxScore: number;
  percentage: number;
  issues: string[];
  suggestions: string[];
  details?: any;
}

// 1. TITLE OPTIMIZATION (65 points)
// =====================================
function analyzeTitleOptimizationEtsy(
  title: string,
  keywords: string[]
): EtsyScoreResult {
  let score = 0;
  const issues: string[] = [];
  const suggestions: string[] = [];
  const maxScore = 65;

  // Rule 1: Length (15 points)
  const length = title.length;
  if (length >= 50 && length <= 110) {
    score += 15;
  } else if (length < 50) {
    issues.push(`Title too short (${length} chars, need 50-110)`);
    suggestions.push('Add descriptive keywords to reach 50-110 characters');
    score += Math.round((length / 50) * 15);
  } else {
    issues.push(`Title too long (${length} chars, max 110)`);
    suggestions.push('Shorten to 110 characters or less');
    score += 5;
  }

  // Rule 2: Primary Keyword Placement (15 points)
  if (keywords.length > 0) {
    const words = title.toLowerCase().split(/\\s+/);
    const primaryKeyword = keywords[0].toLowerCase();
    const keywordPosition = words.findIndex(word =>
      word.includes(primaryKeyword) || primaryKeyword.includes(word)
    );
    if (keywordPosition === 0) {
      score += 15;
    } else if (keywordPosition >= 1 && keywordPosition <= 2) {
      score += 10;
      suggestions.push(`Move "${keywords[0]}" to the beginning of title`);
    } else if (keywordPosition > 2) {
      score += 5;
      issues.push('Primary keyword not in first 3 words');
      suggestions.push(`Start title with "${keywords[0]}"`);
    } else {
      issues.push('Primary keyword not found in title');
      suggestions.push(`Include "${keywords[0]}" at the start of title`);
    }
  } else {
    score += 7; // No keywords provided, give partial credit
  }

  // Rule 3: Keyword Density (10 points)
  const keywordsFound = keywords.filter(kw =>
    title.toLowerCase().includes(kw.toLowerCase())
  ).length;
  if (keywordsFound >= 2 && keywordsFound <= 4) {
    score += 10;
  } else if (keywordsFound > 4) {
    score += 8;
    issues.push('Too many keywords (may appear spammy)');
    suggestions.push('Use 2-4 keywords naturally in title');
  } else if (keywordsFound === 1) {
    score += 5;
    suggestions.push('Include 1-2 more relevant keywords');
  } else {
    issues.push('Not enough keywords in title');
    suggestions.push('Include 2-4 relevant keywords');
  }

  // Rule 4: Readability No Keyword Stuffing (10 points)
  const hasPipes = title.includes('|');
  const hasExcessivePunctuation = (title.match(/[:|,]/g) || []).length > 3;
  if (!hasPipes && !hasExcessivePunctuation) {
    score += 10;
  } else {
    issues.push('Title appears keyword-stuffed or uses excessive separators');
    suggestions.push('Write naturally without pipes (|) or excessive commas');
  }

  // Rule 5: No Pipes (5 points)
  if (!hasPipes) {
    score += 5;
  } else {
    issues.push('Remove pipe separators (|) - Etsy penalizes these');
  }

  // Rule 6: Material/Attribute Inclusion (5 points)
  const materials = [
    'ceramic', 'wood', 'metal', 'leather', 'cotton', 'silver', 'gold',
    'handmade', 'vintage', 'custom', 'personalized', 'brass', 'copper',
    'stainless', 'glass', 'crystal', 'canvas', 'linen', 'wool', 'silk'
  ];
  const hasMaterial = materials.some(mat =>
    title.toLowerCase().includes(mat)
  );
  if (hasMaterial) {
    score += 5;
  } else {
    suggestions.push('Include material or key attribute (e.g., "ceramic", "handmade")');
  }

  // Rule 7: Descriptive Adjectives (5 points)
  const adjectives = [
    'beautiful', 'unique', 'handmade', 'custom', 'personalized', 'vintage',
    'modern', 'rustic', 'elegant', 'minimalist', 'bohemian', 'luxury',
    'premium', 'artisan', 'handcrafted', 'exclusive', 'limited', 'rare'
  ];
  const adjectiveCount = adjectives.filter(adj =>
    title.toLowerCase().includes(adj)
  ).length;
  if (adjectiveCount >= 2) {
    score += 5;
  } else if (adjectiveCount === 1) {
    score += 3;
    suggestions.push('Add one more descriptive adjective');
  } else {
    suggestions.push('Add descriptive adjectives (e.g., "handmade", "unique")');
  }

  return {
    score,
    maxScore,
    percentage: Math.round((score / maxScore) * 100),
    issues,
    suggestions
  };
}

// 2. TAGS OPTIMIZATION (55 points)
// =====================================
function analyzeTagsOptimizationEtsy(
  tags: string[],
  title: string,
  category: string
): EtsyScoreResult {
  let score = 0;
  const issues: string[] = [];
  const suggestions: string[] = [];
  const maxScore = 55;

  // Rule 1: Tag Count (10 points)
  const tagCount = tags.length;
  if (tagCount === 13) {
    score += 10;
  } else if (tagCount >= 10) {
    score += 7;
    suggestions.push(`Add ${13 - tagCount} more tags to reach 13`);
  } else if (tagCount >= 7) {
    score += 5;
    issues.push(`Only ${tagCount} tags used (need 13)`);
    suggestions.push('Use all 13 available tag slots');
  } else {
    issues.push(`Only ${tagCount} tags used (need 13)`);
    suggestions.push('Add more tags - you\'re missing significant search traffic');
  }

  // Rule 2: Multi-Word Tags (10 points)
  const wordCounts = tags.map(tag => tag.trim().split(/\\s+/).length);
  const avgWords = wordCounts.reduce((a, b) => a + b, 0) / (tags.length || 1);
  if (avgWords >= 2) {
    score += 10;
  } else if (avgWords >= 1.5) {
    score += 5;
    suggestions.push('Use more multi-word phrases (e.g., "ceramic coffee mug" vs "mug")');
  } else {
    issues.push('Too many single-word tags');
    suggestions.push('Replace single words with 2-3 word phrases');
  }

  // Rule 3: Long-Tail Keywords (10 points)
  const longTailCount = tags.filter(tag =>
    tag.trim().split(/\\s+/).length >= 3
  ).length;
  if (longTailCount >= 5) {
    score += 10;
  } else if (longTailCount >= 3) {
    score += 7;
    suggestions.push(`Add ${5 - longTailCount} more long-tail keywords (3+ words)`);
  } else if (longTailCount >= 1) {
    score += 3;
    issues.push('Not enough long-tail keywords');
    suggestions.push('Add specific 3-word phrases (e.g., "handmade ceramic coffee mug")');
  } else {
    issues.push('No long-tail keywords found');
    suggestions.push('Add at least 5 long-tail keywords (3+ words each)');
  }

  // Rule 4: No Duplicates (5 points)
  const uniqueTags = new Set(tags.map(t => t.toLowerCase().trim()));
  if (uniqueTags.size === tags.length) {
    score += 5;
  } else {
    issues.push('Duplicate tags found');
    suggestions.push('Remove duplicate tags and add unique keywords');
  }

  // Rule 5: Match Title Keywords (10 points)
  const titleWords = title.toLowerCase().split(/\\s+/);
  const matchingTags = tags.filter(tag =>
    titleWords.some(word => tag.toLowerCase().includes(word) && word.length > 3)
  ).slice(0, 3).length;
  if (matchingTags === 3) {
    score += 10;
  } else if (matchingTags === 2) {
    score += 7;
    suggestions.push('First 3 tags should match primary keywords from title');
  } else if (matchingTags === 1) {
    score += 3;
    issues.push('Tags don\'t match title keywords well');
  } else {
    issues.push('Tags don\'t match title keywords');
    suggestions.push('First 3 tags should match primary keywords from title');
  }

  // Rule 6: Regional Variants (5 points)
  const needsVariants = ['jewelry', 'color', 'personalize', 'organize'];
  const hasVariantWord = needsVariants.some(word =>
    tags.some(tag => tag.toLowerCase().includes(word))
  );
  if (hasVariantWord) {
    const variants: Record<string, string> = {
      'jewelry': 'jewellery',
      'color': 'colour',
      'personalize': 'personalise',
      'organize': 'organise'
    };
    const hasVariant = Object.values(variants).some(v =>
      tags.some(tag => tag.toLowerCase().includes(v))
    );
    if (hasVariant) {
      score += 5;
    } else {
      suggestions.push('Add regional spelling variants (e.g., "jewellery" for UK)');
    }
  } else {
    score += 5; // N/A, give full credit
  }

  // Rule 7: No Category/Attribute Repeats (5 points)
  const categoryWords = category.toLowerCase().split(/[\\s>/]+/);
  const redundantTags = tags.filter(tag =>
    categoryWords.some(cw => tag.toLowerCase() === cw && cw.length > 3)
  );
  if (redundantTags.length === 0) {
    score += 5;
  } else {
    issues.push('Tags repeat category words');
    suggestions.push(`Remove redundant tags: ${redundantTags.join(', ')}`);
  }

  return {
    score,
    maxScore,
    percentage: Math.round((score / maxScore) * 100),
    issues,
    suggestions
  };
}

// 3. DESCRIPTION OPTIMIZATION (55 points)
// ======================================
function analyzeDescriptionOptimizationEtsy(
  description: string,
  keywords: string[]
): EtsyScoreResult {
  let score = 0;
  const issues: string[] = [];
  const suggestions: string[] = [];
  const maxScore = 55;

  // Rule 1: Length (10 points)
  const length = description.length;
  if (length >= 500) {
    score += 10;
  } else if (length >= 200) {
    score += 7;
    suggestions.push('Expand description to 500+ characters for better SEO');
  } else if (length >= 100) {
    score += 3;
    issues.push(`Description too short (${length} chars, need 500+)`);
    suggestions.push('Write detailed description (500-1000 characters)');
  } else {
    issues.push(`Description too short (${length} chars, need 500+)`);
    suggestions.push('Write a comprehensive product description');
  }

  // Rule 2: Keywords in First Sentence (15 points)
  const sentences = description.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const firstTwoSentences = sentences.slice(0, 2).join(' ').toLowerCase();
  const keywordsInIntro = keywords.filter(kw =>
    firstTwoSentences.includes(kw.toLowerCase())
  ).length;
  if (keywordsInIntro >= 3) {
    score += 15;
  } else if (keywordsInIntro === 2) {
    score += 10;
    suggestions.push('Add one more keyword to first 2 sentences');
  } else if (keywordsInIntro === 1) {
    score += 5;
    issues.push('Not enough keywords in opening sentences');
    suggestions.push('Include 2-3 keywords in first 2 sentences');
  } else {
    issues.push('No keywords in first 2 sentences');
    suggestions.push('Start description with primary keywords');
  }

  // Rule 3: Keyword Density (10 points)
  const words = description.toLowerCase().split(/\\s+/).filter(w => w.length > 0);
  const keywordOccurrences = keywords.reduce((count, kw) => {
    const regex = new RegExp(kw.toLowerCase().replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&'), 'g');
    return count + (description.toLowerCase().match(regex) || []).length;
  }, 0);
  const density = words.length > 0 ? (keywordOccurrences / words.length) * 100 : 0;
  if (density >= 1 && density <= 2) {
    score += 10;
  } else if ((density >= 0.5 && density < 1) || (density > 2 && density <= 3)) {
    score += 5;
    if (density < 1) {
      suggestions.push('Naturally include keywords 1-2 more times');
    } else {
      suggestions.push('Reduce keyword repetition (appears spammy)');
    }
  } else {
    issues.push(`Keyword density ${density.toFixed(1)}% (target: 1-2%)`);
    if (density < 0.5) {
      suggestions.push('Include keywords more frequently (target 1-2% density)');
    } else {
      suggestions.push('Reduce keyword stuffing (target 1-2% density)');
    }
  }

  // Rule 4: Readability (5 points)
  const hasExcessiveKeywords = density > 3;
  const hasParagraphs = description.includes('\\n\\n') || description.includes('\\n');
  if (!hasExcessiveKeywords && hasParagraphs) {
    score += 5;
  } else {
    if (hasExcessiveKeywords) {
      issues.push('Description appears keyword-stuffed');
    }
    if (!hasParagraphs) {
      suggestions.push('Break into paragraphs for readability');
    }
  }

  // Rule 5: Product Details (10 points)
  const hasDimensions = /\\d+\\s*(inch|cm|mm|\"|'|x|×)/i.test(description);
  const hasMaterials = /(made of|material|ceramic|wood|metal|leather|cotton|silver|gold)/i.test(description);
  const hasUses = /(perfect for|great for|ideal for|use for|suitable for)/i.test(description);
  const detailsCount = [hasDimensions, hasMaterials, hasUses].filter(Boolean).length;
  if (detailsCount === 3) {
    score += 10;
  } else if (detailsCount === 2) {
    score += 7;
    if (!hasDimensions) suggestions.push('Add dimensions/size');
    if (!hasMaterials) suggestions.push('Mention materials used');
    if (!hasUses) suggestions.push('Describe use cases or occasions');
  } else if (detailsCount === 1) {
    score += 3;
    issues.push('Missing product details');
    if (!hasDimensions) suggestions.push('Add dimensions/size');
    if (!hasMaterials) suggestions.push('Mention materials used');
    if (!hasUses) suggestions.push('Describe use cases or occasions');
  } else {
    issues.push('Missing product details');
    suggestions.push('Add dimensions, materials, and use cases');
  }

  // Rule 6: Call-to-Action (5 points)
  const ctaPhrases = [
    'order now', 'buy now', 'add to cart', 'purchase', 'shop now',
    'message me', 'contact me', 'questions', 'custom order', 'get yours'
  ];
  const hasCTA = ctaPhrases.some(phrase =>
    description.toLowerCase().includes(phrase)
  );
  if (hasCTA) {
    score += 5;
  } else {
    suggestions.push('Add call-to-action (e.g., "Order now" or "Message me with questions")');
  }

  return {
    score,
    maxScore,
    percentage: Math.round((score / maxScore) * 100),
    issues,
    suggestions,
    details: {
      length,
      keywordDensity: density.toFixed(2),
      hasDimensions,
      hasMaterials,
      hasUses,
      hasCTA
    }
  };
}

// 4. CALCULATE OVERALL OPPORTUNITY SCORE
// =======================================
function calculateOverallOpportunityScore(
  titleResult: EtsyScoreResult,
  tagsResult: EtsyScoreResult,
  descriptionResult: EtsyScoreResult,
  photoCount: number
): {
  overallScore: number;
  maxScore: number;
  percentage: number;
  opportunityPercentage: number;
  breakdown: any;
  priorityIssues: string[];
  quickWins: string[];
} {
  const photoMaxScore = 65;
  // Attributes and category (simplified - not implemented yet)
  const attributesScore = 12; // Placeholder
  const attributesMaxScore = 25;
  const categoryScore = 10; // Placeholder
  const categoryMaxScore = 20;

  const totalScore =
    titleResult.score +
    tagsResult.score +
    descriptionResult.score +
    Math.min(photoCount * 6.5, photoMaxScore) + // Photo score (simplified)
    attributesScore +
    categoryScore;

  const maxScore = 285;
  const percentage = Math.round((totalScore / maxScore) * 100);
  const opportunityPercentage = 100 - percentage;

  // Collect all issues
  const allIssues = [
    ...titleResult.issues,
    ...tagsResult.issues,
    ...descriptionResult.issues
  ];

  // Collect all suggestions
  const allSuggestions = [
    ...titleResult.suggestions,
    ...tagsResult.suggestions,
    ...descriptionResult.suggestions
  ];

  return {
    overallScore: totalScore,
    maxScore,
    percentage,
    opportunityPercentage,
    breakdown: {
      title: {
        score: titleResult.score,
        maxScore: titleResult.maxScore,
        percentage: titleResult.percentage
      },
      tags: {
        score: tagsResult.score,
        maxScore: tagsResult.maxScore,
        percentage: tagsResult.percentage
      },
      description: {
        score: descriptionResult.score,
        maxScore: descriptionResult.maxScore,
        percentage: descriptionResult.percentage
      },
      photos: {
        score: Math.min(photoCount * 6.5, photoMaxScore),
        maxScore: photoMaxScore,
        percentage: Math.round((Math.min(photoCount * 6.5, photoMaxScore) / photoMaxScore) * 100)
      },
      attributes: {
        score: attributesScore,
        maxScore: attributesMaxScore,
        percentage: Math.round((attributesScore / attributesMaxScore) * 100)
      },
      category: {
        score: categoryScore,
        maxScore: categoryMaxScore,
        percentage: Math.round((categoryScore / categoryMaxScore) * 100)
      }
    },
    priorityIssues: allIssues.slice(0, 5),
    quickWins: allSuggestions.slice(0, 5)
  };
}

// ==============================================
// POST HANDLER - UPGRADED 285-POINT SYSTEM
// ==============================================
export async function POST(request: NextRequest) {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  try {
    console.log('[SEO Audit] Processing request...');
    const body = await request.json();
    console.log('[SEO Audit] Request body:', JSON.stringify(body).substring(0, 200));
    
    const { platform, title, description, tags, category, price, imageUrl, keywords } = body;

    // Validate required fields
    if (!platform || !title || !description || !tags) {
      console.error('[SEO Audit] Missing required fields');
      return NextResponse.json(
        { error: 'Missing required fields: platform, title, description, tags' },
        { status: 400 }
      );
    }

    // Parse tags
    const tagArray = typeof tags === 'string'
      ? tags.split(',').map(t => t.trim()).filter(t => t.length > 0)
      : tags;
    
    console.log('[SEO Audit] Parsed tags:', tagArray);

    // Extract keywords from title if not provided
    const keywordList = keywords || [
      ...title.split(/\\s+/).slice(0, 3).filter((w: string) => w.length > 3)
    ];
    
    console.log('[SEO Audit] Keywords:', keywordList);

    // ===
    // ETSY 285-POINT ANALYSIS
    // ===

    // 1. Analyze Title (65 points)
    console.log('[SEO Audit] Analyzing title...');
    const titleAnalysis = analyzeTitleOptimizationEtsy(title, keywordList);
    console.log('[SEO Audit] Title score:', titleAnalysis.score);

    // 2. Analyze Tags (55 points)
    console.log('[SEO Audit] Analyzing tags...');
    const tagsAnalysis = analyzeTagsOptimizationEtsy(
      tagArray,
      title,
      category || 'General'
    );
    console.log('[SEO Audit] Tags score:', tagsAnalysis.score);

    // 3. Analyze Description (55 points)
    console.log('[SEO Audit] Analyzing description...');
    const descriptionAnalysis = analyzeDescriptionOptimizationEtsy(
      description,
      keywordList
    );
    console.log('[SEO Audit] Description score:', descriptionAnalysis.score);

    // 4. Calculate Overall Score (285 points)
    console.log('[SEO Audit] Calculating overall score...');
    const photoCount = imageUrl ? 1 : 0; // Will be updated when photo analysis is integrated
    const overallAnalysis = calculateOverallOpportunityScore(
      titleAnalysis,
      tagsAnalysis,
      descriptionAnalysis,
      photoCount
    );
    console.log('[SEO Audit] Overall score:', overallAnalysis.overallScore);

    // ===
    // AI-POWERED RECOMMENDATIONS
    // ===
    console.log('[SEO Audit] Generating AI recommendations...');
    const aiPrompt = `Analyze this ${platform} product listing and provide strategic recommendations:

LISTING DATA:
Title: ${title}
Description: ${description}
Tags: ${tagArray.join(', ')}
Category: ${category || 'Not specified'}

CURRENT SCORES:
Title: ${titleAnalysis.percentage}% (${titleAnalysis.score}/${titleAnalysis.maxScore})
Tags: ${tagsAnalysis.percentage}% (${tagsAnalysis.score}/${tagsAnalysis.maxScore})
Description: ${descriptionAnalysis.percentage}% (${descriptionAnalysis.score}/${descriptionAnalysis.maxScore})
Overall: ${overallAnalysis.percentage}% (${overallAnalysis.overallScore}/${overallAnalysis.maxScore})

Based on this analysis, provide:
1. Top 3 strengths of this listing
2. Top 3 specific, actionable recommendations to improve the score
3. Estimated ranking potential (Excellent/Good/Fair/Poor)
4. Improvement potential percentage (0-100)

Format as JSON:
{
  "strengths": ["strength1", "strength2", "strength3"],
  "recommendations": ["rec1", "rec2", "rec3"],
  "ranking": "Good",
  "improvementPotential": 75
}`;

    const aiResponse = await openai.chat.completions.create({
      model: 'gpt-4o', // Using gpt-4o (your account has access to this)
      messages: [
        {
          role: 'system',
          content: 'You are an expert in Etsy SEO optimization. Provide specific, actionable advice based on Etsy\'s 2025 algorithm.'
        },
        {
          role: 'user',
          content: aiPrompt
        }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
    });

    const aiAnalysis = JSON.parse(aiResponse.choices[0].message.content || '{}');

    // ===
    // RETURN COMPLETE ANALYSIS
    // ===
    return NextResponse.json({
      success: true,
      platform,
      // Overall Scores
      overallScore: overallAnalysis.percentage,
      opportunityScore: overallAnalysis.opportunityPercentage,
      totalPoints: overallAnalysis.overallScore,
      maxPoints: overallAnalysis.maxScore,
      // Component Breakdown
      breakdown: overallAnalysis.breakdown,
      // Detailed Analysis
      titleAnalysis: {
        score: titleAnalysis.score,
        maxScore: titleAnalysis.maxScore,
        percentage: titleAnalysis.percentage,
        issues: titleAnalysis.issues,
        suggestions: titleAnalysis.suggestions
      },
      tagsAnalysis: {
        score: tagsAnalysis.score,
        maxScore: tagsAnalysis.maxScore,
        percentage: tagsAnalysis.percentage,
        issues: tagsAnalysis.issues,
        suggestions: tagsAnalysis.suggestions
      },
      descriptionAnalysis: {
        score: descriptionAnalysis.score,
        maxScore: descriptionAnalysis.maxScore,
        percentage: descriptionAnalysis.percentage,
        issues: descriptionAnalysis.issues,
        suggestions: descriptionAnalysis.suggestions,
        details: descriptionAnalysis.details
      },
      // Priority Actions
      priorityIssues: overallAnalysis.priorityIssues,
      quickWins: overallAnalysis.quickWins,
      // AI Recommendations
      strengths: aiAnalysis.strengths || [],
      recommendations: aiAnalysis.recommendations || [],
      competitiveAnalysis: {
        estimatedRanking: aiAnalysis.ranking || 'Good',
        improvementPotential: aiAnalysis.improvementPotential || 50
      }
    });
  } catch (error: any) {
    console.error('SEO Audit Error:', error);
    return NextResponse.json(
      { error: 'Failed to perform SEO audit', details: error.message },
      { status: 500 }
    );
  }
}

// Health check endpoint
export async function GET() {
  return NextResponse.json({
    ok: true,
    status: 'R.A.N.K. 285™ SEO Audit endpoint ready',
    model: 'gpt-4o',
    hasApiKey: !!process.env.OPENAI_API_KEY,
    system: '285-Point Etsy Algorithm',
    version: '2.0'
  });
}
