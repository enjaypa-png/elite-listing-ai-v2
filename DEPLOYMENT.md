# Elite Listing AI - Optimize v1.0 Deployment Guide

## 🚀 Deployment Summary

**Commit:** `cf97a9e` - "feat: Add debug grant credits endpoint for testing"  
**Status:** ✅ Backend tested and ready for deployment  
**Date:** January 2025

---

## ✅ Implementation Complete

### Core Features
1. **Optimize API v1.0** - Full GPT-4o integration with credit system
2. **Credit System** - Double-entry ledger with transaction safety
3. **Optimization History** - Cursor-based pagination API + Dashboard UI
4. **Health Monitoring** - Environment validation with USE_REAL_STRIPE support
5. **Debug Tools** - Grant credits endpoint (dev-only, REMOVE before prod)

### Infrastructure Fixes
- Prisma binary targets for Vercel (native, debian, rhel)
- Runtime exports (`nodejs`) on all Prisma-using routes
- Idempotent webhook processing
- Structured JSON logging

---

## 📋 Pre-Deployment Checklist

### 1. Environment Variables (Vercel Dashboard)

**Required:**
```bash
OPENAI_API_KEY=sk-your-actual-openai-key
DATABASE_URL=postgresql://user:password@host:5432/database
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

**Optional (for development):**
```bash
USE_REAL_STRIPE=false
USE_MOCK_ETSY=true
DEBUG_GRANT_CREDITS_KEY=your-debug-key  # REMOVE IN PRODUCTION
```

**Stripe (when ready for payments):**
```bash
USE_REAL_STRIPE=true
STRIPE_SECRET_KEY=sk_test_your_stripe_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key
```

### 2. Database Migrations

Run Prisma migrations on your production database:

```bash
cd /app/elite-listing-ai-v2
npx prisma migrate deploy
```

**Expected migrations:**
- ✅ `001_credit_ledgers.sql` - Credit system
- ✅ `002_webhook_events.sql` - Webhook idempotency

Verify tables created:
- `users`
- `shops`
- `listings`
- `optimizations`
- `optimization_variants`
- `photo_scores`
- `credit_ledgers`
- `webhook_events`

### 3. Prisma Client Generation

Ensure Prisma client is generated with correct binary targets:

```bash
npx prisma generate
```

---

## 🧪 Backend Testing Results

### Test Summary (Automated)
✅ **Health API** - Returns 200, shows environment status, no Prisma errors  
✅ **Debug Grant Credits** - Creates test user, ledger entries with idempotency  
✅ **OpenAI Client** - API key detected, ready for use  
✅ **Optimize API** - Proper auth validation, code structure verified  
✅ **Optimizations History** - Auth validation, pagination ready  
✅ **Etsy Integration** - Mock mode operational  

### Known Limitations
- Full E2E optimize flow requires authentication (frontend integration needed)
- Stripe testing requires real keys and webhook setup
- Idempotency uses timestamp-based keys (consider UUIDs for production)

---

## 🔧 Post-Deployment Verification

### 1. Health Check
```bash
curl https://your-app.vercel.app/api/health
```

**Expected:**
- `success: true`
- `environment` object with all services
- Warnings array (may show Stripe mock mode if USE_REAL_STRIPE=false)
- No Prisma errors

### 2. Verify Prisma (via health endpoint)
Check health endpoint response for any Prisma connection errors.

### 3. Test Debug Endpoint (Dev Only)
```bash
curl -X POST https://your-app.vercel.app/api/debug/grant-credits \
  -H "Content-Type: application/json" \
  -d '{"amount":10,"key":"your-debug-key"}'
```

**Expected:**
- `ok: true`
- `newBalance: 10`
- Creates test user and ledger entry

### 4. Frontend Load Test
- Visit `/dashboard` - Should load without Prisma errors
- Check "System Health & Actions" panel - Should show green/⚠️ only
- Verify "Recent Optimizations" section renders (empty state OK)

---

## 🚨 Production Readiness

**Before going live:**

1. **Remove Debug Endpoint:**
   ```bash
   rm app/api/debug/grant-credits/route.ts
   ```
   
2. **Remove DEBUG_GRANT_CREDITS_KEY** from Vercel environment variables

3. **Enable Real Stripe:**
   - Set `USE_REAL_STRIPE=true`
   - Add Stripe webhook endpoint to Stripe dashboard
   - Test webhook with Stripe CLI

4. **Apply RLS Policies** (Supabase):
   - Run `/supabase/rls_policies.sql`
   - Verify user data isolation

5. **Enable Real Etsy API** (when ready):
   - Set `USE_MOCK_ETSY=false`
   - Add `ETSY_API_KEY` and `ETSY_REDIRECT_URI`

---

## 📊 Monitoring & Logs

### Structured Logging Format
All API routes log in JSON format with `requestId`:

```json
{
  "level": "info",
  "message": "Optimization complete",
  "requestId": "uuid",
  "userId": "user_id",
  "creditsDeducted": 1,
  "timestamp": "2025-01-04T..."
}
```

### Key Log Patterns
- `[requestId] Starting optimization request...`
- `[requestId] User authenticated: ...`
- `[requestId] Credit check passed: balance=X`
- `[requestId] Calling OpenAI GPT-4o...`
- `[requestId] Optimization complete: 1 credit deducted, new balance=X`

### Vercel Logs
Access via Vercel Dashboard → Deployment → Functions → Logs

---

## 🔒 Security Notes

1. **Authentication:**
   - All protected endpoints require Supabase session
   - Returns 401/500 if auth fails

2. **Credit System:**
   - Server-side validation only
   - Double-entry ledger (immutable audit trail)
   - Deduction happens ONLY after successful OpenAI response

3. **API Keys:**
   - Never exposed to client
   - Validated on every request
   - Logged securely (no key values in logs)

4. **Rate Limiting:**
   - Consider adding rate limits via middleware (TODO)
   - Vercel provides DDoS protection by default

---

## 📞 Support

**Issues:**
- Check Vercel deployment logs
- Review Prisma connection errors
- Verify environment variables set correctly

**Debug Mode:**
- Use `/api/health` to verify configuration
- Use debug grant credits endpoint (dev only) to test credit system

---

**Last Updated:** January 4, 2025  
**Version:** 1.0.0  
**Deployment Status:** Ready for Vercel deployment
