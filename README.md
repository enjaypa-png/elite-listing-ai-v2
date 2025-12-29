# Elite Listing AI v2

**AI-powered Etsy listing photo analyzer and optimizer** using **deterministic scoring** with MODE-based workflows.

Upload 1-10 listing photos → Select MODE → Get three-output analysis → Download optimized images with smart crop

---

## 🎯 Core Features

### Deterministic Scoring with MODE Selection
- Upload **1-10 images** as a single Etsy listing (no minimum!)
- **Two Scoring Modes**:
  - **📸 Optimize Images** - Score uploaded images only, no listing-level penalties
  - **📋 Evaluate Full Listing** - Treat as complete listing, apply photo count multipliers
- **Three-Output Architecture**:
  - **A) Image Quality Score** (0-100) - Objective quality with fixed penalties
  - **B) Listing Completeness** - Advisory photo count/type coverage (no score impact)
  - **C) Conversion Headroom** - Prioritized upside actions with estimated impact
- **Smart Crop** - Automatically zooms to achieve Etsy's recommended 70-80% product fill
- **Objective Detection** - AI detects only severe issues (blur, lighting, distinguishability)
- Download optimized photos individually or as batch

### What Makes This Different
- ✅ **Deterministic scoring** - Start at 100, apply only fixed penalties (no fuzzy logic)
- ✅ **Explicit MODE selection** - Never infer intent from image count
- ✅ **No category bias** - Universal quality rules, backgrounds/settings/props never penalized
- ✅ **Transparent deductions** - See exactly why points were deducted with clear explanations
- ✅ **Object detection** - Google Cloud Vision API finds product and optimizes framing
- ✅ **Real improvements** - Typical gains: +10 to +25 points (not inflated)

---

## 📊 Deterministic Scoring System

### Start at 100, Apply Only Fixed Penalties

Every image starts at **100 points**. Deductions are applied ONLY for objective, measurable issues:

#### Technical Gates (Hard Requirements)
| Gate | Penalty | Why |
|------|---------|-----|
| Width < 1000px | **-15** | Etsy minimum requirement |
| Shortest side < 2000px | **-10** | Quality benchmark for zoom |
| File size > 1MB | **-8** | Page load performance |
| Color profile not sRGB | **-5** | Cross-device color accuracy |
| PPI not 72 | **-3** | Web display standard |
| Thumbnail crop unsafe (1st photo) | **-25** | Search visibility |

#### Soft Quality (AI-Detected Issues)
| Issue | Penalty | Detection Criteria |
|-------|---------|-------------------|
| Severe blur | **-20** | Heavy artifacts, out of focus, unclear details |
| Severe lighting | **-15** | Too dark, blown highlights, harsh shadows |
| Product not distinguishable | **-12** | Unclear at thumbnail size |

### Universal Category Safety Rule
**NEVER penalize backgrounds, settings, skin tones, fabric, props, or lifestyle scenes.**

These are stylistic choices with ZERO impact on objective quality. The AI detects them for advisory output only, but they never affect scores.

### Photo Count Multipliers (Evaluate Full Listing Mode Only)

| Photo Count | Multiplier | Why |
|-------------|------------|-----|
| 1-4 photos | **0.82×** | Below Etsy baseline |
| 5 photos | **1.00×** | Baseline compliance |
| 6-7 photos | **1.03×** | Good coverage |
| 8 photos | **1.06×** | Optimal range |
| 9 photos | **1.08×** | Excellent coverage |
| 10 photos | **1.10×** | Maximum optimization |

**Note:** Multipliers apply ONLY in `evaluate_full_listing` mode. In `optimize_images` mode, there are NO listing-level penalties or bonuses.

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
  deterministic-scoring.ts      # 🎯 Core deterministic scoring engine (NEW)
  ai-vision.ts                  # 🧠 Gemini AI objective detection (rewritten)
  object-detection.ts           # 📸 Google Vision product detection + smart crop
  etsy-compliance-scoring.ts    # 📊 Legacy compliance calculation
  issue-categorization.ts       # ✨ Auto-fixable vs manual categorization
  listing-scoring.ts            # 🧮 Legacy listing-level aggregation
  scoring-anchors.ts            # 📈 Legacy calibration data
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

**Primary Branch:** `main`

Vercel auto-deploys on push to `main` branch.

**Recent Production Updates (Dec 2024-2025):**
- ✅ **Deterministic scoring refactor** - Fixed penalties, MODE selection, A/B/C outputs
- ✅ **Universal category safety** - Removed all category-specific hard caps
- ✅ **Objective AI detection** - AI detects only severe issues (no scoring)
- ✅ Removed client-side compression (was causing +2 bug)
- ✅ Added smart crop for product fill optimization
- ✅ Added issue categorization (auto-fix vs manual)
- ✅ Fixed emoji display issues (Unicode → actual emojis)
- ✅ Enabled single image upload (was 2-10, now 1-10)

---

## 📈 Score Interpretation

### Image Quality Score (0-100)

Deterministic scoring based on objective quality only:

| Range | Quality | Typical Characteristics |
|-------|---------|------------------------|
| 95-100 | Exceptional | All gates passed, no deductions |
| 85-94 | Very Good | Minor technical issues only (PPI, small file size) |
| 75-84 | Good | Some technical gates failed or minor quality issues |
| 65-74 | Acceptable | Multiple technical issues or one soft quality issue |
| 50-64 | Below Average | Major technical failures or multiple quality issues |
| 35-49 | Poor | Severe blur/lighting + technical failures |
| <35 | Failing | Multiple severe issues, recommend reshoot |

**Note:** Scores are deterministic - same image always gets same score. No calibration anchors or fuzzy logic.

### Listing Completeness (Advisory Only)

**B) Output** shows photo count and diversity recommendations but has **ZERO score impact**:
- Optimal: 8-10 photos with diverse types (Studio, Lifestyle, Detail, Scale)
- Baseline: 5+ photos
- Below baseline: <5 photos (penalized in `evaluate_full_listing` mode via multiplier)

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
2. **MODE Selection** - User explicitly selects workflow:
   - `optimize_images`: Score images only, no listing penalties
   - `evaluate_full_listing`: Apply photo count multipliers
3. **AI Objective Detection**
   - Gemini 2.0 Flash detects ONLY severe issues:
     - Severe blur (heavy artifacts, out of focus)
     - Severe lighting (too dark, blown out, harsh shadows)
     - Product distinguishability (clear at thumbnail size?)
     - Thumbnail crop safety (first photo only)
   - NO scoring, NO subjective opinions
   - Backgrounds/settings detected for advisory only
4. **Technical Analysis**
   - Extract metadata (width, height, file size, color profile, PPI)
   - Check all technical gates
   - Apply fixed penalties for failures
5. **Deterministic Scoring**
   - Start at 100 per image
   - Deduct fixed penalties for failed gates
   - Deduct for AI-detected severe issues
   - Calculate average Image Quality Score
   - Apply photo count multiplier (if evaluate_full_listing mode)
6. **Three-Output Generation**
   - **A)** Image Quality Score (0-100) with per-image breakdown
   - **B)** Listing Completeness (advisory photo count/types)
   - **C)** Conversion Headroom (prioritized upside actions)
7. **Smart Crop** (if needed)
   - Detect product with Google Cloud Vision
   - Calculate current fill percentage
   - If < 70%, crop to achieve 75% fill
   - Center on product, maintain 4:3 ratio
8. **Resize & Optimize**
   - Resize to 3000×2250px using `fit: 'cover'` + entropy
   - Convert to sRGB JPEG
   - Compress to <1MB with mozjpeg
   - Set 72 PPI metadata
9. **Recalculate Score**
   - Technical gates: **improved** (width, shortest side, file size, sRGB, PPI)
   - AI detections: **unchanged** (blur, lighting are inherent to photo)
   - New score reflects technical optimization only

**Expected Improvements:**
- Images with technical issues: +15 to +35 points (gates fixed)
- Already-optimized images: +0 to +8 points (minor improvements)
- Images with severe blur/lighting: Limited gains (inherent quality issues)

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

## 📝 License

Proprietary - Elite Listing AI

---

**Branch:** `main`
**Last Updated:** December 2025
**Version:** 3.0 (Deterministic Scoring with MODE Selection)
