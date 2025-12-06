export const runtime = 'nodejs';
export const preferredRegion = 'iad1';
export const maxDuration = 60;

import { NextRequest, NextResponse } from 'next/server';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { scorePhoto } from '@/lib/photoScoring_v2';
import { computeContentHash } from '@/lib/hash';
import { persistImageAnalysis, formatAspectRatio, deriveFlags } from '@/lib/image-analysis-rpc';
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
    // Check for auth header
    const authHeader = request.headers.get('Authorization');
    const accessToken = authHeader?.replace('Bearer ', '');
    
    // Check cookies for Supabase auth
    const cookieHeader = request.headers.get('cookie') || '';
    const cookies = Object.fromEntries(
      cookieHeader.split('; ').map(c => {
        const [key, ...val] = c.split('=');
        return [key, val.join('=')];
      })
    );
    
    // Look for various Supabase cookie formats
    const sbAccessToken = cookies['sb-access-token'] || 
                         cookies[`sb-${supabaseUrl.split('//')[1]?.split('.')[0]}-auth-token`];
    
    const token = accessToken || sbAccessToken;
    
    if (!token) {
      // For development/testing, allow unauthenticated with service role
      // In production, you'd want to remove this fallback
      console.log('[Auth] No token found, using service role for development');
      const adminClient = createClient(supabaseUrl, supabaseServiceKey);
      return { supabase: adminClient, userId: null, error: 'No authentication - using service role' };
    }
    
    // Create client and verify token
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false, autoRefreshToken: false }
    });
    
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      console.log('[Auth] Token validation failed:', error?.message);
      // Fallback to service role for development
      const adminClient = createClient(supabaseUrl, supabaseServiceKey);
      return { supabase: adminClient, userId: null, error: 'Invalid token - using service role' };
    }
    
    console.log('[Auth] Authenticated user:', user.id);
    return { supabase, userId: user.id, error: null };
    
  } catch (error: any) {
    console.error('[Auth] Error:', error);
    const adminClient = createClient(supabaseUrl, supabaseServiceKey);
    return { supabase: adminClient, userId: null, error: error.message };
  }
}

export async function POST(request: NextRequest) {
  const requestId = randomUUID();
  
  try {
    // Get authenticated client
    const { supabase, userId, error: authError } = await getAuthenticatedClient(request);
    
    if (!supabase) {
      return NextResponse.json(
        { success: false, error: 'Failed to initialize database client' },
        { status: 500 }
      );
    }
    
    if (authError) {
      console.log(`[${requestId}] Auth note:`, authError);
    }
    
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
    console.log(`[${requestId}] User ID:`, userId || 'anonymous');

    // Get image bytes
    const bytes = await imageFile.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Compute content hash for deduplication
    const contentHash = await computeContentHash(buffer);
    console.log(`[${requestId}] Content hash:`, contentHash.substring(0, 16) + '...');
    
    // Upload to Supabase Storage
    const filename = `analysis-${requestId}-${Date.now()}.jpg`;
    
    // Use service role client for storage upload
    const adminClient = createClient(supabaseUrl, supabaseServiceKey);
    
    const { data: uploadData, error: uploadError } = await adminClient.storage
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

    // Calculate R.A.N.K. 285™ score
    console.log(`[${requestId}] Calculating score...`);
    const photoAnalysis = await scorePhoto(buffer, userCategory);
    
    console.log(`[${requestId}] Score:`, photoAnalysis.score);
    console.log(`[${requestId}] Breakdown:`, photoAnalysis.breakdown);
    console.log(`[${requestId}] Metadata:`, photoAnalysis.metadata);

    // Persist to database via RPC (if user is authenticated)
    let analysisId: string | null = null;
    let persistError: string | null = null;
    
    if (userId) {
      // User is authenticated - persist with their ID
      const flags = deriveFlags(photoAnalysis.metadata, photoAnalysis.breakdown);
      
      const { id, error: rpcError } = await persistImageAnalysis(supabase, {
        profile_name: userCategory,
        content_hash: contentHash,
        image_url: imageUrl,
        width_px: photoAnalysis.metadata.width,
        height_px: photoAnalysis.metadata.height,
        file_size_bytes: photoAnalysis.metadata.fileSize,
        aspect_ratio: formatAspectRatio(photoAnalysis.metadata.aspectRatio),
        file_type: imageFile.type?.split('/')[1] || 'jpeg',
        color_profile: 'sRGB', // Canvas always outputs sRGB
        ppi: 72, // Web standard
        flags,
        score: photoAnalysis.score,
        breakdown: photoAnalysis.breakdown,
      });
      
      analysisId = id;
      persistError = rpcError;
      
      if (rpcError) {
        console.warn(`[${requestId}] RPC persist warning:`, rpcError);
      } else {
        console.log(`[${requestId}] Persisted analysis with ID:`, analysisId);
      }
    } else {
      console.log(`[${requestId}] Skipping persistence - user not authenticated`);
    }

    // Build response
    const meta = photoAnalysis.metadata;
    
    // Determine strengths
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

    // Determine issues
    const issues: string[] = [];
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

    const canOptimize = photoAnalysis.score < 90 || 
                       photoAnalysis.suggestions.length > 0 ||
                       Math.abs(meta.aspectRatio - 1.0) > 0.05;

    return NextResponse.json({
      success: true,
      analysisId,  // Will be null if not authenticated
      contentHash,
      imageUrl,
      score: photoAnalysis.score,
      breakdown: photoAnalysis.breakdown,
      category: photoAnalysis.category,
      suggestions: photoAnalysis.suggestions,
      metadata: photoAnalysis.metadata,
      canOptimize,
      overallAssessment: `Photo scored ${photoAnalysis.score}/100 using R.A.N.K. 285™ deterministic analysis`,
      strengths,
      issues,
      persisted: !!analysisId,
      persistError,
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
    ],
    authentication: 'Optional but recommended - results are persisted for authenticated users',
    returns: {
      analysisId: 'UUID if persisted',
      contentHash: 'SHA-256 of image',
      score: 'Overall score 0-100',
      breakdown: 'Component scores',
      metadata: 'Image metrics',
    }
  });
}
