/**
 * AI VISION ANALYSIS - Etsy Image Scoring
 * Uses Google AI Studio (Gemini 2.0 Flash)
 * Calibrated with real Etsy listing anchors
 */

import { ImageAttributes } from './database-scoring';

// ===========================================
// GOOGLE AI STUDIO CONFIGURATION
// ===========================================
const GEMINI_MODEL = 'gemini-2.0-flash';

// ===========================================
// AI VISION RESPONSE TYPE
// ===========================================

export interface AIVisionResponse {
  has_clean_white_background: boolean;
  is_product_centered: boolean;
  has_good_lighting: boolean;
  is_sharp_focus: boolean;
  has_no_watermarks: boolean;
  professional_appearance: boolean;
  
  detected_photo_type: 'studio' | 'lifestyle' | 'scale' | 'detail' | 'group' | 'packaging' | 'process' | 'unknown';
  has_studio_shot: boolean;
  has_lifestyle_shot: boolean;
  has_scale_shot: boolean;
  has_detail_shot: boolean;
  has_group_shot: boolean;
  has_packaging_shot: boolean;
  has_process_shot: boolean;
  
  shows_texture_or_craftsmanship: boolean;
  product_clearly_visible: boolean;
  appealing_context: boolean;
  reference_object_visible: boolean;
  size_comparison_clear: boolean;
  
  ai_score?: number;
  ai_confidence?: number;
  ai_caps_applied?: string[];
  ai_strengths?: string[];
  ai_issues?: string[];
  ai_optimization_recommendations?: string[];
  
  // Optimization flags derived from AI analysis
  _needs_brightness_boost?: boolean;
  _needs_sharpening?: boolean;
  _needs_contrast_boost?: boolean;
  _needs_saturation_boost?: boolean;
  _needs_background_cleanup?: boolean;
  
  // Product fill percentage (70-80% is ideal for Etsy)
  ai_product_fill_percent?: number;

  // NEW: Etsy-specific preferences (Phase 1)
  ai_alt_text?: string;
  has_text_elements?: boolean;
  text_readable?: boolean;
  has_wrinkles?: boolean;

  // Phase 2: Warm Lighting & White Background
  has_warm_lighting?: boolean;  // Home & Living: warm, natural lighting
  lighting_temperature?: 'warm' | 'cool' | 'neutral';  // Detected lighting temperature
  background_is_pure_white?: boolean;  // Jewelry: clean white background (#FFFFFF)
  background_purity_score?: number;  // 0-100, how close to pure white
}

// ===========================================
// SYSTEM PROMPT - ETSY IMAGE ANALYSIS ENGINE
// ===========================================

const SYSTEM_PROMPT = `You are an Etsy Image Quality Analyzer. Your job is to detect OBJECTIVE quality issues only.

CRITICAL: You do NOT assign scores or penalties. You ONLY detect these specific conditions:

1) SEVERE BLUR: Heavy compression artifacts, out of focus, unclear details
2) SEVERE LIGHTING: Too dark to see product, blown out highlights, harsh shadows making product unclear
3) PRODUCT DISTINGUISHABILITY: Can the product be clearly identified at thumbnail size?
4) THUMBNAIL CROP SAFETY (FIRST PHOTO ONLY): Would a centered 1:1 square crop cut off the product?
5) PHOTO TYPE: Studio, Lifestyle, Scale, Detail, Group, Packaging, or Process
6) FEATURES: Detect warm lighting, text elements, wrinkles, background type (for advisory output only)

UNIVERSAL RULE: NEVER flag backgrounds, settings, skin tones, fabric, props, or lifestyle scenes as problems.
These are stylistic choices and have ZERO impact on quality.

================================================
DETECTION CRITERIA (OBJECTIVE ONLY)
================================================

1) SEVERE BLUR DETECTION:
   - Out of focus / soft focus
   - Heavy compression artifacts
   - Details not discernible
   - Text (if present) is unreadable due to blur

2) SEVERE LIGHTING DETECTION:
   - Product too dark to see clearly
   - Blown out highlights (pure white with no detail)
   - Harsh shadows that obscure product features
   - Product indistinguishable due to lighting

3) PRODUCT DISTINGUISHABILITY:
   - At thumbnail size, is the product clearly identifiable?
   - Can you tell what it is without zooming?
   - Are defining features visible?

4) THUMBNAIL CROP SAFETY (FIRST PHOTO ONLY):
   - Imagine a centered 1:1 square crop
   - Would the product be fully visible?
   - Would important edges/text/features be cut off?
   - Answer: true (safe) or false (unsafe)

5) PHOTO TYPE CLASSIFICATION:
   - Studio: clean background, simple, well-lit
   - Lifestyle: product in use or styled environment
   - Scale: product next to reference object (hands, ruler, etc.)
   - Detail: close-up showing texture/craftsmanship
   - Group: multiple variations or quantities
   - Packaging: shows box/wrapping
   - Process: making/creation process

6) FEATURE DETECTION (ADVISORY ONLY - ZERO SCORING IMPACT):
   - hasWarmLighting: golden/yellow tones vs blue/cool tones
   - hasTextElements: readable text visible (labels, cards, etc.)
   - textReadable: if text exists, is it legible?
   - hasWrinkles: fabric shows creases (clothing only)
   - backgroundType: white, neutral, colored, lifestyle, on-model

================================================
OUTPUT FORMAT (STRICT JSON ONLY)
================================================
Return ONE JSON object with objective detections only:

{
  "images": [
    {
      "imageNumber": number,
      "hasSevereBlur": boolean,
      "hasSevereLighting": boolean,
      "isProductDistinguishable": boolean,
      "thumbnailCropSafe": boolean | null,  // Only for first photo, null for others
      "photoType": "Studio" | "Lifestyle" | "Scale" | "Detail" | "Group" | "Packaging" | "Process",
      "altText": string,  // 125-char max SEO description
      "hasTextElements": boolean,
      "textReadable": boolean,
      "hasWrinkles": boolean,
      "hasWarmLighting": boolean,
      "lightingTemperature": "warm" | "cool" | "neutral",
      "backgroundType": "white" | "neutral" | "colored" | "lifestyle" | "on-model"
    }
  ]
}

CRITICAL RULES:
- Do NOT assign scores
- Do NOT create lists of "issues" or "strengths"
- Do NOT make recommendations
- ONLY detect the specific conditions listed above
- Be conservative: flag "hasSevereBlur" or "hasSevereLighting" ONLY when truly severe
- Background color is NEVER a problem (backgroundType is informational only)

ALT TEXT:
- Generate a 125-character SEO-optimized description
- Example: "Handmade ceramic mug with blue glaze on wooden table, perfect for coffee lovers"

Return JSON ONLY. No markdown. No commentary.`;

// ===========================================
// ANALYZE IMAGE WITH GOOGLE AI STUDIO
// ===========================================

export async function analyzeImageWithVision(
  imageBase64: string,
  mimeType: 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp' = 'image/jpeg'
): Promise<AIVisionResponse | null> {
  
  const apiKey = process.env.GOOGLE_API_KEY;
  
  if (!apiKey) {
    console.error('[AI Vision] GOOGLE_API_KEY not found');
    return null;
  }
  
  try {
    console.log('[AI Vision] Analyzing image with Gemini 2.0 Flash...');
    
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`;
    
    const requestBody = {
      contents: [
        {
          parts: [
            { text: SYSTEM_PROMPT },
            {
              inline_data: {
                mime_type: mimeType,
                data: imageBase64,
              },
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 2048,
      },
    };
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('[AI Vision] Google AI Studio error:', response.status, errorText);
      return null;
    }
    
    const data = await response.json();
    
    const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    
    if (!responseText) {
      console.error('[AI Vision] No text in response');
      return null;
    }
    
    console.log('[AI Vision] Raw response:', responseText.substring(0, 500));
    
    // Extract JSON
    let jsonStr = responseText;
    if (jsonStr.startsWith('```')) {
      jsonStr = jsonStr.replace(/```json?\n?/g, '').replace(/```/g, '').trim();
    }
    const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('[AI Vision] Could not find JSON in response');
      return null;
    }
    
    const parsed = JSON.parse(jsonMatch[0]);
    
    // Handle both single image and multi-image response formats
    if (parsed.images && Array.isArray(parsed.images)) {
      // Multi-image response - take first image for single image analysis
      const firstImage = parsed.images[0];
      console.log('[AI Vision] Score:', firstImage.score, '| Type:', firstImage.photoType);
      return mapToExistingShape(firstImage);
    } else {
      // Single image response
      console.log('[AI Vision] Score:', parsed.score, '| Type:', parsed.photoType);
      return mapToExistingShape(parsed);
    }
    
  } catch (error: any) {
    console.error('[AI Vision] Error:', error.message);
    return null;
  }
}

// ===========================================
// ANALYZE MULTIPLE IMAGES (BATCH)
// ===========================================

export async function analyzeMultipleImages(
  images: { base64: string; mimeType: 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp' }[]
): Promise<{ images: any[]; summary: any } | null> {
  
  const apiKey = process.env.GOOGLE_API_KEY;
  
  if (!apiKey) {
    console.error('[AI Vision] GOOGLE_API_KEY not found');
    return null;
  }
  
  try {
    console.log(`[AI Vision] Analyzing ${images.length} images as a listing...`);
    
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`;
    
    // Build parts array with prompt and all images
    const parts: any[] = [{ text: SYSTEM_PROMPT }];
    
    images.forEach((img, index) => {
      parts.push({
        inline_data: {
          mime_type: img.mimeType,
          data: img.base64,
        },
      });
    });
    
    const requestBody = {
      contents: [{ parts }],
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 4096,
      },
    };
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('[AI Vision] Google AI Studio error:', response.status, errorText);
      return null;
    }
    
    const data = await response.json();
    const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    
    if (!responseText) {
      console.error('[AI Vision] No text in response');
      return null;
    }
    
    // Extract JSON
    let jsonStr = responseText;
    if (jsonStr.startsWith('```')) {
      jsonStr = jsonStr.replace(/```json?\n?/g, '').replace(/```/g, '').trim();
    }
    const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('[AI Vision] Could not find JSON in response');
      return null;
    }
    
    const parsed = JSON.parse(jsonMatch[0]);
    
    console.log('[AI Vision] Analyzed', parsed.images?.length || 0, 'images');
    console.log('[AI Vision] Summary:', parsed.summary);
    
    return parsed;
    
  } catch (error: any) {
    console.error('[AI Vision] Error:', error.message);
    return null;
  }
}

// ===========================================
// MAP AI OUTPUT TO RESPONSE SHAPE
// ===========================================

function mapToExistingShape(aiOutput: any): AIVisionResponse {
  const photoType = (aiOutput.photoType || 'unknown').toLowerCase();
  const issues = Array.isArray(aiOutput.issues) ? aiOutput.issues : [];
  const strengths = Array.isArray(aiOutput.strengths) ? aiOutput.strengths : [];
  const issuesLower = issues.map((i: string) => i.toLowerCase());
  const strengthsLower = strengths.map((s: string) => s.toLowerCase());
  
  let detected_photo_type: AIVisionResponse['detected_photo_type'] = 'unknown';
  if (photoType.includes('studio')) detected_photo_type = 'studio';
  else if (photoType.includes('lifestyle')) detected_photo_type = 'lifestyle';
  else if (photoType.includes('detail')) detected_photo_type = 'detail';
  else if (photoType.includes('scale')) detected_photo_type = 'scale';
  else if (photoType.includes('group')) detected_photo_type = 'group';
  else if (photoType.includes('packaging')) detected_photo_type = 'packaging';
  else if (photoType.includes('process')) detected_photo_type = 'process';
  
  // Derive flags from AI issues and strengths (more reliable than arbitrary fields)
  const hasLightingIssue = issuesLower.some(i => 
    i.includes('lighting') || i.includes('dark') || i.includes('dim') || 
    i.includes('shadow') || i.includes('bright') || i.includes('exposure')
  );
  const hasGoodLighting = strengthsLower.some(s => 
    s.includes('lighting') || s.includes('well-lit') || s.includes('bright')
  ) && !hasLightingIssue;
  
  const hasFocusIssue = issuesLower.some(i => 
    i.includes('blur') || i.includes('focus') || i.includes('soft') || i.includes('sharp')
  );
  const isSharpFocus = strengthsLower.some(s => 
    s.includes('sharp') || s.includes('focus') || s.includes('crisp') || s.includes('clear')
  ) && !hasFocusIssue;
  
  const hasBackgroundIssue = issuesLower.some(i => 
    i.includes('background') || i.includes('clutter') || i.includes('distract')
  );
  const hasCleanBackground = strengthsLower.some(s => 
    s.includes('clean') || s.includes('background') || s.includes('simple')
  ) && !hasBackgroundIssue;
  
  const hasContrastIssue = issuesLower.some(i => 
    i.includes('contrast') || i.includes('flat') || i.includes('dull')
  );
  
  const hasSaturationIssue = issuesLower.some(i => 
    i.includes('saturation') || i.includes('color') || i.includes('vibran') || i.includes('dull')
  );
  
  return {
    has_clean_white_background: hasCleanBackground,
    is_product_centered: !issuesLower.some(i => i.includes('center') || i.includes('crop') || i.includes('fill')),
    has_good_lighting: hasGoodLighting,
    is_sharp_focus: isSharpFocus,
    has_no_watermarks: !issuesLower.some(i => i.includes('watermark') || i.includes('logo') || i.includes('text')),
    professional_appearance: (aiOutput.score ?? 50) >= 75,
    
    detected_photo_type,
    has_studio_shot: photoType.includes('studio'),
    has_lifestyle_shot: photoType.includes('lifestyle'),
    has_scale_shot: photoType.includes('scale'),
    has_detail_shot: photoType.includes('detail'),
    has_group_shot: photoType.includes('group'),
    has_packaging_shot: photoType.includes('packaging'),
    has_process_shot: photoType.includes('process'),
    
    shows_texture_or_craftsmanship: photoType.includes('detail'),
    product_clearly_visible: !issuesLower.some(i => i.includes('visible') || i.includes('unclear')),
    appealing_context: photoType.includes('lifestyle') && !hasBackgroundIssue,
    reference_object_visible: photoType.includes('scale'),
    size_comparison_clear: photoType.includes('scale'),
    
    ai_score: typeof aiOutput.score === 'number' ? aiOutput.score : undefined,
    ai_confidence: typeof aiOutput.confidence === 'number' ? aiOutput.confidence : 0.8,
    ai_caps_applied: Array.isArray(aiOutput.capsApplied) ? aiOutput.capsApplied : [],
    ai_strengths: strengths,
    ai_issues: issues,
    ai_optimization_recommendations: Array.isArray(aiOutput.optimizationRecommendations) ? aiOutput.optimizationRecommendations : [],
    // New flags for optimization decisions
    _needs_brightness_boost: hasLightingIssue,
    _needs_sharpening: hasFocusIssue,
    _needs_contrast_boost: hasContrastIssue,
    _needs_saturation_boost: hasSaturationIssue,
    _needs_background_cleanup: hasBackgroundIssue,
    
    // Product fill percentage (70-80% is ideal for Etsy)
    ai_product_fill_percent: typeof aiOutput.productFillPercent === 'number' ? aiOutput.productFillPercent : undefined,

    // NEW: Etsy-specific preferences (Phase 1)
    ai_alt_text: typeof aiOutput.altText === 'string' ? aiOutput.altText : undefined,
    has_text_elements: typeof aiOutput.hasTextElements === 'boolean' ? aiOutput.hasTextElements : false,
    text_readable: typeof aiOutput.textReadable === 'boolean' ? aiOutput.textReadable : true,
    has_wrinkles: typeof aiOutput.hasWrinkles === 'boolean' ? aiOutput.hasWrinkles : false,

    // Phase 2: Warm Lighting & White Background
    has_warm_lighting: typeof aiOutput.hasWarmLighting === 'boolean' ? aiOutput.hasWarmLighting : false,
    lighting_temperature: ['warm', 'cool', 'neutral'].includes(aiOutput.lightingTemperature)
      ? aiOutput.lightingTemperature as 'warm' | 'cool' | 'neutral'
      : 'neutral',
    background_is_pure_white: typeof aiOutput.backgroundIsPureWhite === 'boolean' ? aiOutput.backgroundIsPureWhite : false,
    background_purity_score: typeof aiOutput.backgroundPurityScore === 'number' ? aiOutput.backgroundPurityScore : 0,
  } as AIVisionResponse;
}

// ===========================================
// FALLBACK DEFAULTS
// ===========================================

export function getDefaultVisionResponse(): AIVisionResponse {
  return {
    has_clean_white_background: false,
    is_product_centered: false,
    has_good_lighting: false,
    is_sharp_focus: false,
    has_no_watermarks: true,
    professional_appearance: false,
    detected_photo_type: 'unknown',
    has_studio_shot: false,
    has_lifestyle_shot: false,
    has_scale_shot: false,
    has_detail_shot: false,
    has_group_shot: false,
    has_packaging_shot: false,
    has_process_shot: false,
    shows_texture_or_craftsmanship: false,
    product_clearly_visible: false,
    appealing_context: false,
    reference_object_visible: false,
    size_comparison_clear: false,
    ai_score: 50,
    ai_confidence: 0,
    ai_caps_applied: ['analysis_failed'],
    ai_strengths: [],
    ai_issues: ['Unable to analyze image'],
    ai_optimization_recommendations: [],
    _needs_brightness_boost: false,
    _needs_sharpening: false,
    _needs_contrast_boost: false,
    _needs_saturation_boost: false,
    _needs_background_cleanup: false,
  };
}

// ===========================================
// MERGE TECHNICAL + AI VISION
// ===========================================

export function mergeAttributes(
  technical: {
    width_px: number;
    height_px: number;
    file_size_bytes: number;
    aspect_ratio: string;
    file_type: string;
    color_profile: string;
    ppi: number;
  },
  vision: AIVisionResponse
): ImageAttributes {
  return {
    ...technical,
    shortest_side: Math.min(technical.width_px, technical.height_px),
    has_clean_white_background: vision.has_clean_white_background,
    is_product_centered: vision.is_product_centered,
    has_good_lighting: vision.has_good_lighting,
    is_sharp_focus: vision.is_sharp_focus,
    has_no_watermarks: vision.has_no_watermarks,
    professional_appearance: vision.professional_appearance,
    has_studio_shot: vision.has_studio_shot,
    has_lifestyle_shot: vision.has_lifestyle_shot,
    has_scale_shot: vision.has_scale_shot,
    has_detail_shot: vision.has_detail_shot,
    has_group_shot: vision.has_group_shot,
    has_packaging_shot: vision.has_packaging_shot,
    has_process_shot: vision.has_process_shot,
    shows_texture_or_craftsmanship: vision.shows_texture_or_craftsmanship ?? false,
    product_clearly_visible: vision.product_clearly_visible ?? false,
    appealing_context: vision.appealing_context ?? false,
    reference_object_visible: vision.reference_object_visible ?? false,
    size_comparison_clear: vision.size_comparison_clear ?? false,
  };
}
