import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { randomUUID } from 'crypto';
import { prisma } from '@/lib/prisma';
import { getOpenAIClient } from '@/lib/openai';
import { getCurrentUser } from '@/lib/auth-helpers';

export const runtime = 'nodejs'

// HEAD method for health check probe
export async function HEAD(request: NextRequest) {
  return new NextResponse(null, { status: 200 })
}

// Input validation schema
const OptimizeRequestSchema = z.object({
  platform: z.string().min(1, 'Platform is required').default('etsy'),
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  tags: z.array(z.string()).optional(),
  photoScore: z.number().min(0).max(100).optional().default(75),
  tone: z.enum(['persuasive', 'minimalist', 'luxury', 'seo-heavy']).optional().default('persuasive'),
  listingId: z.string().optional(), // Optional Etsy listing ID for prefill
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
function analyzeListingQuality(title: string, description: string, tags: string[], platform: string) {
  const complianceIssues: string[] = [];
  const suggestions: string[] = [];
  
  // Extract primary keyword
  const titleWords = title.split(/\s+/);
  const primaryKeyword = titleWords.slice(0, 3).join(' ');
  
  // Calculate keyword density
  const keywordDensity = calculateKeywordDensity(description, primaryKeyword);
  
  // Find primary keyword position
  const primaryKeywordPosition = title.toLowerCase().indexOf(primaryKeyword.toLowerCase());
  
  // Title length check
  const titleLength = title.length;
  if (platform === 'etsy' && titleLength > 140) {
    complianceIssues.push('Title exceeds Etsy\'s 140 character limit');
  }
  
  // Keyword density check
  if (keywordDensity < 1.5) {
    suggestions.push('Increase keyword density to 1.5-3% for better SEO');
  } else if (keywordDensity > 3.0) {
    complianceIssues.push('Keyword density too high - risk of keyword stuffing penalty');
  }
  
  // Tag count check
  if (platform === 'etsy' && tags.length !== 13) {
    complianceIssues.push(`Etsy requires exactly 13 tags (currently ${tags.length})`);
  }
  
  // Flesch score
  const fleschScore = calculateFleschScore(description);
  if (fleschScore < 60) {
    suggestions.push('Improve readability - text is too complex');
  }
  
  // Emotion triggers
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
function calculateAdvancedScores(variant: any, analysis: any, platform: string): Partial<OptimizationVariant> {
  const clarity = Math.min(100, Math.round(analysis.fleschScore * 1.2));
  
  const emotionScore = Math.min(100, analysis.emotionTriggers.length * 10);
  const descriptionLength = variant.description.length;
  const lengthScore = descriptionLength >= 150 && descriptionLength <= 300 ? 100 : 70;
  const persuasion = Math.round((emotionScore * 0.6 + lengthScore * 0.4));
  
  let seoDensity = 0;
  if (analysis.keywordDensity >= 1.5 && analysis.keywordDensity <= 3.0) {
    seoDensity = 100;
  } else if (analysis.keywordDensity < 1.5) {
    seoDensity = Math.round((analysis.keywordDensity / 1.5) * 100);
  } else {
    seoDensity = Math.max(0, 100 - (analysis.keywordDensity - 3.0) * 20);
  }
  
  const positionScore = analysis.primaryKeywordPosition <= 60 ? 100 : 60;
  const tagScore = variant.tags.length === 13 ? 100 : 70;
  const keywordHarmony = Math.round((positionScore * 0.6 + tagScore * 0.4));
  
  const titleScore = analysis.titleLength <= 140 ? 100 : 70;
  const emotionalAppeal = Math.min(100, analysis.emotionTriggers.length * 15);
  const ctrProbability = Math.round((titleScore * 0.4 + emotionalAppeal * 0.3 + keywordHarmony * 0.3));
  
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
    status: 'optimize endpoint ready (v1.0)',
    model: 'gpt-4o',
    hasApiKey: !!process.env.OPENAI_API_KEY,
    features: [
      'Authentication Required',
      'Credit System Integration',
      'Database Persistence',
      'Real GPT-4o Integration',
      'Advanced Scoring',
    ],
  });
}

// POST /api/optimize - Optimize listing content
export async function POST(request: NextRequest) {
  const requestId = randomUUID();
  
  try {
    console.log(`[${requestId}] Starting optimization request...`);
    
    // 1. Authentication check
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json(
        { ok: false, error: { code: 'unauthorized', message: 'Authentication required', requestId } },
        { status: 401 }
      );
    }
    
    console.log(`[${requestId}] User authenticated: ${user.id}`);
    
    // 2. Parse and validate input
    const body = await request.json();
    const validatedInput = OptimizeRequestSchema.parse(body);
    const { platform, title, description, tags, photoScore, tone, listingId } = validatedInput;
    
    console.log(`[${requestId}] Input validated: platform=${platform}, tone=${tone}, listingId=${listingId || 'none'}`);
    
    // 3. Check user credit balance
    const lastLedgerEntry = await prisma.creditLedger.findFirst({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
    });
    
    const currentBalance = lastLedgerEntry?.balance || 0;
    
    if (currentBalance < 1) {
      console.log(`[${requestId}] Insufficient credits: balance=${currentBalance}`);
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: 'insufficient_credits',
            message: 'Insufficient credits. Please purchase more credits to continue.',
            currentBalance,
            requestId,
          },
        },
        { status: 402 }
      );
    }
    
    console.log(`[${requestId}] Credit check passed: balance=${currentBalance}`);
    
    // 4. Check OpenAI configuration
    if (!process.env.OPENAI_API_KEY) {
      console.error(`[${requestId}] OpenAI API key not configured`);
      return NextResponse.json(
        { ok: false, error: { code: 'missing_api_key', message: 'OpenAI API key not configured', requestId } },
        { status: 500 }
      );
    }
    
    // 5. Create optimization record (status: processing)
    const optimization = await prisma.optimization.create({
      data: {
        userId: user.id,
        listingId: listingId || null,
        type: 'full',
        status: 'processing',
        creditsUsed: 0, // Will be set to 1 on success
        aiModel: 'gpt-4o',
        originalContent: {
          title,
          description: description || '',
          tags: tags || [],
          platform,
          tone,
          photoScore,
        },
      },
    });
    
    console.log(`[${requestId}] Optimization record created: ${optimization.id}`);
    
    // 6. Build AI prompt
    const toneInstructions = {
      persuasive: 'Use emotional triggers, storytelling, and benefit-focused language.',
      minimalist: 'Use clean, concise language. Focus on essential features.',
      luxury: 'Use sophisticated, premium language. Emphasize exclusivity and craftsmanship.',
      'seo-heavy': 'Maximize keyword usage while maintaining readability.',
    };
    
    const systemPrompt = `You are an elite e-commerce listing optimizer with deep expertise in ${platform} algorithm optimization.

CRITICAL RULES:
1. KEYWORD PRIORITY: Primary keyword MUST appear in first 60 characters of title
2. DENSITY CONTROL: Maintain keyword density between 1.5% and 3.0%
3. TITLE COMPOSITION: Maximum 140 characters (Etsy limit), front-load primary keyword
4. TAG REQUIREMENTS: Exactly 13 tags (Etsy requirement)

TONE: ${toneInstructions[tone]}

Generate 3 distinct optimized variants. Each variant MUST include:
1. Optimized title (≤140 chars)
2. Compelling description (150-300 words)
3. Exactly 13 unique, relevant tags
4. Estimated copyScore (0-100)

Return valid JSON:
{
  "variants": [
    {
      "title": "string",
      "description": "string",
      "tags": ["tag1", "tag2", ... 13 tags],
      "copyScore": number
    }
  ],
  "rationale": "Brief explanation",
  "primaryKeyword": "extracted primary keyword"
}`;
    
    const userPrompt = `Original Listing:
Platform: ${platform}
Title: ${title}
Description: ${description || 'Not provided'}
Current Tags: ${tags?.join(', ') || 'None'}
Photo Quality Score: ${photoScore}/100
Desired Tone: ${tone}

Generate 3 optimized variants following all algorithm rules.`;
    
    // 7. Call OpenAI API (temp 0.4, max_tokens 2000)
    console.log(`[${requestId}] Calling OpenAI GPT-4o...`);
    const client = getOpenAIClient();
    const completion = await client.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.4,
      max_tokens: 2000,
    });
    
    console.log(`[${requestId}] OpenAI API call successful`);
    
    const responseContent = completion.choices[0]?.message?.content;
    if (!responseContent) {
      throw new Error('No response from OpenAI');
    }
    
    // 8. Parse AI response
    const aiResponse = JSON.parse(responseContent);
    const variants: any[] = aiResponse.variants || [];
    
    if (variants.length === 0) {
      throw new Error('No variants generated');
    }
    
    // 9. Process and enhance each variant
    const enhancedVariants: OptimizationVariant[] = variants.map((variant, index) => {
      const variantTags = variant.tags || [];
      while (variantTags.length < 13) {
        variantTags.push(`tag${variantTags.length + 1}`);
      }
      
      const analysis = analyzeListingQuality(
        variant.title,
        variant.description,
        variantTags.slice(0, 13),
        platform
      );
      
      const advancedScores = calculateAdvancedScores(variant, analysis, platform);
      
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
    
    // 10. Calculate health score
    const avgCopyScore = enhancedVariants.reduce((sum, v) => sum + v.copyScore, 0) / enhancedVariants.length;
    const seoScore = enhancedVariants.reduce((sum, v) => sum + v.seoDensity, 0) / enhancedVariants.length;
    const healthScore = Math.round(avgCopyScore);
    
    // 11. Save variants to database and update optimization
    await prisma.$transaction(async (tx) => {
      // Create variant records
      for (let i = 0; i < enhancedVariants.length; i++) {
        const variant = enhancedVariants[i];
        await tx.optimizationVariant.create({
          data: {
            optimizationId: optimization.id,
            variantNumber: i + 1,
            title: variant.title,
            description: variant.description,
            tags: variant.tags,
            score: variant.copyScore,
            reasoning: `Copy Score: ${variant.copyScore}, CTR: ${variant.ctrProbability}%, Conversion: ${variant.conversionProbability}%`,
            metadata: {
              clarity: variant.clarity,
              persuasion: variant.persuasion,
              seoDensity: variant.seoDensity,
              keywordHarmony: variant.keywordHarmony,
              readabilityScore: variant.readabilityScore,
              emotionScore: variant.emotionScore,
              ctrProbability: variant.ctrProbability,
              conversionProbability: variant.conversionProbability,
            },
          },
        });
      }
      
      // Update optimization status
      await tx.optimization.update({
        where: { id: optimization.id },
        data: {
          status: 'completed',
          creditsUsed: 1,
          result: {
            healthScore,
            variantCount: enhancedVariants.length,
            rationale: aiResponse.rationale || 'Optimizations generated',
            primaryKeyword: aiResponse.primaryKeyword || '',
          },
          completedAt: new Date(),
        },
      });
      
      // 12. Deduct 1 credit (ONLY on success)
      await tx.creditLedger.create({
        data: {
          userId: user.id,
          amount: -1,
          balance: currentBalance - 1,
          type: 'usage',
          description: `Listing optimization - ${platform}`,
          referenceId: optimization.id,
          referenceType: 'optimization',
          metadata: {
            optimizationId: optimization.id,
            platform,
            tone,
            variantCount: enhancedVariants.length,
          },
        },
      });
    });
    
    console.log(`[${requestId}] Optimization complete: 1 credit deducted, new balance=${currentBalance - 1}`);
    
    // 13. Return success response
    return NextResponse.json({
      ok: true,
      optimizationId: optimization.id,
      creditsRemaining: currentBalance - 1,
      variant_count: enhancedVariants.length,
      variants: enhancedVariants,
      healthScore,
      rationale: aiResponse.rationale || 'Optimizations generated based on platform best practices.',
      primaryKeyword: aiResponse.primaryKeyword || '',
      metadata: {
        model: 'gpt-4o',
        platform,
        tone,
        requestId,
      },
    });
    
  } catch (error: any) {
    console.error(`[${requestId}] Error optimizing listing:`, error);
    
    // Update optimization record as failed if it was created
    try {
      await prisma.optimization.updateMany({
        where: {
          id: { contains: requestId },
          status: 'processing',
        },
        data: {
          status: 'failed',
          errorMessage: error.message,
        },
      });
    } catch (updateError) {
      console.error(`[${requestId}] Failed to update optimization record:`, updateError);
    }
    
    // Handle validation errors
    if (error instanceof z.ZodError) {
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
