export const runtime = "nodejs"; // REQUIRED for sharp
export const preferredRegion = "iad1"; // stable Node region
export const maxDuration = 60;

import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';
import { createClient } from '@supabase/supabase-js';
import { calculateDeterministicScore } from '@/lib/photoScoring';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: NextRequest) {
  try {
    const { imageUrl } = await request.json();
    
    if (!imageUrl) {
      return NextResponse.json(
        { success: false, error: 'imageUrl is required' },
        { status: 400 }
      );
    }
    
    console.log('[Photo Optimizer] Processing image:', imageUrl);
    
    // Download original image
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      throw new Error(`Failed to fetch image: ${imageResponse.statusText}`);
    }
    
    const imageBuffer = Buffer.from(await imageResponse.arrayBuffer());
    console.log('[Photo Optimizer] Downloaded image:', imageBuffer.length, 'bytes');
    
    // Calculate original deterministic score
    console.log('[Photo Optimizer] Calculating original score...');
    const originalAnalysis = await calculateDeterministicScore(imageBuffer);
    const originalScore = originalAnalysis.score;
    const subscores = originalAnalysis.metrics;
    
    console.log('[Photo Optimizer] Original Score:', originalScore);
    console.log('[Photo Optimizer] Subscores:', subscores);
    
    // Determine which optimizations to apply based on weak subscores
    const improvements: string[] = [];
    let optimizedImage = sharp(imageBuffer);
    let needsOptimization = false;
    
    // 1. Crop/Resize (if crop score < 4)
    if (subscores.crop < 4) {
      console.log('[Photo Optimizer] Applying crop optimization (score:', subscores.crop, ')');
      optimizedImage = optimizedImage.resize(1000, 1000, {
        fit: 'cover',
        position: 'center'
      });
      improvements.push('Cropped to 1:1 aspect ratio (1000x1000px)');
      needsOptimization = true;
    }
    
    // 2. Lighting (if lighting score < 12)
    if (subscores.lighting < 12) {
      console.log('[Photo Optimizer] Applying lighting optimization (score:', subscores.lighting, ')');
      optimizedImage = optimizedImage.modulate({
        brightness: 1.15,
        saturation: 1.08
      }).gamma(1.1);
      improvements.push('Enhanced brightness and lighting');
      needsOptimization = true;
    }
    
    // 3. Sharpness (if sharpness score < 14)
    if (subscores.sharpness < 14) {
      console.log('[Photo Optimizer] Applying sharpness optimization (score:', subscores.sharpness, ')');
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
      console.log('[Photo Optimizer] Applying noise reduction (score:', subscores.noise, ')');
      optimizedImage = optimizedImage.median(3);
      improvements.push('Reduced image noise');
      needsOptimization = true;
    }
    
    // 5. Color (if color score < 7)
    if (subscores.color < 7) {
      console.log('[Photo Optimizer] Applying color correction (score:', subscores.color, ')');
      optimizedImage = optimizedImage.modulate({
        saturation: 1.15
      });
      improvements.push('Enhanced color balance and vibrance');
      needsOptimization = true;
    }
    
    // 6. Contrast (if contrast score < 3)
    if (subscores.contrast < 3) {
      console.log('[Photo Optimizer] Applying contrast enhancement (score:', subscores.contrast, ')');
      optimizedImage = optimizedImage.linear(1.2, 0);
      improvements.push('Increased contrast for better depth');
      needsOptimization = true;
    }
    
    // If no optimizations needed, return original
    if (!needsOptimization) {
      console.log('[Photo Optimizer] Image already optimized, no improvements needed');
      return NextResponse.json({
        success: true,
        alreadyOptimized: true,
        message: 'Your photo has reached our optimization ceiling.',
        score: originalScore,
        optimizedUrl: imageUrl,
        improvements: []
      });
    }
    
    // Always optimize for web
    optimizedImage = optimizedImage.jpeg({ 
      quality: 92,
      progressive: true,
      mozjpeg: true
    });
    improvements.push('Optimized file size while maintaining quality');
    
    const optimizedBuffer = await optimizedImage.toBuffer();
    
    console.log('[Photo Optimizer] Original size:', imageBuffer.length, 'bytes');
    console.log('[Photo Optimizer] Optimized size:', optimizedBuffer.length, 'bytes');
    
    // Re-score optimized image
    console.log('[Photo Optimizer] Calculating optimized score...');
    const optimizedAnalysis = await calculateDeterministicScore(optimizedBuffer);
    const newScore = optimizedAnalysis.score;
    
    console.log('[Photo Optimizer] New Score:', newScore);
    console.log('[Photo Optimizer] Score improvement:', newScore - originalScore);
    
    // Only use optimized image if score improved by at least 2 points
    if (newScore < originalScore + 2) {
      console.log('[Photo Optimizer] Optimization did not improve score enough, returning original');
      return NextResponse.json({
        success: true,
        alreadyOptimized: true,
        message: 'Your photo has reached our optimization ceiling.',
        score: originalScore,
        optimizedUrl: imageUrl,
        improvements: []
      });
    }
    
    // Upload optimized image to Supabase
    const filename = `optimized-${Date.now()}.jpg`;
    
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from('product-images')
      .upload(filename, optimizedBuffer, {
        contentType: 'image/jpeg',
        cacheControl: '3600',
        upsert: false
      });
    
    if (uploadError) {
      console.error('[Photo Optimizer] Supabase upload error:', uploadError);
      throw new Error(`Failed to upload optimized image: ${uploadError.message}`);
    }
    
    console.log('[Photo Optimizer] Uploaded to:', uploadData.path);
    
    // Get public URL
    const { data: urlData } = supabaseAdmin.storage
      .from('product-images')
      .getPublicUrl(filename);
    
    if (!urlData || !urlData.publicUrl) {
      console.error('[Photo Optimizer] Failed to generate public URL');
      throw new Error('Failed to generate public URL for optimized image');
    }
    
    console.log('[Photo Optimizer] Public URL:', urlData.publicUrl);
    
    return NextResponse.json({
      success: true,
      optimizedUrl: urlData.publicUrl,
      improvements,
      originalScore,
      newScore,
      scoreImprovement: newScore - originalScore,
      originalSize: imageBuffer.length,
      optimizedSize: optimizedBuffer.length,
      compressionRatio: ((1 - optimizedBuffer.length / imageBuffer.length) * 100).toFixed(1) + '%'
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
