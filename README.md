# Elite Listing AI v2

**AI-powered Etsy listing photo analyzer and optimizer** using the **R.A.N.K. 285™** scoring system with two-engine architecture.

Upload 1-10 listing photos → Get AI-powered scores → Download optimized images with smart crop

---

## 🎯 Core Features

### Multi-Image Analysis & Optimization
- Upload **1-10 images** as a single Etsy listing (no minimum!)
- **Two-Engine Scoring System**:
  - **AI Visual Quality** (60% weight) - Immutable composition, lighting, styling analysis
  - **Etsy Technical Compliance** (40% weight) - Mutable specs that improve with optimization
- **Smart Crop** - Automatically zooms to achieve Etsy's recommended 70-80% product fill
- **Issue Categorization** - Clearly shows which issues will auto-fix vs require manual editing
- Download optimized photos individually or as batch

### What Makes This Different
- ✅ **No client-side compression** - Server handles everything for accurate before/after scores
- ✅ **Immutable visual quality** - AI score never changes during optimization (honest scoring)
- ✅ **Object detection** - Google Cloud Vision API finds product and optimizes framing
- ✅ **Intelligent cropping** - Uses `fit: 'cover'` with entropy-based smart crop (preserves product fill)
- ✅ **Real improvements** - Typical gains: +10 to +25 points (not inflated)

---

## 📊 Two-Engine Scoring System

### Engine 1: AI Visual Quality (Immutable - 60% Weight)
Powered by **Google Gemini 2.0 Flash**, evaluates:
- Composition & framing
- Lighting quality
- Background/styling
- Category-specific requirements
- Product presentation

**Calibration:**
- Start at 50 (average Etsy baseline)
- Adjust ±15 for strengths/weaknesses
- Hard caps enforce category rules

### Engine 2: Etsy Technical Compliance (Mutable - 40% Weight)
Deterministic scoring based on measurable specs:
- **Aspect Ratio** - 4:3 recommended (100 pts if perfect)
- **Resolution** - Shortest side ≥ 2000px (90-100 pts)
- **File Size** - <1MB required, <500KB optimal (95-100 pts)
- **Color Profile** - sRGB required (100 pts)
- **Format** - JPEG optimal (100 pts)

**Final Score Formula:**
```
final_score = (visual_quality × 0.6) + (etsy_compliance × 0.4)
```

### Hard Caps (Override AI Score)
| Issue | Max Score | Why |
|-------|-----------|-----|
| Pet Supplies without pet | 55 | Etsy ranking penalty |
| Wall Art without room mockup | 60 | Category requirement |
| Jewelry without scale reference | 78 | Returns prevention |
| Cluttered/messy background | 75 | Trust reduction |
| Bad lifestyle context | 70 | Hurts more than helps |
| Raw/unfinished photo | 50 | Not product-ready |
| Significantly blurry | 80 | Quality baseline |

---

## 🛠️ Optimization Features

### Automatic Technical Fixes ✨
**Issues that will auto-fix during optimization:**

1. **Smart Crop for Product Fill**
   - Detects product using Google Cloud Vision API
   - Calculates current fill percentage
   - Intelligently zooms/crops to achieve 75% fill (middle of 70-80% Etsy range)
   - Maintains 4:3 aspect ratio

2. **Etsy Compliance**
   - Resize to 3000×2250px (4:3 ratio)
   - Convert to sRGB color profile
   - Compress to <1MB (typically 250-500KB)
   - Embed 72 PPI metadata
   - Convert to JPEG format

3. **Visual Enhancements** (AI-triggered)
   - Sharpening (if blur detected)
   - Brightness boost +8% (if underexposed)
   - Contrast adjustment +10% (if flat)
   - Saturation enhancement +10% (if dull)

### Manual Editing Required ⚠️
**Issues that cannot be auto-fixed:**

- Product fill < 70% (now fixed with smart crop!)
- Missing scale reference
- No lifestyle/room context
- Background clutter/distractions
- Category requirement violations
- Composition/framing issues
- Product damage/defects

**New Feature:** Issues are categorized in the UI so users know what to expect!

---

## 🏗️ Tech Stack

| Component | Technology |
|-----------|------------|
| **Frontend** | Next.js 14 (App Router), React 19, TypeScript |
| **AI Vision** | Google AI Studio (Gemini 2.0 Flash) |
| **Object Detection** | Google Cloud Vision API (Object Localization) |
| **Image Processing** | Sharp v0.33 (mozjpeg compression) |
| **Auth** | Supabase Auth |
| **Database** | Prisma + Supabase PostgreSQL |
| **Storage** | Supabase Storage |
| **Payments** | Stripe |
| **Deployment** | Vercel (auto-deploy from main) |

---

## 📁 Project Structure

```
/app
  /upload/page.tsx              # Main upload UI (no client compression!)
  /api
    /analyze-listing/route.ts   # Two-engine scoring (AI + compliance)
    /optimize-listing/route.ts  # Smart crop + optimization
    /auth/*                     # Authentication
    /user/*                     # User profile & credits
    /checkout/route.ts          # Stripe payments
    /webhooks/stripe/route.ts   # Payment webhooks

/lib
  ai-vision.ts                  # 🧠 Gemini AI integration + scoring prompt
  object-detection.ts           # 📸 Google Vision product detection + smart crop
  etsy-compliance-scoring.ts    # 📊 Deterministic compliance calculation
  issue-categorization.ts       # ✨ Auto-fixable vs manual categorization
  listing-scoring.ts            # 🧮 Listing-level aggregation
  scoring-anchors.ts            # 📈 Calibration data (real Etsy listings)
  auth-*.ts                     # Auth utilities
  stripe.ts                     # Payment utilities
  supabase.ts                   # Database client

/archive                        # Legacy/unused features
```

---

## 🔑 Environment Variables

```bash
# AI & Object Detection
GOOGLE_API_KEY=                 # Google AI Studio + Cloud Vision (shared key)

# Database & Auth
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
DATABASE_URL=                   # Prisma connection string

# Auth
NEXTAUTH_SECRET=
NEXTAUTH_URL=

# Payments
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
```

### Google API Setup
The same `GOOGLE_API_KEY` is used for:
1. **Gemini 2.0 Flash** (AI vision scoring)
2. **Cloud Vision API** (object detection for smart crop)

**Pricing:**
- Gemini: ~$0.075 per 1,000 images
- Cloud Vision: ~$1.50 per 1,000 images
- **Total: ~$1.58 per 1,000 optimizations**

---

## 🚀 Development

```bash
# Install dependencies
yarn install

# Setup database
npx prisma generate
npx prisma db push

# Run development server
yarn dev
```

---

## 📦 Deployment

<<<<<<< HEAD
Deployed on **Vercel**. Push to `main` branch triggers auto-deploy.
=======
**Primary Branch:** `main`

Vercel auto-deploys on push to `main` branch.

**Recent Production Fixes (Dec 2024):**
- ✅ Removed client-side compression (was causing +2 bug)
- ✅ Added smart crop for product fill optimization
- ✅ Added issue categorization (auto-fix vs manual)
- ✅ Fixed emoji display issues (Unicode → actual emojis)
- ✅ Enabled single image upload (was 2-10, now 1-10)
- ✅ Implemented two-engine scoring system
>>>>>>> f2f92a0 (docs: update README with two-engine architecture and recent improvements)

---

## 📈 AI Calibration Data

Calibrated with **real Etsy listings** across multiple categories:
- **15+ listings, ~130 images analyzed**
- **Score range:** 48-94
- **Categories:** Home & Living, Jewelry, Vintage, Pet Supplies, Bath & Beauty, Craft Supplies, Clothing, Wall Art

### Score Interpretation
| Range | Quality | Description |
|-------|---------|-------------|
| 90-98 | Exceptional | Top 1-5% of Etsy, professional photography |
| 85-89 | Very Good | Best-seller quality, strong conversion potential |
| 80-84 | Good | Technically competent, clear product presentation |
| 70-79 | Acceptable | Minor issues, room for improvement |
| 60-69 | Below Average | Multiple issues affecting buyer confidence |
| 45-59 | Poor | Significant problems, recommend reshoot |
| <45 | Failing | Would actively hurt sales and ranking |

---

## 📋 Etsy Official Image Requirements

| Specification | Requirement | Our Optimization |
|---------------|-------------|------------------|
| Recommended Size | 3000 × 2250 px | ✅ Resize to exact spec |
| Aspect Ratio | 4:3 | ✅ Smart crop to 4:3 |
| Minimum Width | 1000 px | ✅ Always exceed |
| Quality Benchmark | Shortest side ≥ 2000 px | ✅ Target 2250px |
| Resolution | 72 PPI | ✅ Set metadata |
| File Size | Under 1MB | ✅ Compress to 250-500KB |
| File Types | JPG, PNG, GIF | ✅ Convert to JPEG |
| Color Profile | sRGB | ✅ Convert to sRGB |
| Product Fill | 70-80% of frame | ✅ Smart crop to 75% |
| Photos per Listing | Up to 10 | ✅ Support 1-10 images |

---

## 🎨 Image Optimization Pipeline

**Step-by-step process:**

1. **Receive Raw Image** - No client compression (critical for accurate scoring)
2. **AI Analysis** (Engine 1)
   - Gemini 2.0 Flash evaluates visual quality
   - Identifies strengths, issues, photo type
   - Assigns immutable visual quality score
3. **Technical Analysis** (Engine 2)
   - Extract metadata (size, format, color profile)
   - Calculate Etsy compliance score
   - Combine: `(visual × 0.6) + (compliance × 0.4)`
4. **Smart Crop** (if needed)
   - Detect product with Google Cloud Vision
   - Calculate current fill percentage
   - If < 70%, crop to achieve 75% fill
   - Center on product, maintain 4:3 ratio
5. **Resize & Optimize**
   - Resize to 3000×2250px using `fit: 'cover'` + entropy
   - Apply AI-triggered enhancements (sharpen, brighten, etc.)
   - Convert to sRGB JPEG
   - Compress to <1MB with mozjpeg
6. **Recalculate Score**
   - Visual quality: **unchanged** (immutable)
   - Etsy compliance: **recalculated** (improved!)
   - New final score shows real improvement

**Expected Improvements:**
- Low-quality images: +10 to +25 points
- Already-optimized images: +2 to +8 points
- Professional photos: +0 to +5 points

---

## 🐛 Known Issues & Limitations

### Current Limitations
- Smart crop requires Google Cloud Vision API key
- Object detection works best with single products (not groups)
- Cannot fix composition issues (angle, perspective)
- Cannot add missing elements (scale reference, lifestyle context)
- Free Google Vision tier: 1,000 requests/month

### Roadmap
- [ ] Batch processing for multiple listings
- [ ] Background removal + replacement
- [ ] Automatic mockup generation (wall art)
- [ ] Scale reference detection
- [ ] Multi-language support
- [ ] Etsy API integration for direct publishing

---

## 🗂️ Archive

Legacy features moved to `/archive` (not used in current build):
- SEO audit/rewrite
- Keyword optimization
- Etsy shop sync
- Knowledge base chat
- Batch processing UI
- One-click optimization flow

---

<<<<<<< HEAD
**Branch:** `main`  
=======
## 📝 License

Proprietary - Elite Listing AI

---

**Branch:** `main`
>>>>>>> f2f92a0 (docs: update README with two-engine architecture and recent improvements)
**Last Updated:** December 2024
**Version:** 2.0 (Two-Engine Architecture)
