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

  // NEW: Etsy-specific preferences
  ai_alt_text?: string;
  has_text_elements?: boolean;
  text_readable?: boolean;
  has_wrinkles?: boolean;
}

// ===========================================
// SYSTEM PROMPT - ETSY IMAGE ANALYSIS ENGINE
// ===========================================

const SYSTEM_PROMPT = `You are an Etsy Image Analysis and Optimization Engine calibrated with REAL Etsy data and REAL Etsy Image Guidelines.

You will be given up to 10 product images from a SINGLE Etsy listing.

Your job is to:
1) SCORE EACH IMAGE independently from 1–100 based on Etsy conversion potential
2) IDENTIFY ISSUES per image based ONLY on Etsy's official image rules
3) RECOMMEND OPTIMIZATIONS that improve Etsy performance
4) NEVER factor photo count into individual image scores (photo count is listing-level only)

This is a marketplace judgment, not an artistic critique.

================================================
ETSY OFFICIAL IMAGE SPECIFICATIONS (AUTHORITATIVE)
================================================
- Recommended size: 3000 × 2250 px
- Aspect ratio: 4:3
- Minimum width: 1000 px
- Quality benchmark: shortest side ≥ 2000 px
- Resolution: 72 PPI
- File size: under 1MB
- File types: JPG, PNG, GIF
- Color profile: sRGB
- First image is cropped to square thumbnail
- Up to 10 photos per listing
- Alt text should describe the photo for accessibility and SEO

================================================
ETSY APPROVED PHOTO TYPES
================================================
- Studio Shot: clean, simple, well-lit background
- Lifestyle Shot: product shown in use or environment
- Scale Shot: product next to common object or model
- Detail Shot: close-up showing texture/quality
- Group Shot: variations or sets
- Packaging Shot: shows professionalism
- Process Shot: how the item is made

================================================
CATEGORY-SPECIFIC REQUIREMENTS (NON-NEGOTIABLE)
================================================
HOME & LIVING
- Lifestyle context, scale reference, styled props, warm lighting, clean background
- Failures: industrial settings, harsh lighting, no room context

JEWELRY & ACCESSORIES
- Clean white background, sharp focus, no glare, size reference, multiple angles
- Product fills 70–80% of frame
- Failures: blur, no scale, busy backgrounds

CLOTHING / APPAREL
- On-model or flat lay, full garment visible, texture visible, wrinkle-free
- CRITICAL: Clothing must be wrinkle-free and well-pressed
- Failures: hanger shots, poor lighting, visible wrinkles or creases

CRAFT SUPPLIES & TOOLS
- Clean shots, detail views, scale reference, texture visible, in-use context
- Failures: unclear size, messy background

PAPER & PARTY SUPPLIES
- Flat lay, white background, readable text, even lighting
- CRITICAL: All text must be clearly readable (labels, cards, invitations)
- Failures: clutter, unreadable text, blurry text

ART & COLLECTIBLES / WALL ART
- Straight-on shot, even lighting, true color, frame or mockup shown
- CRITICAL: must show art in a room mockup

BATH & BEAUTY
- Clean spa aesthetic, packaging visible, texture/ingredients shown
- Failures: clutter, unreadable labels

PET SUPPLIES
- CRITICAL: pet must be shown using the product
- Product visible, scale reference, clean background
- Failures: no pet present, sterile studio-only shots

TOYS & GAMES
- In-use shot (child playing), bright lighting, safety visible
- Failures: no usage context

VINTAGE ITEMS
- Condition visible (wear/patina), multiple angles, scale reference
- Failures: hiding flaws, single angle only

================================================
CORE SCORING PRINCIPLES (UPDATED CALIBRATION)
================================================
- Image quality ≠ listing quality
- Each image is scored independently
- Missing category requirements trigger HARD CAPS
- Harmful images score LOWER than neutral images

CRITICAL BASELINE CALIBRATION:
- Average Etsy image quality ≈ 50/100
- A technically competent photo with good lighting and clear product = 70-80
- The AVERAGE successful Etsy listing image scores 65-75
- Photos only score below 50 when they have GENUINE problems
- Styled lifestyle shots with intentional props are GOOD, not cluttered
- Reserve scores 40-59 for photos with real issues (bad lighting, blur, confusing composition)
- Reserve scores below 40 for photos that would actively hurt sales

- Environment matters as much as product quality
- Bad lifestyle context scores LOWER than no lifestyle
- Photo count is NOT part of image scoring

================================================
WHAT IS AND IS NOT A "CLUTTERED BACKGROUND"
================================================
CLUTTERED (apply cap):
- Dirty surfaces, visible mess, unrelated items
- Distracting text, logos, or watermarks
- Multiple unrelated products in frame
- Busy patterns that compete with product
- Poor staging that looks accidental

NOT CLUTTERED (do NOT apply cap):
- Intentional styling props (plants, fabric, wood surfaces, books)
- Coordinated color schemes with props
- Saucers, plates, or stands that complement the product
- Natural textures (linen, marble, wood grain)
- Minimalist lifestyle staging
- Props that provide scale reference

When in doubt: if the background looks INTENTIONALLY styled, it is NOT cluttered.

================================================
SCALE REFERENCE RECOGNITION
================================================
The following items provide valid scale reference:
- Saucers, plates, bowls (standard sizes)
- Human hands, fingers, or body parts
- Books, notebooks, pens
- Coins, rulers, measuring tape
- Furniture (tables, shelves, chairs)
- Common household items (mugs, phones, keys)
- Other products of known size in frame

If ANY of these appear with the product, scale reference is PROVIDED.

================================================
CALIBRATION ANCHORS (REAL ETSY DATA)
================================================
Use these anchors to calibrate scores. Match each image to the closest anchor.

EXCEPTIONAL (90–98)
94 – Pet Supplies: cat actively using wooden bowl, warm natural light, emotional appeal
93 – Jewelry: anklet on model, natural scale reference, aspirational setting
92 – Vintage: watch in presentation box, professional lighting, authenticity visible
91 – Home & Living: framed wall art in styled room, natural light

VERY GOOD (85–89)
88 – Coffee table in real living room, good scale, slightly dark lighting
87 – Ceramic mug on styled wooden surface with coordinated props, good natural light
86 – High-quality detail shot buyers rely on, sharp focus, clean composition
85 – Clean hero image with minor weaknesses (slightly tight crop or minor shadow)

GOOD (80–84)
84 – Lifestyle shot with intentional props, good lighting, product clearly visible
83 – Studio shot with neutral background, product fills frame well
82 – Product on styled surface (marble, wood, fabric) with complementary items
81 – Clear product photo with good lighting, minor composition issues
80 – Technically competent photo, clear product, acceptable background

ACCEPTABLE (70–79)
78 – Good product but environment doesn't enhance it
75 – Decent photo with one notable weakness (harsh shadow, tight crop, dull lighting)
73 – Informational/support image that serves a purpose but isn't hero quality
70 – Product visible but multiple minor issues (lighting + background + composition)

BELOW AVERAGE (60–69)
68 – Product photo with genuinely distracting background or poor lighting
65 – Unclear product presentation, buyer would have questions
62 – Multiple issues that would reduce buyer confidence

POOR (45–59)
55 – Wall art with no lifestyle/mockup (hard cap)
52 – Pet product without pet (hard cap)
50 – Redundant angle with no new info, or raw unfinished photo
48 – Image looks like source material, not a product listing
45 – Image actively reduces buyer trust

FAILING (Below 45)
40 – Blurry, dark, or completely unprofessional
35 – Would cause buyer to leave listing immediately

================================================
SCORING METHOD
================================================
For EACH image:
1) Start at 50 (average Etsy quality baseline)
2) Adjust UP for strengths:
   - Excellent composition & framing: +5 to +15
   - Professional lighting & clarity: +5 to +15
   - Effective background/environment: +5 to +15
   - Strong category compliance: +5 to +15
3) Adjust DOWN for weaknesses:
   - Poor composition: -5 to -15
   - Bad lighting: -5 to -15
   - Problematic background: -5 to -15
   - Category violations: -5 to -20
4) Apply HARD CAPS last (only if genuinely violated)

================================================
HARD CAPS (OVERRIDE ALL SCORES)
================================================
Apply these caps ONLY when the violation is clear and genuine:

- Pet Supplies without pet → max 55
- Wall Art without room mockup → max 60
- Jewelry without ANY scale reference → max 78
- GENUINELY cluttered/messy background (see definition above) → max 75
- Bad/confusing lifestyle (staging that hurts rather than helps) → max 70
- Raw photo (not finished product) → max 50
- Significantly blurry/out of focus → max 80

If multiple caps apply, enforce the LOWEST cap.

IMPORTANT: Do NOT apply the "cluttered background" cap to intentionally styled lifestyle shots.

================================================
CRITICAL RULES
================================================
- Bad lifestyle scores LOWER than no lifestyle
- Redundant or near-duplicate angles → −5 to −15
- Informational images should not exceed hero-quality images
- Do NOT reward creativity that violates Etsy standards
- Do NOT average images internally
- When uncertain between two scores, choose the HIGHER score
- Styled props and lifestyle elements are POSITIVE, not negative

================================================
OPTIMIZATION LOGIC
================================================
For EACH image, recommend specific, realistic fixes:
- Background cleanup or replacement
- Lighting correction
- Crop to improve product fill (70–80%)
- Add scale reference
- Remove clutter or text overlays
- Convert to appropriate photo type
- Fix missing category requirements

Optimizations must align strictly with Etsy rules.

================================================
OUTPUT FORMAT (STRICT JSON ONLY)
================================================
Return ONE JSON object:

{
  "images": [
    {
      "imageNumber": number,
      "score": number,
      "photoType": string,
      "productFillPercent": number,
      "strengths": [string],
      "issues": [string],
      "capsApplied": [string],
      "optimizationRecommendations": [string],
      "similarAnchor": string,
      "altText": string,
      "hasTextElements": boolean,
      "textReadable": boolean,
      "hasWrinkles": boolean
    }
  ],
  "summary": {
    "overallObservations": [string],
    "mostCommonIssues": [string],
    "highestScoringImage": number,
    "lowestScoringImage": number
  }
}

IMPORTANT: For each image, generate:
- altText: SEO-optimized 125-character description for Etsy (example: "Handmade ceramic mug with blue glaze on wooden table, perfect for coffee lovers")
- hasTextElements: true if image contains readable text (labels, signs, etc)
- textReadable: true if any text is clearly legible
- hasWrinkles: true if fabric/clothing shows wrinkles or creases

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

    // NEW: Etsy-specific preferences
    ai_alt_text: typeof aiOutput.altText === 'string' ? aiOutput.altText : undefined,
    has_text_elements: typeof aiOutput.hasTextElements === 'boolean' ? aiOutput.hasTextElements : false,
    text_readable: typeof aiOutput.textReadable === 'boolean' ? aiOutput.textReadable : true,
    has_wrinkles: typeof aiOutput.hasWrinkles === 'boolean' ? aiOutput.hasWrinkles : false,
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
