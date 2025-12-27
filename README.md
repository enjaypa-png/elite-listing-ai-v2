# Elite Listing AI

**AI-powered Etsy listing photo analyzer and optimizer** using the **R.A.N.K. 285™** scoring system.

Upload 2-10 listing photos → Get conversion-focused scores → Download optimized images

---

## 🎯 Core Feature

**Multi-Image Analysis & Optimization**
- Upload multiple images (2-10) as a single Etsy listing
- AI scores each image independently (1-100) based on Etsy conversion potential
- Identifies issues per image based on **Etsy's Official Image Guidelines**
- Recommends specific optimizations aligned with Etsy rules
- Applies photo count multiplier at listing level (not image level)
- Download optimized photos individually or as batch

---

## 📊 Scoring System

### Image-Level Scoring (AI-Powered)
- **Start at 50** (average Etsy quality baseline)
- Adjust ±15 for: Composition, Lighting, Background, Category Compliance
- Hard caps enforce category requirements

### Hard Caps (Non-Negotiable)
| Issue | Max Score |
|-------|-----------|
| Pet Supplies without pet | 55 |
| Wall Art without lifestyle mockup | 60 |
| Jewelry without scale reference | 78 |
| Genuinely cluttered background | 75 |
| Bad lifestyle context | 70 |
| Raw photo (not product) | 50 |
| Blurry/out of focus | 80 |

### Listing-Level Multipliers
| Photo Count | Multiplier | Status |
|-------------|------------|--------|
| 1-4 photos | 0.82 | Penalty |
| 5 photos | 1.00 | Baseline |
| 6-7 photos | 1.03 | Good |
| 8 photos | 1.06 | Better |
| 9 photos | 1.08 | Great |
| 10 photos | 1.10 | Optimal |

**Formula:** `final_listing_score = avg(image_scores) × photo_count_multiplier × (1 - redundancy_penalty)`

---

## 🛠️ Image Optimization Features

### Etsy Compliance (Automatic)
- ✅ **sRGB color profile** conversion (Etsy requirement)
- ✅ **72 PPI metadata** embedded
- ✅ **4:3 aspect ratio** resize to 3000×2250px
- ✅ **Smart resize** with `fit: contain` - preserves entire product (no cropping)
- ✅ **White padding** added if needed to maintain aspect ratio
- ✅ **File size optimization** - JPEG compression to stay under 1MB

### AI-Driven Enhancements
- ✅ **Sharpening** - applied when AI detects blur/focus issues
- ✅ **Brightness boost** - applied when AI detects lighting issues
- ✅ **Contrast adjustment** - applied when AI detects flat/dull images
- ✅ **Saturation enhancement** - applied when AI detects color issues

### Validation & Warnings
- ✅ **Square-safe check** - warns if main image will crop poorly as thumbnail
- ✅ **Product fill tracking** - AI estimates product fill % (70-80% ideal)

---

## 🔧 Tech Stack

| Component | Technology |
|-----------|------------|
| **Frontend** | Next.js 16, React 19, TypeScript, Tailwind CSS |
| **AI Engine** | Google AI Studio (Gemini 2.0 Flash) |
| **Image Processing** | Sharp v0.33 (Node.js) |
| **Auth** | Supabase Auth |
| **Database** | Supabase PostgreSQL + Prisma |
| **Storage** | Supabase Storage |
| **Payments** | Stripe |
| **Deployment** | Vercel |

---

## 📁 Project Structure

```
/app
  /upload/page.tsx              # Main upload UI
  /api
    /analyze-listing/route.ts   # Multi-image AI analysis endpoint
    /optimize-listing/route.ts  # Image optimization + storage endpoint
    /auth/*                     # Authentication endpoints
    /user/*                     # User profile & credits
    /checkout/route.ts          # Stripe payments
    /webhooks/stripe/route.ts   # Payment webhooks

/lib
  ai-vision.ts                  # 🧠 Gemini AI integration + scoring prompt
  listing-scoring.ts            # 🧮 Photo count multipliers + redundancy
  scoring-anchors.ts            # 📊 Category requirements + calibration data
  database-scoring.ts           # Legacy deterministic scoring (deprecated)
  auth-*.ts                     # Auth utilities
  stripe.ts                     # Payment utilities
  supabase.ts                   # Database client

/archive                        # Legacy/unused features
```

---

## 🔑 Environment Variables

```bash
# AI
GOOGLE_API_KEY=                 # Google AI Studio API key

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

## 🚀 Development

```bash
yarn install
yarn dev
```

---

## 📦 Deployment

Deployed on **Vercel**. Push to `main` branch triggers auto-deploy.

---

## 📈 AI Calibration Data

The AI is calibrated with **real Etsy listings**:
- **15+ listings, ~130 images**
- **Score range:** 48-94
- **Categories:** Home & Living, Jewelry, Vintage, Pet Supplies, Bath & Beauty, Craft Supplies, Clothing, Wall Art

### Score Anchors
| Range | Quality | Description |
|-------|---------|-------------|
| 90-98 | Exceptional | Top 1-5% of Etsy, professional photography |
| 85-89 | Very Good | Best-seller quality |
| 80-84 | Good | Technically competent, clear product |
| 70-79 | Acceptable | Minor issues, room for improvement |
| 60-69 | Below Average | Multiple issues affecting sales |
| 45-59 | Poor | Significant problems, needs reshoot |
| <45 | Failing | Would actively hurt sales |

---

## 📋 Etsy Official Image Specifications

| Spec | Requirement |
|------|-------------|
| Size | 3000 × 2250 px (recommended) |
| Aspect Ratio | 4:3 |
| Minimum Width | 1000 px |
| Quality Benchmark | Shortest side ≥ 2000 px |
| Resolution | 72 PPI |
| File Size | Under 1MB |
| File Types | JPG, PNG, GIF |
| Color Profile | sRGB |
| Photos per Listing | Up to 10 (minimum 5 recommended) |

---

## 🗂️ Archive

Unused features moved to `/archive`:
- SEO audit/rewrite
- Keyword optimization  
- Etsy sync
- Knowledge base
- Batch processing
- One-click optimization

---

**Branch:** `main`  
**Last Updated:** December 2024
