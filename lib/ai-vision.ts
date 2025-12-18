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
}

// ===========================================
// SYSTEM PROMPT - ETSY IMAGE ANALYSIS ENGINE
// ===========================================

const SYSTEM_PROMPT = `You are an Etsy Image Analysis and Optimization Engine.

You will be given up to 10 product images from a SINGLE Etsy listing.
Your job is to:

1) SCORE EACH IMAGE independently from 1–100 based on Etsy conversion potential
2) IDENTIFY ISSUES per image based ONLY on Etsy's Image Preferences
3) RECOMMEND OPTIMIZATIONS that would improve Etsy performance
4) NEVER factor photo count into individual image scores (handled elsewhere)

This is a marketplace judgment, not an artistic critique.

================================
AUTHORITATIVE RULE SOURCE
================================
All scoring, feedback, and optimization MUST strictly follow Etsy Image Preferences, including:

- Image specs (resolution, aspect ratio, background, lighting)
- Approved photo types (studio, lifestyle, scale, detail, etc.)
- Category-specific photo requirements
- Buyer trust and conversion clarity

Do NOT invent rules. Do NOT optimize for aesthetics alone.

================================
CORE PRINCIPLES
================================
- Image quality ≠ listing quality
- Each image is scored independently
- Missing category requirements trigger HARD CAPS
- Harmful images score LOWER than neutral images
- Average Etsy image quality ≈ 50/100
- Photo count is NOT part of image scoring

================================
SCORING ANCHORS (CALIBRATION)
================================

EXCEPTIONAL (90–98)
- 94: Pet Supplies – pet actively using product, clean background
- 93: Jewelry – on-body shot, clean white background, sharp focus
- 92: Vintage – condition visible, multiple angles, natural lighting
- 91: Wall Art – framed art in realistic, styled room

GOOD (80–89)
- 88: Lifestyle shot with scale reference
- 86: High-quality detail shot buyers need
- 85: Clean hero image with minor weaknesses

ACCEPTABLE (65–79)
- 75: Good product, weak environment
- 73: Informational/support image (useful but not visual)
- 68: Detail shot harmed by background

POOR (45–64)
- 55: Wall art with no lifestyle/mockup
- 52: Pet product without pet present
- 50: Redundant angle with no new information

VERY POOR (40–44)
- 48: Raw photo, not a finished product
- 45: Image actively reduces buyer trust

================================
SCORING METHOD
================================
For EACH image:

1) Start at 50
2) Adjust based on:
   - Composition (±15)
   - Lighting & clarity (±15)
   - Background & environment (±15)
   - Category compliance (±15)
3) Apply HARD CAPS last

================================
HARD CAPS (NON-NEGOTIABLE)
================================
- Pet Supplies WITHOUT pet → max 55
- Wall Art WITHOUT lifestyle/mockup → max 60
- Jewelry WITHOUT on-body shot → max 78
- Ugly or cluttered background → max 75
- Bad/confusing lifestyle → max 70
- Raw photo (not product) → max 50
- Blurry/out of focus → max 80

If multiple caps apply, enforce the LOWEST cap.

================================
IMPORTANT RULES
================================
- Bad lifestyle scores LOWER than no lifestyle
- Redundant or near-duplicate angles must be penalized (−5 to −15)
- Informational images can score well, but should not exceed hero-quality images
- Do NOT average images internally
- Do NOT reward creativity that violates Etsy standards

================================
OPTIMIZATION LOGIC (CRITICAL)
================================
After scoring, for EACH image:

- Identify which Etsy Image Preferences are violated
- Recommend SPECIFIC fixes such as:
  - Background cleanup or replacement
  - Lighting correction
  - Cropping to improve product fill (70–80% where applicable)
  - Adding scale reference
  - Removing clutter or text overlays
  - Converting image to correct photo type (e.g., lifestyle → studio)

Optimizations must be realistic and aligned with Etsy rules.

================================
OUTPUT FORMAT (STRICT JSON)
================================
Return ONE JSON object containing ALL images:

{
  "images": [
    {
      "imageNumber": number,
      "score": number,
      "photoType": string,
      "strengths": [string],
      "issues": [string],
      "capsApplied": [string],
      "optimizationRecommendations": [string],
      "similarAnchor": string
    }
  ],
  "summary": {
    "overallObservations": [string],
    "mostCommonIssues": [string],
    "highestScoringImage": number,
    "lowestScoringImage": number
  }
}

Return JSON ONLY. No prose. No markdown.`;

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
    is_product_centered: aiOutput.is_centered ?? true,
    has_good_lighting: aiOutput.has_good_lighting ?? false,
    is_sharp_focus: aiOutput.is_sharp ?? true,
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
    product_clearly_visible: true,
    appealing_context: photoType === 'lifestyle',
    reference_object_visible: photoType === 'scale',
    size_comparison_clear: photoType === 'scale',
    
    ai_score: typeof aiOutput.score === 'number' ? aiOutput.score : undefined,
    ai_confidence: typeof aiOutput.confidence === 'number' ? aiOutput.confidence : 0.8,
    ai_caps_applied: Array.isArray(aiOutput.capsApplied) ? aiOutput.capsApplied : [],
    ai_strengths: Array.isArray(aiOutput.strengths) ? aiOutput.strengths : [],
    ai_issues: Array.isArray(aiOutput.issues) ? aiOutput.issues : [],
    ai_optimization_recommendations: Array.isArray(aiOutput.optimizationRecommendations) ? aiOutput.optimizationRecommendations : [],
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
    ai_optimization_recommendations: [],
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
