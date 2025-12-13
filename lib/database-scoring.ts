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
  
  // Photo-type specific attributes (NEW)
  shows_texture_or_craftsmanship: boolean;  // For detail shots
  product_clearly_visible: boolean;          // For lifestyle shots
  appealing_context: boolean;                // For lifestyle shots
  reference_object_visible: boolean;         // For scale shots
  size_comparison_clear: boolean;            // For scale shots
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
// FETCH SCORING RULES BY PHOTO TYPE
// ===========================================

export type PhotoType = 'main' | 'detail' | 'lifestyle' | 'scale' | 'studio' | 'group' | 'packaging' | 'process' | 'unknown';

export async function fetchScoringRulesByPhotoType(
  supabase: SupabaseClient,
  photoType: PhotoType
): Promise<ScoringRules | null> {
  
  // Map photo type to profile name
  const profileNameMap: Record<string, string> = {
    'main': 'main_image_scoring',
    'studio': 'main_image_scoring',      // Studio shots use main image rules
    'detail': 'detail_shot_scoring',
    'lifestyle': 'lifestyle_shot_scoring',
    'scale': 'scale_shot_scoring',
    'group': 'main_image_scoring',       // Fallback to main
    'packaging': 'main_image_scoring',   // Fallback to main
    'process': 'main_image_scoring',     // Fallback to main
    'unknown': 'main_image_scoring',     // Fallback to main
  };
  
  const profileName = profileNameMap[photoType] || 'main_image_scoring';
  
  console.log(`[Scoring] Fetching rules for photo type: ${photoType} -> profile: ${profileName}`);
  
  try {
    // Fetch profile by name
    const { data: profiles, error: profileError } = await supabase
      .from('scoring_profiles')
      .select('id, name')
      .eq('name', profileName)
      .eq('is_active', true)
      .limit(1);
    
    if (profileError) {
      console.error(`[Scoring] Error fetching profile ${profileName}:`, profileError);
      return null;
    }
    
    if (!profiles || profiles.length === 0) {
      console.error(`[Scoring] Profile not found: ${profileName}`);
      return null;
    }
    
    const profile = profiles[0];
    console.log(`[Scoring] Using profile: ${profile.name} (${profile.id})`);
    
    // Fetch rules for this profile
    // Note: Technical specs are shared - fetch from the original 'single_image_scoring' profile
    const { data: singleImageProfile } = await supabase
      .from('scoring_profiles')
      .select('id')
      .eq('name', 'single_image_scoring')
      .eq('is_active', true)
      .limit(1);
    
    const technicalProfileId = singleImageProfile?.[0]?.id || profile.id;
    
    const [technicalResult, photoTypesResult, compositionResult] = await Promise.all([
      supabase
        .from('technical_specs_rules')
        .select('*')
        .eq('profile_id', technicalProfileId),
      supabase
        .from('photo_types_rules')
        .select('*')
        .eq('profile_id', technicalProfileId),
      supabase
        .from('composition_rules')
        .select('*')
        .eq('profile_id', profile.id),  // Use photo-type-specific composition rules
    ]);
    
    console.log(`[Scoring] Rules loaded for ${profileName}:`, {
      technical: technicalResult.data?.length || 0,
      photoTypes: photoTypesResult.data?.length || 0,
      composition: compositionResult.data?.length || 0,
    });
    
    return {
      profileId: profile.id,
      profileName: profile.name,
      technicalSpecs: technicalResult.data || [],
      photoTypes: photoTypesResult.data || [],
      compositionRules: compositionResult.data || [],
    };
    
  } catch (error) {
    console.error('[Scoring] Error fetching rules by photo type:', error);
    return null;
  }
}

// ===========================================
// USER-FRIENDLY FEEDBACK MESSAGES
// ===========================================

const FEEDBACK_MESSAGES: Record<string, { passed: string; failed: string; isCritical?: boolean }> = {
  // Technical Specs - Benefit-focused (NO technical jargon)
  'recommended_size': {
    failed: "Image won't display well in Etsy search results",
    passed: 'Optimized for Etsy search visibility',
    isCritical: true
  },
  'aspect_ratio': {
    failed: 'Image may get awkwardly cropped in listings',
    passed: 'Perfect aspect ratio for thumbnails'
  },
  'shortest_side': {
    failed: 'Image resolution too low for zoom clarity',
    passed: 'High resolution for customer zoom',
    isCritical: true
  },
  'shortest_side_benchmark': {
    failed: "Below Etsy's quality benchmark",
    passed: "Meets Etsy's professional standards",
    isCritical: true
  },
  'min_width': {
    failed: "Doesn't meet Etsy's minimum requirements",
    passed: "Meets Etsy's size requirements",
    isCritical: true
  },
  'max_file_size': {
    failed: 'Slow loading could lose customers',
    passed: 'Fast mobile loading',
    isCritical: true
  },
  'color_profile': {
    failed: 'Colors may look different on customer devices',
    passed: 'Colors display accurately everywhere'
  },
  'file_types': {
    failed: 'File format incompatible with Etsy',
    passed: "Matched to Etsy's preferred file format",
    isCritical: true
  },
  'file_type': {
    failed: 'File format incompatible with Etsy',
    passed: "Matched to Etsy's preferred file format",
    isCritical: true
  },
  // Composition - User benefits
  'clean_background': {
    failed: 'Background could be cleaner',
    passed: 'Clean, professional background'
  },
  'good_lighting': {
    failed: 'Lighting could improve click-through rate',
    passed: 'Well-lit and inviting'
  },
  'sharp_focus': {
    failed: 'Slight blur reduces buyer confidence',
    passed: 'Sharp and in focus'
  },
  'product_centered': {
    failed: 'Product could be better centered',
    passed: 'Product perfectly framed'
  },
  'no_watermarks': {
    failed: 'Text or watermarks may distract buyers',
    passed: 'Clean presentation without distractions'
  },
  'professional_appearance': {
    failed: 'Photo could look more professional',
    passed: 'Professional quality image'
  },
  // Photo Types - Recommendations
  'studio_shot': {
    failed: 'Consider a studio-style main photo',
    passed: 'Professional studio-quality photo'
  },
  'lifestyle_shot': {
    failed: 'Consider showing product in use',
    passed: 'Lifestyle context helps buyers visualize'
  },
  'scale_shot': {
    failed: 'Consider showing product size reference',
    passed: 'Size clearly communicated'
  },
  'detail_shot': {
    failed: 'Consider adding close-up details',
    passed: 'Craftsmanship and details visible'
  }
};

function generateFeedback(
  breakdown: {
    technical: { rule: string; points: number; met: boolean }[];
    photo_types: { type: string; points: number; detected: boolean }[];
    composition: { rule: string; points: number; met: boolean }[];
  },
  rules: ScoringRules
): { rule: string; status: 'critical' | 'warning' | 'passed'; message: string }[] {
  
  const feedback: { rule: string; status: 'critical' | 'warning' | 'passed'; message: string }[] = [];
  
  // Process technical rules
  for (const item of breakdown.technical) {
    const messageConfig = FEEDBACK_MESSAGES[item.rule];
    if (!messageConfig) continue;
    
    const status = item.met ? 'passed' : (messageConfig.isCritical ? 'critical' : 'warning');
    const message = item.met ? messageConfig.passed : messageConfig.failed;
    
    feedback.push({ rule: item.rule, status, message });
  }
  
  // Process composition rules
  for (const item of breakdown.composition) {
    const messageConfig = FEEDBACK_MESSAGES[item.rule];
    if (!messageConfig) continue;
    
    const status = item.met ? 'passed' : 'warning';
    const message = item.met ? messageConfig.passed : messageConfig.failed;
    
    feedback.push({ rule: item.rule, status, message });
  }
  
  // Process photo type rules (always warnings if not detected)
  for (const item of breakdown.photo_types) {
    const messageConfig = FEEDBACK_MESSAGES[item.type];
    if (!messageConfig) continue;
    
    const status = item.detected ? 'passed' : 'warning';
    const message = item.detected ? messageConfig.passed : messageConfig.failed;
    
    feedback.push({ rule: item.type, status, message });
  }
  
  // Sort: critical first, then warnings, then passed
  const statusOrder = { 'critical': 0, 'warning': 1, 'passed': 2 };
  feedback.sort((a, b) => statusOrder[a.status] - statusOrder[b.status]);
  
  return feedback;
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
      case 'shortest_side_benchmark':
        // Check shortest side meets minimum requirement
        met = attributes.shortest_side >= (rule.metadata?.min_value || 2000);
        break;
      case 'color_profile':
        // Check color profile matches (case-insensitive)
        const expectedProfile = rule.metadata?.value || 'sRGB';
        met = attributes.color_profile?.toLowerCase() === expectedProfile.toLowerCase();
        break;
      case 'file_types':
        // Check if file type is in allowed list
        const allowedFileTypes = rule.metadata?.allowed || ['jpg', 'jpeg', 'png'];
        met = allowedFileTypes.some(type => type.toLowerCase() === attributes.file_type.toLowerCase());
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
    // Standard composition rules
    'clean_background': 'has_clean_white_background',
    'has_clean_background': 'has_clean_white_background',
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
    'home_living_guidance': 'has_clean_white_background',
    
    // Photo-type specific rules (NEW)
    'shows_texture_or_craftsmanship': 'shows_texture_or_craftsmanship',
    'product_clearly_visible': 'product_clearly_visible',
    'appealing_context': 'appealing_context',
    'reference_object_visible': 'reference_object_visible',
    'size_comparison_clear': 'size_comparison_clear',
    'product_visible': 'product_clearly_visible',  // Alias for scale shot
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
  
  // ===========================================
  // 6. GENERATE USER-FRIENDLY FEEDBACK
  // ===========================================
  const feedback = generateFeedback(breakdown, rules);
  
  return {
    technical_points: technicalPoints,
    photo_type_points: photoTypePoints,
    composition_points: compositionPoints,
    total_score: totalScore,
    scoring_breakdown: breakdown,
    is_already_optimized: isAlreadyOptimized,
    failed_required_specs: failedRequiredSpecs,
    feedback,
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
