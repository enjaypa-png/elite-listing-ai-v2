/**
 * AI VISION ANALYSIS - Binary YES/NO Responses Only
 * Uses Claude Vision to detect image attributes
 * Returns structured boolean data, NOT subjective scores
 */

import Anthropic from '@anthropic-ai/sdk';
import { ImageAttributes } from './database-scoring';

// ===========================================
// AI VISION RESPONSE TYPE
// ===========================================

export interface AIVisionResponse {
  // Composition checks (binary)
  has_clean_white_background: boolean;
  is_product_centered: boolean;
  has_good_lighting: boolean;
  is_sharp_focus: boolean;
  has_no_watermarks: boolean;
  professional_appearance: boolean;
  
  // Photo type detection (binary)
  detected_photo_type: 'studio' | 'lifestyle' | 'scale' | 'detail' | 'group' | 'packaging' | 'process' | 'unknown';
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

// ===========================================
// CLAUDE VISION PROMPT
// ===========================================

const VISION_PROMPT = `You are analyzing product photos for Etsy listings. Your goal is to help sellers understand if their photos meet Etsy's best practices.

Analyze this product image and return ONLY a JSON object with these exact boolean fields.
Do NOT add any explanation or text outside the JSON.

{
  "has_clean_white_background": true/false,
  "is_product_centered": true/false,
  "has_good_lighting": true/false,
  "is_sharp_focus": true/false,
  "has_no_watermarks": true/false,
  "professional_appearance": true/false,
  "detected_photo_type": "studio" | "lifestyle" | "scale" | "detail" | "group" | "packaging" | "process" | "unknown",
  "has_studio_shot": true/false,
  "has_lifestyle_shot": true/false,
  "has_scale_shot": true/false,
  "has_detail_shot": true/false,
  "has_group_shot": true/false,
  "has_packaging_shot": true/false,
  "has_process_shot": true/false,
  "shows_texture_or_craftsmanship": true/false,
  "product_clearly_visible": true/false,
  "appealing_context": true/false,
  "reference_object_visible": true/false,
  "size_comparison_clear": true/false
}

STANDARD CRITERIA (be reasonable, not strict):
- has_clean_white_background: true if background is clean and uncluttered. Can be white, gray, beige, cream, linen, wood, or any simple surface. Does NOT require pure white.
- is_product_centered: true if the product is the clear focus and prominently positioned
- has_good_lighting: true if product is well-lit and details are visible. Soft shadows are fine.
- is_sharp_focus: true if product is in focus and details are reasonably clear
- has_no_watermarks: true if there are NO text overlays, logos, or watermarks
- professional_appearance: true if the image looks intentionally styled and composed

PHOTO TYPE DEFINITIONS (be generous - if it's close, mark it true):
- STUDIO: Clean, uncluttered background (white, gray, beige, linen, wood, simple texture). Product is the clear focus. Does NOT require pure white backdrop.
- LIFESTYLE: Product shown in context, in use, or styled setting (on table, shelf, with decor, outdoors, etc.)
- SCALE: ANY object providing size reference - books, leaves, plants, hands, furniture, cups, coins, rulers, fabric, food items, etc.
- DETAIL: Close-up or cropped view showing texture, material quality, craftsmanship, stitching, or specific features
- GROUP: Multiple products or variations shown together
- PACKAGING: Product packaging is visible
- PROCESS: Behind-the-scenes or making-of shot

PHOTO-TYPE SPECIFIC CRITERIA:
- shows_texture_or_craftsmanship: true if you can see material quality, texture, grain, weave, stitching, or handmade details
- product_clearly_visible: true if the product is the clear subject and easily identifiable
- appealing_context: true if the setting enhances the product appeal
- reference_object_visible: true if ANY object provides size context (books, leaves, plants, hands, furniture, cups, etc.)
- size_comparison_clear: true if viewer can reasonably gauge the product's size from context

Set detected_photo_type to the BEST match, and set the corresponding has_X_shot to true.
Return ONLY the JSON object, no other text.`;

// ===========================================
// ANALYZE IMAGE WITH CLAUDE VISION
// ===========================================

export async function analyzeImageWithVision(
  imageBase64: string,
  mimeType: 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp' = 'image/jpeg'
): Promise<AIVisionResponse | null> {
  
  // Use ANTHROPIC_API_KEY only
  const apiKey = process.env.ANTHROPIC_API_KEY;
  
  if (!apiKey) {
    console.error('[AI Vision] ANTHROPIC_API_KEY not found');
    return null;
  }
  
  try {
    console.log('[AI Vision] Analyzing image with Claude Vision...');
    
    const anthropic = new Anthropic({
      apiKey,
    });
    
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: mimeType,
                data: imageBase64,
              },
            },
            {
              type: 'text',
              text: VISION_PROMPT,
            },
          ],
        },
      ],
    });
    
    // Extract text response
    const textContent = response.content.find(c => c.type === 'text');
    if (!textContent || textContent.type !== 'text') {
      console.error('[AI Vision] No text response from Claude');
      return null;
    }
    
    // Parse JSON response
    const jsonText = textContent.text.trim();
    console.log('[AI Vision] Raw response:', jsonText);
    
    // Try to extract JSON from response (in case there's extra text)
    const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('[AI Vision] Could not find JSON in response');
      return null;
    }
    
    const parsed = JSON.parse(jsonMatch[0]) as AIVisionResponse;
    
    console.log('[AI Vision] Parsed response:', parsed);
    
    return parsed;
    
  } catch (error: any) {
    console.error('[AI Vision] Error:', error.message);
    return null;
  }
}

// ===========================================
// FALLBACK: DETERMINISTIC DEFAULTS
// ===========================================

export function getDefaultVisionResponse(): AIVisionResponse {
  return {
    has_clean_white_background: false,
    is_product_centered: false,
    has_good_lighting: false,
    is_sharp_focus: false,
    has_no_watermarks: true,  // Assume no watermarks by default
    professional_appearance: false,
    detected_photo_type: 'unknown',
    has_studio_shot: false,
    has_lifestyle_shot: false,
    has_scale_shot: false,
    has_detail_shot: false,
    has_group_shot: false,
    has_packaging_shot: false,
    has_process_shot: false,
    // Photo-type specific defaults (NEW)
    shows_texture_or_craftsmanship: false,
    product_clearly_visible: false,
    appealing_context: false,
    reference_object_visible: false,
    size_comparison_clear: false,
  };
}

// ===========================================
// MERGE TECHNICAL + AI VISION INTO ATTRIBUTES
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
    
    // AI Vision attributes
    has_clean_white_background: vision.has_clean_white_background,
    is_product_centered: vision.is_product_centered,
    has_good_lighting: vision.has_good_lighting,
    is_sharp_focus: vision.is_sharp_focus,
    has_no_watermarks: vision.has_no_watermarks,
    professional_appearance: vision.professional_appearance,
    
    // Photo types
    has_studio_shot: vision.has_studio_shot,
    has_lifestyle_shot: vision.has_lifestyle_shot,
    has_scale_shot: vision.has_scale_shot,
    has_detail_shot: vision.has_detail_shot,
    has_group_shot: vision.has_group_shot,
    has_packaging_shot: vision.has_packaging_shot,
    has_process_shot: vision.has_process_shot,
    
    // Photo-type specific attributes (NEW)
    shows_texture_or_craftsmanship: vision.shows_texture_or_craftsmanship ?? false,
    product_clearly_visible: vision.product_clearly_visible ?? false,
    appealing_context: vision.appealing_context ?? false,
    reference_object_visible: vision.reference_object_visible ?? false,
    size_comparison_clear: vision.size_comparison_clear ?? false,
  };
}
