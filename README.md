# Elite Listing AI

**AI-powered Etsy listing photo analyzer and optimizer**

Upload 2-10 listing photos → Get conversion-focused scores → Download optimized images

## Core Feature

**Multi-Image Analysis & Optimization**
- Upload multiple images (2-10) as a single Etsy listing
- AI scores each image independently (1-100) based on Etsy conversion potential
- Identifies issues per image based on Etsy's Image Preferences
- Recommends specific optimizations aligned with Etsy rules
- Applies photo count multiplier at listing level (not image level)
- Download optimized photos individually or as batch

## Scoring System

### Image-Level Scoring (AI)
- **Start at 50** (average Etsy quality)
- Adjust ±15 for: Composition, Lighting, Background, Category Compliance
- Hard caps enforce category requirements

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

### Listing-Level Multipliers
| Photo Count | Multiplier |
|-------------|------------|
| 1-4 photos | 0.82 (penalty) |
| 5 photos | 1.00 (baseline) |
| 6-7 photos | 1.03 |
| 8 photos | 1.06 |
| 9 photos | 1.08 |
| 10 photos | 1.10 (optimal) |

**Formula:** `final_listing_score = avg(image_scores) × photo_count_multiplier × (1 - redundancy_penalty)`

## Tech Stack

- **Frontend:** Next.js 16, React 19, TypeScript, Tailwind CSS
- **AI:** Google AI Studio (Gemini 2.0 Flash)
- **Auth:** Supabase Auth
- **DB:** Supabase PostgreSQL + Prisma
- **Payments:** Stripe
- **Deploy:** Vercel

## Project Structure

```
/app
  /upload/page.tsx              # Main upload UI
  /api
    /analyze-listing/route.ts   # Multi-image analysis endpoint
    /optimize-listing/route.ts  # Image optimization endpoint
    /auth/*                     # Authentication
    /user/*                     # User profile & credits
    /checkout/route.ts          # Stripe payments
    /webhooks/stripe/route.ts   # Payment webhooks

/lib
  ai-vision.ts                  # Gemini AI integration + scoring prompt
  listing-scoring.ts            # Photo count multipliers + redundancy
  scoring-anchors.ts            # Category requirements (reference)
  auth-*.ts                     # Auth utilities
  stripe.ts                     # Payment utilities
  supabase.ts                   # Database client
```

## Environment Variables

```bash
# AI
GOOGLE_API_KEY=                 # Google AI Studio API key

# Database
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Auth
NEXTAUTH_SECRET=
NEXTAUTH_URL=

# Payments
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
```

## Development

```bash
yarn install
yarn dev
```

## Deployment

Deployed on Vercel. Push to `rebuild-core-workflow` branch triggers auto-deploy.

## Training Dataset

The AI is calibrated with real Etsy listings:
- **15 listings, ~130 images**
- **Score range:** 48-94
- **Categories:** Home & Living, Jewelry, Vintage, Pet Supplies, Bath & Beauty, Craft Supplies, Clothing, Wall Art

## Archive

Unused features moved to `/archive`:
- SEO audit/rewrite
- Keyword optimization  
- Etsy sync
- Knowledge base
- Batch processing
- One-click optimization

---

**Branch:** `rebuild-core-workflow`
