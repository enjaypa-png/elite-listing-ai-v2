export const runtime = 'nodejs';
export const preferredRegion = 'iad1';
export const maxDuration = 60;

import { NextRequest, NextResponse } from 'next/server';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { analyzeImage } from '@/lib/photoScoring';
import { computeContentHash } from '@/lib/hash';
import { ETSY_CATEGORIES, getEtsyCategory } from '@/lib/etsy-image-standards';
import { randomUUID } from 'crypto';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Get authenticated Supabase client from request
async function getAuthenticatedClient(request: NextRequest): Promise<{
  supabase: SupabaseClient | null;
  userId: string | null;
  error: string | null;
}> {
  try {
    const authHeader = request.headers.get('Authorization');
    const accessToken = authHeader?.replace('Bearer ', '');
    
    const cookieHeader = request.headers.get('cookie') || '';
    const cookies = Object.fromEntries(
      cookieHeader.split('; ').map(c => {
        const [key, ...val] = c.split('=');
        return [key, val.join('=')];
      })
    );
    
    const sbAccessToken = cookies['sb-access-token'] || 
                         cookies[`sb-${supabaseUrl.split('//')[1]?.split('.')[0]}-auth-token`];
    
    const token = accessToken || sbAccessToken;
    
    if (!token) {
      console.log('[Auth] No token found, using service role');
      const adminClient = createClient(supabaseUrl, supabaseServiceKey);
      return { supabase: adminClient, userId: null, error: 'No authentication' };
    }
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false, autoRefreshToken: false }
    });
    
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      const adminClient = createClient(supabaseUrl, supabaseServiceKey);
      return { supabase: adminClient, userId: null, error: 'Invalid token' };
    }
    
    return { supabase, userId: user.id, error: null };
    
  } catch (error: any) {
    const adminClient = createClient(supabaseUrl, supabaseServiceKey);
    return { supabase: adminClient, userId: null, error: error.message };
  }
}

export async function POST(request: NextRequest) {
  const requestId = randomUUID();
  
  try {
    const { supabase, userId, error: authError } = await getAuthenticatedClient(request);
    
    if (!supabase) {
      return NextResponse.json(
        { success: false, error: 'Failed to initialize database client' },
        { status: 500 }
      );
    }
    
    const formData = await request.formData();
    const imageFile = formData.get('image') as File;
    const userCategory = (formData.get('category') as string) || 'craft_supplies';
    
    if (!imageFile) {
      return NextResponse.json(
        { success: false, error: 'No image file provided' },
        { status: 400 }
      );
    }

    console.log(`[${requestId}] Analyzing:`, imageFile.name, imageFile.size, 'bytes');
    console.log(`[${requestId}] Category:`, userCategory);

    const bytes = await imageFile.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Compute content hash
    const contentHash = await computeContentHash(buffer);
    console.log(`[${requestId}] Content hash:`, contentHash.substring(0, 16) + '...');
    
    // Upload to Supabase Storage
    const filename = `analysis-${requestId}-${Date.now()}.jpg`;
    const adminClient = createClient(supabaseUrl, supabaseServiceKey);
    
    const { error: uploadError } = await adminClient.storage
      .from('product-images')
      .upload(filename, buffer, {
        contentType: imageFile.type || 'image/jpeg',
        cacheControl: 'no-cache'
      });

    if (uploadError) {
      throw new Error(`Upload failed: ${uploadError.message}`);
    }

    const { data: urlData } = adminClient.storage
      .from('product-images')
      .getPublicUrl(filename);
    
    const imageUrl = urlData.publicUrl;
    console.log(`[${requestId}] Uploaded to:`, imageUrl);

    // Analyze using new Etsy-based scoring system
    console.log(`[${requestId}] Analyzing with Etsy standards...`);
    const analysis = await analyzeImage(buffer, userCategory);
    
    console.log(`[${requestId}] Score:`, analysis.score);
    console.log(`[${requestId}] Breakdown:`, analysis.breakdown);

    // Get category info for response
    const etsyCategory = getEtsyCategory(userCategory);
    const categoryInfo = ETSY_CATEGORIES[etsyCategory];

    // Persist to database if authenticated
    let analysisId: string | null = null;
    
    if (userId) {
      try {
        const { data, error: rpcError } = await supabase.rpc('f_upsert_image_analysis', {
          p_profile_name: etsyCategory,
          p_content_hash: contentHash,
          p_image_url: imageUrl,
          p_width_px: analysis.metadata.width,
          p_height_px: analysis.metadata.height,
          p_file_size_bytes: analysis.metadata.fileSize,
          p_aspect_ratio: `${analysis.metadata.width}:${analysis.metadata.height}`,
          p_file_type: imageFile.type?.split('/')[1] || 'jpeg',
          p_color_profile: 'sRGB',
          p_ppi: 72,
          p_flags: {
            clean_white_background: analysis.breakdown.background >= 80,
            product_centered: true,
            good_light: analysis.breakdown.lighting >= 75,
            sharp_focus: analysis.breakdown.sharpness >= 75,
            no_watermarks: true,
            professional_appearance: analysis.score >= 75,
          },
          p_scoring: {
            overall_score: analysis.score,
            dimensions_score: analysis.breakdown.dimensions,
            aspect_ratio_score: analysis.breakdown.aspectRatio,
            file_size_score: analysis.breakdown.fileSize,
            lighting_score: analysis.breakdown.lighting,
            sharpness_score: analysis.breakdown.sharpness,
            background_score: analysis.breakdown.background,
          },
          p_user_id: userId,
        });
        
        if (!rpcError) {
          analysisId = data;
          console.log(`[${requestId}] Persisted with ID:`, analysisId);
        }
      } catch (e) {
        console.warn(`[${requestId}] RPC persist warning:`, e);
      }
    }

    return NextResponse.json({
      success: true,
      analysisId,
      contentHash,
      imageUrl,
      
      // Core score
      score: analysis.score,
      
      // Detailed breakdown
      breakdown: analysis.breakdown,
      
      // Compliance with Etsy requirements
      compliance: analysis.compliance,
      
      // Category info
      category: analysis.category,
      categoryName: analysis.categoryName,
      categoryRequirements: analysis.categoryRequirements,
      
      // Image metadata
      metadata: analysis.metadata,
      
      // Actionable info
      suggestions: analysis.suggestions,
      canOptimize: analysis.optimizationPotential.canImprove,
      optimizationPotential: analysis.optimizationPotential,
      
      // Etsy specs for reference
      etsySpecs: {
        recommendedSize: '3000x2250',
        aspectRatio: '4:3',
        maxFileSize: '1MB',
        minWidth: '1000px',
        qualityBenchmark: 'Shortest side >= 2000px',
      },
      
      persisted: !!analysisId,
    });

  } catch (error: any) {
    console.error(`[${requestId}] Error:`, error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to analyze image' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    endpoint: '/api/analyze-image',
    method: 'POST',
    description: 'Analyzes product photos against official Etsy image requirements',
    accepts: 'multipart/form-data with "image" and optional "category" fields',
    
    // Official Etsy categories
    categories: Object.keys(ETSY_CATEGORIES),
    
    // Etsy requirements summary
    etsyRequirements: {
      recommendedSize: '3000x2250 pixels',
      aspectRatio: '4:3',
      minimumWidth: '1000 pixels',
      qualityBenchmark: 'Shortest side at least 2000 pixels',
      resolution: '72 PPI',
      maxFileSize: 'Under 1MB',
      fileTypes: ['jpg', 'gif', 'png'],
      colorProfile: 'sRGB',
      thumbnailCrop: '1:1 square (first photo)',
      recommendedPhotos: '5-10 per listing',
    },
  });
}
