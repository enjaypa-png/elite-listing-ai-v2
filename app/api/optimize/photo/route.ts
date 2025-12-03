export const runtime = "nodejs"; // REQUIRED for sharp
export const preferredRegion = "iad1"; // stable Node region
export const maxDuration = 60;

import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { scorePhoto, isAlreadyOptimal } from '@/lib/photoScoring_v2';
import { randomUUID } from 'crypto';

// Lazy initialization to avoid build-time errors
let _supabaseAdminPhoto: SupabaseClient | null = null;

function getSupabaseAdminPhoto(): SupabaseClient {
  if (!_supabaseAdminPhoto) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Supabase credentials not configured');
    }
    _supabaseAdminPhoto = createClient(supabaseUrl, supabaseServiceKey);
  }
  return _supabaseAdminPhoto;
}

export async function POST(request: NextRequest) {
  const requestId = randomUUID();
  
  try {
    const supabaseAdmin = getSupabaseAdminPhoto();
    const body = await request.json();
    const { imageUrl, category = 'small_crafts' } = body;
    
    if (!imageUrl) {
      return NextResponse.json(
        { success: false, error: 'imageUrl is required' },
        { status: 400 }
      );
    }
    
    console.log(`[${requestId}] Photo Optimizer - Processing image:`, imageUrl);
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
    console.log(`[${requestId}] Downloaded image:`, originalBuffer.length, 'bytes');
    
    // STEP 1: Analyze original image FIRST
    console.log(`[${requestId}] Analyzing original image...`);
    const originalAnalysis = await scorePhoto(originalBuffer, category);
    const originalScore = originalAnalysis.score;
    const originalMetadata = originalAnalysis.metadata;
    
    console.log(`[${requestId}] Original Score:`, originalScore);
    console.log(`[${requestId}] Original Metadata:`, originalMetadata);
    
    // STEP 2: Check if ALREADY OPTIMAL (before doing any work)
    if (isAlreadyOptimal(originalAnalysis)) {
      console.log(`[${requestId}] Image is already optimal - skipping processing`);
      return NextResponse.json({
        success: true,
        alreadyOptimized: true,
        optimizedUrl: imageUrl, // Return ORIGINAL URL
        improvements: [], // MUST BE EMPTY
        originalScore,
        newScore: originalScore,
        scoreImprovement: 0,
        breakdown: originalAnalysis.breakdown,
        message: 'Image is fully optimized for Etsy',
        metadata: originalMetadata
      });
    }
    
    // STEP 3: Determine what optimizations are NEEDED
    const needsCrop = Math.abs(originalMetadata.aspectRatio - 1.0) > 0.05;
    const needsResize = originalMetadata.width < 950 || originalMetadata.width > 1100 ||
                       originalMetadata.height < 950 || originalMetadata.height > 1100;
    const needsSharpening = originalMetadata.sharpness < 80;
    const needsLightingUp = originalMetadata.brightness < 50;
    const needsLightingDown = originalMetadata.brightness > 75;
    const needsCompression = originalMetadata.fileSize / 1024 < 400 || originalMetadata.fileSize / 1024 > 2048;
    
    console.log(`[${requestId}] Optimization needs:`, {
      needsCrop,
      needsResize,
      needsSharpening,
      needsLightingUp,
      needsLightingDown,
      needsCompression
    });
    
    // STEP 4: Apply ONLY needed optimizations
    const improvements: string[] = [];
    let optimizedImage = sharp(Buffer.from(originalBuffer));
    
    // Crop/Resize to 1:1 if needed
    if (needsCrop || needsResize) {
      console.log(`[${requestId}] Applying crop to 1:1 ratio`);
      optimizedImage = optimizedImage.resize(1000, 1000, {
        fit: 'cover',
        position: 'center'
      });
      improvements.push('Cropped to 1:1 aspect ratio (1000x1000px)');
    }
    
    // Sharpening if needed
    if (needsSharpening) {
      console.log(`[${requestId}] Applying sharpening (current: ${originalMetadata.sharpness})`);
      optimizedImage = optimizedImage.sharpen({
        sigma: 2.0,
        m1: 1.2,
        m2: 0.7
      });
      improvements.push('Applied sharpening filter for better clarity');
    }
    
    // Lighting adjustment if needed
    if (needsLightingUp) {
      console.log(`[${requestId}] Brightening image (current: ${originalMetadata.brightness})`);
      optimizedImage = optimizedImage
        .modulate({ brightness: 1.25, saturation: 1.1 })
        .gamma(1.18);
      improvements.push('Enhanced brightness and lighting');
    } else if (needsLightingDown) {
      console.log(`[${requestId}] Reducing brightness (current: ${originalMetadata.brightness})`);
      optimizedImage = optimizedImage
        .modulate({ brightness: 0.88 })
        .gamma(0.95);
      improvements.push('Balanced overexposure');
    }
    
    // File size optimization
    if (needsCompression || improvements.length > 0) {
      console.log(`[${requestId}] Applying JPEG optimization`);
      optimizedImage = optimizedImage.jpeg({
        quality: 92,
        progressive: true,
        mozjpeg: true
      });
      if (needsCompression) {
        improvements.push('Optimized file size while maintaining quality');
      }
    }
    
    // If somehow nothing was needed but we got here, apply basic optimization
    if (improvements.length === 0) {
      console.log(`[${requestId}] Applying basic Etsy optimization`);
      optimizedImage = optimizedImage
        .resize(1000, 1000, { fit: 'cover', position: 'center' })
        .jpeg({ quality: 92, progressive: true, mozjpeg: true });
      improvements.push('Applied Etsy-standard optimization');
    }
    
    // STEP 5: Generate optimized buffer
    const optimizedBuffer = await optimizedImage.toBuffer();
    
    console.log(`[${requestId}] Original size:`, originalBuffer.length, 'bytes');
    console.log(`[${requestId}] Optimized size:`, optimizedBuffer.length, 'bytes');
    
    // STEP 6: Score optimized image
    console.log(`[${requestId}] Scoring optimized image...`);
    const optimizedAnalysis = await scorePhoto(optimizedBuffer, category);
    const newScore = optimizedAnalysis.score;
    const scoreImprovement = newScore - originalScore;
    
    console.log(`[${requestId}] New Score:`, newScore);
    console.log(`[${requestId}] Score improvement:`, scoreImprovement);
    
    // STEP 7: Upload optimized image to Supabase
    const filename = `optimized-${requestId}-${Date.now()}.jpg`;
    
    console.log(`[${requestId}] Uploading to Supabase:`, filename);
    
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from('product-images')
      .upload(filename, optimizedBuffer, {
        contentType: 'image/jpeg',
        cacheControl: 'no-cache',
        upsert: false
      });
    
    if (uploadError) {
      console.error(`[${requestId}] Supabase upload error:`, uploadError);
      throw new Error(`Failed to upload optimized image: ${uploadError.message}`);
    }
    
    const { data: urlData } = supabaseAdmin.storage
      .from('product-images')
      .getPublicUrl(filename);
    
    if (!urlData || !urlData.publicUrl) {
      throw new Error('Failed to generate public URL for optimized image');
    }
    
    console.log(`[${requestId}] Success! URL:`, urlData.publicUrl);
    
    // STEP 8: Return results
    return NextResponse.json({
      success: true,
      alreadyOptimized: false,
      optimizedUrl: urlData.publicUrl,
      improvements, // List of actual improvements made
      originalScore,
      newScore,
      scoreImprovement,
      breakdown: optimizedAnalysis.breakdown,
      message: scoreImprovement > 0 
        ? `Photo optimized successfully! Score improved by ${scoreImprovement} points.`
        : 'Photo optimized for Etsy standards.',
      metadata: optimizedAnalysis.metadata,
      originalSize: originalBuffer.length,
      optimizedSize: optimizedBuffer.length,
      compressionRatio: ((1 - optimizedBuffer.length / originalBuffer.length) * 100).toFixed(1) + '%'
    });
    
  } catch (error: any) {
    console.error(`[${requestId}] ROUTE ERROR:`, error);
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
    optionalFields: ['category'],
    hasSharp: true,
    hasSupabase: !!process.env.NEXT_PUBLIC_SUPABASE_URL
  });
}
