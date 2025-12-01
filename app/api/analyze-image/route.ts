export const runtime = 'nodejs'; // Force Node.js runtime for sharp
export const preferredRegion = 'iad1'; // Stable region
export const maxDuration = 60; // 60 second timeout

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { calculateDeterministicScore } from '@/lib/photoScoring';
import { randomUUID } from 'crypto';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const imageFile = formData.get('image') as File;
    
    if (!imageFile) {
      return NextResponse.json(
        { success: false, error: 'No image file provided' },
        { status: 400 }
      );
    }

    console.log('[Analyze Image] Processing:', imageFile.name, imageFile.size, 'bytes');

    // Upload to Supabase first
    const bytes = await imageFile.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const uniqueId = randomUUID();
    const filename = `analysis-${uniqueId}-${Date.now()}.jpg`;
    
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from('product-images')
      .upload(filename, buffer, {
        contentType: 'image/jpeg',
        cacheControl: 'no-cache'
      });

    if (uploadError) {
      throw new Error(`Upload failed: ${uploadError.message}`);
    }

    const { data: urlData } = supabaseAdmin.storage
      .from('product-images')
      .getPublicUrl(filename);
    
    const imageUrl = urlData.publicUrl;
    console.log('[Analyze Image] Uploaded to:', imageUrl);

    // Calculate deterministic R.A.N.K. 285™ score
    console.log('[Analyze Image] Calculating deterministic score...');
    console.log('[Analyze Image] Buffer hash:', buffer.slice(0, 16).toString('hex'));
    const photoAnalysis = await calculateDeterministicScore(buffer);
    
    console.log('[Analyze Image] Deterministic Score:', photoAnalysis.score);
    console.log('[Analyze Image] Metrics:', photoAnalysis.metrics);

    return NextResponse.json({
      success: true,
      imageUrl: imageUrl,
      score: photoAnalysis.score,
      subscores: photoAnalysis.metrics,
      suggestions: photoAnalysis.suggestions,
      canOptimize: true,
      overallAssessment: `Photo scored ${photoAnalysis.score}/100 using R.A.N.K. 285™ deterministic analysis`,
      strengths: photoAnalysis.score >= 80 ? ['High quality image', 'Professional presentation'] : [],
      issues: photoAnalysis.suggestions.length > 0 ? ['See suggestions for improvements'] : []
    });

  } catch (error: any) {
    console.error('[Analyze Image] Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to analyze image'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    endpoint: '/api/analyze-image',
    method: 'POST',
    description: 'Analyzes product photos using R.A.N.K. 285™ deterministic scoring',
    accepts: 'multipart/form-data with "image" field',
    scoring: 'Deterministic 10-metric weighted analysis'
  });
}
