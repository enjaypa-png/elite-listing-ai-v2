/**
 * Image Analysis RPC Helpers
 * Interfaces with Supabase RPCs for persisting analysis results
 */

import { SupabaseClient } from '@supabase/supabase-js';

export interface ImageAnalysisFlags {
  clean_white_background: boolean;
  product_centered: boolean;
  good_light: boolean;
  sharp_focus: boolean;
  no_watermarks: boolean;
  professional_appearance: boolean;
}

export interface UpsertImageAnalysisParams {
  profile_name: string;       // e.g., 'small_jewelry', 'etsy_v1'
  content_hash: string;       // SHA-256 hex
  image_url: string;
  width_px: number;
  height_px: number;
  file_size_bytes: number;
  aspect_ratio: string;       // e.g., '1:1', '4:3'
  file_type: string;          // e.g., 'jpeg', 'png'
  color_profile: string;      // e.g., 'sRGB'
  ppi: number;
  flags: ImageAnalysisFlags;
  // Optional: score data
  score?: number;
  breakdown?: {
    technical: number;
    presentation: number;
    composition: number;
  };
}

/**
 * Convert aspect ratio number to string format
 */
export function formatAspectRatio(ratio: number): string {
  // Common ratios
  if (Math.abs(ratio - 1.0) < 0.02) return '1:1';
  if (Math.abs(ratio - 1.333) < 0.02) return '4:3';
  if (Math.abs(ratio - 0.75) < 0.02) return '3:4';
  if (Math.abs(ratio - 1.5) < 0.02) return '3:2';
  if (Math.abs(ratio - 0.667) < 0.02) return '2:3';
  if (Math.abs(ratio - 1.778) < 0.02) return '16:9';
  if (Math.abs(ratio - 0.5625) < 0.02) return '9:16';
  
  // Generic format
  return `${ratio.toFixed(2)}:1`;
}

/**
 * Determine flags from photo analysis metadata
 */
export function deriveFlags(metadata: {
  brightness: number;
  sharpness: number;
  bgVariance: number;
  aspectRatio: number;
}, breakdown: { technical: number; presentation: number; composition: number }): ImageAnalysisFlags {
  return {
    clean_white_background: metadata.bgVariance < 40,
    product_centered: true, // We can't easily detect this without ML
    good_light: metadata.brightness >= 50 && metadata.brightness <= 75,
    sharp_focus: metadata.sharpness >= 75,
    no_watermarks: true, // We can't easily detect this without ML
    professional_appearance: breakdown.presentation >= 75,
  };
}

/**
 * Persist image analysis to Supabase via RPC
 * Requires an authenticated Supabase client (user context)
 */
export async function persistImageAnalysis(
  supabase: SupabaseClient,
  params: UpsertImageAnalysisParams
): Promise<{ id: string | null; error: string | null }> {
  try {
    console.log('[RPC] Calling f_upsert_image_analysis with:', {
      profile_name: params.profile_name,
      content_hash: params.content_hash.substring(0, 16) + '...',
      width: params.width_px,
      height: params.height_px,
    });
    
    const { data, error } = await supabase.rpc('f_upsert_image_analysis', {
      p_profile_name: params.profile_name,
      p_content_hash: params.content_hash,
      p_image_url: params.image_url,
      p_width_px: params.width_px,
      p_height_px: params.height_px,
      p_file_size_bytes: params.file_size_bytes,
      p_aspect_ratio: params.aspect_ratio,
      p_file_type: params.file_type,
      p_color_profile: params.color_profile,
      p_ppi: params.ppi,
      p_flags: params.flags,
    });
    
    if (error) {
      console.error('[RPC] f_upsert_image_analysis error:', error);
      return { id: null, error: error.message };
    }
    
    console.log('[RPC] f_upsert_image_analysis success, id:', data);
    return { id: data, error: null };
    
  } catch (error: any) {
    console.error('[RPC] Exception:', error);
    return { id: null, error: error.message };
  }
}

/**
 * Fetch analysis history with pagination
 */
export async function fetchAnalysisHistory(
  supabase: SupabaseClient,
  limit: number = 20,
  cursor?: string // ISO timestamp
): Promise<{ data: any[] | null; error: string | null }> {
  try {
    const params: { p_limit: number; p_cursor?: string } = { p_limit: limit };
    if (cursor) {
      params.p_cursor = cursor;
    }
    
    const { data, error } = await supabase.rpc('f_list_latest_analyses', params);
    
    if (error) {
      console.error('[RPC] f_list_latest_analyses error:', error);
      return { data: null, error: error.message };
    }
    
    return { data, error: null };
    
  } catch (error: any) {
    console.error('[RPC] Exception:', error);
    return { data: null, error: error.message };
  }
}

/**
 * Fetch 30-day summary
 */
export async function fetchUserSummary(
  supabase: SupabaseClient
): Promise<{ data: any[] | null; error: string | null }> {
  try {
    const { data, error } = await supabase.rpc('f_get_user_summary_30d');
    
    if (error) {
      console.error('[RPC] f_get_user_summary_30d error:', error);
      return { data: null, error: error.message };
    }
    
    return { data, error: null };
    
  } catch (error: any) {
    console.error('[RPC] Exception:', error);
    return { data: null, error: error.message };
  }
}
