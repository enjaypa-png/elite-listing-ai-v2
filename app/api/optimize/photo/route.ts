export const runtime = "nodejs";
export const preferredRegion = "iad1";
export const maxDuration = 60;

import { NextRequest, NextResponse } from 'next/server';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { optimizeImage } from '@/lib/photoOptimizer';
import { randomUUID } from 'crypto';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

export async function POST(request: NextRequest) {
  const requestId = randomUUID();
  
  try {
    const body = await request.json();
    const { imageUrl, category = 'craft_supplies' } = body;
    
    if (!imageUrl) {
      return NextResponse.json(
        { success: false, error: 'imageUrl is required' },
        { status: 400 }
      );
    }
    
    console.log(`[${requestId}] Optimizing image:`, imageUrl);
    console.log(`[${requestId}] Category:`, category);
    
    // Download original image
    const imageResponse = await fetch(imageUrl, {
      cache: 'no-store',
      headers: { 'Cache-Control': 'no-cache' }
    });
    
    if (!imageResponse.ok) {
      throw new Error(`Failed to fetch image: ${imageResponse.statusText}`);
    }
    
    const originalBuffer = Buffer.from(await imageResponse.arrayBuffer());
    console.log(`[${requestId}] Downloaded:`, originalBuffer.length, 'bytes');
    
    // Optimize using new Etsy-based optimizer
    const result = await optimizeImage(originalBuffer, category);
    
    // If already optimized, return original
    if (result.alreadyOptimized) {
      console.log(`[${requestId}] Image already meets Etsy standards`);
      return NextResponse.json({
        success: true,
        alreadyOptimized: true,
        optimizedUrl: imageUrl,
        improvements: [],
        originalScore: result.originalScore,
        newScore: result.newScore,
        scoreImprovement: 0,
        breakdown: result.analysis.breakdown,
        message: result.message,
        metadata: result.analysis.metadata,
      });
    }
    
    // Upload optimized image to Supabase
    const filename = `optimized-${requestId}-${Date.now()}.jpg`;
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    
    console.log(`[${requestId}] Uploading optimized image:`, filename);
    
    const { error: uploadError } = await supabaseAdmin.storage
      .from('product-images')
      .upload(filename, result.buffer, {
        contentType: 'image/jpeg',
        cacheControl: 'no-cache',
        upsert: false
      });
    
    if (uploadError) {
      throw new Error(`Failed to upload: ${uploadError.message}`);
    }
    
    const { data: urlData } = supabaseAdmin.storage
      .from('product-images')
      .getPublicUrl(filename);
    
    console.log(`[${requestId}] Optimization complete`);
    console.log(`[${requestId}] Score: ${result.originalScore} -> ${result.newScore} (+${result.scoreImprovement})`);
    
    return NextResponse.json({
      success: true,
      alreadyOptimized: false,
      optimizedUrl: urlData.publicUrl,
      improvements: result.improvements,
      originalScore: result.originalScore,
      newScore: result.newScore,
      scoreImprovement: result.scoreImprovement,
      breakdown: result.analysis.breakdown,
      compliance: result.analysis.compliance,
      message: result.message,
      metadata: result.analysis.metadata,
      
      // File size comparison
      originalSize: originalBuffer.length,
      optimizedSize: result.buffer.length,
      compressionRatio: ((1 - result.buffer.length / originalBuffer.length) * 100).toFixed(1) + '%',
    });
    
  } catch (error: any) {
    console.error(`[${requestId}] Error:`, error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to optimize photo' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    endpoint: '/api/optimize/photo',
    method: 'POST',
    description: 'Optimizes photos to meet official Etsy image requirements',
    requiredFields: ['imageUrl'],
    optionalFields: ['category'],
    
    optimizationTargets: {
      dimensions: '3000x2250 (4:3 ratio)',
      minShortestSide: '2000px',
      maxFileSize: '1MB',
      format: 'JPEG progressive',
      sharpening: 'Applied if needed',
      brightness: 'Adjusted if too dark/bright',
    },
  });
}
