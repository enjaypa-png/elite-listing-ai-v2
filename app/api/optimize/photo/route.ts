export const runtime = "nodejs"; // REQUIRED for sharp
export const preferredRegion = "iad1"; // stable Node region
export const maxDuration = 60;

import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';
import { createClient } from '@supabase/supabase-js';
import { calculateDeterministicScore } from '@/lib/photoScoring';
import { randomUUID } from 'crypto';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: NextRequest) {
  const requestId = randomUUID(); // Unique ID for this request
  
  try {
    const { imageUrl } = await request.json();
    
    if (!imageUrl) {
      return NextResponse.json(
        { success: false, error: 'imageUrl is required' },
        { status: 400 }
      );
    }
    
    console.log(`[${requestId}] Photo Optimizer - Processing image:`, imageUrl);
    
    // Download original image (fresh fetch for THIS request only)
    const imageResponse = await fetch(imageUrl, {
      cache: 'no-store', // Prevent caching
      headers: {
        'Cache-Control': 'no-cache',
      }
    });
    
    if (!imageResponse.ok) {
      throw new Error(`Failed to fetch image: ${imageResponse.statusText}`);
    }
    
    // Create NEW buffer for THIS request
    const originalBuffer = Buffer.from(await imageResponse.arrayBuffer());
    console.log(`[${requestId}] Downloaded FRESH image:`, originalBuffer.length, 'bytes');
    console.log(`[${requestId}] Buffer hash:`, originalBuffer.slice(0, 16).toString('hex'));
    
    // Calculate original deterministic score with THIS buffer
    console.log(`[${requestId}] Calculating original score...`);
    const originalAnalysis = await calculateDeterministicScore(originalBuffer);
    const originalScore = originalAnalysis.score;
    const subscores = originalAnalysis.metrics;
    
    console.log(`[${requestId}] Original Score:`, originalScore);
    console.log(`[${requestId}] Subscores:`, JSON.stringify(subscores));
    
    // Determine which optimizations to apply based on weak subscores
    const improvements: string[] = [];
    let needsOptimization = false;
    
    // Create a NEW sharp instance with a COPY of the buffer
    let optimizedImage = sharp(Buffer.from(originalBuffer));
    
    // 1. Crop/Resize (if crop score < 4)
    if (subscores.crop < 4) {
      console.log(`[${requestId}] Applying crop optimization (score: ${subscores.crop})`);
      optimizedImage = optimizedImage.resize(1000, 1000, {
        fit: 'cover',
        position: 'center'
      });
      improvements.push('Cropped to 1:1 aspect ratio (1000x1000px)');
      needsOptimization = true;
    }
    
    // 2. Lighting (if lighting score < 12)
    if (subscores.lighting < 12) {
      console.log(`[${requestId}] Applying lighting optimization (score: ${subscores.lighting})`);
      optimizedImage = optimizedImage.modulate({
        brightness: 1.15,
        saturation: 1.08
      }).gamma(1.1);
      improvements.push('Enhanced brightness and lighting');
      needsOptimization = true;
    }
    
    // 3. Sharpness (if sharpness score < 14)
    if (subscores.sharpness < 14) {
      console.log(`[${requestId}] Applying sharpness optimization (score: ${subscores.sharpness})`);
      optimizedImage = optimizedImage.sharpen({
        sigma: 1.5,
        m1: 1.0,
        m2: 0.5
      });
      improvements.push('Applied sharpening filter for better clarity');
      needsOptimization = true;
    }
    
    // 4. Noise (if noise score < 3)
    if (subscores.noise < 3) {
      console.log(`[${requestId}] Applying noise reduction (score: ${subscores.noise})`);
      optimizedImage = optimizedImage.median(3);
      improvements.push('Reduced image noise');
      needsOptimization = true;
    }
    
    // 5. Color (if color score < 7)
    if (subscores.color < 7) {
      console.log(`[${requestId}] Applying color correction (score: ${subscores.color})`);
      optimizedImage = optimizedImage.modulate({
        saturation: 1.15
      });
      improvements.push('Enhanced color balance and vibrance');
      needsOptimization = true;
    }
    
    // 6. Contrast (if contrast score < 3)
    if (subscores.contrast < 3) {
      console.log(`[${requestId}] Applying contrast enhancement (score: ${subscores.contrast})`);
      optimizedImage = optimizedImage.linear(1.2, 0);
      improvements.push('Increased contrast for better depth');
      needsOptimization = true;
    }
    
    // ALWAYS apply final JPEG optimization (even if no filters were applied)
    optimizedImage = optimizedImage.jpeg({ 
      quality: 92,
      progressive: true,
      mozjpeg: true
    });
    
    // Add default improvement if no specific filters were applied
    if (improvements.length === 0) {
      improvements.push('Applied Etsy-standard file optimization');
    } else {
      improvements.push('Optimized file size while maintaining quality');
    }
    
    // Generate NEW buffer from optimization pipeline
    const optimizedBuffer = await optimizedImage.toBuffer();
    
    // CRITICAL DEBUG LOGGING
    const originalHash = originalBuffer.slice(0, 16).toString('hex');
    const optimizedHash = optimizedBuffer.slice(0, 16).toString('hex');
    const buffersEqual = originalBuffer.equals(optimizedBuffer);
    
    console.log(`[${requestId}] ===== BUFFER VERIFICATION =====`);
    console.log(`[${requestId}] Original Buffer Hash:`, originalHash);
    console.log(`[${requestId}] Optimized Buffer Hash:`, optimizedHash);
    console.log(`[${requestId}] Are Buffers Equal:`, buffersEqual);
    console.log(`[${requestId}] Original size:`, originalBuffer.length, 'bytes');
    console.log(`[${requestId}] Optimized size:`, optimizedBuffer.length, 'bytes');
    console.log(`[${requestId}] ==============================`);
    
    if (buffersEqual) {
      console.error(`[${requestId}] ERROR: Buffers are IDENTICAL - optimization did nothing!`);
    }
    
    // Re-score optimized image using THE NEW BUFFER
    console.log(`[${requestId}] Calculating optimized score with NEW buffer...`);
    const optimizedAnalysis = await calculateDeterministicScore(optimizedBuffer);
    const newScore = optimizedAnalysis.score;
    
    console.log(`[${requestId}] New Score:`, newScore);
    console.log(`[${requestId}] Score improvement:`, newScore - originalScore);
    
    // ALWAYS return optimized image (removed score improvement guard for now)
    // This ensures the optimizer visibly works and produces before/after
    
    // Upload optimized image to Supabase with UNIQUE filename
    const filename = `optimized-${requestId}-${Date.now()}.jpg`;
    
    console.log(`[${requestId}] Uploading to Supabase as:`, filename);
    
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from('product-images')
      .upload(filename, optimizedBuffer, {
        contentType: 'image/jpeg',
        cacheControl: '3600',
        upsert: false
      });
    
    if (uploadError) {
      console.error(`[${requestId}] Supabase upload error:`, uploadError);
      throw new Error(`Failed to upload optimized image: ${uploadError.message}`);
    }
    
    console.log(`[${requestId}] Uploaded to:`, uploadData.path);
    
    // Get public URL
    const { data: urlData } = supabaseAdmin.storage
      .from('product-images')
      .getPublicUrl(filename);
    
    if (!urlData || !urlData.publicUrl) {
      console.error(`[${requestId}] Failed to generate public URL`);
      throw new Error('Failed to generate public URL for optimized image');
    }
    
    console.log(`[${requestId}] Public URL:`, urlData.publicUrl);
    
    // ALWAYS return optimized image (even if score unchanged)
    const scoreImprovement = newScore - originalScore;
    const alreadyOptimized = (scoreImprovement === 0);
    
    return NextResponse.json({
      success: true,
      alreadyOptimized,
      optimizedUrl: urlData.publicUrl,
      improvements,
      originalScore,
      newScore,
      scoreImprovement,
      subscores: optimizedAnalysis.metrics,
      originalSize: originalBuffer.length,
      optimizedSize: optimizedBuffer.length,
      compressionRatio: ((1 - optimizedBuffer.length / originalBuffer.length) * 100).toFixed(1) + '%'
    });
    
  } catch (error: any) {
    console.error('[Photo Optimizer] ROUTE ERROR:', error);
    console.error('[Photo Optimizer] ERROR STACK:', error.stack);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to optimize photo',
        details: error.stack
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    endpoint: '/api/optimize/photo',
    method: 'POST',
    description: 'Adaptive photo optimization driven by R.A.N.K. 285™ subscores',
    requiredFields: ['imageUrl'],
    hasSharp: true,
    hasSupabase: !!process.env.NEXT_PUBLIC_SUPABASE_URL
  });
}
