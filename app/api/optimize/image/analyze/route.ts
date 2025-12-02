export const runtime = 'nodejs';
export const preferredRegion = 'iad1';
export const maxDuration = 60;

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { scorePhoto } from '@/lib/photoScoring_v2';

// Input validation schema
const AnalyzeImageRequestSchema = z.object({
  imageUrl: z.string().min(1, 'Image URL is required'),
  platform: z.string().default('etsy'),
  listingId: z.string().optional(),
  userId: z.string().optional(),
  saveToDatabase: z.boolean().default(false),
});

// GET /api/optimize/image/analyze - Health check endpoint
export async function GET() {
  return NextResponse.json({
    ok: true,
    status: 'R.A.N.K. 285™ deterministic image analysis ready',
    scoring: 'Deterministic 10-metric weighted analysis'
  });
}

// POST /api/optimize/image/analyze - Analyze product image quality with deterministic scoring
export async function POST(request: NextRequest) {
  try {
    // Parse and validate input
    const body = await request.json();
    const validatedInput = AnalyzeImageRequestSchema.parse(body);
    const { imageUrl } = validatedInput;

    console.log('[Image Analyze] Fetching image from:', imageUrl);

    // Download image from URL
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      throw new Error(`Failed to fetch image: ${imageResponse.statusText}`);
    }

    const imageBuffer = Buffer.from(await imageResponse.arrayBuffer());
    console.log('[Image Analyze] Downloaded:', imageBuffer.length, 'bytes');

    // Calculate deterministic score
    const photoAnalysis = await scorePhoto(imageBuffer, 'small_crafts');
    
    console.log('[Image Analyze] Deterministic Score:', photoAnalysis.score);
    console.log('[Image Analyze] Breakdown:', photoAnalysis.breakdown);

    return NextResponse.json({
      ok: true,
      success: true,
      score: photoAnalysis.score,
      breakdown: photoAnalysis.breakdown,
      suggestions: photoAnalysis.suggestions,
      feedback: `Deterministic R.A.N.K. 285™ score: ${photoAnalysis.score}/100`
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
