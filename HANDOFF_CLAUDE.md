# Elite Listing AI - Handoff Document for Claude
**Last Updated:** December 2024

---

## 🎯 PROJECT OVERVIEW

**Elite Listing AI** is a SaaS tool for Etsy sellers that analyzes and optimizes product listing photos using AI-powered scoring based on the proprietary **R.A.N.K. 285™** system.

### Core Feature
- Upload 2-10 product images as a single Etsy listing
- AI scores each image independently (1-100) based on Etsy conversion potential
- Identifies issues per image based on Etsy's Image Preferences
- Calculates overall listing score with photo count multipliers
- Recommends specific optimizations aligned with Etsy best practices
- Downloads optimized photos (resized, enhanced, compressed)

### Project Owner
- **Nick**: Non-technical founder
- Uses AI agents (Neo for development, Claude for consulting)
- 2+ years invested in this project

---

## 🏗️ TECH STACK

| Component | Technology |
|-----------|------------|
| **Frontend** | Next.js 16, React 19, TypeScript, Tailwind CSS |
| **AI Engine** | Google AI Studio (Gemini 2.0 Flash) |
| **Auth** | Supabase Auth |
| **Database** | Supabase PostgreSQL + Prisma |
| **Storage** | Supabase Storage (for optimized images) |
| **Payments** | Stripe |
| **Deployment** | Vercel |

---

## 📁 PROJECT STRUCTURE

```
/app/elite-listing-ai-v2/
├── app/
│   ├── upload/page.tsx              # Main upload UI (multi-image)
│   ├── dashboard/                   # User dashboard
│   ├── page.tsx                     # Landing page
│   ├── layout.tsx                   # App layout
│   └── api/
│       ├── analyze-listing/route.ts # Core: Multi-image AI analysis
│       ├── optimize-listing/route.ts # Core: Image optimization + storage
│       ├── auth/                    # Authentication endpoints
│       ├── user/                    # User profile & credits
│       ├── checkout/route.ts        # Stripe payments
│       └── webhooks/stripe/route.ts # Payment webhooks
│
├── lib/
│   ├── ai-vision.ts                 # 🧠 CRITICAL: Gemini AI prompt & analysis
│   ├── listing-scoring.ts           # 🧮 CRITICAL: Photo count multipliers
│   ├── scoring-anchors.ts           # 📊 CRITICAL: Category requirements & calibration data
│   ├── auth-*.ts                    # Auth utilities
│   ├── stripe.ts                    # Payment utilities
│   └── supabase.ts                  # Database client
│
├── components/                      # UI components
├── design-system/                   # Design tokens
├── prisma/
│   └── schema.prisma               # Database schema
├── archive/                         # Legacy/unused code (can be deleted)
├── package.json
└── README.md
```

---

## 🧠 AI SCORING SYSTEM

### How It Works

1. **Image Analysis**: Each uploaded image is sent to Gemini 2.0 Flash with a detailed prompt
2. **Individual Scoring**: AI scores each image 1-100 based on Etsy conversion potential
3. **Listing Score**: Final score = `avg(image_scores) × photo_count_multiplier × (1 - redundancy_penalty)`

### AI Prompt Location
**File:** `/app/elite-listing-ai-v2/lib/ai-vision.ts`

The AI prompt includes:
- Scoring anchors (real Etsy examples calibrated by score range)
- Category-specific requirements (Pet Supplies, Wall Art, Jewelry, etc.)
- Hard caps for violations (e.g., Pet Supplies without pet = max 55)
- Output format (strict JSON)

### Photo Count Multipliers
**File:** `/app/elite-listing-ai-v2/lib/listing-scoring.ts`

| Photo Count | Multiplier | Status |
|-------------|------------|--------|
| 1-4 photos | 0.82 | Penalty |
| 5 photos | 1.00 | Baseline |
| 6-7 photos | 1.03 | Good |
| 8 photos | 1.06 | Better |
| 9 photos | 1.08 | Great |
| 10 photos | 1.10 | Optimal |

### Hard Caps (Non-Negotiable)
| Issue | Max Score |
|-------|-----------|
| Pet Supplies without pet | 55 |
| Wall Art without lifestyle mockup | 60 |
| Jewelry without on-body shot | 78 |
| Ugly/cluttered background | 75 |
| Bad lifestyle context | 70 |
| Raw photo (not product) | 50 |
| Blurry/out of focus | 80 |

---

## 📊 SCORING CALIBRATION DATA

**File:** `/app/elite-listing-ai-v2/lib/scoring-anchors.ts`

### Score Ranges
- **Exceptional (90-98)**: Professional photography, top 1-5% of Etsy
- **Good (80-89)**: Best-seller quality, strong conversion
- **Average (70-79)**: Typical Etsy quality, room for improvement
- **Below Average (60-69)**: Multiple issues affecting sales
- **Poor (40-59)**: Significant problems, needs reshoot
- **Failing (0-39)**: Would actively hurt sales

### Calibration Datasets (Completed)
1. **Dataset 1 (High Quality)**: 5 listings, 43 images, scores 75-93
2. **Dataset 2 (High Quality)**: 4 listings, 34 images, scores 80-93
3. **Dataset 3 (Low Quality)**: 3 listings, 26 images, scores 48-55

### Categories with Specific Requirements
- Home & Living
- Jewelry & Accessories
- Pet Supplies
- Vintage Items
- Art & Collectibles / Wall Art
- Clothing/Apparel
- Bath & Beauty
- Craft Supplies

---

## 🔧 KEY API ENDPOINTS

### POST /api/analyze-listing
Analyzes multiple images as a complete Etsy listing.

**Input:** FormData with `image_0`, `image_1`, ... `image_N`

**Output:**
```json
{
  "success": true,
  "overallListingScore": 78,
  "mainImageScore": 82,
  "averageImageScore": 76,
  "varietyScore": 75,
  "detectedPhotoTypes": ["studio_shot", "lifestyle_shot"],
  "missingPhotoTypes": ["scale_shot", "detail_shot"],
  "imageResults": [
    {
      "imageIndex": 0,
      "score": 82,
      "photoTypes": ["studio_shot"],
      "feedback": [...]
    }
  ]
}
```

### POST /api/optimize-listing
Optimizes all images in a listing.

**Input:** FormData with `image_0`, `image_1`, ... `image_N`

**Output:**
```json
{
  "success": true,
  "originalListingScore": 65,
  "newListingScore": 78,
  "overallImprovement": 13,
  "optimizedImages": [
    {
      "imageIndex": 0,
      "originalScore": 65,
      "newScore": 78,
      "optimizedUrl": "https://...",
      "improvements": ["✅ Optimized for Etsy search", "✅ Lighting enhanced"]
    }
  ]
}
```

---

## ⚠️ KNOWN ISSUES & RISKS

### P0: Timeout Risk on /api/optimize-listing
- Vercel has 60-second serverless function limit
- Optimization endpoint analyzes images twice (before and after)
- Risk of timeout with 7+ images
- **Potential fix:** Remove the "after" re-analysis call

### P1: Score Calibration
- AI may still score too harshly or too leniently
- Calibration depends on quality of training anchors
- May need ongoing refinement based on real-world testing

---

## 🔑 ENVIRONMENT VARIABLES

```bash
# AI
GOOGLE_API_KEY=                      # Google AI Studio API key

# Database & Auth
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Auth Secret
NEXTAUTH_SECRET=
NEXTAUTH_URL=

# Payments
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
```

---

## 🚀 DEPLOYMENT

- **Platform:** Vercel
- **Branch:** `rebuild-core-workflow`
- **Auto-deploy:** Push to branch triggers deployment

### Local Development
```bash
cd /app/elite-listing-ai-v2
yarn install
yarn dev
```

---

## 📋 PENDING TASKS

### Immediate (P0-P1)
1. **Test AI Scoring Engine** - Validate new prompt with real images
2. **Monitor Timeout Risk** - Test with 7-10 images
3. **UI Polish** - Switch to light theme

### Future (P2-P3)
1. Delete `/archive` directory (legacy code)
2. Fix "Reshoot Tips" box contrast
3. Technical debt: Migrate text PKs to UUID
4. Unify data layers (Prisma vs Supabase client)

---

## 🎨 UI/UX NOTES

- Currently uses dark theme (requested to switch to light)
- Header text to change: "Optimize your Etsy listing photos for maximum visibility"
- Remove "false promises" from landing page
- Fix low-contrast "Reshoot Tips" box

---

## 📝 IMPORTANT CODE SECTIONS

### The AI Brain (lib/ai-vision.ts)
```typescript
// Line 53-193: SYSTEM_PROMPT - The core AI instructions
// Line 199-290: analyzeImageWithVision() - Single image analysis
// Line 296-376: analyzeMultipleImages() - Batch analysis
```

### The Calculator (lib/listing-scoring.ts)
```typescript
// Line 63-74: PHOTO_COUNT_MULTIPLIERS
// Line 203-273: calculateListingScore() - Final score formula
```

### The Memory (lib/scoring-anchors.ts)
```typescript
// Line 26-147: SCORING_ANCHORS_TEXT - Real Etsy calibration examples
// Line 153-319: CATEGORY_REQUIREMENTS - Category-specific rules
```

---

## 🧪 TESTING CHECKLIST

- [ ] Upload 2 images - verify analysis works
- [ ] Upload 10 images - check for timeout
- [ ] Test Pet Supplies category - verify pet requirement cap
- [ ] Test Wall Art category - verify lifestyle mockup cap
- [ ] Test optimization flow - verify download works
- [ ] Test score calculations match expected ranges

---

## 📞 SUPPORT

For questions about:
- **Scoring logic**: Check `lib/ai-vision.ts` and `lib/scoring-anchors.ts`
- **UI/UX**: Check `app/upload/page.tsx`
- **API issues**: Check `app/api/analyze-listing/route.ts`
- **Database**: Check `prisma/schema.prisma`

---

*This document was generated to provide Claude (Anthropic) with full context for assisting with Elite Listing AI development.*
