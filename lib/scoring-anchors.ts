/**
 * SCORING ANCHORS - Real Etsy Examples for AI Calibration
 * 
 * These anchors teach the AI what different score ranges look like.
 * Data collected from real Etsy listings across quality spectrum.
 */

// ===========================================
// SCORE RANGE DEFINITIONS
// ===========================================

export const SCORE_RANGES = {
  exceptional: { min: 90, max: 100, label: 'Exceptional', description: 'Top 1-5% of Etsy - professional photography' },
  good: { min: 80, max: 89, label: 'Good', description: 'Best-seller quality - strong photos that convert' },
  average: { min: 70, max: 79, label: 'Average', description: 'Typical Etsy quality - room for improvement' },
  below_average: { min: 60, max: 69, label: 'Below Average', description: 'Multiple issues affecting sales' },
  poor: { min: 40, max: 59, label: 'Poor', description: 'Significant problems - needs reshoot' },
  failing: { min: 0, max: 39, label: 'Failing', description: 'Would actively hurt sales' }
};

// ===========================================
// ANCHOR EXAMPLES BY SCORE RANGE
// These are embedded in the AI prompt for calibration
// ===========================================

export const SCORING_ANCHORS_TEXT = `
## SCORING CALIBRATION ANCHORS

Use these real Etsy examples to calibrate your scoring. Match the user's image to the most similar anchor.

### EXCEPTIONAL (90-98)

**94/100 - Pet Supplies - Lifestyle with Pet**
"Cat actively using wooden pet bowl, shows removable bowl feature, warm natural lighting, cozy home setting - exactly what Pet Supplies needs. Pet engagement + clear product visibility + aspirational context."
- Strengths: Pet in use, natural light, demonstrates functionality, emotional appeal
- Why 94: Hits every category requirement, professional execution

**93/100 - Jewelry - On-Body Hero**
"Personalized anklet on model's ankle with beach setting, warm lighting makes gold pop, excellent scale reference with foot visible."
- Strengths: On-body context, warm lighting, lifestyle setting, clear product
- Why 93: Professional quality, shows size naturally, aspirational context

**92/100 - Vintage - Hero Product Shot**
"Watch in presentation box, professional lighting highlights sunburst gold dial, clear vintage authenticity markers visible."
- Strengths: Professional presentation, excellent lighting, shows condition clearly
- Why 92: Builds trust for vintage buyers, museum-quality presentation

**91/100 - Home & Living - Lifestyle**
"Framed wall art in elegant Parisian-style room, beautiful natural lighting, oak frame visible, minimalist styling."
- Strengths: Aspirational room setting, natural light, doesn't over-style
- Why 91: Shows product in context without competing elements

### GOOD (80-89)

**88/100 - Home & Living - Lifestyle**
"Coffee table in living room with natural lighting, good scale reference with surrounding furniture, elegant styling with candles/books."
- Strengths: Real room context, warm lighting, demonstrates scale
- Why 88 not 92: Slight darkness in lighting, one distracting element

**86/100 - Vintage - Side Profile Detail**
"Watch slim case profile and lug design, important for collectors assessing wearability."
- Strengths: Critical detail for category, sharp focus, informative
- Why 86: Useful but not hero-quality, serves specific purpose

**85/100 - Home & Living - Lifestyle**
"Coffee table hero shot in realistic living room, excellent scale reference and styling."
- Strengths: Good context, shows real use
- Why 85 not 90: Lighting slightly dark, could be brighter

### AVERAGE (70-79)

**75/100 - Home & Living - Detail**
"Close-up showing weave texture and pattern, fills frame well."
- Strengths: Good detail visibility, sharp focus
- Weaknesses: Still on unappealing floor background, slight shadow at bottom
- Why 75: Good execution undermined by poor background choice

**73/100 - Jewelry - Infographic**
"Font selection guide for personalization options."
- Strengths: Helpful for conversion, clear information
- Weaknesses: Not a product photo, doesn't showcase actual jewelry
- Why 73: Useful but doesn't demonstrate product quality

### BELOW AVERAGE (60-69)

**68/100 - Home & Living - Detail**
"Weave texture from closer angle, better composition than others."
- Strengths: Shows material quality
- Weaknesses: Same industrial floor background, no lifestyle context
- Why 68: Decent shot ruined by environment

**62/100 - Home & Living - Hero**
"Full rug laid flat on industrial green tile floor, orange wall visible, harsh overhead lighting."
- Strengths: Shows full product
- Weaknesses: Industrial floor with grout lines, clashing wall color, harsh reflections
- Why 62: Product visible but environment actively hurts appeal

**61/100 - Home & Living - Alternate Angle**
"Different perspective but same green tile floor, orange wall, harsh lighting with reflections."
- Strengths: Shows different angle
- Weaknesses: Same environmental problems, no staging effort
- Why 61: Redundant angle doesn't add value

### POOR (40-59)

**55/100 - Home & Living - Lifestyle Attempt**
"Rug shown on stairs for lifestyle context, but bright green walls and worn marble stairs are extremely distracting."
- Strengths: Attempted lifestyle context
- Weaknesses: Green walls clash with product, worn/dirty stairs visible, not aspirational
- Why 55: Good intent, terrible execution - environment hurts more than helps

**54/100 - Home & Living - Lifestyle Attempt**
"Another staircase shot, bright green walls, worn marble, metal railing distracting."
- Strengths: Shows product in use
- Weaknesses: Clashing colors, dirty surfaces, industrial feel
- Why 54: Lifestyle context that actually damages perception

**52/100 - Wall Art - Single Image Listing**
"Canvas print on plain beige wall, harsh overhead shadow, no scale reference, no detail shots."
- Strengths: Product centered, in focus
- Weaknesses: ONLY 1 IMAGE, no scale, no texture detail, no lifestyle context, plain wall
- Why 52: Bare minimum effort - would not convert

### CRITICAL SCORING RULES FROM ANCHORS:

1. **Environment matters as much as product** - A sharp, well-composed product photo on ugly background caps at 75 max
2. **Lifestyle context must be ASPIRATIONAL** - Bad lifestyle (dirty stairs, industrial floors) scores LOWER than plain studio
3. **Single image listings cap at 60** - Regardless of image quality, 1 photo = no trust
4. **Redundant angles don't add value** - Same shot from slightly different angle = diminishing returns
5. **Category requirements are non-negotiable** - Pet Supplies without pet = capped. Jewelry without scale = capped.
`;

// ===========================================
// CATEGORY-SPECIFIC REQUIREMENTS
// ===========================================

export const CATEGORY_REQUIREMENTS: Record<string, {
  name: string;
  must_have: string[];
  nice_to_have: string[];
  common_failures: string[];
}> = {
  home_living: {
    name: 'Home & Living',
    must_have: [
      'Lifestyle context showing product in real room setting',
      'Scale reference with furniture or common objects',
      'Clean or intentionally styled background',
      'Warm, inviting lighting'
    ],
    nice_to_have: [
      'Multiple room settings showing versatility',
      'Detail shots of texture/craftsmanship',
      'Color accuracy for fabric/material'
    ],
    common_failures: [
      'Industrial or warehouse backgrounds',
      'Harsh overhead lighting',
      'No room context - just product on floor',
      'Clashing wall colors'
    ]
  },
  jewelry: {
    name: 'Jewelry & Accessories',
    must_have: [
      'Clean white or neutral background for studio shots',
      'Sharp focus on fine details',
      'Scale reference (hand, finger, coin)',
      'No harsh shadows or glare on metal'
    ],
    nice_to_have: [
      'On-body/model shots',
      'Multiple angles',
      'Lifestyle context (elegant setting)'
    ],
    common_failures: [
      'Blurry detail shots',
      'No size reference',
      'Busy patterned backgrounds',
      'Glare on gemstones/metal'
    ]
  },
  pet_supplies: {
    name: 'Pet Supplies',
    must_have: [
      'Pet shown using the product (when possible)',
      'Product clearly visible even with pet',
      'Scale reference',
      'Clean background'
    ],
    nice_to_have: [
      'Multiple pets/breeds shown',
      'Lifestyle home setting',
      'Emotional appeal shots'
    ],
    common_failures: [
      'No pet in any photos',
      'Pet obscures product',
      'No size reference for pet items',
      'Sterile studio-only approach'
    ]
  },
  vintage: {
    name: 'Vintage Items',
    must_have: [
      'Condition clearly visible - show wear honestly',
      'Multiple angles',
      'Authenticity markers visible (labels, stamps, hallmarks)',
      'Scale reference'
    ],
    nice_to_have: [
      'Professional presentation (box, stand)',
      'Detail shots of patina/character',
      'Context shots suggesting era'
    ],
    common_failures: [
      'Hiding flaws or wear',
      'Single angle only',
      'No authenticity proof',
      'Poor lighting hiding condition'
    ]
  },
  art_collectibles: {
    name: 'Art & Collectibles / Wall Art',
    must_have: [
      'Straight-on shot without distortion',
      'True colors, no color cast',
      'No glare or reflections',
      'Scale reference with furniture or person'
    ],
    nice_to_have: [
      'Room mockup showing size in context',
      'Detail of texture/brushwork',
      'Frame options shown'
    ],
    common_failures: [
      'Single image only',
      'No size context',
      'Glare from glass/varnish',
      'Perspective distortion'
    ]
  },
  clothing: {
    name: 'Clothing/Apparel',
    must_have: [
      'On model OR professional flat lay',
      'Full garment visible',
      'Fabric texture visible',
      'Wrinkle-free presentation'
    ],
    nice_to_have: [
      'Multiple angles (front, back, detail)',
      'Size reference or fit guide',
      'Lifestyle/styled shots'
    ],
    common_failures: [
      'Wrinkled garments',
      'On hanger against wall',
      'Poor lighting hiding fabric quality',
      'No full garment shot'
    ]
  },
  bath_beauty: {
    name: 'Bath & Beauty',
    must_have: [
      'Clean, spa-like aesthetic',
      'Packaging/labels clearly readable',
      'Ingredients or texture shown (where relevant)',
      'Professional lighting'
    ],
    nice_to_have: [
      'Lifestyle context (bathroom, vanity)',
      'Texture swatches',
      'Size comparison'
    ],
    common_failures: [
      'Cluttered background',
      'Unreadable labels',
      'No texture/consistency shown',
      'Harsh bathroom lighting'
    ]
  },
  craft_supplies: {
    name: 'Craft Supplies & Tools',
    must_have: [
      'All items clearly shown',
      'Quantity visible',
      'Scale reference',
      'Quality/texture visible'
    ],
    nice_to_have: [
      'Shown in use/project context',
      'Close-up of material quality',
      'Packaging shot'
    ],
    common_failures: [
      'Unclear what quantity included',
      'No size reference',
      'Poor lighting hiding quality',
      'Messy arrangement'
    ]
  }
};

// ===========================================
// HELPER: Generate prompt section
// ===========================================

export function getAnchorsForPrompt(): string {
  return SCORING_ANCHORS_TEXT;
}

export function getCategoryRequirements(category: string): string {
  const cat = CATEGORY_REQUIREMENTS[category];
  if (!cat) return '';
  
  return `
CATEGORY: ${cat.name}
MUST HAVE: ${cat.must_have.join(', ')}
NICE TO HAVE: ${cat.nice_to_have.join(', ')}
COMMON FAILURES: ${cat.common_failures.join(', ')}
`;
}
