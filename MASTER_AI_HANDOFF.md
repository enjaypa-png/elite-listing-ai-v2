# MASTER HANDOFF DOCUMENT - ELITE LISTING AI
**Version:** 1.0  
**Last Updated:** 2024-11-26 10:00 UTC  
**Branch:** rebuild-core-workflow  
**Commit:** 129970b  
**For:** AI Agents (Neo, Emergent, Claude, ChatGPT, etc.)

---

## 1. CONTEXT SYNC

### Product
**Name:** Elite Listing AI  
**Type:** Etsy listing optimization SaaS  
**Value Prop:** Provides R.A.N.K. 285™ Etsy-specific analysis (not generic SEO)  
**Differentiator:** Uses real Etsy Marketplace Insights data, not fake estimates  

### Tech Stack
- **Frontend:** Next.js 15, React 19, TypeScript
- **Backend:** Next.js API Routes, Prisma ORM
- **Database:** PostgreSQL via Supabase (⚠️ MUST use ?pgbouncer=true)
- **Auth:** Supabase Auth with PKCE flow
- **Storage:** Supabase Storage (for images)
- **AI:** OpenAI GPT-4o (text + vision), Anthropic Claude (rewrites)
- **Payments:** Stripe
- **Integration:** Etsy OAuth (personal API approval granted)
- **Hosting:** Vercel

### Repository
**URL:** https://github.com/enjaypa-png/elite-listing-ai-v2  
**Active Branch:** `rebuild-core-workflow` ⚠️ NOT main  
**Backup Branch:** `backup-before-ai-upgrade`  

### Environments
- **Production:** Vercel (main branch)
- **Preview:** Vercel (rebuild-core-workflow branch)  
- **Local:** http://localhost:3000

### Current Bugs
1. UI doesn't match landing page quality (needs visual polish)
2. One-Click Optimizer uses sample data (needs Etsy listing scraper)
3. Photo enhancement not implemented (shows suggestions only)
4. Store Sync placeholder (needs Etsy OAuth flow)
5. My Listings placeholder (needs listing manager UI)

### Recently Completed
- ✅ Image upload pipeline (Supabase Storage)
- ✅ R.A.N.K. 285™ scoring system (complete)
- ✅ Removed 2,785 lines of duplicate code
- ✅ Clean dashboard with 2 primary CTAs
- ✅ Global UI token system
- ✅ Navigation system (TopNav, Breadcrumbs)
- ✅ Validation & error handling

### Deprecated/Deleted
- ❌ 7-step workflow pages (photo-checkup, photo-improve, keywords, title-description, finish)
- ❌ "Hidden Pond Finder" and "blue ocean" terminology
- ❌ Fake competitive intelligence
- ❌ Duplicate keyword research tools
- ❌ Base64 image encoding (replaced with Supabase Storage)

---

## 2. FEATURE STATE SNAPSHOT

### 2.1 Image Analyzer & Improvements
**Status:** STABLE (analysis), MISSING (enhancement)  
**Files:**
- `/app/upload/page.tsx` - Upload UI
- `/app/api/upload/image/route.ts` - Supabase Storage upload
- `/app/api/optimize/image/analyze/route.ts` - OpenAI Vision analysis

**Logic Done:**
- File upload to Supabase Storage bucket `product-images`
- OpenAI Vision API analysis (lighting, composition, clarity, etc.)
- Results displayed inline with score and suggestions

**Logic Missing:**
- AI photo enhancement (improvement generation)
- Before/after comparison
- Download enhanced images

**Workflow Position:** Standalone tool (not part of workflow anymore)

---

### 2.2 Keyword Engine
**Status:** DEPRECATED (removed confusing tools)  
**Current Approach:** User provides real Etsy Marketplace Insights data manually

**Files:**
- ❌ Old keyword pages deleted
- `/app/api/keywords/*` - Legacy endpoints (may need cleanup)

**Logic:**
- No automated keyword research (Etsy provides this free)
- Focus shifted to analyzing user-provided data

**Workflow Position:** Not applicable (removed from main flow)

---

### 2.3 Competitor Intelligence Engine
**Status:** REMOVED (was using fake estimates)  
**Decision:** Don't compete with Etsy's official data

**Files:**
- ❌ All competitive intelligence files deleted
- ❌ Ranking estimator deleted
- ❌ Revenue impact calculator deleted

**Logic:**
- Removed entirely (was misleading)

---

### 2.4 Listing Optimizer (One-Click)
**Status:** IN-PROGRESS (UI done, logic partial)  
**Files:**
- `/app/dashboard/optimize-listing/page.tsx` - Main UI
- `/app/api/seo/audit/route.ts` - R.A.N.K. 285™ analysis

**Logic Done:**
- URL validation
- R.A.N.K. 285™ scoring (285-point breakdown)
- Priority issues identification
- Quick wins suggestions
- Component-by-component analysis

**Logic Missing:**
- Fetch actual listing data from Etsy URL
- Generate optimized title/tags/description
- Display before/after comparison
- Export/copy functionality

**Workflow Position:** Primary entry point from dashboard

---

### 2.5 Pricing Suggestion Engine
**Status:** NOT STARTED  

**Files:** None yet

**Logic:** Not implemented

---

### 2.6 Scoring System (R.A.N.K. 285™)
**Status:** STABLE  
**Files:**
- `/app/api/seo/audit/route.ts` - Complete implementation

**Logic Done:**
- Title optimization (65 points, 7 rules)
- Tags optimization (55 points, 7 rules)
- Description optimization (55 points, 6 rules)
- Photos placeholder (65 points)
- Attributes placeholder (25 points)
- Category placeholder (20 points)
- AI recommendations via GPT-4o

**Logic Missing:**
- Photo scoring integration (currently hardcoded)
- Attributes analysis
- Category validation

**Workflow Position:** Core analysis engine used by all optimization tools

---

### 2.7 Chrome Extension
**Status:** NOT STARTED  

**Files:** None

**Logic:** Not implemented

---

### 2.8 Stripe + Credits System
**Status:** PARTIAL (models exist, no UI)  
**Files:**
- `/prisma/schema.prisma` - CreditLedger model
- `/lib/stripe.ts` - Stripe client
- Backend ready, no frontend

**Logic Done:**
- Prisma models (User, CreditLedger)
- Stripe integration code exists
- Welcome bonus (10 credits) on signup

**Logic Missing:**
- Credit purchase UI
- Credit usage tracking in optimizer
- Pricing page
- Checkout flow

---

### 2.9 Etsy OAuth + Import Layer
**Status:** PARTIAL (models exist, OAuth incomplete)  
**Files:**
- `/prisma/schema.prisma` - Shop, Listing models
- `/lib/etsy-oauth.ts` - OAuth helpers (may need updates)
- `/lib/etsy-api.ts` - API client

**Personal API Credentials:**
- API Key: `5fv9bmd14ydqqx3lnbgcmsih`
- Shared Secret: `d0yg3nmoqc`
- Rate Limits: 5 QPS, 5K QPD

**Logic Done:**
- Prisma models ready
- OAuth helpers exist
- Personal API approval granted

**Logic Missing:**
- OAuth flow UI
- Listing import functionality
- Store sync dashboard
- Listing selection dropdown

---

## 3. CODEBASE NAVIGATION MAP

### Folder Structure

| Path | Purpose | Status |
|------|---------|--------|
| `/app/` | Next.js app directory | Active |
| `/app/api/` | API routes | Active |
| `/app/dashboard/` | Main app dashboard and tools | Active |
| `/app/auth/` | Sign in/sign up pages | Stable |
| `/app/upload/` | Photo analysis tool | Stable |
| `/components/` | Reusable React components | Active |
| `/components/ui/` | Base UI components (Button, Card, etc.) | Stable |
| `/components/navigation/` | TopNav, Breadcrumbs | Stable |
| `/components/workflow/` | Old workflow components | Deprecated |
| `/components/seo/` | SEO analysis components | Partial |
| `/lib/` | Utility functions and clients | Active |
| `/prisma/` | Database schema and migrations | Stable |
| `/design-system/` | UI tokens (colors, spacing, etc.) | Stable |
| `/legacy/` | Old system backup | DO NOT DELETE |

### Key Components

| Component | File | Purpose |
|-----------|------|---------|
| `TopNav` | `/components/navigation/TopNav.tsx` | Sticky navigation bar |
| `Breadcrumbs` | `/components/navigation/Breadcrumbs.tsx` | Page location indicator |
| `Card` | `/components/ui/Card.tsx` | Standard card container |
| `Button` | `/components/ui/Button.tsx` | Standard button (4 variants) |
| `Container` | `/components/ui/Container.tsx` | Page width container |
| `Modal` | `/components/ui/Modal.tsx` | Modal dialogs |
| `Input` | `/components/ui/Input.tsx` | Form inputs |

### Key API Routes

| Route | File | Purpose | Status |
|-------|------|---------|--------|
| `/api/upload/image` | `/app/api/upload/image/route.ts` | Upload to Supabase Storage | Stable |
| `/api/optimize/image/analyze` | `/app/api/optimize/image/analyze/route.ts` | OpenAI Vision analysis | Stable |
| `/api/seo/audit` | `/app/api/seo/audit/route.ts` | R.A.N.K. 285™ scoring | Stable |
| `/api/seo/rewrite` | `/app/api/seo/rewrite/route.ts` | AI rewrite suggestions | Backend ready |
| `/api/auth/*` | `/app/api/auth/` | Supabase auth routes | Stable |
| `/api/keywords/*` | `/app/api/keywords/` | Keyword generation | Legacy (may clean up) |

### Key Prisma Models

| Model | Purpose | Status |
|-------|---------|--------|
| `User` | User accounts | Stable |
| `Shop` | Connected Etsy shops | Stable (no UI) |
| `Listing` | Etsy listing data | Stable (no UI) |
| `Optimization` | Optimization sessions | Stable (no UI) |
| `OptimizationVariant` | AI-generated variants | Stable (no UI) |
| `PhotoScore` | Image analysis results | Stable |
| `CreditLedger` | Credit transactions | Stable (no UI) |
| `WebhookEvent` | Stripe/Etsy webhooks | Stable (no UI) |
| `Keyword` | Manus keyword dataset | Stable |
| `LongTailPattern` | Keyword patterns | Stable |

---

## 4. DEVELOPMENT PROTOCOLS

### CRITICAL RULES (NEVER VIOLATE)

#### Database
1. **PgBouncer Fix is SACRED**
   - File: `/lib/prisma.ts`
   - Setting: `statement_cache_size=0`
   - ⚠️ Removing this breaks ALL database operations

2. **DATABASE_URL Format**
   - MUST include: `?pgbouncer=true`
   - MUST use port: `6543` (pooler, not 5432)
   - Format: `postgresql://user:pass@pooler.supabase.com:6543/db?pgbouncer=true`

3. **Schema Changes**
   - Require explicit approval
   - Run migrations properly
   - Never break existing models

#### UI Design
1. **Use Global Tokens** (`/design-system/tokens.json`)
   - Background: `#0D1117`
   - Card: `#11161F`
   - Primary: `#007AFF`
   - Text: `#E6EDF3`
   - Muted: `#8B949E`

2. **NO Hardcoding**
   - Use `tokens.colors.*`, `tokens.spacing.*`, `tokens.radius.*`
   - Use existing components (Button, Card, Container)
   - Match landing page aesthetic

3. **Component Standards**
   - Button: 4 variants (primary, secondary, ghost, danger)
   - Card: Uses card.background, card.border, card.shadow
   - All pages have TopNav + Breadcrumbs

#### Architecture
1. **Image Storage**
   - Supabase Storage only (not base64)
   - Bucket: `product-images` (must be public)
   - ⚠️ Don't revert to base64 approach

2. **API Routes**
   - All return JSON with `success: boolean`
   - Include error handling
   - Use request IDs for tracing

3. **No Fake Data**
   - Never estimate search volumes
   - Never fake rankings
   - Never fake revenue projections
   - Be honest about limitations

### Code Quality Expectations
- TypeScript for all new files
- Zod validation for API inputs
- Error boundaries on components
- Loading states on async operations
- Console logs for debugging (remove in production)

### Naming Conventions
- Components: PascalCase (`OptimizeListingPage.tsx`)
- Files: kebab-case for routes (`optimize-listing/page.tsx`)
- API routes: REST conventions (`/api/seo/audit`)
- Functions: camelCase (`analyzeTitle`)
- Constants: UPPER_SNAKE_CASE (`MAX_FILE_SIZE`)

### Pull Request Rules
- Branch from `rebuild-core-workflow`
- Descriptive commit messages
- Test before pushing
- Don't push directly to main
- Include "what changed" and "why" in PR description

---

## 5. CURRENT ROADMAP

### 7-10 Day Sprint (Immediate)
**Goal:** Make optimizer actually optimize listings

**Tasks:**
1. Build Etsy listing scraper
   - Fetch title, description, tags from Etsy URL
   - Parse HTML or use Etsy API
   - Handle rate limits (5 QPS, 5K QPD)

2. Implement optimization logic
   - Generate optimized title using R.A.N.K. rules
   - Generate 13 optimized tags
   - Rewrite description with better keyword density
   - Display before/after comparison

3. Add copy/export features
   - "Copy to Clipboard" buttons
   - "Download as Text" option
   - "Push to Etsy" preparation (not implementation)

**Blockers:**
- None (all dependencies ready)

**Human Approval Needed:**
- None for listed tasks

---

### 3-4 Week Milestone (Short-term)
**Goal:** Store sync + listing management

**Tasks:**
1. Build Etsy OAuth flow
   - OAuth connect button
   - Token exchange and storage
   - Refresh token handling

2. Fetch user's listings
   - Pull active listings from Etsy
   - Store in Listing model
   - Update periodically

3. Listing Manager UI
   - Display synced listings
   - Show R.A.N.K. scores per listing
   - "Optimize This" buttons
   - Batch select for optimization

4. Stripe integration
   - Credit purchase flow
   - Pricing page
   - Checkout with Stripe
   - Credit deduction on optimization

**Blockers:**
- Etsy OAuth callback URL (need production domain)

**Human Approval Needed:**
- Pricing tiers
- Credit costs per optimization

---

### 60-90 Day Scale (Long-term)
**Goal:** Competitive feature parity + unique advantages

**Features:**
1. Chrome Extension
   - One-click optimize from Etsy listing page
   - Inline R.A.N.K. score display
   - Quick copy optimized content

2. Batch Optimization
   - Upload CSV of listings
   - Optimize all at once
   - Export optimized CSV

3. Photo Enhancement
   - AI-powered image improvement
   - Background removal
   - Brightness/contrast adjustment
   - Downloadable enhanced images

4. Analytics Dashboard
   - Track optimization history
   - Show score improvements over time
   - Revenue impact tracking

5. Competitor Analysis (honest version)
   - User provides competitor URLs
   - Analyze their strategies
   - Identify gaps
   - No fake estimates

**Blockers:**
- Photo enhancement model decision
- Analytics tracking implementation

**Human Approval Needed:**
- Feature prioritization
- Pricing for premium features

---

## 6. AI-TO-AI WORKFLOW

### On Handoff Receipt
1. **Read this entire document** (15 minutes)
2. **Clone repository:**
   ```bash
   git clone https://github.com/enjaypa-png/elite-listing-ai-v2.git
   cd elite-listing-ai-v2
   git checkout rebuild-core-workflow
   ```
3. **Review recent commits:**
   ```bash
   git log --oneline -20
   ```
4. **Check current deployment:**
   - Go to Vercel dashboard
   - Find latest `rebuild-core-workflow` deployment
   - Test live app

### Ask for Missing Context
If you need:
- Environment variables → Ask human for credentials
- API keys → Check Vercel environment settings or ask
- Design decisions → Reference `/design-system/tokens.json`
- Business logic → Reference this doc or ask
- Etsy API limits → Already documented (5 QPS, 5K QPD)

### After Completing Work
1. **Update This Document:**
   - Change version number
   - Update "Last Updated" timestamp
   - Update "Recently Completed" section
   - Move completed tasks from roadmap
   - Add new bugs/blockers discovered

2. **Create Session Summary:**
   - File: `AI_SESSION_SUMMARY_[DATE].md`
   - Include: What you built, what you fixed, what's broken, what's next
   - Commit to repository

3. **Log Changes:**
   ```markdown
   ## Changes Made (YYYY-MM-DD by [Agent Name])
   - Fixed: [specific bug]
   - Built: [specific feature]
   - Broke: [if anything]
   - Next: [what next agent should do]
   ```

4. **Human Review Items:**
   - List anything needing Nick's decision
   - List anything blocked waiting for external dependency
   - List anything you're unsure about

### What Next Agent Should Do
**Immediate Priority (from Nick):**
1. Polish UI to match landing page quality
2. Build Etsy listing scraper
3. Implement actual optimization logic

**Reference Files:**
- `AI_AGENT_HANDOFF_COMPLETE.md` - Original handoff
- `AI_SESSION_SUMMARY_FINAL.md` - Latest session
- This file - Master reference

---

## 7. COMPLETE CODEBASE MAP

### `/app/` - Application Pages

| File/Folder | Purpose | Keep/Delete | Notes |
|-------------|---------|-------------|-------|
| `/app/page.tsx` | Landing page | KEEP | Well designed, use as UI reference |
| `/app/layout.tsx` | Root layout | KEEP | Theme provider |
| `/app/globals.css` | Global CSS | KEEP | CSS variables defined |
| `/app/dashboard/page.tsx` | Main dashboard | KEEP | 2 primary CTAs |
| `/app/dashboard/optimize-listing/` | One-Click Optimizer | KEEP | Needs optimization logic |
| `/app/dashboard/listings/` | Listing manager | KEEP | Placeholder, needs build |
| `/app/dashboard/etsy-sync/` | Store sync | KEEP | Placeholder, needs OAuth |
| `/app/dashboard/batch/` | Batch optimizer | KEEP | Placeholder |
| `/app/dashboard/listing-optimizer/` | Duplicate? | REVIEW | May be duplicate |
| `/app/dashboard/seo-audit/` | SEO audit page | KEEP | Placeholder |
| `/app/upload/` | Photo analysis | KEEP | Working, canonical version |
| `/app/auth/signin/` | Sign in | KEEP | Working |
| `/app/auth/signup/` | Sign up | KEEP | Working |

### `/app/api/` - API Routes

| Route | File | Purpose | Status |
|-------|------|---------|--------|
| `/api/upload/image` | `route.ts` | Supabase Storage upload | Stable |
| `/api/optimize/image/analyze` | `route.ts` | OpenAI Vision analysis | Stable |
| `/api/seo/audit` | `route.ts` | R.A.N.K. 285™ scoring | Stable |
| `/api/seo/rewrite` | `route.ts` | AI rewrites (Claude) | Backend ready, no UI |
| `/api/auth/*` | Various | Supabase auth | Stable |
| `/api/keywords/*` | Various | Keyword generation | Legacy, review |
| `/api/internal/seed-keywords` | `route.ts` | Database seeding | Utility |

### `/components/` - React Components

| Component | File | Purpose | Status |
|-----------|------|---------|--------|
| `TopNav` | `navigation/TopNav.tsx` | Top navigation | Stable |
| `Breadcrumbs` | `navigation/Breadcrumbs.tsx` | Page breadcrumbs | Stable |
| `Button` | `ui/Button.tsx` | Standard button | Stable |
| `Card` | `ui/Card.tsx` | Card container | Stable |
| `Container` | `ui/Container.tsx` | Page container | Stable |
| `Modal` | `ui/Modal.tsx` | Modal dialogs | Stable |
| `Input` | `ui/Input.tsx` | Form inputs | Stable |
| `StepLayout` | `workflow/StepLayout.tsx` | Workflow layout | Deprecated |
| `ProgressIndicator` | `workflow/ProgressIndicator.tsx` | Step progress | Deprecated |
| `InfoTooltip` | `workflow/InfoTooltip.tsx` | Info tooltips | Deprecated |
| `RewriteSuggestions` | `seo/RewriteSuggestions.tsx` | AI rewrites UI | Partial |

### `/lib/` - Utility Libraries

| File | Purpose | Status |
|------|---------|--------|
| `prisma.ts` | Prisma client (⚠️ has PgBouncer fix) | CRITICAL - DO NOT MODIFY |
| `supabase.ts` | Supabase clients | Stable |
| `auth-helpers.ts` | Auth utility functions | Stable |
| `openai.ts` | OpenAI client | Stable |
| `stripe.ts` | Stripe client | Partial |
| `etsy-api.ts` | Etsy API client | Partial |
| `etsy-oauth.ts` | Etsy OAuth helpers | Partial |
| `optimizationState.ts` | Session storage state | Deprecated (old workflow) |
| `ai-rewrite-engine.ts` | Anthropic rewrites | Backend ready |

### `/prisma/` - Database

| File | Purpose | Status |
|------|---------|--------|
| `schema.prisma` | Database schema (10 models) | Stable |
| `manusDataset.json` | Keyword dataset | Stable |
| `seedKeywords.ts` | Database seeding script | Utility |

---

## 8. ENVIRONMENT VARIABLES

### Critical (App Won't Work Without)
```
OPENAI_API_KEY=sk-...
DATABASE_URL=postgresql://...?pgbouncer=true
DIRECT_URL=postgresql://...
NEXT_PUBLIC_SUPABASE_URL=https://....supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

### Optional (For Full Features)
```
ANTHROPIC_API_KEY=sk-ant-... (for AI rewrites)
STRIPE_SECRET_KEY=sk_test_... (for payments)
STRIPE_WEBHOOK_SECRET=whsec_... (for webhooks)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_... (for checkout)
ETSY_API_KEY=5fv9bmd14ydqqx3lnbgcmsih (personal approval)
ETSY_CLIENT_SECRET=d0yg3nmoqc
ETSY_REDIRECT_URI=https://your-app.vercel.app/api/etsy/callback
```

---

## 9. CURRENT ISSUES & SOLUTIONS

### Issue 1: UI Doesn't Match Landing Page Quality
**Problem:** Dashboard and tool pages look basic compared to polished landing page  
**Solution:** Apply landing page styling patterns to all pages  
**Priority:** HIGH  
**Files to Update:** All dashboard pages, optimize-listing, upload  

### Issue 2: One-Click Optimizer Uses Sample Data
**Problem:** Can't fetch actual Etsy listing data yet  
**Solution:** Build Etsy listing scraper (HTML parser or API)  
**Priority:** HIGH  
**Blocker:** None (Etsy API ready, just needs implementation)

### Issue 3: Photo Enhancement Not Implemented
**Problem:** Shows suggestions but can't auto-fix images  
**Solution:** Decide on approach (OpenAI DALL-E edit, manual guidance, or skip feature)  
**Priority:** MEDIUM  
**Blocker:** Business decision needed

### Issue 4: Store Sync Incomplete
**Problem:** Can't connect Etsy shop yet  
**Solution:** Build OAuth flow with `/lib/etsy-oauth.ts`  
**Priority:** MEDIUM  
**Blocker:** None

### Issue 5: No Listing Manager
**Problem:** Can't view/manage synced listings  
**Solution:** Build listing table UI with Prisma queries  
**Priority:** MEDIUM  
**Blocker:** Store Sync must be done first

---

## 10. QUICK START CHECKLIST (NEW AGENT)

**Before you code:**
- [ ] Read this entire document
- [ ] Clone repository and checkout `rebuild-core-workflow`
- [ ] Review last 10 commits (`git log --oneline -10`)
- [ ] Test current deployment
- [ ] Read `AI_SESSION_SUMMARY_FINAL.md`
- [ ] Understand what NOT to change (PgBouncer, design tokens, architecture)

**Your first task should be:**
1. Test the app live
2. Identify highest priority issue
3. Confirm with human if unclear
4. Build/fix systematically
5. Test after each change
6. Commit frequently
7. Update this document when done

**Never assume:**
- Environment variables are set (check Vercel)
- External services work (test APIs)
- Previous agent was correct (verify everything)
- Business logic (ask if unsure)

---

## 11. FILE MANIFEST

### Critical Files (DO NOT DELETE)
```
/lib/prisma.ts                    (PgBouncer fix)
/design-system/tokens.json        (UI tokens)
/prisma/schema.prisma             (Database schema)
/app/api/seo/audit/route.ts       (R.A.N.K. 285™ logic)
/app/api/upload/image/route.ts    (Supabase upload)
/app/globals.css                  (Global styles)
/components/ui/*                  (Base components)
/legacy/*                         (Backup, don't delete)
```

### Working Features
```
/app/dashboard/page.tsx           (Dashboard - working)
/app/dashboard/optimize-listing/  (Optimizer - partial)
/app/upload/                      (Photo analysis - working)
/app/auth/signin/                 (Auth - working)
/components/navigation/           (Nav - working)
```

### Incomplete/Placeholder
```
/app/dashboard/listings/          (Needs build)
/app/dashboard/etsy-sync/         (Needs OAuth)
/app/dashboard/batch/             (Needs build)
/lib/etsy-oauth.ts                (Needs implementation)
/lib/stripe.ts                    (Needs UI)
```

### Deprecated (Don't Use)
```
/components/workflow/*            (Old 7-step workflow)
/lib/optimizationState.ts         (Old session storage)
```

---

## 12. TESTING PROTOCOLS

### Before Every Deployment
1. Test auth flow (signin/signup)
2. Test dashboard navigation
3. Test One-Click Optimizer with real Etsy URL
4. Test Photo Analysis with sample image
5. Check console for errors
6. Verify no 404s on navigation
7. Test mobile responsive

### After Every Major Change
1. Run build locally: `npm run build`
2. Check for TypeScript errors
3. Test changed feature thoroughly
4. Verify didn't break existing features
5. Check Vercel deployment logs

---

## 13. COMMON PATTERNS

### Adding a New Page
```tsx
'use client';

import { TopNav, Breadcrumbs } from '@/components/navigation';
import { Container, Card, Button } from '@/components/ui';
import tokens from '@/design-system/tokens.json';

export default function NewPage() {
  return (
    <div style={{ minHeight: '100vh', background: tokens.colors.background }}>
      <TopNav />
      <Breadcrumbs />
      
      <Container>
        <div style={{ maxWidth: '1200px', margin: '0 auto', paddingTop: tokens.spacing[12] }}>
          {/* Your content */}
        </div>
      </Container>
    </div>
  );
}
```

### Adding an API Route
```typescript
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Your logic here
    
    return NextResponse.json({
      success: true,
      data: result
    });
  } catch (error: any) {
    console.error('Error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
```

### Using Prisma
```typescript
import { prisma } from '@/lib/prisma';

// Query
const users = await prisma.user.findMany();

// Create
const user = await prisma.user.create({
  data: { email, name }
});

// Update
await prisma.user.update({
  where: { id },
  data: { name }
});
```

---

## 14. ETSY API INTEGRATION NOTES

### Personal API Credentials
- **Keystring:** `5fv9bmd14ydqqx3lnbgcmsih`
- **Shared Secret:** `d0yg3nmoqc`
- **Rate Limits:** 5 requests/second, 5,000 requests/day
- **Type:** Personal (testing only, not production-approved yet)

### OAuth Flow (To Implement)
1. User clicks "Connect Etsy Shop"
2. Redirect to: `https://www.etsy.com/oauth/connect?client_id={ETSY_API_KEY}&redirect_uri={CALLBACK}&response_type=code&scope=listings_r`
3. Etsy redirects to: `{YOUR_APP}/api/etsy/callback?code={CODE}`
4. Exchange code for access_token
5. Store token in Shop model
6. Use token to fetch listings

### Listing Fetch (To Implement)
```typescript
// GET /api/etsy/listings
const response = await fetch('https://openapi.etsy.com/v3/application/shops/{shop_id}/listings', {
  headers: {
    'x-api-key': ETSY_API_KEY,
    'Authorization': `Bearer ${access_token}`
  }
});
```

---

## 15. SUPABASE STORAGE NOTES

### Bucket Configuration
- **Name:** `product-images`
- **Type:** Public (⚠️ required for OpenAI to access URLs)
- **Purpose:** Store uploaded product photos
- **Max Size:** 10MB per file

### Upload Pattern
```typescript
import { supabaseAdmin } from '@/lib/supabase';

const { data, error } = await supabaseAdmin.storage
  .from('product-images')
  .upload(filePath, buffer, {
    contentType: file.type,
    cacheControl: '3600',
    upsert: false
  });

const { data: urlData } = supabaseAdmin.storage
  .from('product-images')
  .getPublicUrl(filePath);

const imageUrl = urlData.publicUrl;
```

---

## 16. R.A.N.K. 285™ SYSTEM REFERENCE

### Component Breakdown
- **Title:** 65 points (length, keyword placement, readability, materials, adjectives)
- **Tags:** 55 points (count, multi-word, long-tail, no duplicates, title match, variants)
- **Description:** 55 points (length, keywords in intro, density, readability, details, CTA)
- **Photos:** 65 points (count, quality, resolution, variety)
- **Attributes:** 25 points (completeness, accuracy)
- **Category:** 20 points (specificity, accuracy)
- **Total:** 285 points

### Scoring Thresholds
- **90%+ (256+):** Excellent - Top 5% of listings
- **80-89% (228-255):** Good - Top 20%
- **70-79% (200-227):** Decent - Top 40%
- **60-69% (171-199):** Needs work
- **<60% (<171):** Poor - Will not rank well

### File
`/app/api/seo/audit/route.ts` - Complete implementation

---

## 17. KNOWN GOTCHAS

### Prisma
- Always use `?pgbouncer=true` in DATABASE_URL
- Never remove `statement_cache_size=0` from prisma.ts
- Run `npx prisma generate` after schema changes

### Supabase
- Client uses localStorage for sessions (not cookies)
- Service role key bypasses RLS (be careful)
- Storage buckets must be public for OpenAI to access

### OpenAI
- GPT-4o-mini not available on all accounts (use GPT-4o)
- Vision API accepts URLs or base64
- Token limits: ~30K TPM for most accounts

### Vercel
- Preview deployments auto-deploy on push
- Environment variables must be set per environment
- Build errors show in deployment logs

### Etsy API
- Personal approval = 5 QPS, 5K QPD (testing limits)
- Production approval needed for public launch
- OAuth requires verified callback URL

---

## 18. SUCCESS METRICS

### MVP Launch Criteria
- [ ] One-Click Optimizer fetches and analyzes real listings
- [ ] R.A.N.K. 285™ scores accurate
- [ ] Store Sync connects Etsy shops
- [ ] Listing Manager displays synced listings
- [ ] Photo Analysis provides actionable feedback
- [ ] UI matches landing page quality
- [ ] No fake data anywhere
- [ ] Mobile responsive
- [ ] <3s page load times

### User Experience Goals
- User can optimize a listing in <5 minutes
- Clear value proposition vs competitors
- No confusing workflows or dead ends
- Professional UI throughout
- Honest about limitations

---

## 19. DEPLOYMENT CHECKLIST

### Before Merging to Main
- [ ] All features tested on preview
- [ ] No console errors
- [ ] No 404 errors
- [ ] Mobile responsive verified
- [ ] Environment variables confirmed
- [ ] Database migrations run
- [ ] Stripe webhooks configured (if using)
- [ ] Etsy OAuth callback whitelisted (if using)

### After Deployment
- [ ] Test production URL
- [ ] Verify all API routes work
- [ ] Check Vercel function logs
- [ ] Monitor error tracking (if configured)
- [ ] Test with real user account

---

## 20. VERSION CONTROL

### Branch Strategy
- `main` - Production (stable releases only)
- `rebuild-core-workflow` - Active development
- `backup-before-ai-upgrade` - Safety backup

### Commit Message Format
```
feat: add feature description
fix: bug description
refactor: code improvement description
docs: documentation update
chore: maintenance task
```

### Current State
**Active Branch:** rebuild-core-workflow  
**Last Commit:** 129970b  
**Commits Ahead of Main:** ~50+  
**Ready to Merge:** No (needs polish + full optimization logic)

---

## 21. CONTACT & RESOURCES

### Documentation
- Main README: `/README.md`
- Project Architecture: `/PROJECT_ARCHITECTURE.md`
- Etsy Integration: `/ETSY_INTEGRATION_GUIDE.md`
- Environment Setup: `/ENV_SETUP_CHECKLIST.md`

### External Resources
- Etsy API Docs: https://developers.etsy.com/documentation
- Supabase Docs: https://supabase.com/docs
- OpenAI API: https://platform.openai.com/docs
- Stripe Docs: https://stripe.com/docs/api

### Human Contact
- **Owner:** Nick
- **Communication:** Via this interface
- **Timezone:** US-based
- **Working:** Two jobs + building this

---

## 22. FINAL NOTES FOR AI AGENTS

**This app is Nick's dream. His family depends on it working.**

**Your job:**
1. Make features WORK (not just look like they work)
2. Be HONEST about limitations
3. Write CLEAN, maintainable code
4. TEST thoroughly before deploying
5. UPDATE this document after your session
6. COMMUNICATE clearly what you did

**Don't:**
- Create fake features that don't work
- Use placeholder data in production
- Break working features
- Ignore validation
- Skip testing
- Leave messes for next agent

**Do:**
- Build features that actually function
- Validate all inputs
- Handle errors gracefully
- Write clear code comments
- Test edge cases
- Document what you built

---

**END OF MASTER HANDOFF DOCUMENT v1.0**

**Next Update:** After next significant build session  
**Maintained By:** Current AI agent working on project  
**For:** All future AI agents

**Let's build something great for Nick. 🚀**
