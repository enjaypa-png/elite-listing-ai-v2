# Deployment Guide - Rebuild Core Workflow Branch

## ✅ APIs Wired - Ready for Testing

All pages now use real API routes instead of mock data.

---

## 🔌 API Connections Made

| Page | API Route | Status |
|------|-----------|--------|
| Upload | `/api/optimize/image/analyze` | ✅ Wired |
| Photo Checkup | Uses cached analysis from upload | ✅ Wired |
| Keywords | `/api/keywords/generate` | ✅ Wired |
| Title/Description | `/api/optimize` | ✅ Wired |
| Finish - Save | `/api/optimizations` (POST) | ✅ Wired |
| Saved Projects | `/api/optimizations` (GET) | ✅ Wired |
| Etsy Connect | `/api/etsy/connect` | ✅ Already wired |

---

## 💾 State Management Added

**Created:** `/app/lib/optimizationState.ts`

**Features:**
- SessionStorage-based persistence
- Survives page refreshes during workflow
- Clean API for get/set/update
- Type-safe with TypeScript interface

**Usage Flow:**
```
Upload → Creates state with photo
Photo Checkup → Reads photo analysis
Keywords → Saves selected keywords
Title/Desc → Saves selections
Finish → Reads all selections, saves to database
```

---

## 🚀 How to Deploy to Vercel

### Option 1: Deploy Specific Branch (Recommended for Testing)

**Via Vercel Dashboard:**
1. Go to your Vercel project
2. Settings → Git → Production Branch
3. Temporarily change to: `rebuild-core-workflow`
4. Trigger new deployment
5. Or go to Deployments → click rebuild-core-workflow → Deploy

**Via CLI:**
```bash
# If you have Vercel CLI installed
vercel --prod --branch rebuild-core-workflow
```

---

### Option 2: Create Preview Deployment

**Vercel will automatically create a preview deployment for the branch:**
- URL format: `https://elite-listing-ai-v2-[hash]-[team].vercel.app`
- Check Deployments tab in Vercel dashboard
- Look for `rebuild-core-workflow` branch deployment

---

### Option 3: Merge to Main (After Testing)

**Once you approve:**
```bash
git checkout main
git merge rebuild-core-workflow
git push origin main
```
Vercel will auto-deploy the main branch.

---

## ✅ Pre-Deployment Checklist

**Environment Variables (Required in Vercel):**
- [ ] `DATABASE_URL` - Supabase pooler URL with pgbouncer=true&statement_cache_size=0
- [ ] `DIRECT_URL` - Supabase direct URL for migrations
- [ ] `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anon key
- [ ] `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key
- [ ] `OPENAI_API_KEY` - OpenAI API key (for keywords, title, description)
- [ ] `NEXTAUTH_SECRET` - Auth secret
- [ ] `NEXTAUTH_URL` - Production URL
- [ ] `STRIPE_SECRET_KEY` - Stripe secret key
- [ ] `STRIPE_WEBHOOK_SECRET` - Stripe webhook secret
- [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Stripe public key

**Build Command:**
```
prisma generate && next build --turbopack
```

**Install Command:**
```
npm install
```

---

## 🧪 Testing Plan

### Test Flow End-to-End:

**Step 1: Homepage**
- [ ] Click "Optimize a Listing" → redirects to /upload
- [ ] Click "My Past Optimizations" → redirects to /saved-projects
- [ ] Info bubble shows tooltip on hover

**Step 2: Upload**
- [ ] Upload photo → preview shows
- [ ] Click "Analyze My Photo" → calls /api/optimize/image/analyze
- [ ] Redirects to /photo-checkup/[id]

**Step 3: Photo Checkup**
- [ ] Photo displays from analysis
- [ ] Score shows (Good/OK/Needs Work)
- [ ] Tips list displays
- [ ] Click "Improve My Photo" → redirects to /photo-improve/[id]
- [ ] Click "Skip to Keywords" → redirects to /keywords/[id]

**Step 4: Photo Improvement**
- [ ] Before/after photos display
- [ ] Radio buttons select version
- [ ] Selection saves to state
- [ ] Click "Continue" → redirects to /keywords/[id]

**Step 5: Keywords**
- [ ] API generates keywords (calls /api/keywords/generate)
- [ ] Keywords display in simple list
- [ ] Checkboxes select keywords
- [ ] Tags appear in sidebar
- [ ] Character counter updates
- [ ] Click "Copy All Tags" → copies to clipboard
- [ ] Click "Details" → modal opens with metrics
- [ ] Click "Continue" → redirects to /title-description/[id]

**Step 6: Title & Description**
- [ ] API generates content (calls /api/optimize)
- [ ] Side-by-side comparison shows
- [ ] Radio buttons select versions
- [ ] Click "Apply All Suggestions" → selects both
- [ ] Click "Continue" → redirects to /finish/[id]

**Step 7: Finish**
- [ ] Summary displays all selections
- [ ] Click "Download Text" → .txt file downloads
- [ ] Click "Copy All" → copies to clipboard
- [ ] Click "Save to Account" → saves to database (calls /api/optimizations POST)
- [ ] Toast shows success
- [ ] Click "Optimize Another" → redirects to /upload

**Step 8: Saved Projects**
- [ ] Loads from database (calls /api/optimizations GET)
- [ ] Project cards display
- [ ] Click card → redirects to /finish/[id]

---

## 📱 Mobile Testing

**Test on:**
- iPhone 14 Pro (393 x 852)
- Samsung Galaxy S22 (360 x 800)
- iPad (768 x 1024)

**Check:**
- [ ] All grids stack vertically
- [ ] Tags builder becomes bottom sheet on keywords page
- [ ] All buttons easily tappable (44px+)
- [ ] No horizontal scrolling
- [ ] Text readable without zoom
- [ ] Info bubbles work on touch (tap to show)

---

## 🐛 Known Issues to Monitor

**Potential Issues:**
1. **Image Upload Size:** Check if /api/optimize/image/analyze handles large files
2. **Session Storage:** Clears on browser close (expected behavior)
3. **OpenAI Rate Limits:** May hit limits during testing
4. **Missing User Session:** Some APIs require auth (need to test logged in)

**Workarounds if needed:**
- Add file size validation (max 10MB)
- Add error handling for API failures
- Add loading states everywhere
- Add auth checks on protected pages

---

## 📊 Current Branch Status

**Branch:** `rebuild-core-workflow`
**Latest Commit:** `6d63a3c`
**Status:** ✅ Ready to deploy

**Files Changed:**
- Added: `/lib/optimizationState.ts` (state management)
- Modified: All workflow pages (wired to APIs)
- Total commits: 10+

---

## 🔗 Deployment URLs

**After deploying, you'll get:**

**Preview URL (branch deployment):**
`https://elite-listing-ai-v2-git-rebuild-core-workflow-[team].vercel.app`

**Or Production URL (if merged to main):**
`https://elite-listing-ai-v2.vercel.app`

---

## ⚡ Quick Deploy Steps

1. **Go to Vercel Dashboard**
2. **Find your project:** elite-listing-ai-v2
3. **Go to:** Deployments tab
4. **Find:** rebuild-core-workflow branch
5. **Click:** "Deploy" or wait for auto-deploy
6. **Get URL:** Click deployment → Visit
7. **Test:** Walk through workflow
8. **Report:** Any issues found

---

## 📝 What to Test

**Critical Path:**
1. Upload photo → Does it analyze?
2. Keywords generate → Do they appear?
3. Title/description generate → Do they show?
4. Save to account → Does it save?
5. View saved projects → Does it load?

**User Experience:**
1. Is the flow clear?
2. Are info bubbles helpful?
3. Does mobile work well?
4. Any confusing parts?
5. Any bugs or errors?

---

## 🎯 After Testing

**If everything works:**
- ✅ Approve merge to main
- ✅ Start Phase 2 development

**If issues found:**
- 🐛 Report bugs
- 🔧 I'll fix them
- 🧪 Redeploy and test again

---

**Status:** ✅ Ready for Deployment & Testing
**Branch:** rebuild-core-workflow
**APIs:** All wired
**State:** Managed
**Docs:** Complete

**Next:** Deploy to Vercel and test!