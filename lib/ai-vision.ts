/**
 * AI VISION ANALYSIS - Etsy Image Scoring
 * Uses Google AI Studio (Gemini 2.0 Flash)
 * Calibrated with real Etsy listing anchors
 */

import { ImageAttributes } from './database-scoring';
import { SCORING_ANCHORS_TEXT, CATEGORY_REQUIREMENTS } from './scoring-anchors';

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
}

// ===========================================
// SYSTEM PROMPT - CALIBRATED WITH REAL ANCHORS
// ===========================================

const SYSTEM_PROMPT = `You are an Etsy product image scorer. Score images 1-100 based on how well they would convert sales on Etsy.

## YOUR CALIBRATION

You have been trained on real Etsy listings. Use these reference points:

${SCORING_ANCHORS_TEXT}

## SCORING APPROACH

1. **Start at 70** (average Etsy quality)
2. **Add points** for strengths (max +28 to reach 98)
3. **Subtract points** for issues (can go down to 40)
4. **Apply hard caps** for missing requirements

## POINT ADJUSTMENTS

**Composition (+/- 12 max)**
- Product fills 70-85% of frame: +6
- Well-centered, balanced margins: +4
- Awkward crop or tilted: -6
- Product too small in frame: -4

**Lighting (+/- 12 max)**
- Soft, even, professional lighting: +8
- Natural light, warm and inviting: +6
- Harsh shadows or glare: -8
- Too dark or overexposed: -6

**Background (+/- 12 max)**
- Clean studio (white/neutral): +6
- Aspirational lifestyle setting: +8
- Busy but not distracting: +2
- Distracting/ugly background: -10
- Industrial/messy environment: -12

**Category Fit (+/- 8 max)**
- Meets all category must-haves: +6
- Exceeds with nice-to-haves: +8
- Missing critical requirement: -8

## HARD CAPS (Cannot exceed these scores)

| Issue | Max Score |
|-------|-----------|
| Ugly/industrial background | 75 |
| Bad lifestyle (dirty, clashing) | 70 |
| No scale reference (jewelry/furniture) | 85 |
| Blurry or soft focus | 80 |
| Single image in listing context | 60 |

## PHOTO TYPE DETECTION

Classify as ONE primary type:
- **studio**: Clean background, product-focused
- **lifestyle**: Product in use or styled setting  
- **detail**: Close-up of texture/features
- **scale**: Size reference included
- **group**: Multiple items shown
- **packaging**: Shows how product arrives
- **process**: Behind-the-scenes/making

## OUTPUT FORMAT

Return ONLY valid JSON:
{
  "score": <number 40-98>,
  "photoType": "<primary type>",
  "strengths": ["<strength 1>", "<strength 2>"],
  "issues": ["<issue 1>", "<issue 2>"],
  "capsApplied": ["<cap reason if any>"],
  "confidence": <0.0-1.0>,
  "has_clean_background": <boolean>,
  "is_centered": <boolean>,
  "has_good_lighting": <boolean>,
  "is_sharp": <boolean>,
  "has_watermarks": <boolean>,
  "looks_professional": <boolean>,
  "background_quality": "<clean|lifestyle_good|lifestyle_bad|busy|ugly>",
  "similar_anchor": "<brief description of which anchor this most resembles>"
}

## CRITICAL RULES

1. **Environment matters as much as product** - Great product on ugly background = 75 max
2. **Bad lifestyle scores LOWER than no lifestyle** - Dirty stairs worse than plain studio
3. **Match to anchors** - Find the closest anchor and adjust from there
4. **Be honest** - Most Etsy photos are 65-80. Reserve 90+ for truly exceptional.
5. **Explain your score** - Reference specific visual evidence

Do NOT include any text outside the JSON.`;

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
    console.log('[AI Vision] Analyzing image with Gemini 2.0 Flash (anchor-calibrated)...');
    
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
        maxOutputTokens: 1024,
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
    
    console.log('[AI Vision] Score:', parsed.score, '| Type:', parsed.photoType, '| Similar to:', parsed.similar_anchor);
    
    return mapToExistingShape(parsed);
    
  } catch (error: any) {
    console.error('[AI Vision] Error:', error.message);
    return null;
  }
}

// ===========================================
// MAP AI OUTPUT TO RESPONSE SHAPE
// ===========================================

function mapToExistingShape(aiOutput: any): AIVisionResponse {
  const photoType = aiOutput.photoType || 'unknown';
  
  let detected_photo_type: AIVisionResponse['detected_photo_type'] = 'unknown';
  if (photoType.includes('studio')) detected_photo_type = 'studio';
  else if (photoType.includes('lifestyle')) detected_photo_type = 'lifestyle';
  else if (photoType.includes('detail')) detected_photo_type = 'detail';
  else if (photoType.includes('scale')) detected_photo_type = 'scale';
  else if (photoType.includes('group')) detected_photo_type = 'group';
  else if (photoType.includes('packaging')) detected_photo_type = 'packaging';
  else if (photoType.includes('process')) detected_photo_type = 'process';
  
  return {
    has_clean_white_background: aiOutput.has_clean_background ?? false,
    is_product_centered: aiOutput.is_centered ?? false,
    has_good_lighting: aiOutput.has_good_lighting ?? false,
    is_sharp_focus: aiOutput.is_sharp ?? false,
    has_no_watermarks: !(aiOutput.has_watermarks ?? false),
    professional_appearance: aiOutput.looks_professional ?? false,
    
    detected_photo_type,
    has_studio_shot: photoType === 'studio',
    has_lifestyle_shot: photoType === 'lifestyle',
    has_scale_shot: photoType === 'scale',
    has_detail_shot: photoType === 'detail',
    has_group_shot: photoType === 'group',
    has_packaging_shot: photoType === 'packaging',
    has_process_shot: photoType === 'process',
    
    shows_texture_or_craftsmanship: photoType === 'detail',
    product_clearly_visible: aiOutput.is_centered ?? false,
    appealing_context: photoType === 'lifestyle' && aiOutput.background_quality !== 'lifestyle_bad',
    reference_object_visible: photoType === 'scale',
    size_comparison_clear: photoType === 'scale',
    
    ai_score: typeof aiOutput.score === 'number' ? aiOutput.score : undefined,
    ai_confidence: typeof aiOutput.confidence === 'number' ? aiOutput.confidence : undefined,
    ai_caps_applied: Array.isArray(aiOutput.capsApplied) ? aiOutput.capsApplied : [],
    ai_strengths: Array.isArray(aiOutput.strengths) ? aiOutput.strengths : [],
    ai_issues: Array.isArray(aiOutput.issues) ? aiOutput.issues : [],
  };
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
