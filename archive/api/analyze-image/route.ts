export const runtime = 'nodejs';
export const preferredRegion = 'iad1';
export const maxDuration = 60;

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import sharp from 'sharp';
import { computeContentHash } from '@/lib/hash';
import { fetchScoringRules, calculateScore, storeImageAnalysis, ImageAttributes } from '@/lib/database-scoring';
import { analyzeImageWithVision, getDefaultVisionResponse, mergeAttributes } from '@/lib/ai-vision';
import { randomUUID } from 'crypto';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// ===========================================
// AUTH HELPER
// ===========================================
async function getAuthenticatedClient(request: NextRequest): Promise<{
  supabase: ReturnType<typeof createClient> | null;
  userId: string | null;
  error: string | null;
}> {
  try {
    const authHeader = request.headers.get('Authorization');
    const accessToken = authHeader?.replace('Bearer ', '');
    
    const cookieHeader = request.headers.get('cookie') || '';
    const cookies = Object.fromEntries(
      cookieHeader.split('; ').filter(c => c).map(c => {
        const [key, ...val] = c.split('=');
        return [key, val.join('=')];
      })
    );
    
    const sbAccessToken = cookies['sb-access-token'];
    const token = accessToken || sbAccessToken;
    
    if (!token) {
      // Use service role for unauthenticated requests
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

// ===========================================
// EXTRACT TECHNICAL ATTRIBUTES FROM IMAGE
// ===========================================
async function extractTechnicalAttributes(buffer: Buffer, fileType: string): Promise<{
  width_px: number;
  height_px: number;
  file_size_bytes: number;
  aspect_ratio: string;
  file_type: string;
  color_profile: string;
  ppi: number;
}> {
  const metadata = await sharp(buffer).metadata();
  
  const width = metadata.width || 1;
  const height = metadata.height || 1;
  const ratio = width / height;
  
  // Determine aspect ratio string
  let aspectRatio = `${width}:${height}`;
  if (Math.abs(ratio - 4/3) < 0.05) aspectRatio = '4:3';
  else if (Math.abs(ratio - 3/4) < 0.05) aspectRatio = '3:4';
  else if (Math.abs(ratio - 1) < 0.05) aspectRatio = '1:1';
  else if (Math.abs(ratio - 16/9) < 0.05) aspectRatio = '16:9';
  else if (Math.abs(ratio - 3/2) < 0.05) aspectRatio = '3:2';
  
  return {
    width_px: width,
    height_px: height,
    file_size_bytes: buffer.length,
    aspect_ratio: aspectRatio,
    file_type: fileType.replace('image/', ''),
    color_profile: 'sRGB',  // Canvas/web always outputs sRGB
    ppi: metadata.density || 72,
  };
}

// ===========================================
// POST HANDLER
// ===========================================
export async function POST(request: NextRequest) {
  const requestId = randomUUID();
  
  try {
    const { supabase, userId, error: authError } = await getAuthenticatedClient(request);
    
    if (!supabase) {
      return NextResponse.json(
        { success: false, error: 'Database connection failed' },
        { status: 500 }
      );
    }
    
    const formData = await request.formData();
    const imageFile = formData.get('image') as File;
    
    if (!imageFile) {
      return NextResponse.json(
        { success: false, error: 'No image file provided' },
        { status: 400 }
      );
    }

    console.log(`[${requestId}] Analyzing image:`, imageFile.name, imageFile.size, 'bytes');
    
    // ===========================================
    // 1. GET SCORING RULES FROM DATABASE
    // ===========================================
    const rules = await fetchScoringRules(supabase);
    
    if (!rules) {
      return NextResponse.json(
        { success: false, error: 'No active scoring profile found. Please contact support.' },
        { status: 500 }
      );
    }
    
    console.log(`[${requestId}] Using scoring profile:`, rules.profileName);
    console.log(`[${requestId}] Rules loaded:`, {
      technical: rules.technicalSpecs.length,
      photoTypes: rules.photoTypes.length,
      composition: rules.compositionRules.length,
    });
    
    // ===========================================
    // 2. EXTRACT TECHNICAL ATTRIBUTES
    // ===========================================
    const bytes = await imageFile.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const contentHash = await computeContentHash(buffer);
    
    const technicalAttrs = await extractTechnicalAttributes(buffer, imageFile.type || 'image/jpeg');
    
    console.log(`[${requestId}] Technical attributes:`, technicalAttrs);
    
    // ===========================================
    // 3. AI VISION ANALYSIS (Binary YES/NO)
    // ===========================================
    const imageBase64 = buffer.toString('base64');
    const mimeType = (imageFile.type || 'image/jpeg') as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp';
    
    let visionResponse = await analyzeImageWithVision(imageBase64, mimeType);
    
    if (!visionResponse) {
      console.warn(`[${requestId}] AI Vision failed, using defaults`);
      visionResponse = getDefaultVisionResponse();
    }
    
    console.log(`[${requestId}] AI Vision results:`, visionResponse);
    
    // ===========================================
    // 4. MERGE ATTRIBUTES
    // ===========================================
    const attributes: ImageAttributes = mergeAttributes(technicalAttrs, visionResponse);
    
    // ===========================================
    // 5. CALCULATE SCORE (DETERMINISTIC DATABASE-DRIVEN)
    // ===========================================
    const scoring = calculateScore(attributes, rules);
    
    console.log(`[${requestId}] Final score:`, scoring.total_score);
    console.log(`[${requestId}] Already optimized:`, scoring.is_already_optimized);
    
    // ===========================================
    // 6. UPLOAD IMAGE TO STORAGE
    // ===========================================
    const adminClient = createClient(supabaseUrl, supabaseServiceKey);
    const filename = `analysis-${requestId}-${Date.now()}.${technicalAttrs.file_type}`;
    
    const { error: uploadError } = await adminClient.storage
      .from('product-images')
      .upload(filename, buffer, {
        contentType: imageFile.type || 'image/jpeg',
        cacheControl: 'no-cache'
      });

    if (uploadError) {
      console.error(`[${requestId}] Upload error:`, uploadError);
    }

    const { data: urlData } = adminClient.storage
      .from('product-images')
      .getPublicUrl(filename);
    
    const imageUrl = urlData?.publicUrl || '';
    
    // ===========================================
    // 7. STORE ANALYSIS IN DATABASE
    // ===========================================
    let analysisId: string | null = null;
    
    if (userId) {
      const storeResult = await storeImageAnalysis(
        supabase,
        userId,
        rules.profileId,
        contentHash,
        imageUrl,
        attributes,
        scoring
      );
      
      analysisId = storeResult.id;
      
      if (storeResult.error) {
        console.warn(`[${requestId}] Store warning:`, storeResult.error);
      } else {
        console.log(`[${requestId}] Stored analysis:`, analysisId);
      }
    }
    
    // ===========================================
    // 8. BUILD RESPONSE
    // ===========================================
    return NextResponse.json({
      success: true,
      analysisId,
      contentHash,
      imageUrl,
      
      // Deterministic score from database rules
      score: scoring.total_score,
      
      // Score breakdown
      breakdown: {
        technical_points: scoring.technical_points,
        photo_type_points: scoring.photo_type_points,
        composition_points: scoring.composition_points,
      },
      
      // Detailed scoring breakdown
      scoring_breakdown: scoring.scoring_breakdown,
      
      // Already optimized detection
      is_already_optimized: scoring.is_already_optimized,
      isAlreadyOptimized: scoring.is_already_optimized, // Alias for frontend
      failed_required_specs: scoring.failed_required_specs,
      
      // User-friendly feedback (18 checks)
      feedback: scoring.feedback || [],
      
      // Technical metadata
      metadata: {
        width: attributes.width_px,
        height: attributes.height_px,
        fileSize: attributes.file_size_bytes,
        fileSizeKB: Math.round(attributes.file_size_bytes / 1024),
        aspectRatio: attributes.aspect_ratio,
        fileType: attributes.file_type,
        shortestSide: attributes.shortest_side,
      },
      
      // AI Vision results (binary)
      vision: {
        has_clean_white_background: attributes.has_clean_white_background,
        is_product_centered: attributes.is_product_centered,
        has_good_lighting: attributes.has_good_lighting,
        is_sharp_focus: attributes.is_sharp_focus,
        has_no_watermarks: attributes.has_no_watermarks,
        professional_appearance: attributes.professional_appearance,
        detected_photo_type: visionResponse.detected_photo_type,
      },
      
      // Profile used
      profile: {
        id: rules.profileId,
        name: rules.profileName,
      },
      
      // Can optimize?
      canOptimize: !scoring.is_already_optimized,
      
      // Persisted?
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

// ===========================================
// GET HANDLER - API INFO
// ===========================================
export async function GET() {
  return NextResponse.json({
    ok: true,
    endpoint: '/api/analyze-image',
    method: 'POST',
    description: 'Analyzes product photos using DETERMINISTIC database-driven scoring',
    scoring: 'Rules fetched from database - same input = same output',
    
    accepts: 'multipart/form-data with "image" field',
    
    response: {
      score: 'Total score from database rules',
      breakdown: 'Points by category (technical, photo_type, composition)',
      is_already_optimized: 'true if score >= 95 and all required specs met',
      vision: 'Binary YES/NO from AI vision analysis',
    },
  });
}
