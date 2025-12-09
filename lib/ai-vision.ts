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
}

// ===========================================
// CLAUDE VISION PROMPT
// ===========================================

const VISION_PROMPT = `Analyze this product image and return ONLY a JSON object with these exact boolean fields.
Do NOT add any explanation or text outside the JSON.
Answer each question with true or false based on strict criteria:

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
  "has_process_shot": true/false
}

STRICT CRITERIA:
- has_clean_white_background: true ONLY if background is solid white or neutral (beige, light gray) with NO distracting elements
- is_product_centered: true ONLY if the main product occupies the center 60% of the frame
- has_good_lighting: true ONLY if product is evenly lit with no harsh shadows or dark areas
- is_sharp_focus: true ONLY if product edges are crisp and clear, not blurry
- has_no_watermarks: true ONLY if there are NO text overlays, logos, or watermarks visible
- professional_appearance: true ONLY if the image looks professionally shot (good composition, proper staging)

PHOTO TYPE DEFINITIONS:
- studio: Product on clean, simple, well-lit background (white/neutral)
- lifestyle: Product shown in use or natural setting/environment
- scale: Product shown next to common object (hand, coin, ruler) for size reference
- detail: Close-up highlighting texture, quality, or unique features
- group: Multiple products or variations shown together
- packaging: Image showing the product packaging
- process: Behind-the-scenes or product being made

Set the corresponding has_X_shot to true for the detected type.
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
      model: 'claude-3-5-sonnet-20240620',
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
  };
}
