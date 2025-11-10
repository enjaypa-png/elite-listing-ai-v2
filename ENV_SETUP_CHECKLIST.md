# Environment Variables - Vercel Setup Checklist

## ✅ Required for Keyword Generator & SEO Auditor

### OPENAI_API_KEY (CRITICAL)
**Status:** ⬜ Not Verified

**What it does:**
- Powers `/api/keywords/generate`
- Powers `/api/seo/audit`
- Powers `/api/optimize` (text optimization)

**Where to get it:**
1. Go to https://platform.openai.com/api-keys
2. Click "Create new secret key"
3. Copy the key (starts with `sk-proj-`)

**Add to Vercel:**
1. Vercel Dashboard → Your Project → Settings → Environment Variables
2. Click "Add New"
3. Name: `OPENAI_API_KEY`
4. Value: `sk-proj-xxxxxxxxxxxxx`
5. Apply to: ✅ Production ✅ Preview ✅ Development
6. Click "Save"

---

## ✅ Required for Database Operations

### DATABASE_URL (CRITICAL)
**Status:** ⬜ Not Verified

**MUST include:** `?pgbouncer=true` parameter

**Correct format (Supabase):**
```
postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true
```

**Key points:**
- Port **6543** (pooler, not 5432)
- Ends with `?pgbouncer=true`
- This fixes the "prepared statement already exists" error

### DIRECT_URL (REQUIRED for migrations)
**Status:** ⬜ Not Verified

**Format:**
```
postgresql://postgres.[ref]:[password]@db.[ref].supabase.co:5432/postgres
```

**Key points:**
- Port **5432** (direct connection)
- No `?pgbouncer=true` parameter
- Only used for migrations

---

## ✅ Required for Authentication

### SUPABASE_URL
```
https://xxxxx.supabase.co
```

### SUPABASE_ANON_KEY
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### NEXTAUTH_SECRET
**Generate with:**
```bash
openssl rand -base64 32
```

### NEXTAUTH_URL
**Development:**
```
http://localhost:3000
```

**Production:**
```
https://your-app.vercel.app
```

---

## ✅ Required for Payments (Stripe)

### STRIPE_SECRET_KEY
```
sk_test_xxxxx  (test mode)
sk_live_xxxxx  (production)
```

### STRIPE_WEBHOOK_SECRET
```
whsec_xxxxx
```

### NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
```
pk_test_xxxxx  (test mode)
pk_live_xxxxx  (production)
```

---

## ✅ Optional (Etsy Integration - Pending Approval)

### ETSY_CLIENT_ID
**Status:** ⚠️ Optional (using mock data until approved)

### ETSY_CLIENT_SECRET
**Status:** ⚠️ Optional (using mock data until approved)

---

## 🔍 Quick Verification Commands

### Check All Health Endpoints

**1. Keyword Generator:**
```bash
curl https://your-app.vercel.app/api/keywords/generate
```
**Expected:** `"hasApiKey": true`

**2. SEO Auditor:**
```bash
curl https://your-app.vercel.app/api/seo/audit
```
**Expected:** `"hasApiKey": true`

**3. Optimizer:**
```bash
curl https://your-app.vercel.app/api/optimize
```
**Expected:** `"hasApiKey": true`

**4. Batch Photo Analysis:**
```bash
curl https://your-app.vercel.app/api/optimize/images/batch-analyze
```
**Expected:** `"hasApiKey": true`

---

## 🚨 Common Issues & Fixes

### Issue: "keyword generation failed"
**Cause:** Missing `OPENAI_API_KEY`

**Fix:**
1. Add `OPENAI_API_KEY` in Vercel
2. Redeploy (automatic)
3. Test health endpoint

---

### Issue: "prepared statement already exists"
**Cause:** `DATABASE_URL` missing `?pgbouncer=true`

**Fix:**
1. Edit `DATABASE_URL` in Vercel
2. Add `?pgbouncer=true` at the end
3. Use port **6543** (pooler) not 5432
4. Redeploy

**Correct:**
```
postgresql://user:pass@pooler.supabase.com:6543/db?pgbouncer=true
```

**Wrong:**
```
postgresql://user:pass@db.supabase.co:5432/db
```

---

### Issue: Login works first time, fails second time
**Cause:** Warm serverless functions reusing Prisma Client

**Fix:**
1. Ensure `DATABASE_URL` has `?pgbouncer=true`
2. Ensure using connection pooler (port 6543)
3. Verify `lib/prisma.ts` uses singleton pattern ✅ (already fixed)

---

## 📝 Environment Variable Setup Order

**Priority 1 (Critical - App Won't Work):**
1. ✅ `DATABASE_URL` (with `?pgbouncer=true`)
2. ✅ `DIRECT_URL`
3. ✅ `OPENAI_API_KEY`
4. ✅ `NEXTAUTH_SECRET`
5. ✅ `NEXTAUTH_URL`

**Priority 2 (Required for Full Features):**
6. ✅ `SUPABASE_URL`
7. ✅ `SUPABASE_ANON_KEY`
8. ✅ `STRIPE_SECRET_KEY`
9. ✅ `STRIPE_WEBHOOK_SECRET`
10. ✅ `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`

**Priority 3 (Optional - Future):**
11. ⚠️ `ETSY_CLIENT_ID` (when API approved)
12. ⚠️ `ETSY_CLIENT_SECRET` (when API approved)

---

## 🎯 Action Items for You

- [ ] Open Vercel Dashboard → Your Project → Settings → Environment Variables
- [ ] Verify `OPENAI_API_KEY` is set (starts with `sk-proj-`)
- [ ] Verify `DATABASE_URL` ends with `?pgbouncer=true`
- [ ] Verify `DATABASE_URL` uses port 6543 (not 5432)
- [ ] Test health endpoints (should return `"hasApiKey": true`)
- [ ] Try keyword generation again
- [ ] Check Vercel function logs if still failing

---

## 📊 What's Working Now

**Deployed to GitHub:**
- ✅ Optimization Studio UI (`/optimize/[listingId]`)
- ✅ 285-point Keyword Generator
- ✅ 285-point SEO Auditor
- ✅ Prisma singleton fix
- ✅ Comprehensive error handling
- ✅ Health check endpoints
- ✅ Diagnostic documentation

**Waiting for:**
- ⏳ Vercel deployment to complete (~2 min)
- ⏳ You to verify `OPENAI_API_KEY` is set in Vercel
- ⏳ Test to confirm errors are resolved

Let me know the results of the health check endpoints and I can help further! 🚀