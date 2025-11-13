# PRESERVATION CHECKLIST v1
## Elite Listing AI - Migration Plan

**Purpose:** Identify all working components, APIs, and infrastructure to preserve during UI rebuild

---

## ✅ SECTION 1: SUPABASE & DATABASE (PRESERVE 100%)

### 1.1 Prisma Schema
**Location:** `/prisma/schema.prisma`
**Status:** ✅ KEEP AS-IS
**Contents:**
- User model (id, email, name, auth fields)
- Shop model (Etsy OAuth tokens, shop data)
- Listing model (product data, images, tags)
- Optimization model (AI results storage)
- OptimizationVariant model (title/description variants)
- PhotoScore model (image analysis results)
- CreditLedger model (payment tracking, double-entry)
- WebhookEvent model (Stripe webhook logging)

**Critical Settings:**
- `statement_cache_size=0` fix for PgBouncer (DO NOT REMOVE)
- DATABASE_URL and DIRECT_URL configuration
- All indexes and relations

**Action:** NO CHANGES - Schema stays exactly as is

---

### 1.2 Supabase Client Configuration
**Location:** `/lib/supabase.ts`
**Status:** ✅ KEEP AS-IS
**Contents:**
- Client-side Supabase client (anon key)
- Server-side Supabase admin (service role key)
- Helper function `getSupabaseServer()`

**Action:** NO CHANGES - Keep all client configurations

---

### 1.3 Prisma Client
**Location:** `/lib/prisma.ts`
**Status:** ✅ KEEP AS-IS (WITH CRITICAL FIX)
**Contents:**
- Singleton pattern for Prisma client
- **CRITICAL:** `datasourceUrl` with `statement_cache_size=0` for PgBouncer fix
- Global instance management

**Action:** NO CHANGES - This fixes the "prepared statement s0" error

---

### 1.4 Database Seed Script
**Location:** `/prisma/seed.ts`
**Status:** ✅ KEEP
**Action:** Preserve for development/testing

---

## ✅ SECTION 2: API ROUTES (PRESERVE ALL WORKING ROUTES)

### 2.1 Authentication APIs
**Location:** `/app/api/auth/*`
**Status:** ✅ KEEP ALL
**Routes:**
- `/api/auth/signin` - User sign in
- `/api/auth/signup` - User registration
- `/api/auth/signout` - User sign out

**Files:**
- `/app/api/auth/signin/route.ts`
- `/app/api/auth/signup/route.ts`
- `/app/api/auth/signout/route.ts`

**Action:** PRESERVE - Will be used in new workflow

---

### 2.2 User & Credits APIs
**Location:** `/app/api/user/*`
**Status:** ✅ KEEP ALL
**Routes:**
- `/api/user/credits` - Get user credit balance
- `/api/user/profile` - Get/update user profile

**Files:**
- `/app/api/user/credits/route.ts`
- `/app/api/user/profile/route.ts`

**Action:** PRESERVE - Critical for credit system

---

### 2.3 Stripe Payment APIs
**Location:** `/app/api/checkout/*` and `/app/api/webhooks/stripe/*`
**Status:** ✅ KEEP ALL
**Routes:**
- `/api/checkout` - Create Stripe checkout session
- `/api/webhooks/stripe` - Handle payment webhooks

**Files:**
- `/app/api/checkout/route.ts`
- `/app/api/webhooks/stripe/route.ts`

**Critical Logic:**
- Credit ledger double-entry bookkeeping
- Webhook idempotency checking
- Refund handling

**Action:** PRESERVE - Payment system stays intact

---

### 2.4 Optimization APIs
**Location:** `/app/api/optimize/*`
**Status:** ✅ KEEP ALL - CORE FEATURES
**Routes:**
- `/api/optimize` - Text optimization (title, description, tags)
- `/api/optimize/demo` - Demo optimization (costs 1 credit)
- `/api/optimize/image/analyze` - Single image analysis
- `/api/optimize/images/batch-analyze` - Batch 10-photo analysis

**Files:**
- `/app/api/optimize/route.ts`
- `/app/api/optimize/demo/route.ts`
- `/app/api/optimize/image/analyze/route.ts`
- `/app/api/optimize/images/batch-analyze/route.ts`

**Critical Features:**
- OpenAI GPT-4o integration
- Vision API for photo analysis
- 285-point algorithm integration
- Credit deduction logic
- Etsy knowledge base usage

**Action:** PRESERVE - These will be rewired to new UI workflow

---

### 2.5 Keyword Generation API
**Location:** `/app/api/keywords/*`
**Status:** ✅ KEEP
**Routes:**
- `/api/keywords/generate` - Generate SEO keywords with 285-point insights

**Files:**
- `/app/api/keywords/generate/route.ts`

**Features:**
- Primary/secondary keyword generation
- Buyer intent analysis
- CTR and conversion scoring
- Algorithm insights

**Action:** PRESERVE - Will be used in new keyword workflow (Step 5)

---

### 2.6 SEO Audit API
**Location:** `/app/api/seo/*`
**Status:** ✅ KEEP
**Routes:**
- `/api/seo/audit` - Complete 285-point audit

**Files:**
- `/app/api/seo/audit/route.ts`

**Action:** PRESERVE - May be used in advanced features

---

### 2.7 Etsy Integration APIs
**Location:** `/app/api/etsy/*`
**Status:** ✅ KEEP ALL
**Routes:**
- `/api/etsy/connect` - OAuth initiation
- `/api/etsy/callback` - OAuth callback
- `/api/etsy/disconnect` - Disconnect shop
- `/api/etsy/import` - Import listings
- `/api/etsy/sync` - Sync listing data
- `/api/etsy/mock_*` - Mock versions for testing

**Files:**
- `/app/api/etsy/connect/route.ts`
- `/app/api/etsy/callback/route.ts`
- `/app/api/etsy/disconnect/route.ts`
- `/app/api/etsy/import/route.ts`
- `/app/api/etsy/sync/route.ts`
- `/app/api/etsy/mock_callback/route.ts`
- `/app/api/etsy/mock_connect/route.ts`
- `/app/api/etsy/mock_import/route.ts`

**Action:** PRESERVE - Etsy OAuth flow works (Phase 4, Step 12)

---

### 2.8 Knowledge Base API
**Location:** `/app/api/knowledge-base/*`
**Status:** ✅ KEEP
**Routes:**
- `/api/knowledge-base` - Access Etsy algorithm insights

**Files:**
- `/app/api/knowledge-base/route.ts`

**Action:** PRESERVE - 285-point system data access

---

### 2.9 Listings & Optimizations APIs
**Location:** `/app/api/listings/*` and `/app/api/optimizations/*`
**Status:** ✅ KEEP
**Routes:**
- `/api/listings` - Get user listings
- `/api/optimizations` - Get user optimizations

**Files:**
- `/app/api/listings/route.ts`
- `/app/api/optimizations/route.ts`

**Action:** PRESERVE - For saved projects page (Phase 4, Step 13)

---

### 2.10 Debug & Development APIs
**Location:** `/app/api/debug/*` and `/app/api/dev/*`
**Status:** ✅ KEEP
**Routes:**
- `/api/debug/grant-credits` - Manual credit granting
- `/api/dev/seed-user` - Create test user

**Files:**
- `/app/api/debug/grant-credits/route.ts`
- `/app/api/dev/seed-user/route.ts`

**Action:** PRESERVE - Useful for development

---

### 2.11 Health Check API
**Location:** `/app/api/health/*`
**Status:** ✅ KEEP
**Routes:**
- `/api/health` - System health check

**Files:**
- `/app/api/health/route.ts`

**Action:** PRESERVE - Monitoring

---

## ✅ SECTION 3: LIBRARY & UTILITY FILES (PRESERVE ALL)

### 3.1 Authentication Helpers
**Files:**
- `/lib/auth.ts` - getCurrentUser, requireAuth
- `/lib/auth-helpers.ts` - Extended auth utilities
- `/lib/auth-simple.ts` - Simple auth helpers

**Action:** ✅ PRESERVE - Auth logic stays

---

### 3.2 Third-Party Integrations
**Files:**
- `/lib/etsy-api.ts` - Etsy API client
- `/lib/etsy-oauth.ts` - OAuth flow helpers
- `/lib/etsyClient.ts` - Etsy client wrapper
- `/lib/stripe.ts` - Stripe client
- `/lib/openai.ts` - OpenAI client
- `/lib/redis.ts` - Redis cache (if used)

**Action:** ✅ PRESERVE - All integration logic stays

---

### 3.3 Etsy Algorithm & Knowledge Base
**Files:**
- `/lib/etsy285PointSystem.json` - Complete 285-point training data
- `/lib/etsyKnowledgeBase.json` - 114 optimization insights
- `/lib/etsyKnowledgeBase.ts` - Knowledge base access functions
- `/lib/scoring285.ts` - Scoring calculation helpers

**Action:** ✅ PRESERVE - Core algorithm data (2 months of work!)

---

### 3.4 Mock Data
**Files:**
- `/lib/mockListingData.ts` - Mock listings for testing

**Action:** ✅ PRESERVE - Useful for development/demo

---

## ✅ SECTION 4: UI COMPONENTS TO PRESERVE

### 4.1 Base UI Components (Design System)
**Location:** `/components/ui/*`
**Status:** ✅ KEEP ALL - REUSE IN NEW WORKFLOW
**Components:**
- `Alert.tsx` - Alert/notification component
- `Button.tsx` - Button component
- `Card.tsx` - Card container
- `Container.tsx` - Page container
- `Footer.tsx` - Footer component
- `Input.tsx` - Form input
- `Modal.tsx` - Modal dialog
- `Navbar.tsx` - Navigation bar
- `index.ts` - Component exports

**Action:** PRESERVE - These are foundation components, reuse everywhere

---

### 4.2 Logo & Health Panel
**Files:**
- `/components/Logo.tsx` - App logo
- `/components/HealthPanel.tsx` - System health display

**Action:** ✅ PRESERVE - Reuse in new layout

---

### 4.3 NEW Simple Keyword Components
**Location:** `/components/keywords/*`
**Status:** ✅ KEEP - USE IN NEW WORKFLOW
**Components:**
- `KeywordSimpleList.tsx` - NEW simple list (just created)
- `EtsyTagsBuilder.tsx` - NEW tag builder (just created)
- `KeywordDetailsModal.tsx` - NEW details modal (just created)
- `KeywordResults.tsx` - OLD complex version

**Action:** 
- ✅ KEEP: KeywordSimpleList, EtsyTagsBuilder, KeywordDetailsModal
- 📦 MOVE TO /legacy: KeywordResults.tsx

---

### 4.4 Optimization Components
**Location:** `/components/optimization/*`
**Status:** ⚠️ SELECTIVE PRESERVATION
**Components:**
- `DescriptionOptimizer.tsx` - Side-by-side description comparison
- `ListingImporter.tsx` - Import listing from Etsy
- `OptimizationStudio.tsx` - Main optimization interface
- `PhotoAnalysisGrid.tsx` - Photo grid display
- `PhotoAnalysisPanel.tsx` - Photo analysis panel
- `PriorityActionsSidebar.tsx` - Issues sidebar
- `ScoreHeader.tsx` - Score display header
- `TagsOptimizer.tsx` - Tag management
- `TitleOptimizer.tsx` - Title variants display

**Action:**
- ✅ CAN REUSE: DescriptionOptimizer (for Step 6 - Title & Description)
- ✅ CAN REUSE: PhotoAnalysisGrid (for Step 3 - Photo Checkup)
- ✅ CAN REUSE: PhotoAnalysisPanel (for Step 3)
- ✅ CAN REUSE: TitleOptimizer (for Step 6)
- 📦 MOVE TO /legacy: OptimizationStudio, PriorityActionsSidebar, ScoreHeader, TagsOptimizer, ListingImporter

**Reason:** New workflow is photo-first (not keyword-first), so some components don't fit

---

## ✅ SECTION 5: PAGE ROUTES (SELECTIVE MIGRATION)

### 5.1 Root & Layout Files
**Files:**
- `/app/page.tsx` - Homepage
- `/app/layout.tsx` - Root layout
- `/app/globals.css` - Global styles
- `/app/providers.tsx` - Context providers

**Action:** 
- ✅ KEEP: layout.tsx, globals.css, providers.tsx (infrastructure)
- 📦 REVIEW: page.tsx (may need redesign for new dashboard)

---

### 5.2 Authentication Pages
**Files:**
- `/app/auth/signin/page.tsx` - Sign in page
- `/app/auth/signup/page.tsx` - Sign up page

**Action:** ✅ PRESERVE - Auth UI works

---

### 5.3 Dashboard Page
**Files:**
- `/app/dashboard/page.tsx` - Main dashboard
- `/app/dashboard/page.tsx.old` - Old backup
- `/app/dashboard/page-old.tsx.bak` - Another backup

**Action:**
- 📦 MOVE TO /legacy: All dashboard files
- 🔨 REBUILD: New dashboard for Phase 1, Step 1 (large "Optimize a Listing" button)

---

### 5.4 Optimize Pages
**Files:**
- `/app/optimize/page.tsx` - Multi-tool optimizer page
- `/app/optimize/[listingId]/page.tsx` - Optimization Studio page

**Action:**
- 📦 MOVE TO /legacy: Both optimize pages
- 🔨 REBUILD: New step-by-step workflow (Steps 2-7)

**Reason:** New workflow is completely different (photo-first, step-by-step)

---

### 5.5 Etsy Integration Page
**Files:**
- `/app/etsy/page.tsx` - Etsy shop connection page

**Action:**
- 📦 MOVE TO /legacy: etsy/page.tsx
- 🔨 REBUILD: Simpler version for Phase 4, Step 12

---

### 5.6 Checkout Page
**Files:**
- `/app/checkout/page.tsx` - Credit purchase page

**Action:** ✅ PRESERVE - Payment flow works

---

### 5.7 Analyze Page
**Files:**
- `/app/analyze/page.tsx` - Analysis page

**Action:** 📦 MOVE TO /legacy (purpose unclear, may be duplicate)

---

### 5.8 Test Pages
**Files:**
- `/app/test/page.tsx`
- `/app/test/listing-optimizer-results.tsx`

**Action:** ✅ KEEP - Useful for development

---

## ✅ SECTION 6: CONFIGURATION & INFRASTRUCTURE

### 6.1 Next.js Configuration
**Files:**
- `/next.config.js`
- `/tsconfig.json`
- `/package.json`
- `/postcss.config.mjs`
- `/eslint.config.mjs`

**Action:** ✅ PRESERVE ALL - No changes to build config

---

### 6.2 Design System
**Files:**
- `/design-system/tokens.json`
- Any other design system files

**Action:** ✅ PRESERVE - Design tokens stay

---

### 6.3 TypeScript Types
**Location:** `/types/*`
**Files:**
- `/types/next-auth.d.ts`
- Any other type definitions

**Action:** ✅ PRESERVE - Type definitions stay

---

### 6.4 Middleware
**Files:**
- `/middleware.ts` - Next.js middleware

**Action:** ✅ PRESERVE - Routing/auth middleware

---

## ✅ SECTION 7: SCRIPTS & UTILITIES

### 7.1 Scripts
**Location:** `/scripts/*`
**Action:** ✅ PRESERVE - Keep all utility scripts

---

### 7.2 Test Scripts
**Files (root level):**
- `test-auth-e2e.js`
- `test-batch-photos.sh`
- `test-kb-quick.js`
- `test-keyword-seo.sh`
- `test-phase2.js`
- `test-prisma-connection.js`
- `test-signup.js`
- `test-supabase-connection.js`

**Action:** ✅ PRESERVE - Testing tools remain

---

## 📦 SECTION 8: FILES TO MOVE TO /legacy

### 8.1 Old Page Routes
**Move these to `/legacy/app/`:**
- `/app/dashboard/page.tsx` → `/legacy/app/dashboard/page.tsx`
- `/app/dashboard/page.tsx.old` → `/legacy/app/dashboard/page.tsx.old`
- `/app/dashboard/page-old.tsx.bak` → `/legacy/app/dashboard/page-old.tsx.bak`
- `/app/optimize/page.tsx` → `/legacy/app/optimize/page.tsx`
- `/app/optimize/[listingId]/page.tsx` → `/legacy/app/optimize/[listingId]/page.tsx`
- `/app/etsy/page.tsx` → `/legacy/app/etsy/page.tsx`
- `/app/analyze/page.tsx` → `/legacy/app/analyze/page.tsx`
- `/app/page.tsx` → `/legacy/app/page.tsx` (root homepage)

**Reason:** These represent old workflows that don't match new photo-first flow

---

### 8.2 Old Optimization Components
**Move these to `/legacy/components/optimization/`:**
- `/components/optimization/OptimizationStudio.tsx`
- `/components/optimization/PriorityActionsSidebar.tsx`
- `/components/optimization/ScoreHeader.tsx`
- `/components/optimization/TagsOptimizer.tsx`
- `/components/optimization/ListingImporter.tsx`

**Keep (can reuse):**
- ✅ `/components/optimization/DescriptionOptimizer.tsx`
- ✅ `/components/optimization/PhotoAnalysisGrid.tsx`
- ✅ `/components/optimization/PhotoAnalysisPanel.tsx`
- ✅ `/components/optimization/TitleOptimizer.tsx`

---

### 8.3 Old Keyword Component
**Move to `/legacy/components/keywords/`:**
- `/components/keywords/KeywordResults.tsx` (old complex version)

**Keep (NEW simple versions):**
- ✅ `/components/keywords/KeywordSimpleList.tsx`
- ✅ `/components/keywords/EtsyTagsBuilder.tsx`
- ✅ `/components/keywords/KeywordDetailsModal.tsx`

---

## ✅ SECTION 9: SUMMARY OF ACTIONS

### Files to PRESERVE (NO CHANGES):
**Total: ~60+ files**

**Database & Backend:**
- ✅ `/prisma/schema.prisma`
- ✅ `/lib/prisma.ts` (with PgBouncer fix)
- ✅ `/lib/supabase.ts`
- ✅ All 25 API route files in `/app/api/*`

**Libraries & Utilities:**
- ✅ All 11 files in `/lib/*.ts` and `/lib/*.json`
- ✅ All auth helpers
- ✅ All third-party integrations
- ✅ 285-point algorithm data

**UI Infrastructure:**
- ✅ All 9 components in `/components/ui/*`
- ✅ `/components/Logo.tsx`
- ✅ `/components/HealthPanel.tsx`
- ✅ 3 NEW keyword components
- ✅ 4 reusable optimization components

**Configuration:**
- ✅ `/next.config.js`
- ✅ `/package.json`
- ✅ `/tsconfig.json`
- ✅ All config files

**Total Preserved:** ~60-70 files with working logic

---

### Files to MOVE TO /legacy:
**Total: ~10 files**

**Old Page Routes:**
- 📦 `/app/page.tsx`
- 📦 `/app/dashboard/page.tsx` (+ old versions)
- 📦 `/app/optimize/page.tsx`
- 📦 `/app/optimize/[listingId]/page.tsx`
- 📦 `/app/etsy/page.tsx`
- 📦 `/app/analyze/page.tsx`

**Old Components:**
- 📦 `/components/keywords/KeywordResults.tsx`
- 📦 `/components/optimization/OptimizationStudio.tsx`
- 📦 `/components/optimization/PriorityActionsSidebar.tsx`
- 📦 `/components/optimization/ScoreHeader.tsx`
- 📦 `/components/optimization/TagsOptimizer.tsx`
- 📦 `/components/optimization/ListingImporter.tsx`

**Total to Archive:** ~12 files (old UI only, all logic preserved)

---

### New Files to CREATE:
**Total: ~8-10 files**

**New Workflow Pages:**
- 🔨 `/app/page.tsx` - New homepage/dashboard
- 🔨 `/app/upload/page.tsx` - Step 1: Upload Photo
- 🔨 `/app/photo-checkup/[id]/page.tsx` - Step 2: Photo Checkup
- 🔨 `/app/photo-improve/[id]/page.tsx` - Step 3: Photo Improvement
- 🔨 `/app/keywords/[id]/page.tsx` - Step 4: Recommended Phrases
- 🔨 `/app/title-description/[id]/page.tsx` - Step 5: Title & Description
- 🔨 `/app/finish/[id]/page.tsx` - Step 6: Finish & Export

**New Components (if needed):**
- 🔨 `/components/workflow/PhotoUploader.tsx`
- 🔨 `/components/workflow/PhotoCheckup.tsx`
- 🔨 `/components/workflow/PhotoImprover.tsx`
- 🔨 `/components/workflow/FinishSummary.tsx`

---

## ✅ SECTION 10: CRITICAL REMINDERS

### What MUST NOT Be Touched:
1. ❌ DO NOT modify Prisma schema
2. ❌ DO NOT delete API routes
3. ❌ DO NOT remove Supabase configuration
4. ❌ DO NOT change PgBouncer fix in prisma.ts
5. ❌ DO NOT delete 285-point algorithm data
6. ❌ DO NOT remove payment/credit system
7. ❌ DO NOT delete Etsy OAuth logic
8. ❌ DO NOT throw away UI base components

### What Will Change:
1. ✅ UI page routes (new photo-first workflow)
2. ✅ Component composition (reuse existing components in new layouts)
3. ✅ User journey (step-by-step instead of multi-tool)
4. ✅ Visual design (simpler, cleaner, info icons everywhere)

---

## 📋 APPROVAL CHECKLIST

Before proceeding, confirm:
- [ ] Preservation checklist is complete and accurate
- [ ] I understand what's being preserved vs moved
- [ ] I'm ready to create the `rebuild-core-workflow` branch
- [ ] I approve moving old pages to `/legacy`
- [ ] I understand backend APIs will be reused (not rebuilt)
- [ ] I'm ready to start Phase 1 of new workflow

---

## 📊 SUMMARY

**Preserving:**
- ✅ 100% of database schema
- ✅ 100% of API routes (25+ routes)
- ✅ 100% of library utilities (~15 files)
- ✅ 100% of UI base components (9+ components)
- ✅ 100% of third-party integrations
- ✅ 100% of 285-point algorithm data
- ✅ Payment system, auth system, Etsy OAuth
- ✅ 3 NEW simple keyword components

**Archiving (not deleting):**
- 📦 ~10-12 old UI page routes
- 📦 ~5-6 old complex components

**Building Fresh:**
- 🔨 ~7-10 new workflow pages
- 🔨 ~4-5 new workflow components
- 🔨 New photo-first user journey

**Risk Level:** MINIMAL
- No data loss
- No logic loss
- Only UI reorganization
- Can always revert to /legacy if needed

---

**Status:** ✅ Ready for Your Approval

Please review this checklist and confirm I can proceed with creating the branch and migration.
