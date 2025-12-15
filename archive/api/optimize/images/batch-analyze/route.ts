import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { z } from 'zod';
import { randomUUID } from 'crypto';

export const runtime = 'nodejs';

// Input validation schema
const BatchAnalyzeRequestSchema = z.object({
  photos: z.array(z.string().url('Each photo must be a valid URL')).min(1).max(10),
  platform: z.string().default('etsy'),
  listingId: z.string().optional(),
  saveToDatabase: z.boolean().default(false),
});

// Platform-specific requirements
const PLATFORM_REQUIREMENTS = {
  etsy: {
    minResolution: 2000,
    preferredAspectRatio: '1:1',
    maxPhotos: 10,
  },
  shopify: {
    minResolution: 2048,
    preferredAspectRatio: '1:1',
    maxPhotos: 10,
  },
  ebay: {
    minResolution: 1600,
    preferredAspectRatio: '1:1',
    maxPhotos: 12,
  },
};

// GET /api/optimize/images/batch-analyze - Health check
export async function GET() {
  return NextResponse.json({
    ok: true,
    status: 'batch image analysis endpoint ready',
    model: 'gpt-4o',
    hasApiKey: !!process.env.OPENAI_API_KEY,
    maxPhotos: 10,
  });
}

// Analyze a single photo with Vision API
async function analyzeSinglePhoto(
  openai: OpenAI,
  photoUrl: string,
  photoNumber: number,
  platform: string
): Promise<any> {
  const requirements = PLATFORM_REQUIREMENTS[platform as keyof typeof PLATFORM_REQUIREMENTS] || PLATFORM_REQUIREMENTS.etsy;

  const systemPrompt = `You are an expert e-commerce product photography analyst specializing in ${platform} listings, powered by Etsy's 2025 algorithm knowledge.

═══════════════════════════════════════════════════════════════
CRITICAL CHECKS (NON-NEGOTIABLE):
═══════════════════════════════════════════════════════════════
1. Resolution: MUST be 2000px+ width (REQUIRED - instant penalty if under)
2. Text overlays or collages? (PROHIBITED - instant algorithm penalty)
3. Mobile thumbnail effectiveness: Would this catch attention at small size in feed?
4. Lighting and clarity quality (professional standard)
5. Product focus: 60-80% of frame (product dominance)
6. Background: Clean, neutral, non-distracting
7. Lifestyle context vs plain product shot

ETSY 2025 ALGORITHM PRIORITIES:
• 44%+ of traffic from mobile app - thumbnails MUST work at small sizes
• First image is often only chance to capture attention in feed
• Computer vision classifies products - professional images improve AI classification
• NO text overlays (harder to read on mobile, actively penalized)
• 5+ photos strongly recommended by algorithm

SCORING CRITERIA (1-10 scale):
1. Visual Appeal: Eye-catching in mobile feed
2. Mobile Optimization: Effective at thumbnail size
3. Professional Quality: Lighting, clarity, composition
4. Engagement Potential: Would buyer click and dwell?

Provide detailed, actionable feedback for Etsy sellers to rank higher.`;

  const userPrompt = `Analyze this ${platform} product photo (#${photoNumber}).

CRITICAL CHECKS (Non-Negotiable):
1. Resolution: Is it 2000px+ width? (REQUIRED)
2. Text overlays or collages present? (PROHIBITED - instant penalty)
3. Mobile thumbnail effectiveness: Would this catch attention at small size in feed?
4. Lighting and clarity quality
5. Product focus: 60-80% of frame
6. Lifestyle context vs plain product shot

SCORING (1-10 scale):
• Visual appeal: Eye-catching in mobile feed
• Mobile optimization: Effective at thumbnail size
• Professional quality: Lighting, clarity, composition
• Engagement potential: Would buyer click?

Provide JSON:
{
  "score": 0-100,
  "productDominance": 0-100,
  "backgroundQuality": 0-100,
  "lighting": 0-100,
  "clarity": 0-100,
  "colorBalance": 0-100,
  "estimatedWidth": 2000,
  "estimatedHeight": 2000,
  "isSquare": true,
  "hasTextOverlay": false,
  "hasCollage": false,
  "mobileEffectiveness": 0-10,
  "feedback": "Specific assessment with algorithm reasoning",
  "suggestions": ["actionable improvement 1", "actionable improvement 2"],
  "criticalViolations": ["text overlay detected", "resolution under 2000px"]
}`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        {
          role: 'user',
          content: [
            { type: 'text', text: userPrompt },
            { type: 'image_url', image_url: { url: photoUrl } },
          ],
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3,
      max_tokens: 1000,
    });

    const responseContent = completion.choices[0]?.message?.content;
    if (!responseContent) {
      throw new Error('No response from OpenAI');
    }

    const aiResponse = JSON.parse(responseContent);

    return {
      photoNumber,
      url: photoUrl,
      score: aiResponse.score || 0,
      productDominance: aiResponse.productDominance || 0,
      backgroundQuality: aiResponse.backgroundQuality || 0,
      lighting: aiResponse.lighting || 0,
      clarity: aiResponse.clarity || 0,
      colorBalance: aiResponse.colorBalance || 0,
      estimatedWidth: aiResponse.estimatedWidth || 0,
      estimatedHeight: aiResponse.estimatedHeight || 0,
      isSquare: aiResponse.isSquare || false,
      hasTextOverlay: aiResponse.hasTextOverlay || false,
      hasCollage: aiResponse.hasCollage || false,
      mobileEffectiveness: aiResponse.mobileEffectiveness || 0,
      meetsMinimum: (aiResponse.estimatedWidth || 0) >= requirements.minResolution && 
                    (aiResponse.estimatedHeight || 0) >= requirements.minResolution,
      feedback: aiResponse.feedback || '',
      suggestions: Array.isArray(aiResponse.suggestions) ? aiResponse.suggestions : [],
      criticalViolations: Array.isArray(aiResponse.criticalViolations) ? aiResponse.criticalViolations : [],
    };
  } catch (error: any) {
    console.error(`Failed to analyze photo #${photoNumber}:`, error.message);
    return {
      photoNumber,
      url: photoUrl,
      error: 'Failed to analyze photo',
      score: 0,
      productDominance: 0,
      backgroundQuality: 0,
      lighting: 0,
      clarity: 0,
      colorBalance: 0,
      estimatedWidth: 0,
      estimatedHeight: 0,
      isSquare: false,
      hasTextOverlay: false,
      hasCollage: false,
      mobileEffectiveness: 0,
      meetsMinimum: false,
      feedback: `Analysis failed: ${error.message}`,
      suggestions: ['Re-check photo URL and try again'],
      criticalViolations: [],
    };
  }
}

// Lazy initialization to avoid build-time errors
let _openaiBatch: OpenAI | null = null;

function getOpenAIForBatch(): OpenAI {
  if (!_openaiBatch) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not configured');
    }
    _openaiBatch = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return _openaiBatch;
}

// POST /api/optimize/images/batch-analyze - Analyze multiple photos in parallel
export async function POST(request: NextRequest) {
  const requestId = randomUUID();

  try {
    console.log(`[${requestId}] Processing batch image analysis request...`);

    const openai = getOpenAIForBatch();

    // Parse and validate input
    const body = await request.json();
    const validatedInput = BatchAnalyzeRequestSchema.parse(body);
    const { photos, platform } = validatedInput;

    console.log(`[${requestId}] Analyzing ${photos.length} photos for ${platform}...`);

    const requirements = PLATFORM_REQUIREMENTS[platform as keyof typeof PLATFORM_REQUIREMENTS] || PLATFORM_REQUIREMENTS.etsy;

    // CRITICAL: Analyze all photos in PARALLEL using Promise.all()
    const startTime = Date.now();
    const analyses = await Promise.all(
      photos.map((photoUrl, index) => 
        analyzeSinglePhoto(openai, photoUrl, index + 1, platform)
      )
    );
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);

    console.log(`[${requestId}] Batch analysis complete in ${elapsed}s`);

    // Calculate overall statistics
    const validAnalyses = analyses.filter(a => !a.error);
    const failedCount = analyses.length - validAnalyses.length;

    if (validAnalyses.length === 0) {
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: 'all_photos_failed',
            message: 'Failed to analyze all photos',
            requestId,
          },
        },
        { status: 500 }
      );
    }

    // Calculate overall score (average of valid analyses)
    const avgScore = Math.round(
      validAnalyses.reduce((sum, a) => sum + a.score, 0) / validAnalyses.length
    );

    const avgProductDominance = Math.round(
      validAnalyses.reduce((sum, a) => sum + a.productDominance, 0) / validAnalyses.length
    );

    const avgBackgroundQuality = Math.round(
      validAnalyses.reduce((sum, a) => sum + a.backgroundQuality, 0) / validAnalyses.length
    );

    const avgLighting = Math.round(
      validAnalyses.reduce((sum, a) => sum + a.lighting, 0) / validAnalyses.length
    );

    const avgClarity = Math.round(
      validAnalyses.reduce((sum, a) => sum + a.clarity, 0) / validAnalyses.length
    );

    const avgColorBalance = Math.round(
      validAnalyses.reduce((sum, a) => sum + a.colorBalance, 0) / validAnalyses.length
    );

    // Identify issues
    const issues: string[] = [];
    const suggestions: string[] = [];

    // Check photo count
    if (photos.length < requirements.maxPhotos) {
      issues.push(`Only ${photos.length}/${requirements.maxPhotos} photos (add ${requirements.maxPhotos - photos.length} more)`);
      suggestions.push(`Add ${requirements.maxPhotos - photos.length} more photos showing different angles, lifestyle shots, and details`);
    }

    // Check for low resolution photos
    const lowResPhotos = validAnalyses.filter(
      a => !a.meetsMinimum && a.estimatedWidth > 0
    );
    if (lowResPhotos.length > 0) {
      issues.push(`${lowResPhotos.length} photos below ${requirements.minResolution}px resolution`);
      suggestions.push(`Re-upload low-res photos at ${requirements.minResolution}x${requirements.minResolution}px or higher`);
    }

    // Check for poor quality photos
    const poorQualityPhotos = validAnalyses.filter(a => a.score < 70);
    if (poorQualityPhotos.length > 0) {
      issues.push(`${poorQualityPhotos.length} photos scored below 70/100`);
      suggestions.push('Improve lighting, background, and composition for low-scoring photos');
    }

    // Check for non-square photos
    const nonSquarePhotos = validAnalyses.filter(a => !a.isSquare);
    if (nonSquarePhotos.length > 0) {
      issues.push(`${nonSquarePhotos.length} photos are not square (1:1 ratio)`);
      suggestions.push('Crop photos to square (1:1) aspect ratio for better grid display');
    }

    // Check for failed photos
    if (failedCount > 0) {
      issues.push(`${failedCount} photos failed to analyze`);
      suggestions.push('Verify failed photo URLs are accessible and valid');
    }

    // Check average scores
    if (avgProductDominance < 70) {
      suggestions.push('Product should occupy 60-80% of frame - crop tighter or zoom in');
    }

    if (avgBackgroundQuality < 70) {
      suggestions.push('Use clean, neutral backgrounds - avoid clutter and distractions');
    }

    if (avgLighting < 70) {
      suggestions.push('Improve lighting - use natural light or softbox, avoid harsh shadows');
    }

    if (avgClarity < 70) {
      suggestions.push('Ensure photos are in sharp focus - use tripod and good camera');
    }

    // Collect unique suggestions from individual photos
    const allSuggestions = validAnalyses
      .flatMap(a => a.suggestions || [])
      .filter((s, i, arr) => arr.indexOf(s) === i) // unique only
      .slice(0, 5); // top 5

    const response = {
      ok: true,
      requestId,
      processingTime: `${elapsed}s`,
      
      // Overall metrics
      overallScore: avgScore,
      photoCount: photos.length,
      analyzedCount: validAnalyses.length,
      failedCount: failedCount,
      
      // Average scores
      averageScores: {
        productDominance: avgProductDominance,
        backgroundQuality: avgBackgroundQuality,
        lighting: avgLighting,
        clarity: avgClarity,
        colorBalance: avgColorBalance,
      },
      
      // Individual photo analyses
      analyses: analyses,
      
      // Issues and suggestions
      issues: issues,
      suggestions: [...new Set([...suggestions, ...allSuggestions])].slice(0, 10), // top 10 unique
      
      // Platform requirements
      platformRequirements: requirements,
      
      // Summary
      summary: {
        excellent: validAnalyses.filter(a => a.score >= 85).length,
        good: validAnalyses.filter(a => a.score >= 70 && a.score < 85).length,
        needsImprovement: validAnalyses.filter(a => a.score < 70).length,
      },
    };

    console.log(`[${requestId}] Response: ${avgScore}/100 overall, ${validAnalyses.length}/${photos.length} analyzed`);

    return NextResponse.json(response);

  } catch (error: any) {
    console.error(`[${requestId}] Batch analysis error:`, error);

    // Handle validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: 'validation_error',
            message: 'Invalid request data',
            details: error.errors,
            requestId,
          },
        },
        { status: 400 }
      );
    }

    // Handle other errors
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: 'internal_error',
          message: error.message || 'Internal server error',
          requestId,
        },
      },
      { status: 500 }
    );
  }
}
