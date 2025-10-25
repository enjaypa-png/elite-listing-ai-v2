import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { z } from 'zod';
import { randomUUID } from 'crypto';

// Validate OpenAI API key
if (!process.env.OPENAI_API_KEY) {
  console.warn('⚠️  OPENAI_API_KEY not set in environment variables');
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

// Input validation schema
const AnalyzeImageRequestSchema = z.object({
  imageUrl: z.string().url('Image URL must be a valid URL'),
  platform: z.string().min(1, 'Platform is required').default('etsy'),
});

// Platform-specific requirements
const PLATFORM_REQUIREMENTS = {
  etsy: {
    minResolution: 2000,
    preferredAspectRatio: '1:1',
    minProductDominance: 70, // percentage
    maxFileSize: 10 * 1024 * 1024, // 10MB
  },
  shopify: {
    minResolution: 2048,
    preferredAspectRatio: '1:1',
    minProductDominance: 65,
    maxFileSize: 20 * 1024 * 1024,
  },
  ebay: {
    minResolution: 1600,
    preferredAspectRatio: '1:1',
    minProductDominance: 70,
    maxFileSize: 12 * 1024 * 1024,
  },
};

// GET /api/optimize/image/analyze - Health check endpoint
export async function GET() {
  return NextResponse.json({
    ok: true,
    status: 'image analysis endpoint ready',
    model: 'gpt-4o',
    hasApiKey: !!process.env.OPENAI_API_KEY,
  });
}

// POST /api/optimize/image/analyze - Analyze product image quality with technical compliance
export async function POST(request: NextRequest) {
  const requestId = randomUUID();

  try {
    console.log(`[${requestId}] Processing enhanced image analysis request...`);

    // Parse and validate input
    const body = await request.json();
    const validatedInput = AnalyzeImageRequestSchema.parse(body);
    const { imageUrl, platform } = validatedInput;

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

    const requirements = PLATFORM_REQUIREMENTS[platform as keyof typeof PLATFORM_REQUIREMENTS] || PLATFORM_REQUIREMENTS.etsy;

    console.log(`[${requestId}] Input validated: platform=${platform}, imageUrl=${imageUrl.substring(0, 50)}...`);

    const systemPrompt = `You are an expert e-commerce product photography analyst specializing in ${platform} listings. 
Analyze product images with strict technical compliance and platform optimization rules.

CRITICAL TECHNICAL COMPLIANCE RULES:
1. Resolution: Minimum ${requirements.minResolution}px on longest side (${platform} quality standard)
2. Aspect Ratio: Prefer ${requirements.preferredAspectRatio} (square) for uniform grid visibility
3. Product Dominance: Product must occupy ≥${requirements.minProductDominance}% of image area
4. Background: Must be clean, neutral, and non-cluttered
5. Brightness & Contrast: Must meet minimum clarity threshold (0.85 luminance index)
6. Color Balance: Avoid oversaturation; favor natural, realistic hues
7. Composition: First image must be centered with strong visual impact
8. Focus: Sharp, high-resolution focus on product details

PLATFORM ALGORITHM OPTIMIZATION:
- Detect if product is properly centered and dominant
- Check for cluttered or distracting backgrounds
- Assess color saturation and realism
- Evaluate composition for clickthrough potential
- Flag any technical issues that hurt search ranking

SCORING SYSTEM (Weighted Image Optimization Index):
- 40% Technical Compliance (resolution, aspect ratio, file quality)
- 30% Algorithm Fit (product dominance, color balance, composition)
- 20% Visual Appeal (lighting, clarity, professional appearance)
- 10% Conversion Optimization (emotional triggers, context)

Provide detailed scores, compliance checks, and specific actionable improvements.`;

    const userPrompt = `Analyze this ${platform} product image: ${imageUrl}

Provide your analysis in this exact JSON format:
{
  "lighting": <number 0-100>,
  "composition": <number 0-100>,
  "clarity": <number 0-100>,
  "appeal": <number 0-100>,
  "technicalCompliance": <number 0-100>,
  "algorithmFit": <number 0-100>,
  "productDominance": <number 0-100>,
  "backgroundQuality": <number 0-100>,
  "colorBalance": <number 0-100>,
  "feedback": "<detailed explanation of scores and compliance>",
  "complianceIssues": ["<issue 1>", "<issue 2>"],
  "suggestions": ["<specific improvement 1>", "<specific improvement 2>", "<specific improvement 3>"],
  "estimatedResolution": "<estimated resolution like 2000x2000 or unknown>",
  "aspectRatioEstimate": "<estimated aspect ratio like 1:1 or 4:3>"
}`;

    // Call OpenAI Vision API
    console.log(`[${requestId}] Calling OpenAI Vision API with enhanced analysis...`);
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        {
          role: 'user',
          content: [
            { type: 'text', text: userPrompt },
            { type: 'image_url', image_url: { url: imageUrl } },
          ],
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3,
      max_tokens: 1500,
    });

    console.log(`[${requestId}] OpenAI Vision API call successful`);

    const responseContent = completion.choices[0]?.message?.content;
    if (!responseContent) {
      throw new Error('No response from OpenAI');
    }

    // Parse AI response
    const aiResponse = JSON.parse(responseContent);
    
    // Calculate weighted overall score (Weighted Image Optimization Index)
    const technicalScore = (aiResponse.technicalCompliance || 0) * 0.4;
    const algorithmScore = (aiResponse.algorithmFit || 0) * 0.3;
    const visualScore = ((aiResponse.lighting + aiResponse.clarity) / 2) * 0.2;
    const conversionScore = (aiResponse.appeal || 0) * 0.1;
    
    const overallScore = Math.round(technicalScore + algorithmScore + visualScore + conversionScore);

    console.log(`[${requestId}] Enhanced image analysis complete. Overall score: ${overallScore}/100`);

    return NextResponse.json({
      ok: true,
      score: overallScore,
      
      // Core metrics
      lighting: aiResponse.lighting,
      composition: aiResponse.composition,
      clarity: aiResponse.clarity,
      appeal: aiResponse.appeal,
      
      // Enhanced metrics
      technicalCompliance: aiResponse.technicalCompliance || 0,
      algorithmFit: aiResponse.algorithmFit || 0,
      productDominance: aiResponse.productDominance || 0,
      backgroundQuality: aiResponse.backgroundQuality || 0,
      colorBalance: aiResponse.colorBalance || 0,
      
      // Technical details
      estimatedResolution: aiResponse.estimatedResolution || 'unknown',
      aspectRatioEstimate: aiResponse.aspectRatioEstimate || 'unknown',
      
      // Feedback and suggestions
      feedback: aiResponse.feedback,
      complianceIssues: aiResponse.complianceIssues || [],
      suggestions: aiResponse.suggestions || [],
      
      // Platform requirements
      platformRequirements: requirements,
      
      requestId,
    });

  } catch (error: any) {
    console.error(`[${requestId}] Error analyzing image:`, error);

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

    // Handle OpenAI API errors
    if (error?.status) {
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: 'openai_error',
            message: error.message || 'OpenAI API error',
            requestId,
          },
        },
        { status: error.status }
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

