import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { z } from 'zod';
import { randomUUID } from 'crypto';
import { prisma } from '@/lib/prisma';

// Validate OpenAI API key
if (!process.env.OPENAI_API_KEY) {
  console.warn('⚠️  OPENAI_API_KEY not set in environment variables');
}

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  project: process.env.OPENAI_PROJECT_ID,
});

// Input validation schema
const OptimizeRequestSchema = z.object({
  platform: z.string().min(1, 'Platform is required').default('etsy'),
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  tags: z.array(z.string()).optional(),
  photoScore: z.number().min(0).max(100).optional().default(75),
  tone: z.enum(['persuasive', 'minimalist', 'luxury', 'seo-heavy']).optional().default('persuasive'),
});

interface OptimizationVariant {
  title: string;
  description: string;
  tags: string[];
  copyScore: number;
  clarity: number;
  persuasion: number;
  seoDensity: number;
  keywordHarmony: number;
  readabilityScore: number;
  emotionScore: number;
  ctrProbability: number;
  conversionProbability: number;
}

interface AnalysisResult {
  keywordDensity: number;
  primaryKeywordPosition: number;
  titleLength: number;
  fleschScore: number;
  emotionTriggers: string[];
  complianceIssues: string[];
  suggestions: string[];
}

// Helper function to calculate Flesch Reading Ease score
function calculateFleschScore(text: string): number {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
  const words = text.split(/\s+/).filter(w => w.length > 0).length;
  const syllables = text.split(/\s+/).reduce((count, word) => {
    return count + countSyllables(word);
  }, 0);
  
  if (sentences === 0 || words === 0) return 0;
  
  const score = 206.835 - 1.015 * (words / sentences) - 84.6 * (syllables / words);
  return Math.max(0, Math.min(100, Math.round(score)));
}

function countSyllables(word: string): number {
  word = word.toLowerCase().replace(/[^a-z]/g, '');
  if (word.length <= 3) return 1;
  
  const vowels = word.match(/[aeiouy]+/g);
  let count = vowels ? vowels.length : 1;
  
  if (word.endsWith('e')) count--;
  if (word.endsWith('le') && word.length > 2) count++;
  
  return Math.max(1, count);
}

// Helper function to calculate keyword density
function calculateKeywordDensity(text: string, keyword: string): number {
  const words = text.toLowerCase().split(/\s+/);
  const keywordWords = keyword.toLowerCase().split(/\s+/);
  let matches = 0;
  
  for (let i = 0; i <= words.length - keywordWords.length; i++) {
    const phrase = words.slice(i, i + keywordWords.length).join(' ');
    if (phrase === keywordWords.join(' ')) matches++;
  }
  
  return words.length > 0 ? (matches / words.length) * 100 : 0;
}

// Helper function to detect emotion triggers
function detectEmotionTriggers(text: string): string[] {
  const emotionWords = [
    'love', 'beautiful', 'perfect', 'amazing', 'stunning', 'gorgeous',
    'unique', 'special', 'handmade', 'artisan', 'crafted', 'premium',
    'luxury', 'elegant', 'timeless', 'exclusive', 'limited', 'rare',
    'cozy', 'comfortable', 'soft', 'warm', 'delightful', 'charming'
  ];
  
  const textLower = text.toLowerCase();
  return emotionWords.filter(word => textLower.includes(word));
}

// Helper function to analyze listing quality
function analyzeListingQuality(
  title: string,
  description: string,
  tags: string[],
  platform: string
): AnalysisResult {
  const complianceIssues: string[] = [];
  const suggestions: string[] = [];
  
  // Extract primary keyword (first few words of title)
  const titleWords = title.split(/\s+/);
  const primaryKeyword = titleWords.slice(0, 3).join(' ');
  
  // Calculate keyword density in description
  const keywordDensity = calculateKeywordDensity(description, primaryKeyword);
  
  // Find primary keyword position in title
  const primaryKeywordPosition = title.toLowerCase().indexOf(primaryKeyword.toLowerCase());
  
  // Title length check
  const titleLength = title.length;
  if (platform === 'etsy' && titleLength > 140) {
    complianceIssues.push('Title exceeds Etsy\'s 140 character limit');
    suggestions.push('Shorten title to 140 characters or less');
  }
  
  if (titleLength > 140) {
    complianceIssues.push('Title exceeds recommended length and may be truncated');
  }
  
  // Keyword density check
  if (keywordDensity < 1.5) {
    suggestions.push('Increase keyword density to 1.5-3% for better SEO');
  } else if (keywordDensity > 3.0) {
    complianceIssues.push('Keyword density too high - risk of keyword stuffing penalty');
    suggestions.push('Reduce keyword density to avoid penalties');
  }
  
  // Primary keyword position check
  if (primaryKeywordPosition > 60) {
    complianceIssues.push('Primary keyword not in first 60 characters of title');
    suggestions.push('Move primary keyword to the beginning of title');
  }
  
  // Tag count check
  if (platform === 'etsy' && tags.length !== 13) {
    complianceIssues.push(`Etsy requires exactly 13 tags (currently ${tags.length})`);
  }
  
  // Calculate Flesch readability score
  const fleschScore = calculateFleschScore(description);
  if (fleschScore < 60) {
    suggestions.push('Improve readability - text is too complex');
  }
  
  // Detect emotion triggers
  const emotionTriggers = detectEmotionTriggers(title + ' ' + description);
  if (emotionTriggers.length < 3) {
    suggestions.push('Add more emotional trigger words to increase appeal');
  }
  
  return {
    keywordDensity,
    primaryKeywordPosition,
    titleLength,
    fleschScore,
    emotionTriggers,
    complianceIssues,
    suggestions,
  };
}

// Helper function to calculate advanced scores
function calculateAdvancedScores(
  variant: any,
  analysis: AnalysisResult,
  platform: string
): Partial<OptimizationVariant> {
  // Clarity score (based on readability)
  const clarity = Math.min(100, Math.round(analysis.fleschScore * 1.2));
  
  // Persuasion score (based on emotion triggers and description quality)
  const emotionScore = Math.min(100, analysis.emotionTriggers.length * 10);
  const descriptionLength = variant.description.length;
  const lengthScore = descriptionLength >= 150 && descriptionLength <= 300 ? 100 : 70;
  const persuasion = Math.round((emotionScore * 0.6 + lengthScore * 0.4));
  
  // SEO Density score (keyword density compliance)
  let seoDensity = 0;
  if (analysis.keywordDensity >= 1.5 && analysis.keywordDensity <= 3.0) {
    seoDensity = 100;
  } else if (analysis.keywordDensity < 1.5) {
    seoDensity = Math.round((analysis.keywordDensity / 1.5) * 100);
  } else {
    seoDensity = Math.max(0, 100 - (analysis.keywordDensity - 3.0) * 20);
  }
  
  // Keyword Harmony score (primary keyword position + tag relevance)
  const positionScore = analysis.primaryKeywordPosition <= 60 ? 100 : 60;
  const tagScore = variant.tags.length === 13 ? 100 : 70;
  const keywordHarmony = Math.round((positionScore * 0.6 + tagScore * 0.4));
  
  // CTR Probability (0-100)
  const titleScore = analysis.titleLength <= 140 ? 100 : 70;
  const emotionalAppeal = Math.min(100, analysis.emotionTriggers.length * 15);
  const ctrProbability = Math.round((titleScore * 0.4 + emotionalAppeal * 0.3 + keywordHarmony * 0.3));
  
  // Conversion Probability (0-100)
  const conversionProbability = Math.round((clarity * 0.3 + persuasion * 0.4 + seoDensity * 0.3));
  
  return {
    clarity,
    persuasion,
    seoDensity,
    keywordHarmony,
    readabilityScore: analysis.fleschScore,
    emotionScore,
    ctrProbability,
    conversionProbability,
  };
}

// GET /api/optimize - Health check endpoint
export async function GET() {
  return NextResponse.json({
    ok: true,
    status: 'optimize endpoint ready (enhanced)',
    model: 'gpt-4o',
    hasApiKey: !!process.env.OPENAI_API_KEY,
    features: [
      'Keyword Priority Layering',
      'Density Control (1.5-3%)',
      'Title Composition Rules',
      'Advanced Copy Scoring',
      'Readability Analysis',
      'Emotion Trigger Detection',
      'CTR/Conversion Prediction',
      'Compliance Checking',
    ],
  });
}

// POST /api/optimize - Optimize listing content using OpenAI with enhanced algorithm
export async function POST(request: NextRequest) {
  const requestId = randomUUID();
  
  try {
    console.log(`[${requestId}] Processing enhanced optimization request...`);
    // Parse and validate input
    const body = await request.json();
    const validatedInput = OptimizeRequestSchema.parse(body);
    
    const { platform, title, description, tags, photoScore, tone } = validatedInput;

    // Check if OpenAI is configured
    if (!process.env.OPENAI_API_KEY) {
      console.error(`[${requestId}] OpenAI API key not configured`);
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: 'missing_api_key',
            message: 'OpenAI API key not configured',
            requestId,
          },
        },
        { status: 500 }
      );
    }

    console.log(`[${requestId}] Input validated: platform=${platform}, tone=${tone}, title="${title.substring(0, 30)}...", photoScore=${photoScore}`);

    // Construct the enhanced AI prompt with Etsy algorithm optimization rules
    const toneInstructions = {
      persuasive: 'Use emotional triggers, storytelling, and benefit-focused language. Appeal to buyer desires and paint a vivid picture.',
      minimalist: 'Use clean, concise language. Focus on essential features and benefits. Avoid flowery language.',
      luxury: 'Use sophisticated, premium language. Emphasize exclusivity, craftsmanship, and high-end appeal.',
      'seo-heavy': 'Maximize keyword usage while maintaining readability. Focus on search optimization and discoverability.',
    };

    const systemPrompt = `You are an elite e-commerce listing optimizer with deep expertise in ${platform} algorithm optimization.

CRITICAL ETSY ALGORITHM RULES (if platform is Etsy):
1. KEYWORD PRIORITY LAYERING:
   - Primary keyword MUST appear in first 60 characters of title
   - Primary keyword MUST appear early in description (first paragraph)
   - Secondary keywords rotated throughout for semantic coverage
   - Long-tail keywords for high-intent queries (personalized, handmade, custom, etc.)

2. DENSITY CONTROL:
   - Maintain keyword density between 1.5% and 3.0% (STRICT)
   - Below 1.5% = poor SEO, Above 3.0% = penalty risk

3. TITLE COMPOSITION:
   - Maximum 140 characters (Etsy limit)
   - Front-load high-volume primary keyword
   - End with brand/style hook
   - Format: [Primary Keyword] | [Key Features] | [Brand/Style]

4. TAG REQUIREMENTS:
   - Exactly 13 tags (Etsy requirement)
   - Use AI clustering for semantic variety
   - No duplicate concepts
   - Mix of broad, medium, and long-tail keywords

TONE: ${toneInstructions[tone]}

Generate 3 distinct optimized variants. Each variant MUST include:
1. Optimized title (≤140 chars, primary keyword in first 60 chars)
2. Compelling description (150-300 words, 1.5-3% keyword density)
3. Exactly 13 unique, relevant tags
4. Estimated copyScore (0-100)

Return valid JSON with this structure:
{
  "variants": [
    {
      "title": "string",
      "description": "string",
      "tags": ["tag1", "tag2", ... 13 tags],
      "copyScore": number
    }
  ],
  "rationale": "Brief explanation of optimization strategy",
  "primaryKeyword": "extracted primary keyword",
  "keywordDensity": number
}`;

    const userPrompt = `Original Listing:
Platform: ${platform}
Title: ${title}
Description: ${description || 'Not provided'}
Current Tags: ${tags?.join(', ') || 'None'}
Photo Quality Score: ${photoScore}/100
Desired Tone: ${tone}

Generate 3 optimized variants following all algorithm rules. Ensure compliance with keyword density, title length, and tag requirements.`;

    // Call OpenAI API
    console.log(`[${requestId}] Calling OpenAI API with enhanced prompt...`);
    const completion = await client.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.8,
      max_tokens: 3000,
    });
    console.log(`[${requestId}] OpenAI API call successful`);

    const responseContent = completion.choices[0]?.message?.content;
    
    if (!responseContent) {
      throw new Error('No response from OpenAI');
    }

    // Parse AI response
    const aiResponse = JSON.parse(responseContent);
    const variants: any[] = aiResponse.variants || [];
    const rationale: string = aiResponse.rationale || 'Optimizations generated based on platform best practices.';
    const primaryKeyword: string = aiResponse.primaryKeyword || title.split(' ').slice(0, 3).join(' ');

    // Validate we have variants
    if (variants.length === 0) {
      throw new Error('No variants generated');
    }

    // Process and enhance each variant with advanced analysis
    const enhancedVariants: OptimizationVariant[] = variants.map((variant, index) => {
      // Ensure exactly 13 tags
      const variantTags = variant.tags || [];
      while (variantTags.length < 13) {
        variantTags.push(tags?.[variantTags.length % (tags?.length || 1)] || `tag${variantTags.length + 1}`);
      }
      
      // Analyze listing quality
      const analysis = analyzeListingQuality(
        variant.title,
        variant.description,
        variantTags.slice(0, 13),
        platform
      );
      
      // Calculate advanced scores
      const advancedScores = calculateAdvancedScores(variant, analysis, platform);
      
      // Calculate overall copyScore (weighted average)
      const copyScore = Math.round(
        advancedScores.clarity! * 0.25 +
        advancedScores.persuasion! * 0.25 +
        advancedScores.seoDensity! * 0.25 +
        advancedScores.keywordHarmony! * 0.25
      );
      
      return {
        title: variant.title,
        description: variant.description,
        tags: variantTags.slice(0, 13),
        copyScore,
        ...advancedScores,
      } as OptimizationVariant;
    });

    // Calculate average scores
    const avgCopyScore = enhancedVariants.reduce((sum, v) => sum + v.copyScore, 0) / enhancedVariants.length;
    const avgCtrProbability = enhancedVariants.reduce((sum, v) => sum + v.ctrProbability, 0) / enhancedVariants.length;
    const avgConversionProbability = enhancedVariants.reduce((sum, v) => sum + v.conversionProbability, 0) / enhancedVariants.length;

    // Calculate enhanced Listing Health Index
    // 40% SEO alignment, 30% engagement likelihood, 20% competitive positioning, 10% compliance
    const seoScore = enhancedVariants.reduce((sum, v) => sum + v.seoDensity, 0) / enhancedVariants.length;
    const engagementScore = avgCtrProbability;
    const competitiveScore = avgConversionProbability;
    
    // Analyze first variant for compliance
    const firstVariantAnalysis = analyzeListingQuality(
      enhancedVariants[0].title,
      enhancedVariants[0].description,
      enhancedVariants[0].tags,
      platform
    );
    const complianceScore = firstVariantAnalysis.complianceIssues.length === 0 ? 100 : Math.max(0, 100 - firstVariantAnalysis.complianceIssues.length * 20);
    
    const healthScore = Math.round(
      seoScore * 0.40 +
      engagementScore * 0.30 +
      competitiveScore * 0.20 +
      complianceScore * 0.10
    );

    console.log(`[${requestId}] Enhanced optimization complete: ${enhancedVariants.length} variants, healthScore=${healthScore}`);

    // Compile all compliance issues and suggestions
    const allComplianceIssues = new Set<string>();
    const allSuggestions = new Set<string>();
    
    enhancedVariants.forEach((variant, index) => {
      const analysis = analyzeListingQuality(variant.title, variant.description, variant.tags, platform);
      analysis.complianceIssues.forEach(issue => allComplianceIssues.add(issue));
      analysis.suggestions.forEach(suggestion => allSuggestions.add(suggestion));
    });

    // Return enhanced response
    const response = {
      ok: true,
      variant_count: enhancedVariants.length,
      variants: enhancedVariants,
      healthScore,
      rationale,
      primaryKeyword,
      complianceIssues: Array.from(allComplianceIssues),
      suggestions: Array.from(allSuggestions),
      analytics: {
        avgCopyScore: Math.round(avgCopyScore),
        avgCtrProbability: Math.round(avgCtrProbability),
        avgConversionProbability: Math.round(avgConversionProbability),
        seoScore: Math.round(seoScore),
        engagementScore: Math.round(engagementScore),
        competitiveScore: Math.round(competitiveScore),
        complianceScore: Math.round(complianceScore),
      },
      healthBreakdown: {
        seoAlignment: Math.round(seoScore * 0.40),
        engagementLikelihood: Math.round(engagementScore * 0.30),
        competitivePositioning: Math.round(competitiveScore * 0.20),
        compliance: Math.round(complianceScore * 0.10),
      },
      metadata: {
        model: 'gpt-4o',
        platform,
        tone,
        originalTitle: title,
        photoScore,
        requestId,
        enhancedFeatures: true,
      },
    };

    return NextResponse.json(response);

  } catch (error: any) {
    console.error(`[${requestId}] Error optimizing listing:`, error);

    // Handle validation errors
    if (error instanceof z.ZodError) {
      console.error(`[${requestId}] Validation error:`, error.issues);
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: 'validation_error',
            message: 'Invalid input parameters',
            details: error.issues,
            requestId,
          },
        },
        { status: 400 }
      );
    }

    // Handle OpenAI errors
    if (error?.status) {
      console.error(`[${requestId}] OpenAI API error (${error.status}):`, error.message);
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: error.code || 'openai_error',
            message: error.message,
            requestId,
          },
        },
        { status: error.status }
      );
    }

    // Generic error
    console.error(`[${requestId}] Unexpected error:`, error.message);
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: 'internal_error',
          message: error.message || 'Failed to optimize listing',
          requestId,
        },
      },
      { status: 500 }
    );
  }
}

