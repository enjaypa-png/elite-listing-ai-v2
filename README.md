# Elite Listing AI

**Multi-image Etsy photo analyzer and optimizer**

Upload 2-10 listing photos → Get AI-powered scores → Download optimized images

## Current Feature

**Image Analysis & Optimization**
- Upload multiple images (2-10) as a single Etsy listing
- AI analyzes each image using Gemini 2.0 Flash
- Scores based on Etsy's image quality standards
- Detects photo types (studio, lifestyle, detail, scale, etc.)
- Identifies missing photo variety
- Optimizes images for Etsy specifications
- Download optimized photos individually or as a batch

## Tech Stack

- **Frontend:** Next.js 16, React 19, TypeScript, Tailwind CSS
- **Backend:** Next.js API Routes (Vercel Serverless)
- **AI:** Google AI Studio (Gemini 2.0 Flash)
- **Database:** Supabase (PostgreSQL)
- **Payments:** Stripe
- **Auth:** NextAuth.js

## Project Structure

```
/app
  /upload/page.tsx          # Main upload UI
  /api
    /analyze-listing        # Multi-image analysis endpoint
    /optimize-listing       # Image optimization endpoint
    /auth/*                 # Authentication
    /user/*                 # User profile & credits
    /checkout               # Stripe payments
    /webhooks/stripe        # Payment webhooks

/lib
  ai-vision.ts              # Gemini AI integration (scoring prompt)
  listing-scoring.ts        # Listing score calculation
  scoring-anchors.ts        # Calibration anchors (in progress)
  auth-*.ts                 # Auth utilities
  stripe.ts                 # Payment utilities
  supabase.ts               # Database client
```

## Environment Variables

```
# Required
GOOGLE_API_KEY=             # Google AI Studio API key
NEXT_PUBLIC_SUPABASE_URL=   # Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
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

---

## Archive

Unused features moved to `/archive` folder:
- SEO audit/rewrite
- Keyword optimization
- Etsy sync
- Knowledge base
- Batch processing
- One-click optimization

These can be restored if needed.
