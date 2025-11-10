# Elite Listing AI v2

## Project Overview

Elite Listing AI is an AI-powered Etsy listing optimization platform that helps sellers improve their product listings using GPT-4 for text generation and OpenAI Vision for image analysis.

**Production URL**: https://elite-listing-ai-v2.vercel.app

## Architecture

This project uses a modern Next.js architecture with the following stack:

- **Frontend Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL (Supabase) with Prisma ORM
- **Authentication**: Supabase Auth with NextAuth v5
- **Payments**: Stripe with credit ledger system
- **AI Services**: OpenAI GPT-4 & Vision API
- **Styling**: Custom design tokens (no Tailwind utility classes)
- **Deployment**: Vercel

### Recent Updates (v1.1.0)

✨ **New Features**:
- **Etsy Algorithm Knowledge Base**: 18 categories, 114 algorithm insights (2024-2025 data)
- **Knowledge Base API**: `/api/knowledge-base` with search, filtering, validation

📦 **Branch Consolidation**:
- Unified codebase from multiple branches (main, knowledge-base-update)
- Removed experimental architectures, standardized on production Next.js
- Zero data loss during consolidation

---

## Getting Started

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

### Development

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

Start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

### Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

### Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

---

## Core Features

### ✅ Completed
- **Listing Text Optimizer**: Generates 3 AI-powered title/description variants
- **Image Analysis**: 10+ quality metrics with optimization recommendations
- **Keyword Generation**: Automated SEO keyword discovery
- **SEO Audit**: Comprehensive listing optimization scoring
- **Knowledge Base**: Etsy algorithm insights (18 categories, 114 insights)
- **Etsy Integration**: OAuth 2.0 + PKCE for shop connection
- **Stripe Payments**: Credit system with double-entry ledger
- **Authentication**: Secure user accounts with Supabase Auth

### 🚧 In Progress
- Competitor Gap Analysis
- Keyword Volume Tracking
- Smart Recommendations Engine
- Bulk Listing Optimizer

---

## Documentation

Comprehensive project documentation:
- `PROJECT_ARCHITECTURE.md` - Technical architecture details
- `PROJECT_STATUS.md` - Current development status
- `MASTER_SPECIFICATION.md` - Feature specifications
- `KNOWLEDGE_BASE_ANALYSIS.md` - Knowledge base integration
- `ROADMAP.md` - Development roadmap
- `MERGE_REPORT.md` - Branch consolidation details

---

## Environment Variables

Required environment variables (create `.env` file):

```bash
# Database (Supabase)
DATABASE_URL=
DIRECT_URL=

# AI Services
OPENAI_API_KEY=

# Payments (Stripe)
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=

# Authentication (Supabase)
SUPABASE_URL=
SUPABASE_ANON_KEY=

# Etsy Integration
ETSY_CLIENT_ID=
ETSY_CLIENT_SECRET=

# NextAuth
NEXTAUTH_SECRET=
NEXTAUTH_URL=
```

---

## API Endpoints

### Core Features
- `POST /api/optimize` - Text optimization (GPT-4)
- `POST /api/optimize/image/analyze` - Image analysis (Vision API)
- `POST /api/keywords/generate` - Keyword generation
- `POST /api/seo/audit` - SEO audit

### Knowledge Base (✨ NEW)
- `GET /api/knowledge-base` - Access Etsy algorithm insights
- Query params: `action` (metadata, categories, search, etc.), `q` (search term), `name` (category)

### Etsy Integration
- `GET /api/etsy/connect` - Initiate OAuth
- `POST /api/etsy/import` - Import listings
- `POST /api/etsy/sync` - Sync listings

### Payments & Auth
- `POST /api/checkout` - Stripe checkout
- `POST /api/auth/signup` - Create account
- `POST /api/auth/signin` - Sign in

---

## Branch Consolidation Notes

This `unified-mvp` branch represents the consolidation of multiple development branches:
- **Base**: `v1.0-stable` tag
- **Merged**: `main` (knowledge base), `knowledge-base-update`
- **Removed**: Experimental FastAPI/React architecture (standardized on Next.js)

See `MERGE_REPORT.md` for complete consolidation details.

---
