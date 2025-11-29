import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: NextRequest) {
  try {
    const { imageUrl, issues } = await request.json();
    
    console.log('[Photo Optimizer] Processing image:', imageUrl);
    console.log('[Photo Optimizer] Issues to fix:', issues);
    
    // Download original image
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      throw new Error(`Failed to fetch image: ${imageResponse.statusText}`);
    }
    
    const imageBuffer = Buffer.from(await imageResponse.arrayBuffer());
    
    // Get image metadata
    const metadata = await sharp(imageBuffer).metadata();
    console.log('[Photo Optimizer] Original dimensions:', metadata.width, 'x', metadata.height);
    
    // Apply optimizations based on issues
    let optimizedImage = sharp(imageBuffer);
    const improvements: string[] = [];
    
    // Always resize/crop to 1:1 aspect ratio (Etsy standard: 1000x1000px)
    optimizedImage = optimizedImage.resize(1000, 1000, {
      fit: 'cover',
      position: 'center'
    });
    improvements.push('Cropped to 1:1 aspect ratio (1000x1000px)');
    improvements.push('Centered product in frame');
    
    // Apply brightness/contrast adjustments if lighting issues detected
    if (issues && (issues.includes('lighting') || issues.includes('brightness') || issues.includes('dark'))) {
      optimizedImage = optimizedImage.modulate({
        brightness: 1.15, // Increase brightness by 15%
        saturation: 1.08  // Slightly boost saturation
      });
      improvements.push('Enhanced brightness and color saturation');
    }
    
    // Apply sharpening if clarity issues detected
    if (issues && (issues.includes('clarity') || issues.includes('sharpness') || issues.includes('blurry'))) {
      optimizedImage = optimizedImage.sharpen({
        sigma: 1.5,
        m1: 1.0,
        m2: 0.5
      });
      improvements.push('Applied sharpening filter for better clarity');
    }
    
    // Always optimize for web (high quality JPEG)
    optimizedImage = optimizedImage.jpeg({ 
      quality: 92,
      progressive: true,
      mozjpeg: true
    });
    improvements.push('Optimized file size while maintaining quality');
    
    const optimizedBuffer = await optimizedImage.toBuffer();
    
    console.log('[Photo Optimizer] Original size:', imageBuffer.length, 'bytes');
    console.log('[Photo Optimizer] Optimized size:', optimizedBuffer.length, 'bytes');
    
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
      console.error('[Photo Optimizer] Upload error:', uploadError);
      throw new Error(`Failed to upload optimized image: ${uploadError.message}`);
    }
    
    console.log('[Photo Optimizer] Uploaded to:', uploadData.path);
    
    // Get public URL
    const { data: urlData } = supabaseAdmin.storage
      .from('product-images')
      .getPublicUrl(filename);
    
    console.log('[Photo Optimizer] Public URL:', urlData.publicUrl);
    
    return NextResponse.json({
      success: true,
      optimizedUrl: urlData.publicUrl,
      improvements,
      originalSize: imageBuffer.length,
      optimizedSize: optimizedBuffer.length,
      compressionRatio: ((1 - optimizedBuffer.length / imageBuffer.length) * 100).toFixed(1) + '%'
    });
    
  } catch (error: any) {
    console.error('[Photo Optimizer] Error:', error);
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
    description: 'Optimizes product photos for Etsy listings',
    requiredFields: ['imageUrl', 'issues'],
    hasSharp: true,
    hasSupabase: !!process.env.NEXT_PUBLIC_SUPABASE_URL
  });
}
