export const runtime = 'nodejs';
export const preferredRegion = 'iad1';
export const maxDuration = 60;

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { analyzeImage } from '@/lib/photoScoring';

// Input validation schema
const AnalyzeImageRequestSchema = z.object({
  imageUrl: z.string().min(1, 'Image URL is required'),
  platform: z.string().default('etsy'),
  category: z.string().default('craft_supplies'),
  listingId: z.string().optional(),
  userId: z.string().optional(),
  saveToDatabase: z.boolean().default(false),
});

// GET /api/optimize/image/analyze - Health check endpoint
export async function GET() {
  return NextResponse.json({
    ok: true,
    status: 'Etsy Image Analyzer ready',
    scoring: 'Based on official Etsy image requirements'
  });
}

// POST /api/optimize/image/analyze - Analyze product image quality
export async function POST(request: NextRequest) {
  try {
    // Parse and validate input
    const body = await request.json();
    const validatedInput = AnalyzeImageRequestSchema.parse(body);
    const { imageUrl, category } = validatedInput;

    console.log('[Image Analyze] Fetching image from:', imageUrl);

    // Download image from URL
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      throw new Error(`Failed to fetch image: ${imageResponse.statusText}`);
    }

    const imageBuffer = Buffer.from(await imageResponse.arrayBuffer());
    console.log('[Image Analyze] Downloaded:', imageBuffer.length, 'bytes');

    // Analyze using Etsy standards
    const analysis = await analyzeImage(imageBuffer, category);
    
    console.log('[Image Analyze] Score:', analysis.score);
    console.log('[Image Analyze] Breakdown:', analysis.breakdown);

    return NextResponse.json({
      ok: true,
      success: true,
      score: analysis.score,
      breakdown: analysis.breakdown,
      compliance: analysis.compliance,
      suggestions: analysis.suggestions,
      metadata: analysis.metadata,
      categoryRequirements: analysis.categoryRequirements,
      feedback: `Etsy compliance score: ${analysis.score}/100`
    });

  } catch (error: any) {
    console.error('[Image Analyze] Error:', error);

    // Handle validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: 'validation_error',
            message: 'Invalid request data',
            details: error.errors,
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
        },
      },
      { status: 500 }
    );
  }
}
