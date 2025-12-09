/**
 * DETERMINISTIC IMAGE SCORING - Database-Driven
 * Scores are calculated from database rules, NOT AI interpretation
 * Same input = Same output EVERY TIME
 */

import { SupabaseClient } from '@supabase/supabase-js';

// ===========================================
// TYPES
// ===========================================

export interface TechnicalSpecRule {
  id: string;
  key: string;
  description: string;
  points_if_met: number;
  points_if_not_met: number;
  required: boolean;
  metadata: Record<string, any>;
}

export interface PhotoTypeRule {
  id: string;
  name: string;
  description: string;
  is_required: boolean;
  points: number;
}

export interface CompositionRule {
  id: string;
  key: string;
  description: string;
  points: number;
}

export interface ScoringRules {
  profileId: string;
  profileName: string;
  technicalSpecs: TechnicalSpecRule[];
  photoTypes: PhotoTypeRule[];
  compositionRules: CompositionRule[];
}

export interface ImageAttributes {
  // Technical attributes (measured)
  width_px: number;
  height_px: number;
  file_size_bytes: number;
  aspect_ratio: string;
  file_type: string;
  color_profile: string;
  ppi: number;
  shortest_side: number;
  
  // AI Vision attributes (binary YES/NO)
  has_clean_white_background: boolean;
  is_product_centered: boolean;
  has_good_lighting: boolean;
  is_sharp_focus: boolean;
  has_no_watermarks: boolean;
  professional_appearance: boolean;
  
  // Photo type detection (binary)
  has_studio_shot: boolean;
  has_lifestyle_shot: boolean;
  has_scale_shot: boolean;
  has_detail_shot: boolean;
  has_group_shot: boolean;
  has_packaging_shot: boolean;
  has_process_shot: boolean;
}

export interface ScoringResult {
  technical_points: number;
  photo_type_points: number;
  composition_points: number;
  total_score: number;
  scoring_breakdown: {
    technical: { rule: string; points: number; met: boolean }[];
    photo_types: { type: string; points: number; detected: boolean }[];
    composition: { rule: string; points: number; met: boolean }[];
  };
  is_already_optimized: boolean;
  failed_required_specs: string[];
}

// ===========================================
// FETCH SCORING RULES FROM DATABASE
// ===========================================

export async function fetchScoringRules(supabase: SupabaseClient): Promise<ScoringRules | null> {
  try {
    // Get active profile - use .limit(1) in case multiple are active
    const { data: profiles, error: profileError } = await supabase
      .from('scoring_profiles')
      .select('id, name')
      .eq('is_active', true)
      .limit(1);
    
    if (profileError) {
      console.error('[Scoring] Error fetching profiles:', profileError);
      return null;
    }
    
    if (!profiles || profiles.length === 0) {
      console.error('[Scoring] No active profile found');
      return null;
    }
    
    const profile = profiles[0];
    const profileId = profile.id;
    console.log('[Scoring] Using profile:', profile.name, '(', profileId, ')');
    
    // Fetch all rules for this profile in parallel
    const [technicalResult, photoTypesResult, compositionResult] = await Promise.all([
      supabase
        .from('technical_specs_rules')
        .select('*')
        .eq('profile_id', profileId),
      supabase
        .from('photo_types_rules')
        .select('*')
        .eq('profile_id', profileId),
      supabase
        .from('composition_rules')
        .select('*')
        .eq('profile_id', profileId),
    ]);
    
    if (technicalResult.error) {
      console.error('[Scoring] Error fetching technical_specs_rules:', technicalResult.error);
    }
    if (photoTypesResult.error) {
      console.error('[Scoring] Error fetching photo_types_rules:', photoTypesResult.error);
    }
    if (compositionResult.error) {
      console.error('[Scoring] Error fetching composition_rules:', compositionResult.error);
    }
    
    // DEBUG: Log all fetched rules
    console.log('[DEBUG] Rules fetched from database:', {
      technical: technicalResult.data?.length || 0,
      photoTypes: photoTypesResult.data?.length || 0,
      composition: compositionResult.data?.length || 0,
      technicalRules: technicalResult.data,
      photoTypesRules: photoTypesResult.data,
      compositionRules: compositionResult.data
    });
    
    return {
      profileId,
      profileName: profile.name,
      technicalSpecs: technicalResult.data || [],
      photoTypes: photoTypesResult.data || [],
      compositionRules: compositionResult.data || [],
    };
    
  } catch (error) {
    console.error('[Scoring] Error fetching rules:', error);
    return null;
  }
}

// ===========================================
// DETERMINISTIC SCORE CALCULATION
// ===========================================

export function calculateScore(
  attributes: ImageAttributes,
  rules: ScoringRules
): ScoringResult {
  
  // DEBUG: Log input attributes
  console.log('[DEBUG] calculateScore called with attributes:', {
    width_px: attributes.width_px,
    height_px: attributes.height_px,
    file_size_bytes: attributes.file_size_bytes,
    aspect_ratio: attributes.aspect_ratio,
    file_type: attributes.file_type,
    shortest_side: attributes.shortest_side,
    has_clean_white_background: attributes.has_clean_white_background,
    is_product_centered: attributes.is_product_centered,
    has_good_lighting: attributes.has_good_lighting,
    is_sharp_focus: attributes.is_sharp_focus,
    has_no_watermarks: attributes.has_no_watermarks,
    professional_appearance: attributes.professional_appearance,
  });
  
  const breakdown = {
    technical: [] as { rule: string; points: number; met: boolean }[],
    photo_types: [] as { type: string; points: number; detected: boolean }[],
    composition: [] as { rule: string; points: number; met: boolean }[],
  };
  
  let technicalPoints = 0;
  let photoTypePoints = 0;
  let compositionPoints = 0;
  const failedRequiredSpecs: string[] = [];
  
  // ===========================================
  // 1. TECHNICAL SPECS SCORING
  // ===========================================
  console.log('[DEBUG] Starting technical specs evaluation...');
  for (const rule of rules.technicalSpecs) {
    let met = false;
    
    // Evaluate each technical rule based on key
    switch (rule.key) {
      case 'min_width':
        met = attributes.width_px >= (rule.metadata?.min_value || 1000);
        break;
      case 'min_shortest_side':
        met = attributes.shortest_side >= (rule.metadata?.min_value || 2000);
        break;
      case 'max_file_size':
        met = attributes.file_size_bytes <= (rule.metadata?.max_value || 1000000);
        break;
      case 'recommended_size':
        // Check if image matches recommended dimensions
        const recWidth = rule.metadata?.width;
        const recHeight = rule.metadata?.height;
        met = (attributes.width_px === recWidth && attributes.height_px === recHeight);
        break;
      case 'aspect_ratio':
        // Check if image matches the recommended aspect ratio
        const targetRatio = rule.metadata?.ratio; // e.g., "4:3"
        if (targetRatio) {
          const [w, h] = targetRatio.split(':').map(Number);
          const targetDecimal = w / h;
          const actualDecimal = attributes.width_px / attributes.height_px;
          met = Math.abs(actualDecimal - targetDecimal) < 0.05; // 5% tolerance
        } else {
          met = false;
        }
        break;
      case 'aspect_ratio_4_3':
        met = attributes.aspect_ratio === '4:3' || 
              Math.abs((attributes.width_px / attributes.height_px) - (4/3)) < 0.05;
        break;
      case 'file_type':
        const allowedTypes = rule.metadata?.allowed || ['jpg', 'jpeg', 'png', 'gif'];
        met = allowedTypes.includes(attributes.file_type.toLowerCase());
        break;
      case 'resolution_ppi':
        met = attributes.ppi >= (rule.metadata?.min_value || 72);
        break;
      case 'color_profile_srgb':
        met = attributes.color_profile?.toLowerCase() === 'srgb';
        break;
      default:
        // Unknown rule key - check metadata for custom evaluation
        met = false;
    }
    
    const points = met ? rule.points_if_met : rule.points_if_not_met;
    technicalPoints += points;
    
    // DEBUG: Log each technical rule evaluation
    console.log('[DEBUG] Technical rule evaluated:', {
      rule: rule.key,
      description: rule.description,
      metadata: rule.metadata,
      met: met,
      points_if_met: rule.points_if_met,
      points_if_not_met: rule.points_if_not_met,
      points_awarded: points,
      running_total: technicalPoints
    });
    
    breakdown.technical.push({
      rule: rule.key,
      points,
      met,
    });
    
    // Track failed required specs
    if (rule.required && !met) {
      failedRequiredSpecs.push(rule.key);
    }
  }
  
  console.log('[DEBUG] Technical specs complete. Total technical points:', technicalPoints);
  
  // ===========================================
  // 2. PHOTO TYPE SCORING
  // ===========================================
  console.log('[DEBUG] Starting photo type evaluation...');
  const photoTypeMap: Record<string, keyof ImageAttributes> = {
    'studio': 'has_studio_shot',
    'studio_shot': 'has_studio_shot',
    'lifestyle': 'has_lifestyle_shot',
    'lifestyle_shot': 'has_lifestyle_shot',
    'scale': 'has_scale_shot',
    'scale_shot': 'has_scale_shot',
    'detail': 'has_detail_shot',
    'detail_shot': 'has_detail_shot',
    'group': 'has_group_shot',
    'group_shot': 'has_group_shot',
    'packaging': 'has_packaging_shot',
    'packaging_shot': 'has_packaging_shot',
    'process': 'has_process_shot',
    'process_shot': 'has_process_shot',
  };
  
  for (const rule of rules.photoTypes) {
    const attrKey = photoTypeMap[rule.name.toLowerCase()];
    const detected = attrKey ? (attributes[attrKey] as boolean) : false;
    
    if (detected) {
      photoTypePoints += rule.points;
    }
    
    // DEBUG: Log each photo type rule evaluation
    console.log('[DEBUG] Photo type rule evaluated:', {
      rule: rule.name,
      description: rule.description,
      attrKey: attrKey,
      detected: detected,
      points: rule.points,
      points_awarded: detected ? rule.points : 0,
      running_total: photoTypePoints
    });
    
    breakdown.photo_types.push({
      type: rule.name,
      points: detected ? rule.points : 0,
      detected,
    });
    
    // Track failed required photo types
    if (rule.is_required && !detected) {
      failedRequiredSpecs.push(`photo_type_${rule.name}`);
    }
  }
  
  console.log('[DEBUG] Photo types complete. Total photo type points:', photoTypePoints);
  
  // ===========================================
  // 3. COMPOSITION SCORING
  // ===========================================
  console.log('[DEBUG] Starting composition evaluation...');
  const compositionMap: Record<string, keyof ImageAttributes> = {
    'clean_background': 'has_clean_white_background',
    'clean_white_background': 'has_clean_white_background',
    'has_clean_white_background': 'has_clean_white_background',
    'product_centered': 'is_product_centered',
    'is_product_centered': 'is_product_centered',
    'good_lighting': 'has_good_lighting',
    'has_good_lighting': 'has_good_lighting',
    'sharp_focus': 'is_sharp_focus',
    'is_sharp_focus': 'is_sharp_focus',
    'no_watermarks': 'has_no_watermarks',
    'has_no_watermarks': 'has_no_watermarks',
    'professional_appearance': 'professional_appearance',
    'home_living_guidance': 'has_clean_white_background', // Fallback for category-specific rules
  };
  
  for (const rule of rules.compositionRules) {
    const attrKey = compositionMap[rule.key.toLowerCase()];
    const met = attrKey ? (attributes[attrKey] as boolean) : false;
    
    if (met) {
      compositionPoints += rule.points;
    }
    
    // DEBUG: Log each composition rule evaluation
    console.log('[DEBUG] Composition rule evaluated:', {
      rule: rule.key,
      description: rule.description,
      attrKey: attrKey,
      ai_value: attrKey ? attributes[attrKey] : undefined,
      met: met,
      points: rule.points,
      points_awarded: met ? rule.points : 0,
      running_total: compositionPoints
    });
    
    breakdown.composition.push({
      rule: rule.key,
      points: met ? rule.points : 0,
      met,
    });
  }
  
  console.log('[DEBUG] Composition complete. Total composition points:', compositionPoints);
  
  // ===========================================
  // 4. CALCULATE TOTAL SCORE
  // ===========================================
  const totalScore = technicalPoints + photoTypePoints + compositionPoints;
  
  // DEBUG: Log final calculation
  console.log('[DEBUG] Final score calculation:', {
    technicalPoints: technicalPoints,
    photoTypePoints: photoTypePoints,
    compositionPoints: compositionPoints,
    totalScore: totalScore,
    failedRequiredSpecs: failedRequiredSpecs
  });
  
  // ===========================================
  // 5. CHECK IF ALREADY OPTIMIZED
  // ===========================================
  const isAlreadyOptimized = totalScore >= 95 && failedRequiredSpecs.length === 0;
  
  console.log('[Scoring] Results:', {
    technical: technicalPoints,
    photoTypes: photoTypePoints,
    composition: compositionPoints,
    total: totalScore,
    isAlreadyOptimized,
    failedRequired: failedRequiredSpecs,
  });
  
  return {
    technical_points: technicalPoints,
    photo_type_points: photoTypePoints,
    composition_points: compositionPoints,
    total_score: totalScore,
    scoring_breakdown: breakdown,
    is_already_optimized: isAlreadyOptimized,
    failed_required_specs: failedRequiredSpecs,
  };
}

// ===========================================
// STORE ANALYSIS IN DATABASE
// ===========================================

export async function storeImageAnalysis(
  supabase: SupabaseClient,
  userId: string,
  profileId: string,
  contentHash: string,
  imageUrl: string,
  attributes: ImageAttributes,
  scoring: ScoringResult
): Promise<{ id: string | null; error: string | null }> {
  
  try {
    const { data, error } = await supabase
      .from('image_analyses')
      .upsert({
        user_id: userId,
        profile_id: profileId,
        content_hash: contentHash,
        image_url: imageUrl,
        
        // Technical attributes
        width_px: attributes.width_px,
        height_px: attributes.height_px,
        file_size_bytes: attributes.file_size_bytes,
        aspect_ratio: attributes.aspect_ratio,
        file_type: attributes.file_type,
        color_profile: attributes.color_profile,
        ppi: attributes.ppi,
        
        // AI Vision booleans
        has_clean_white_background: attributes.has_clean_white_background,
        is_product_centered: attributes.is_product_centered,
        has_good_lighting: attributes.has_good_lighting,
        is_sharp_focus: attributes.is_sharp_focus,
        has_no_watermarks: attributes.has_no_watermarks,
        professional_appearance: attributes.professional_appearance,
        
        // Photo type booleans
        has_studio_shot: attributes.has_studio_shot,
        has_lifestyle_shot: attributes.has_lifestyle_shot,
        has_scale_shot: attributes.has_scale_shot,
        has_detail_shot: attributes.has_detail_shot,
        has_group_shot: attributes.has_group_shot,
        has_packaging_shot: attributes.has_packaging_shot,
        has_process_shot: attributes.has_process_shot,
        
        // Scores
        technical_points: scoring.technical_points,
        photo_type_points: scoring.photo_type_points,
        composition_points: scoring.composition_points,
        total_score: scoring.total_score,
        scoring_breakdown: scoring.scoring_breakdown,
        
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id,profile_id,content_hash',
      })
      .select('id')
      .single();
    
    if (error) {
      console.error('[Scoring] Error storing analysis:', error);
      return { id: null, error: error.message };
    }
    
    return { id: data?.id || null, error: null };
    
  } catch (error: any) {
    console.error('[Scoring] Exception storing analysis:', error);
    return { id: null, error: error.message };
  }
}
