# Elite Listing AI v2

## Project Overview

Elite Listing AI is an AI-powered Etsy listing optimization platform that helps sellers improve their product listings using GPT-4 for text generation and OpenAI Vision for image analysis.

## Architecture Notes

**⚠️ IMPORTANT: Dual Architecture in Unified Branch**

This unified-mvp branch contains TWO architectures for evaluation:

### 1. Next.js Architecture (v1.0-stable + main)
- **Location**: Root directory with `app/`, `components/`, `lib/`, `prisma/`
- **Tech Stack**: Next.js 15, TypeScript, Prisma, Supabase, Stripe
- **Features**: Full production app with authentication, payments, Etsy integration
- **Status**: Production-ready at https://elite-listing-ai-v2.vercel.app

### 2. FastAPI + React Architecture (dashboard-fix-nov3)
- **Location**: `backend/` and `frontend/` directories  
- **Tech Stack**: FastAPI (Python), React, shadcn/ui
- **Features**: Alternative implementation exploring different stack
- **Status**: Development/experimental

**TODO**: Team decision needed on which architecture to use going forward or how to integrate features from both.

---

## Next.js Setup (Original Architecture)

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

### Getting Started

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

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

## FastAPI + React Setup (Alternative Architecture)

See `backend/` and `frontend/` directories for the alternative implementation.

### Backend Setup
```bash
cd backend
pip install -r requirements.txt
python server.py
```

### Frontend Setup
```bash
cd frontend
npm install
npm start
```

---

## Documentation

For comprehensive project documentation, see:
- `PROJECT_ARCHITECTURE.md` - Technical architecture details
- `PROJECT_STATUS.md` - Current development status
- `MASTER_SPECIFICATION.md` - Feature specifications
- `KNOWLEDGE_BASE_ANALYSIS.md` - Knowledge base integration details
- `ROADMAP.md` - Development roadmap

---

## Branch Consolidation Notes

This `unified-mvp` branch was created by merging:
- `v1.0-stable` (base)
- `main` (knowledge base features)
- `dashboard-fix-nov3` (alternative architecture)
- `knowledge-base-update` (additional knowledge base updates)

See `MERGE_REPORT.md` for detailed merge analysis and conflict resolutions.
