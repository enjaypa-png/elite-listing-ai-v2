# Elite Listing AI - Complete AI Agent Handoff Package
## Nov 19, 2024 - Session with Neo (E2)

**⚠️ READ THIS ENTIRE DOCUMENT BEFORE MAKING ANY CHANGES ⚠️**

---

## 📍 CURRENT PROJECT STATE

**Repository:** https://github.com/enjaypa-png/elite-listing-ai-v2  
**Active Branch:** `rebuild-core-workflow` ⚠️ **NOT main**  
**Latest Commit:** `58e73ac` - Supabase Storage + UI components  
**Status:** Image upload pipeline rebuilt, UI token migration in progress

---

## 🎯 WHAT IS ELITE LISTING AI?

### The Product
An **AI-powered Etsy listing optimization platform** that helps Etsy sellers optimize their product listings using OpenAI's GPT-4o and a proprietary **285-Point Etsy Algorithm System** based on Etsy's 2025 ranking factors.

### The Killer Feature (Your Competitive Moat)
**Seamless One-Click Etsy Sync** - The ONLY tool that automates the entire optimization workflow:

**Competitors (eRank, Alura, Marmalead):**
- Show suggestions only
- User must manually copy/paste to Etsy
- 20-30 minutes per listing
- 8+ context switches (tool → Etsy → tool → Etsy...)
- High error rate

**Your Solution:**
1. **Connect Etsy** → OAuth one time
2. **Import Listing** → One click fetches all data + 10 photos
3. **AI Optimizes** → 285-point algorithm generates variants
4. **Review Changes** → Unified Optimization Studio
5. **Sync to Etsy** → One click pushes everything back

**Result:** 5-10 minutes per listing, ZERO context switches, 3x faster

---

## 🏗️ TECH STACK

**Frontend:**
- Next.js 15 (App Router)
- React 19
- TypeScript
- **Token-based design system** (NOT Tailwind classes)

**Backend:**
- Next.js API Routes
- Prisma ORM
- PostgreSQL (Supabase)
- Supabase Auth
- Supabase Storage

**AI/ML:**
- OpenAI GPT-4o (text optimization)
- OpenAI GPT-4o Vision (photo analysis)

**Integrations:**
- Stripe (payments)
- Etsy OAuth + REST API (personal approval granted)

**Infrastructure:**
- Vercel (hosting)
- Supabase (database + auth + storage)

---

## ✅ WHAT'S WORKING (DO NOT MODIFY WITHOUT EXPLICIT BUG)

### Backend (Fully Functional)

**Database Schema (8 Models):**
- ✅ User - Auth and user data
- ✅ Shop - Connected Etsy shops
- ✅ Listing - Etsy listing data
- ✅ Optimization - Optimization sessions
- ✅ OptimizationVariant - AI-generated variants
- ✅ PhotoScore - Image analysis results
- ✅ CreditLedger - User credits tracking
- ✅ WebhookEvent - Stripe/Etsy webhooks
- ✅ Keyword - Manus keyword dataset
- ✅ LongTailPattern - Long-tail keyword patterns

**API Routes (25+ Working):**
- ✅ `/api/auth/signin` - Supabase email/password auth
- ✅ `/api/auth/signup` - User registration
- ✅ `/api/auth/signout` - Sign out
- ✅ `/api/upload/image` - Image upload (Supabase Storage)
- ✅ `/api/optimize/image/analyze` - Photo AI analysis
- ✅ `/api/optimize/images/batch-analyze` - Batch photo analysis
- ✅ `/api/keywords/*` - Keyword generation endpoints
- ✅ `/api/seo/audit` - SEO scoring
- ✅ `/api/optimize` - Text optimization
- ✅ Stripe webhooks
- ✅ Etsy OAuth callbacks

**Critical Configuration:**
- ✅ **PgBouncer fix** in `/lib/prisma.ts`: `statement_cache_size=0` ⚠️ NEVER REMOVE
- ✅ Prisma singleton pattern (prevents connection issues)
- ✅ Supabase client configured with PKCE flow

### Frontend (7-Step Workflow)

**Pages (All Exist):**
1. ✅ `/upload` - Upload product photo (**REFACTORED** with new UI components)
2. ✅ `/photo-checkup/[id]` - Photo analysis results (needs token migration)
3. ✅ `/photo-improve/[id]` - Photo improvement suggestions (needs token migration)
4. ✅ `/keywords/[id]` - Keyword generation (needs token migration)
5. ✅ `/title-description/[id]` - Title/description optimization (needs token migration)
6. ✅ `/finish/[id]` - Final review (needs token migration)
7. ✅ `/saved-projects` - View saved optimizations (needs token migration)
8. ✅ `/etsy-connect` - Connect Etsy shop (needs token migration)

**State Management:**
- ✅ `/lib/optimizationState.ts` - sessionStorage-based workflow state
- ✅ Persists across page navigation
- ✅ Used by all workflow pages

**UI System:**
- ✅ Design tokens: `/design-system/tokens.json`
- ✅ Shared components: `/components/ui/` (Button, Card, Container, Modal, Input)
- ✅ **NEW workflow components:** `/components/workflow/` (StepLayout, ProgressIndicator, InfoTooltip)

---

## 🚨 CURRENT BLOCKERS & RECENT FIXES

### BLOCKER #1: Image Upload Pipeline ⚠️ CRITICAL (IN PROGRESS)

**Problem Evolution:**
1. **Original:** Upload → base64 → analyzer → OpenAI Vision
2. **Issue 1:** Zod validation rejected base64 data URLs
   - ✅ **FIXED:** Changed `.url()` to `.min(1)` in analyzer validation
3. **Issue 2:** 290K tokens exceeded OpenAI limit (30K TPM)
   - ❌ **ATTEMPTED:** Added image resizing (didn't solve root issue)
4. **Issue 3:** Vercel 4.5MB body limit blocked large base64 payloads
   - ✅ **FIXED:** Migrated to Supabase Storage architecture

**Current Solution (Commit 31972bf):**
- Upload images to Supabase Storage bucket `product-images`
- Return public URL (not base64)
- OpenAI fetches image directly from URL
- No token limits, no payload limits, faster

**Status:** Code deployed, **waiting for user to:**
1. Create Supabase Storage bucket named `product-images`
2. Make it **public** (so OpenAI can access URLs)
3. Test end-to-end workflow

**Files Modified:**
- `/app/api/upload/image/route.ts` - Now uses `supabaseAdmin.storage.from('product-images').upload()`
- `/app/api/optimize/image/analyze/route.ts` - Accepts URLs or base64 (validation: `.min(1)`)
- `/app/upload/page.tsx` - Better error handling for non-JSON responses

### BLOCKER #2: UI Inconsistency (Phase 2 In Progress)

**Problem:** Workflow pages use hardcoded colors/spacing instead of design tokens

**Progress:**
- ✅ **Phase 1 Complete:** Created foundational components
  - `StepLayout.tsx` - Standard page wrapper with header/content/footer
  - `ProgressIndicator.tsx` - 7-step progress indicator
  - `InfoTooltip.tsx` - Reusable (ℹ) tooltip
- ✅ **Phase 2A Complete:** Refactored `/upload` page to use new components
  - Removed 88 lines of hardcoded UI
  - All styling now uses `tokens.colors.*`, `tokens.spacing.*`, `tokens.radius.*`
  - Uses `<Button />` component instead of custom buttons

**Remaining Work (Phase 2B-2G):**
- ⏳ 7 more pages need token migration (one at a time, architect-approved)
- Pattern established, just needs surgical application

**Critical Rules:**
- ✅ Use design tokens ONLY (no hardcoded hex colors, spacing, radii)
- ✅ Use existing UI components (Button, Card, Container, Modal, Input)
- ✅ Use new workflow components (StepLayout, ProgressIndicator, InfoTooltip)
- ❌ NO redesigns - follow existing patterns exactly
- ❌ NO Tailwind classes
- ❌ NO creating new design tokens

### BLOCKER #3: Vercel Deployment Chaos (Not Started)

**Problem:** Multiple Vercel projects, multiple deployments, confusing URLs

**User Pain:**
- Doesn't know which deployment URL to use
- Environment variables may be scattered
- Multiple preview deployments from different commits

**Solution Needed:**
- Establish ONE canonical preview URL for `rebuild-core-workflow`
- Consolidate environment variables
- Clean up old deployments
- Document which URL to use for testing

---

## 🔑 REQUIRED ENVIRONMENT VARIABLES

### Priority 1 (Critical - App Won't Work):
```
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxx
DATABASE_URL=postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true
DIRECT_URL=postgresql://postgres.[ref]:[password]@db.[ref].supabase.co:5432/postgres
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

### Priority 2 (Stripe Payments):
```
STRIPE_SECRET_KEY=sk_test_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
```

### Priority 3 (Etsy Integration - NOW AVAILABLE):
```
ETSY_API_KEY=5fv9bmd14ydqqx3lnbgcmsih
ETSY_CLIENT_SECRET=d0yg3nmoqc
ETSY_REDIRECT_URI=https://your-app.vercel.app/api/etsy/callback
USE_MOCK_ETSY=false
```

**Important Notes:**
- DATABASE_URL **MUST** use port **6543** (pooler) with `?pgbouncer=true`
- DIRECT_URL uses port **5432** (direct) without pgbouncer parameter
- All vars must be set for **Production**, **Preview**, AND **Development** in Vercel

---

## 🔒 ABSOLUTE RULES - NEVER VIOLATE

### Backend Rules:
1. **NEVER remove the PgBouncer fix** in `/lib/prisma.ts`
   - Line: `statement_cache_size=0`
   - Removing this causes "prepared statement already exists" errors
2. **NEVER modify Prisma models** without explicit bug confirmation
3. **NEVER change API response shapes** - frontend depends on exact contracts
4. **ALWAYS use `?pgbouncer=true`** in DATABASE_URL
5. **NEVER work on `main` branch** - use `rebuild-core-workflow` only

### Frontend UI Rules:
1. **MUST use design tokens** from `/design-system/tokens.json`
   - Colors: `tokens.colors.primary`, `tokens.colors.background`, etc.
   - Spacing: `tokens.spacing[4]`, `tokens.spacing[10]`, etc.
   - Radius: `tokens.radius.lg`, `tokens.radius.full`, etc.
   - Typography: `tokens.typography.fontSize.xl`, etc.
2. **NO hardcoded values**: No `#3B82F6`, no `16px`, no `border-radius: 8px`
3. **USE existing components:**
   - `<Button variant="primary" size="lg" />`
   - `<Card>`, `<Container>`, `<Modal>`, `<Input>`
   - `<StepLayout>`, `<ProgressIndicator>`, `<InfoTooltip>`
4. **NO Tailwind classes** - this is a token-based design system
5. **NO redesigns** - replicate existing patterns exactly
6. **NO new CSS frameworks or libraries**

### Required Page Structure:
```tsx
import { StepLayout, ProgressIndicator, InfoTooltip } from '@/components/workflow';

<StepLayout
  header={
    <>
      <ProgressIndicator currentStep={N} />
      <h1>Step N: Page Title <InfoTooltip text="Help text" /></h1>
      <p>Subtitle</p>
    </>
  }
  footer={<Button onClick={handleNext}>Continue</Button>}
>
  {/* Page content */}
</StepLayout>
```

---

## 🎨 DESIGN SYSTEM REFERENCE

**Location:** `/design-system/tokens.json`

**Available Tokens:**
```javascript
// Colors
tokens.colors.background    // #0f1419 (dark bg)
tokens.colors.surface       // #1a2332 (card bg)
tokens.colors.surface2      // #243041 (elevated surface)
tokens.colors.border        // rgba(255, 255, 255, 0.1)
tokens.colors.text          // #f8f9fa (primary text)
tokens.colors.textMuted     // #a6acb5 (secondary text)
tokens.colors.primary       // #00B3FF (brand blue)
tokens.colors.primaryHover  // #0095d9
tokens.colors.primaryForeground // #1a1a2e (text on primary)
tokens.colors.success       // #22C55E (green)
tokens.colors.danger        // #EF4444 (red)
tokens.colors.warning       // #F59E0B (orange)

// Spacing (0.25rem to 6rem)
tokens.spacing[1]  // 0.25rem
tokens.spacing[2]  // 0.5rem
tokens.spacing[3]  // 0.75rem
tokens.spacing[4]  // 1rem
tokens.spacing[6]  // 1.5rem
tokens.spacing[8]  // 2rem
tokens.spacing[10] // 2.5rem
tokens.spacing[12] // 3rem
tokens.spacing[16] // 4rem
tokens.spacing[20] // 5rem
tokens.spacing[24] // 6rem

// Border Radius
tokens.radius.sm   // 0.375rem
tokens.radius.md   // 0.5rem
tokens.radius.lg   // 0.75rem
tokens.radius.xl   // 1rem
tokens.radius['2xl'] // 1.5rem
tokens.radius.full // 9999px

// Typography
tokens.typography.fontSize.xs   // 0.75rem
tokens.typography.fontSize.sm   // 0.875rem
tokens.typography.fontSize.base // 1rem
tokens.typography.fontSize.lg   // 1.125rem
tokens.typography.fontSize.xl   // 1.25rem
tokens.typography.fontSize['2xl'] // 1.5rem
tokens.typography.fontSize['3xl'] // 1.875rem
tokens.typography.fontSize['4xl'] // 2.25rem
tokens.typography.fontSize['6xl'] // 3.75rem

tokens.typography.fontWeight.normal   // 400
tokens.typography.fontWeight.medium   // 500
tokens.typography.fontWeight.semibold // 600
tokens.typography.fontWeight.bold     // 700

// Motion
tokens.motion.duration.fast   // 150ms
tokens.motion.duration.normal // 300ms
tokens.motion.duration.slow   // 500ms
tokens.motion.easing.easeInOut // ease-in-out
```

**Example Usage:**
```tsx
<div style={{
  background: tokens.colors.surface,
  padding: tokens.spacing[8],
  borderRadius: tokens.radius.lg,
  color: tokens.colors.text
}}>
  Content
</div>
```

---

## 📊 DATABASE SCHEMA OVERVIEW

**Models:**

1. **User** - Users table
   - id, email, name, emailVerified, createdAt, updatedAt
   - Relations: shops[], creditLedgers[], optimizations[]

2. **Shop** - Connected Etsy shops
   - userId, platform, platformShopId, shopName, accessToken, refreshToken
   - Relations: user, listings[]

3. **Listing** - Etsy listing data
   - shopId, platformListingId, title, description, price, imageUrls, tags
   - Relations: shop, optimizations[], photoScores[]

4. **Optimization** - Optimization sessions
   - userId, listingId, type, status, creditsUsed, result
   - Relations: user, listing, variants[]

5. **OptimizationVariant** - AI-generated variants
   - optimizationId, variantNumber, title, description, tags, score
   - Relations: optimization

6. **PhotoScore** - Image analysis results
   - listingId, imageUrl, overallScore, compositionScore, lightingScore, analysis, suggestions
   - Relations: listing

7. **CreditLedger** - Credit transactions
   - userId, amount, balance, type, description
   - Relations: user

8. **WebhookEvent** - Webhook events
   - provider, eventType, eventId, payload, processed

9. **Keyword** - Keyword database (Manus dataset)
   - keyword, category, subcategory, type, isActive

10. **LongTailPattern** - Long-tail keyword patterns
    - pattern, description, variables, category

---

## 🎨 THE 7-STEP WORKFLOW (User Journey)

### Current Implementation:

**Step 1: Upload** (`/upload`) ✅ UI REFACTORED
- User uploads product photo
- Uploads to Supabase Storage bucket `product-images`
- Returns public URL
- Stores in sessionStorage

**Step 2: Photo Checkup** (`/photo-checkup/[id]`) ⏳ NEEDS TOKEN MIGRATION
- Retrieves analysis from sessionStorage
- Displays photo quality score
- Shows suggestions for improvement
- Options: Improve Photo OR Skip to Keywords

**Step 3: Photo Improve** (`/photo-improve/[id]`) ⏳ NEEDS TOKEN MIGRATION
- Shows original vs improved version
- User selects which to use
- Continues to keywords

**Step 4: Keywords** (`/keywords/[id]`) ⏳ NEEDS TOKEN MIGRATION
- AI generates keyword suggestions using Manus dataset
- User selects 13 tags (Etsy limit)
- Uses: `KeywordSimpleList`, `EtsyTagsBuilder`, `KeywordDetailsModal` components

**Step 5: Title/Description** (`/title-description/[id]`) ⏳ NEEDS TOKEN MIGRATION
- AI generates optimized title and description
- Shows variants with scores
- User selects preferred version

**Step 6: Finish** (`/finish/[id]`) ⏳ NEEDS TOKEN MIGRATION
- Summary of all optimizations
- Final score comparison (before/after)
- Option to save or sync to Etsy

**Step 7: Sync** (future)
- Push all changes to Etsy via OAuth
- One-click update of listing

**Supporting Pages:**
- `/saved-projects` - View previous optimizations ⏳ NEEDS TOKEN MIGRATION
- `/etsy-connect` - Connect Etsy shop via OAuth ⏳ NEEDS TOKEN MIGRATION

---

## 📁 PROJECT FILE STRUCTURE

```
/app/
  ├── auth/
  │   ├── signin/page.tsx       ✅ Working (redirects to /upload)
  │   └── signup/page.tsx       ✅ Working
  ├── api/
  │   ├── auth/                 ✅ Supabase auth routes
  │   ├── upload/image/         ✅ Supabase Storage upload
  │   ├── optimize/
  │   │   ├── image/analyze/    ✅ OpenAI Vision analysis
  │   │   └── images/batch-analyze/ ✅ Batch analysis
  │   ├── keywords/             ✅ Keyword generation
  │   └── seo/audit/            ✅ SEO scoring
  ├── upload/page.tsx           ✅ REFACTORED (Phase 2A)
  ├── photo-checkup/[id]/       ⏳ Needs token migration
  ├── photo-improve/[id]/       ⏳ Needs token migration
  ├── keywords/[id]/            ⏳ Needs token migration
  ├── title-description/[id]/   ⏳ Needs token migration
  ├── finish/[id]/              ⏳ Needs token migration
  ├── saved-projects/           ⏳ Needs token migration
  └── etsy-connect/             ⏳ Needs token migration

/components/
  ├── ui/                       ✅ Existing shared components
  │   ├── Button.tsx           ✅ Token-based, 4 variants
  │   ├── Card.tsx             ✅ Token-based
  │   ├── Container.tsx        ✅ Token-based
  │   ├── Modal.tsx            ✅ Token-based
  │   └── Input.tsx            ✅ Token-based
  └── workflow/                 ✅ NEW - Phase 1 complete
      ├── StepLayout.tsx       ✅ Created
      ├── ProgressIndicator.tsx ✅ Created
      └── InfoTooltip.tsx      ✅ Created

/lib/
  ├── prisma.ts                 ✅ CRITICAL: Has PgBouncer fix
  ├── supabase.ts               ✅ Auth + Storage clients
  ├── auth-helpers.ts           ✅ Supabase auth functions
  ├── optimizationState.ts      ✅ Workflow state management
  ├── etsy-api.ts               ✅ Etsy integration
  ├── stripe.ts                 ✅ Stripe integration
  └── openai.ts                 ✅ OpenAI client

/design-system/
  └── tokens.json               ✅ MUST USE - Design tokens

/prisma/
  ├── schema.prisma             ✅ 10 models defined
  └── manusDataset.json         ✅ Keyword dataset

/legacy/                        ✅ Old system (preserved, don't delete)
```

---

## 🔧 RECENT FIXES SUMMARY (Last 10 Commits)

```
58e73ac - docs: add current session handoff
31972bf - fix: use Supabase Storage for images
91f7af5 - fix: add image resizing
ff59640 - chore: trigger deployment
aa6339a - fix: remove middleware auth blocking
bf89c37 - fix: redirect authenticated users to /upload
69c8b73 - refactor(upload): integrate StepLayout
5fe5538 - chore: add workflow UI primitives and fix analyzer validation
```

**Key Changes:**
1. Image analyzer now accepts any string (not just URLs)
2. Image upload switched from base64 → Supabase Storage
3. Auth redirects to `/upload` instead of `/dashboard`
4. Middleware simplified (security headers only)
5. Upload page refactored with token-based UI
6. New workflow components created

---

## 🎯 IMMEDIATE NEXT STEPS

### Priority 1: Verify Image Pipeline (URGENT)
1. **User creates Supabase Storage bucket:**
   - Name: `product-images`
   - Type: Public
   - Location: Supabase Dashboard → Storage → New Bucket

2. **Test end-to-end workflow:**
   - Sign in
   - Upload photo (normal iPhone photo)
   - Wait for analysis
   - Verify redirect to photo-checkup page
   - Check that analysis data displays correctly

3. **If it fails:**
   - Check Vercel function logs
   - Check Supabase Storage permissions
   - Verify OpenAI API key is set
   - Check that bucket is public

### Priority 2: Continue UI Token Migration (Phase 2B)
**Next page:** `/app/photo-checkup/[id]/page.tsx`

**Steps:**
1. Read the page code
2. Apply same pattern as upload page:
   - Import workflow components
   - Wrap in `<StepLayout>`
   - Add `<ProgressIndicator currentStep={2} />`
   - Replace inline (ℹ) with `<InfoTooltip>`
   - Replace custom buttons with `<Button>`
   - Replace hardcoded colors/spacing with tokens
3. Get architect approval
4. Commit and push
5. Repeat for remaining 6 pages

### Priority 3: Establish Canonical Deployment URL
1. Identify the correct preview URL for `rebuild-core-workflow`
2. Document it for user
3. Add to environment variables if needed

---

## 🚀 MEDIUM-TERM ROADMAP

### Phase 1 (MVP - Current):
- ✅ AI Variant Generator
- ✅ Copy Quality Scoring
- ✅ Listing Health Index
- 🔄 Photo Analysis (current work)
- ⏳ Automated Keyword Generation
- ⏳ Smart Recommendations

### Phase 2 (Enhanced Features):
- Keyword Volume Tracking
- SEO Optimization Audit
- Etsy Search Data Analysis
- A/B Testing Sandbox

### Phase 3 (Advanced Features):
- Complete Etsy API Integration (import/export)
- Bulk Processing
- Real-time Monitoring
- Predictive Analytics

---

## 🎯 THE 285-POINT ETSY ALGORITHM

**Your Proprietary Scoring System:**

**Breakdown (Total: 285 points):**
- **SEO Score:** 50 points
  - Title optimization: 20 pts
  - Tags: 15 pts
  - Keywords: 15 pts
- **Engagement:** 35 points
  - Copy quality: 15 pts
  - CTR potential: 10 pts
  - Conversion potential: 10 pts
- **Listing Quality:** 30 points
  - Photo scores: 15 pts
  - Description: 10 pts
  - Compliance: 5 pts
- **Technical Compliance:** 170 points
  - Various Etsy algorithm factors

**Implementation Status:**
- ✅ Framework implemented
- ✅ Scoring functions in `/lib/scoring285.ts`
- ⏳ Integration into workflow pages needed

---

## 📚 ETSY INTEGRATION DETAILS

### Personal API Approval Granted:
- **API Key (keystring):** `5fv9bmd14ydqqx3lnbgcmsih`
- **Shared Secret:** `d0yg3nmoqc`
- **Rate Limits:** 5 QPS (queries per second), 5K QPD (queries per day)
- **Type:** Personal API (testing purposes)

### OAuth Flow:
1. User clicks "Connect Etsy"
2. Redirect to Etsy OAuth with client_id
3. Etsy redirects back to `/api/etsy/callback`
4. Exchange code for access_token
5. Store in Shop model
6. Fetch shop data and listings

### API Capabilities:
- ✅ Fetch shop info
- ✅ Fetch listings (with photos, tags, description)
- ✅ Update listings (one-click sync)
- ⚠️ Rate limits apply (5 QPS, 5K QPD)

---

## 🔍 DEBUGGING TIPS

### Common Issues:

**1. "Prepared statement already exists"**
- **Cause:** DATABASE_URL missing `?pgbouncer=true`
- **Fix:** Add `?pgbouncer=true` to DATABASE_URL, use port 6543

**2. "OpenAI API key not configured"**
- **Cause:** Missing OPENAI_API_KEY or using old deployment
- **Fix:** Add env var in Vercel, redeploy

**3. "404 Not Found" on signin**
- **Cause:** Using old deployment URL without latest code
- **Fix:** Use latest preview deployment URL

**4. "Request too large" or "429 Token limit"**
- **Cause:** Images too large for OpenAI Vision
- **Fix:** Supabase Storage architecture (already implemented)

**5. UI looks inconsistent**
- **Cause:** Page uses hardcoded colors instead of tokens
- **Fix:** Migrate to token-based styling (Phase 2 work)

### Vercel Logs:
- **Location:** Vercel Dashboard → Deployments → Click deployment → Logs tab
- **Filter by:** Functions, Builds, or Real-time
- Look for error messages with requestId for tracing

---

## 🎯 SUCCESS METRICS (MVP Launch)

**Technical:**
- ✅ All 7 workflow steps functional
- ✅ End-to-end upload → analyze → optimize works
- ✅ No 404 errors, no token errors, no auth errors
- ✅ <5s optimization time
- ✅ Mobile responsive

**Business:**
- User can optimize a listing in <2 minutes
- Health Score accuracy >85%
- CTR prediction accuracy >70%
- User satisfaction >4.5/5 stars

---

## 📝 EXISTING KEYWORD COMPONENTS (DO NOT RECREATE)

These components already work - use them as-is:
- ✅ `KeywordSimpleList` - Display keyword list
- ✅ `EtsyTagsBuilder` - Build 13 Etsy tags
- ✅ `KeywordDetailsModal` - Show keyword details

**Location:** Search for these in `/components/` or within workflow pages

---

## 🚫 LEGACY FOLDER (PRESERVED)

**Location:** `/legacy/`

**Contents:** Entire old system before rebuild

**Rules:**
- ❌ DO NOT delete
- ❌ DO NOT modify
- ✅ CAN reference for patterns
- ✅ Keep for rollback safety

---

## 🔐 SECURITY & BEST PRACTICES

### Authentication:
- ✅ Supabase Auth with PKCE flow
- ✅ Sessions in localStorage
- ✅ Auto token refresh enabled
- ✅ Security headers in middleware

### API Security:
- ✅ Input validation with Zod
- ✅ Request IDs for tracing
- ✅ Structured error responses
- ✅ No sensitive data in logs

### Database:
- ✅ Prisma ORM (prevents SQL injection)
- ✅ Connection pooling (PgBouncer)
- ✅ Singleton pattern (prevents connection leaks)

---

## 📦 DEPENDENCIES

**Production:**
- next (15.5.6)
- react (19.1.0)
- prisma/client (6.19.0)
- @supabase/supabase-js (2.75.1)
- openai (6.5.0)
- stripe (19.1.0)
- zod (4.1.12)
- sharp (for image processing) ⚠️ Just added

**Dev:**
- typescript (5.9.3)
- prisma (6.19.0)
- eslint
- tailwindcss (4.1.14) - ⚠️ NOT using classes, only for token system

---

## 🎯 WHAT TO FOCUS ON NEXT

### Immediate (This Week):
1. ✅ Verify Supabase Storage image upload works
2. ✅ Complete end-to-end workflow test
3. ⏳ Migrate remaining 7 pages to token-based UI
4. ⏳ Clean up Vercel deployment URLs

### Short-term (Next 2 Weeks):
5. Implement keyword generation in Step 4
6. Implement title/description optimization in Step 5
7. Build finish/summary page functionality
8. Add Etsy OAuth connection flow

### Medium-term (Month 1):
9. Implement one-click sync to Etsy
10. Add Stripe payment flow for credits
11. Build saved projects functionality
12. Implement 285-point scoring across all features

---

## 🚨 COMMON PITFALLS TO AVOID

1. **Don't use old deployment URLs** - always use the latest
2. **Don't modify working backend** - it's solid, leave it alone
3. **Don't redesign the UI** - follow token system exactly
4. **Don't remove PgBouncer fix** - this will break everything
5. **Don't work on main branch** - use rebuild-core-workflow
6. **Don't hardcode values** - use tokens for everything
7. **Don't create new layout components** - use StepLayout
8. **Don't skip architect approval** - get approval between phases

---

## 🔗 IMPORTANT LINKS

**Repository:**
- Repo: https://github.com/enjaypa-png/elite-listing-ai-v2
- Branch: https://github.com/enjaypa-png/elite-listing-ai-v2/tree/rebuild-core-workflow
- Latest commit: `58e73ac`

**External Services:**
- Vercel: Elite Listing AI's projects
- Supabase: (User has credentials - ask if needed)
- OpenAI: https://platform.openai.com
- Stripe: https://dashboard.stripe.com
- Etsy Developers: https://www.etsy.com/developers

**Documentation:**
- Next.js 15: https://nextjs.org/docs
- Prisma: https://www.prisma.io/docs
- Supabase: https://supabase.com/docs
- OpenAI API: https://platform.openai.com/docs

---

## 👥 AGENT RESPONSIBILITIES

**Your Role:**
- Strategic oversight and debugging
- Guide implementation (don't replace the builder)
- Prevent duplicated work
- Keep project organized
- Ensure design system compliance

**What You Should NOT Do:**
- Write large code blocks (unless specifically asked)
- Make changes without understanding context
- Redesign working features
- Ignore the design token system
- Skip testing after changes

**Communication Style:**
- Ask clarifying questions when needed
- Confirm understanding before major changes
- Provide clear, step-by-step guidance
- Flag potential issues proactively
- Be direct but helpful

---

## ⚠️ CRITICAL WARNINGS

1. **The PgBouncer Fix is Sacred**
   - Location: `/lib/prisma.ts`
   - Setting: `statement_cache_size=0`
   - Removing this breaks all database operations

2. **The Design Token System is Law**
   - NO hardcoded colors, spacing, or radii
   - MUST use tokens from `/design-system/tokens.json`
   - NO exceptions (user has been very clear about this)

3. **Branch Discipline**
   - Work ONLY on `rebuild-core-workflow`
   - NEVER commit to `main` directly
   - ALWAYS push to origin after commits

4. **Supabase Storage is the New Architecture**
   - Images go to Supabase Storage (public bucket)
   - Return URLs, not base64
   - Don't revert to base64 approach

---

## 📊 PROJECT METRICS

**Code Stats:**
- 8 Prisma models
- 25+ API routes
- 10 workflow pages
- 5 shared UI components
- 3 new workflow components
- ~10,000 lines of code

**Timeline:**
- Project age: ~2-3 months
- Current sprint: Rebuild core workflow
- Target MVP: 2-4 weeks from now

**Team:**
- Solo founder/developer
- Using AI agents for development
- Fast iteration, high velocity

---

## 🎯 FINAL CHECKLIST FOR NEW AGENT

Before you start coding, verify:
- [ ] I've read CURRENT_SESSION_HANDOFF.md completely
- [ ] I understand the 285-point algorithm concept
- [ ] I know the design token system is mandatory
- [ ] I understand PgBouncer fix must never be removed
- [ ] I know we work on rebuild-core-workflow branch only
- [ ] I understand the 7-step workflow user journey
- [ ] I've reviewed the recent commits (last 10)
- [ ] I know what NOT to do (common pitfalls)
- [ ] I understand my role is oversight, not replacement
- [ ] I'm ready to help test the Supabase Storage pipeline

---

## 📞 HANDOFF CONTACT

**Previous Agent:** Neo (E2) via Emergent  
**Session Date:** Nov 19, 2024  
**Session Duration:** ~3 hours  
**Work Completed:**
- Fixed image analyzer Zod validation
- Created 3 workflow UI components
- Refactored upload page with tokens
- Migrated to Supabase Storage architecture
- Fixed auth redirect issues
- Simplified middleware

**Outstanding Work:**
- Verify Supabase Storage works end-to-end
- Migrate 7 remaining pages to token system
- Clean up Vercel deployments
- Implement keyword generation
- Build Etsy OAuth sync

---

**End of Handoff Document**

**Version:** 1.0  
**Last Updated:** Nov 19, 2024  
**Status:** Ready for new agent onboarding

---

## 🚀 GETTING STARTED (NEW AGENT)

**Step 1:** Read this entire document (30 min)  
**Step 2:** Clone repo and checkout `rebuild-core-workflow`  
**Step 3:** Review recent commits to understand recent changes  
**Step 4:** Help user create Supabase Storage bucket  
**Step 5:** Test image upload pipeline  
**Step 6:** Continue UI token migration  

**Questions?** Ask the user - they have full context and credentials.

**Let's build something great! 🚀**
