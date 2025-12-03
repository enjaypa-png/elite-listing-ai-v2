export const runtime = 'nodejs'; // Force Node.js runtime for sharp
export const preferredRegion = 'iad1'; // Stable region
export const maxDuration = 60; // 60 second timeout

import { NextRequest, NextResponse } from 'next/server';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { scorePhoto } from '@/lib/photoScoring_v2';
import { randomUUID } from 'crypto';

// Lazy initialization to avoid build-time errors
let _supabaseAdmin: SupabaseClient | null = null;

function getSupabaseAdmin(): SupabaseClient {
  if (!_supabaseAdmin) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Supabase credentials not configured');
    }
    _supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
  }
  return _supabaseAdmin;
}

export async function POST(request: NextRequest) {
  const requestId = randomUUID();
  
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const formData = await request.formData();
    const imageFile = formData.get('image') as File;
    const userCategory = (formData.get('category') as string) || 'small_crafts';
    
    if (!imageFile) {
      return NextResponse.json(
        { success: false, error: 'No image file provided' },
        { status: 400 }
      );
    }

    console.log(`[${requestId}] Analyzing:`, imageFile.name, imageFile.size, 'bytes');
    console.log(`[${requestId}] Category:`, userCategory);

    // Upload to Supabase first
    const bytes = await imageFile.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const filename = `analysis-${requestId}-${Date.now()}.jpg`;
    
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
    console.log(`[${requestId}] Uploaded to:`, imageUrl);

    // Calculate deterministic R.A.N.K. 285™ score
    console.log(`[${requestId}] Calculating score...`);
    const photoAnalysis = await scorePhoto(buffer, userCategory);
    
    console.log(`[${requestId}] Score:`, photoAnalysis.score);
    console.log(`[${requestId}] Breakdown:`, photoAnalysis.breakdown);
    console.log(`[${requestId}] Metadata:`, photoAnalysis.metadata);

    // Determine strengths based on breakdown scores
    const strengths: string[] = [];
    if (photoAnalysis.breakdown.technical >= 80) {
      strengths.push('Good technical quality (lighting, sharpness)');
    }
    if (photoAnalysis.breakdown.presentation >= 80) {
      strengths.push('Professional presentation and staging');
    }
    if (photoAnalysis.breakdown.composition >= 80) {
      strengths.push('Well-composed with ideal aspect ratio');
    }
    if (photoAnalysis.score >= 85) {
      strengths.push('High overall quality for Etsy listing');
    }

    // Determine issues from metadata analysis
    const issues: string[] = [];
    const meta = photoAnalysis.metadata;
    
    if (meta.brightness < 50) {
      issues.push('Low lighting - image appears dark');
    } else if (meta.brightness > 75) {
      issues.push('Overexposed - image too bright');
    }
    
    if (meta.sharpness < 65) {
      issues.push('Image lacks sharpness');
    }
    
    if (Math.abs(meta.aspectRatio - 1.0) > 0.1) {
      issues.push('Non-square aspect ratio');
    }
    
    if (meta.fileSize / 1024 > 3000) {
      issues.push('File size too large');
    } else if (meta.fileSize / 1024 < 200) {
      issues.push('File may be over-compressed');
    }

    // Determine if optimization would help
    const canOptimize = photoAnalysis.score < 90 || 
                       photoAnalysis.suggestions.length > 0 ||
                       Math.abs(meta.aspectRatio - 1.0) > 0.05;

    return NextResponse.json({
      success: true,
      imageUrl: imageUrl,
      score: photoAnalysis.score,
      breakdown: photoAnalysis.breakdown,
      category: photoAnalysis.category,
      suggestions: photoAnalysis.suggestions,
      metadata: photoAnalysis.metadata,
      canOptimize,
      overallAssessment: `Photo scored ${photoAnalysis.score}/100 using R.A.N.K. 285™ deterministic analysis`,
      strengths,
      issues
    });

  } catch (error: any) {
    console.error(`[${requestId}] Error:`, error);
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
    accepts: 'multipart/form-data with "image" and optional "category" fields',
    categories: [
      'small_jewelry', 'flat_artwork', 'wearables_clothing', 'wearables_accessories',
      'home_decor_wall_art', 'furniture', 'small_crafts', 'craft_supplies',
      'vintage_items', 'digital_products'
    ]
  });
}
