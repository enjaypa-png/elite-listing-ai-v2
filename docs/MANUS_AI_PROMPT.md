# Manus AI Prompt: Etsy Image Scoring Anchor Collection

## Your Mission
Collect 40-50 real Etsy listing images to serve as **scoring anchors** for an AI-powered image analysis tool. These anchors will calibrate the AI to score images accurately relative to what actually sells on Etsy.

---

## CRITICAL: Output Format Required

Return your findings as a **JSON array** in a file called `scoring_anchors.json`. Each anchor must follow this exact structure:

```json
{
  "anchors": [
    {
      "id": "anchor_001",
      "category": "home_living",
      "photo_type": "studio",
      "score": 91,
      "image_url": "https://i.etsystatic.com/...",
      "seller_type": "best_seller",
      "reasoning": {
        "score_justification": "Clean white background, product fills 75% of frame, soft diffused lighting with no harsh shadows, professional color grading, sharp focus throughout",
        "strengths": [
          "Perfect 4:3 aspect ratio",
          "Product centered with balanced margins",
          "Neutral background doesn't compete with product",
          "Excellent detail visibility"
        ],
        "weaknesses": [
          "Could benefit from lifestyle context shot in set"
        ],
        "etsy_alignment": "Follows Etsy's recommendation for clean, well-lit hero images"
      },
      "technical_notes": {
        "background_type": "clean_white",
        "lighting_quality": "professional_soft",
        "composition": "centered_balanced",
        "has_props": false,
        "shows_scale": false,
        "image_position": "main_image"
      }
    }
  ]
}
```

---

## Categories to Cover (ALL 10 Required)

Collect **4-5 images per category** with a mix of score ranges:

| Category | Code | Target Images |
|----------|------|---------------|
| Home & Living | `home_living` | 5 images |
| Jewelry & Accessories | `jewelry` | 5 images |
| Clothing/Apparel | `clothing` | 5 images |
| Craft Supplies & Tools | `craft_supplies` | 4 images |
| Paper & Party Supplies | `paper_party` | 4 images |
| Art & Collectibles | `art_collectibles` | 5 images |
| Bath & Beauty | `bath_beauty` | 4 images |
| Pet Supplies | `pet_supplies` | 4 images |
| Toys & Games | `toys_games` | 4 images |
| Vintage Items | `vintage` | 5 images |

---

## Photo Types to Include

For each category, try to include multiple photo types:

| Photo Type | Code | Description |
|------------|------|-------------|
| Studio Shot | `studio` | Clean background, product-focused |
| Lifestyle Shot | `lifestyle` | Product in use/context |
| Detail Shot | `detail` | Close-up of texture/craftsmanship |
| Scale Shot | `scale` | Size reference included |
| Group Shot | `group` | Multiple items/variations |
| Packaging Shot | `packaging` | Shows product packaging |
| Process Shot | `process` | Behind-the-scenes/making-of |

---

## Score Distribution Required

To properly calibrate, I need anchors across the FULL score spectrum:

| Score Range | Quality Level | # of Anchors Needed | Description |
|-------------|---------------|---------------------|-------------|
| 90-98 | Exceptional | 8-10 | Top 1% Etsy listings, professional photography |
| 85-89 | Best Seller | 10-12 | Successful shops, strong photos |
| 75-84 | Good | 10-12 | Solid amateur work, minor issues |
| 60-74 | Needs Work | 8-10 | Clear problems but fixable |
| 40-59 | Poor | 4-6 | Multiple serious issues |
| Below 40 | Failing | 2-4 | Examples of what NOT to do |

---

## How to Find Images

### For HIGH scores (85-98):
1. Go to Etsy.com
2. Search for products in each category
3. Filter by "Star Seller" or sort by "Best Selling"
4. Look for shops with 10,000+ sales
5. Select their BEST main listing images

### For MEDIUM scores (60-84):
1. Search without filters
2. Look at page 2-5 of results
3. Find images that are "okay but not great"
4. Common issues: slightly busy background, imperfect lighting

### For LOW scores (below 60):
1. Sort by "Most Recent" 
2. Look for new sellers or listings with few sales
3. Find examples with clear problems:
   - Blurry/out of focus
   - Poor lighting (harsh shadows, dark)
   - Cluttered backgrounds
   - Product not centered
   - Watermarks present
   - Wrong aspect ratio

---

## Scoring Criteria Reference

When assigning scores, evaluate these factors:

### Background (20 points max)
- Clean, distraction-free: +15 to +20
- Slightly busy but acceptable: +8 to +14
- Distracting/cluttered: 0 to +7

### Lighting (20 points max)
- Soft, even, professional: +15 to +20
- Acceptable but imperfect: +8 to +14
- Harsh shadows/glare/dark: 0 to +7

### Composition (20 points max)
- Product fills 70-85%, centered, balanced: +15 to +20
- Slightly off but acceptable: +8 to +14
- Poor framing/cropping: 0 to +7

### Technical Quality (20 points max)
- Sharp focus, good resolution, correct colors: +15 to +20
- Minor softness or issues: +8 to +14
- Blurry/pixelated/wrong colors: 0 to +7

### Category-Specific Requirements (20 points max)
- Meets all category requirements: +15 to +20
- Meets most requirements: +8 to +14
- Misses key requirements: 0 to +7

**Total: 100 points possible**

---

## Category-Specific Requirements to Check

### Home & Living
- [ ] Lifestyle context present
- [ ] Scale reference included
- [ ] Styled with complementary props
- [ ] Natural warm lighting
- [ ] Clean background
- [ ] Color harmony with setting

### Jewelry & Accessories
- [ ] Clean white/neutral background
- [ ] Sharp focus on details
- [ ] No harsh shadows
- [ ] Size reference (model hand, coin, ruler)
- [ ] Multiple angles available
- [ ] Product fills 70-80% of frame

### Clothing/Apparel
- [ ] On model OR professional flat lay
- [ ] Full garment visible
- [ ] Fabric texture visible
- [ ] Natural lighting
- [ ] Neutral background
- [ ] Wrinkle-free presentation

### Craft Supplies & Tools
- [ ] Clean product shot
- [ ] Detail shots of quality
- [ ] Scale reference
- [ ] Texture visible
- [ ] Shown in use (lifestyle)
- [ ] Handmade quality visible

### Paper & Party Supplies
- [ ] Flat lay styling
- [ ] Clean white background
- [ ] Text clearly readable
- [ ] Styled with props
- [ ] Even lighting
- [ ] Color accuracy

### Art & Collectibles
- [ ] Straight-on shot (no distortion)
- [ ] Even lighting (no glare)
- [ ] True colors
- [ ] Frame/mockup context shown
- [ ] High resolution
- [ ] White or neutral background

### Bath & Beauty
- [ ] Clean/spa-like aesthetic
- [ ] Packaging clearly visible
- [ ] Ingredients/texture shown
- [ ] Lifestyle context
- [ ] Natural/organic vibe
- [ ] Professional lighting

### Pet Supplies
- [ ] Pet shown using product
- [ ] Product clearly visible
- [ ] Scale reference
- [ ] Clean background
- [ ] Lifestyle context
- [ ] Emotional appeal

### Toys & Games
- [ ] In-use shot (child playing)
- [ ] Bright/cheerful lighting
- [ ] Clean background
- [ ] Scale reference
- [ ] Safety features visible
- [ ] Fun/playful styling

### Vintage Items
- [ ] Condition clearly visible
- [ ] Multiple angles
- [ ] Scale reference
- [ ] Natural lighting
- [ ] Authenticity marks visible (labels)
- [ ] Wear/patina shown honestly

---

## Example Anchors (Use as Reference)

### Example 1: High Score (92/100)
```json
{
  "id": "anchor_example_high",
  "category": "jewelry",
  "photo_type": "studio",
  "score": 92,
  "image_url": "[Etsy image URL]",
  "seller_type": "best_seller",
  "reasoning": {
    "score_justification": "Professional studio setup with clean white background. Ring is perfectly centered, sharp focus on gemstone details. Soft shadow adds dimension without distraction. Color-accurate representation.",
    "strengths": [
      "Flawless white background",
      "Gemstone sparkle captured perfectly",
      "Professional color grading",
      "Sharp focus throughout",
      "Ideal product-to-frame ratio (75%)"
    ],
    "weaknesses": [
      "No scale reference in this particular shot"
    ],
    "etsy_alignment": "Exceeds Etsy jewelry photography guidelines"
  },
  "technical_notes": {
    "background_type": "clean_white",
    "lighting_quality": "professional_soft",
    "composition": "centered_balanced",
    "has_props": false,
    "shows_scale": false,
    "image_position": "main_image"
  }
}
```

### Example 2: Medium Score (72/100)
```json
{
  "id": "anchor_example_medium",
  "category": "home_living",
  "photo_type": "lifestyle",
  "score": 72,
  "image_url": "[Etsy image URL]",
  "seller_type": "regular",
  "reasoning": {
    "score_justification": "Good lifestyle context but background is slightly busy. Lighting is natural but creates some harsh shadows on the left side. Product is visible but competes with props for attention.",
    "strengths": [
      "Good lifestyle context",
      "Natural lighting approach",
      "Product clearly identifiable"
    ],
    "weaknesses": [
      "Background too busy - multiple competing elements",
      "Harsh shadows on product",
      "Props distract from main product",
      "Could use tighter crop"
    ],
    "etsy_alignment": "Meets basic requirements but doesn't follow best practices for background simplicity"
  },
  "technical_notes": {
    "background_type": "lifestyle_busy",
    "lighting_quality": "natural_harsh",
    "composition": "off_center",
    "has_props": true,
    "shows_scale": true,
    "image_position": "secondary"
  }
}
```

### Example 3: Low Score (45/100)
```json
{
  "id": "anchor_example_low",
  "category": "clothing",
  "photo_type": "studio",
  "score": 45,
  "image_url": "[Etsy image URL]",
  "seller_type": "new_seller",
  "reasoning": {
    "score_justification": "Multiple critical issues: shirt is wrinkled, photographed on unmade bed with visible sheets, lighting is dim yellow-tinted from indoor bulb, image is slightly blurry, colors appear washed out.",
    "strengths": [
      "Full garment is visible"
    ],
    "weaknesses": [
      "Wrinkled garment - needs steaming/ironing",
      "Bed sheets visible as background",
      "Poor indoor lighting with color cast",
      "Image not sharp - camera shake or focus issue",
      "Colors not true to life",
      "No styling effort"
    ],
    "etsy_alignment": "Fails most Etsy clothing photography requirements"
  },
  "technical_notes": {
    "background_type": "cluttered_home",
    "lighting_quality": "poor_indoor",
    "composition": "poor",
    "has_props": false,
    "shows_scale": false,
    "image_position": "main_image"
  }
}
```

---

## Deliverable Checklist

Please return:

1. **`scoring_anchors.json`** - Main file with all 40-50 anchors in the exact JSON format above

2. **Summary stats** at the end of the JSON:
```json
{
  "anchors": [...],
  "metadata": {
    "total_anchors": 45,
    "by_category": {
      "home_living": 5,
      "jewelry": 5,
      ...
    },
    "by_score_range": {
      "90-98": 9,
      "85-89": 11,
      "75-84": 10,
      "60-74": 9,
      "40-59": 4,
      "below_40": 2
    },
    "collection_date": "2024-12-14"
  }
}
```

---

## Important Notes

1. **Use REAL Etsy image URLs** - The URLs should be from `i.etsystatic.com` domain
2. **Be honest with scores** - Don't inflate or deflate, score what you actually see
3. **Detailed reasoning is critical** - The AI will learn from your explanations
4. **Cover the full spectrum** - We need bad examples too, not just good ones
5. **Category requirements matter** - Score based on category-specific criteria, not just general photo quality

---

## Questions?

If anything is unclear, the key principle is: **Score images the way an experienced Etsy seller would evaluate competition.** Best sellers should score 85-95. Average listings should score 65-80. Poor listings should score below 60.

Good luck! This data will directly power accurate scoring for thousands of Etsy sellers.
