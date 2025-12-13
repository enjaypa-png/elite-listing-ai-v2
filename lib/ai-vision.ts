/**
 * AI VISION ANALYSIS - Deterministic Etsy Image Scoring
 * Uses Vertex AI (Gemini 2.5 Flash) for fast, accurate image analysis
 * Auth: API key header (x-goog-api-key)
 */

import { ImageAttributes } from './database-scoring';

// ===========================================
// VERTEX AI CONFIGURATION
// ===========================================
const VERTEX_PROJECT = 'gen-lang-client-0375102261';
const VERTEX_LOCATION = 'us-central1';
const VERTEX_MODEL = 'gemini-2.5-flash';

// ===========================================
// AI VISION RESPONSE TYPE (EXISTING SHAPE - PRESERVED)
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
  
  // Photo-type specific attributes
  shows_texture_or_craftsmanship: boolean;
  product_clearly_visible: boolean;
  appealing_context: boolean;
  reference_object_visible: boolean;
  size_comparison_clear: boolean;
  
  // AI-determined score (1-100) - SINGLE SOURCE OF TRUTH
  ai_score?: number;
  ai_confidence?: number;
  ai_caps_applied?: string[];
  ai_strengths?: string[];
  ai_issues?: string[];
}

// ===========================================
// SYSTEM PROMPT - SINGLE SOURCE OF TRUTH
// ===========================================

const SYSTEM_PROMPT = `ROLE:
You are an automated, critical image quality evaluator for Etsy product listings.

Your task is to strictly score individual product images on a 1–100 scale based on Etsy's real buyer-facing image standards.
You must be skeptical, conservative, and evidence-driven.

👉 Scores above 90 are rare and represent top-tier, professional listings only.
👉 Do not inflate scores. Do not assume intent. Judge only what is visible.

🔢 SCORING BASE RULES (MANDATORY)

Start every image at 50/100

Adjust score only when visual evidence exists

Apply hard caps when required elements are missing

Never return 100 unless all required criteria are met

If unsure, score lower, not higher

🚫 HARD SCORE CAPS (NON-NEGOTIABLE)

If any condition below is missing, enforce the maximum score cap:

Missing Element              | Max Score
-----------------------------|----------
Clean, distraction-free background | 85
Proper crop (no edge clipping, centered) | 90
Product clearly dominates frame | 90
Sharp focus (no softness / blur) | 85
Accurate color & exposure | 88
Studio-style presentation (main image only) | 92

📸 SCORING DIMENSIONS (ADD / SUBTRACT)

Apply all that apply. No double counting.

Composition & Framing (±15)
- Product fills ~70–85% of frame: +8
- Balanced margins / centered subject: +5
- Awkward crop, tilt, or cutoff: −8

Lighting & Exposure (±15)
- Soft, even, diffused lighting: +10
- Harsh shadows, glare, blown highlights: −10

Background Quality (±10)
- Clean, neutral, Etsy-appropriate background: +8
- Busy, textured, distracting background: −10

Context Use (±10)
- Lifestyle context improves clarity: +6
- Props distract or confuse: −6

Technical Quality (±10)
- Sharp, noise-free image: +8
- Compression artifacts, blur, softness: −8

🧠 PHOTO TYPE CLASSIFICATION (REQUIRED)

Classify each image as one or more of:
- studio_shot
- lifestyle_shot
- detail_shot
- scale_shot

If confidence <70%, classify as uncertain.

🚨 ANTI-INFLATION RULES (CRITICAL)

Do NOT assume professionalism
Do NOT average away failures
Do NOT reward "effort"
Do NOT boost scores for quantity
90–100 = top 1–5% of Etsy listings
Most solid listings should score 70–85

📤 REQUIRED OUTPUT (JSON ONLY)

Return ONLY a valid JSON object with this exact structure:
{
  "score": <number 1-100>,
  "capsApplied": [<list of cap reasons if any>],
  "photoTypes": [<list of detected types>],
  "strengths": [<list of positive observations>],
  "issues": [<list of problems found>],
  "confidence": <number 0-1>,
  "has_clean_background": <boolean>,
  "is_centered": <boolean>,
  "has_good_lighting": <boolean>,
  "is_sharp": <boolean>,
  "has_watermarks": <boolean>,
  "looks_professional": <boolean>
}

Do NOT include any text outside the JSON. Do NOT explain your reasoning.`;

// ===========================================
// ANALYZE IMAGE WITH VERTEX AI
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
    console.log('[AI Vision] Analyzing image with Vertex AI (Gemini 2.5 Flash)...');
    
    // Vertex AI endpoint
    const endpoint = `https://${VERTEX_LOCATION}-aiplatform.googleapis.com/v1/projects/${VERTEX_PROJECT}/locations/${VERTEX_LOCATION}/publishers/google/models/${VERTEX_MODEL}:generateContent`;
    
    // Build request body
    const requestBody = {
      contents: [
        {
          role: 'user',
          parts: [
            { text: SYSTEM_PROMPT },
            {
              inlineData: {
                mimeType: mimeType,
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
    
    // Make request with API key header
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
      },
      body: JSON.stringify(requestBody),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('[AI Vision] Vertex AI error:', response.status, errorText);
      return null;
    }
    
    const data = await response.json();
    
    // Extract text from response
    const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    
    if (!responseText) {
      console.error('[AI Vision] No text in response');
      return null;
    }
    
    console.log('[AI Vision] Raw response:', responseText.substring(0, 300));
    
    // Extract JSON from response
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
    
    // Log deterministic score
    console.log('[AI Vision] Deterministic score:', parsed.score, 'Confidence:', parsed.confidence, 'Caps:', parsed.capsApplied);
    
    // Map AI output to existing AIVisionResponse shape
    const mapped: AIVisionResponse = mapToExistingShape(parsed);
    
    return mapped;
    
  } catch (error: any) {
    console.error('[AI Vision] Error:', error.message);
    return null;
  }
}

// ===========================================
// MAP AI OUTPUT TO EXISTING SHAPE
// ===========================================

function mapToExistingShape(aiOutput: any): AIVisionResponse {
  const photoTypes: string[] = aiOutput.photoTypes || [];
  
  // Determine primary photo type
  let detected_photo_type: AIVisionResponse['detected_photo_type'] = 'unknown';
  if (photoTypes.includes('studio_shot')) detected_photo_type = 'studio';
  else if (photoTypes.includes('lifestyle_shot')) detected_photo_type = 'lifestyle';
  else if (photoTypes.includes('detail_shot')) detected_photo_type = 'detail';
  else if (photoTypes.includes('scale_shot')) detected_photo_type = 'scale';
  else if (photoTypes.includes('group_shot')) detected_photo_type = 'group';
  else if (photoTypes.includes('packaging_shot')) detected_photo_type = 'packaging';
  else if (photoTypes.includes('process_shot')) detected_photo_type = 'process';
  
  return {
    // Map boolean composition checks
    has_clean_white_background: aiOutput.has_clean_background ?? false,
    is_product_centered: aiOutput.is_centered ?? false,
    has_good_lighting: aiOutput.has_good_lighting ?? false,
    is_sharp_focus: aiOutput.is_sharp ?? false,
    has_no_watermarks: !(aiOutput.has_watermarks ?? false),
    professional_appearance: aiOutput.looks_professional ?? false,
    
    // Photo type detection
    detected_photo_type,
    has_studio_shot: photoTypes.includes('studio_shot'),
    has_lifestyle_shot: photoTypes.includes('lifestyle_shot'),
    has_scale_shot: photoTypes.includes('scale_shot'),
    has_detail_shot: photoTypes.includes('detail_shot'),
    has_group_shot: photoTypes.includes('group_shot'),
    has_packaging_shot: photoTypes.includes('packaging_shot'),
    has_process_shot: photoTypes.includes('process_shot'),
    
    // Photo-type specific (infer from context)
    shows_texture_or_craftsmanship: photoTypes.includes('detail_shot'),
    product_clearly_visible: aiOutput.is_centered ?? false,
    appealing_context: photoTypes.includes('lifestyle_shot'),
    reference_object_visible: photoTypes.includes('scale_shot'),
    size_comparison_clear: photoTypes.includes('scale_shot'),
    
    // AI-determined score - SINGLE SOURCE OF TRUTH
    ai_score: typeof aiOutput.score === 'number' ? aiOutput.score : undefined,
    ai_confidence: typeof aiOutput.confidence === 'number' ? aiOutput.confidence : undefined,
    ai_caps_applied: Array.isArray(aiOutput.capsApplied) ? aiOutput.capsApplied : [],
    ai_strengths: Array.isArray(aiOutput.strengths) ? aiOutput.strengths : [],
    ai_issues: Array.isArray(aiOutput.issues) ? aiOutput.issues : [],
  };
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
    
    // Photo-type specific attributes
    shows_texture_or_craftsmanship: vision.shows_texture_or_craftsmanship ?? false,
    product_clearly_visible: vision.product_clearly_visible ?? false,
    appealing_context: vision.appealing_context ?? false,
    reference_object_visible: vision.reference_object_visible ?? false,
    size_comparison_clear: vision.size_comparison_clear ?? false,
  };
}
