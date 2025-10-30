# Elite Listing AI - Environment Variables Matrix

**Version:** 2.0  
**Last Updated:** January 2025

---

## Overview

This document lists ALL environment variables required for Elite Listing AI to function properly. These variables must be configured in:

1. **Local Development:** `.env.local` file (git-ignored)
2. **Vercel Preview:** Preview environment settings
3. **Vercel Production:** Production environment settings

**CRITICAL:** Never commit real secrets to Git. Always use environment variables.

---

## Required Environment Variables

### Database (Supabase PostgreSQL)

```bash
# Supabase PostgreSQL connection string
# Format: postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres
# Get from: Supabase Dashboard → Project Settings → Database → Connection String (Pooling)
DATABASE_URL="postgresql://postgres.xxxxx:password@aws-0-region.pooler.supabase.com:5432/postgres"

# Alternative: Direct connection (not recommended for production)
# DIRECT_URL="postgresql://postgres:[PASSWORD]@db.xxxxx.supabase.co:5432/postgres"
```

**Where to get:** Supabase Dashboard → Your Project → Settings → Database → Connection Strings

---

### Authentication (Supabase Auth)

```bash
# Supabase Project URL
# Format: https://[PROJECT_ID].supabase.co
# Get from: Supabase Dashboard → Project Settings → API
NEXT_PUBLIC_SUPABASE_URL="https://xxxxx.supabase.co"

# Supabase Anon/Public Key (safe for client-side)
# Get from: Supabase Dashboard → Project Settings → API → anon/public
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# Supabase Service Role Key (NEVER expose to client-side)
# Get from: Supabase Dashboard → Project Settings → API → service_role
# Used for: Admin operations, bypassing RLS
SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Where to get:** Supabase Dashboard → Your Project → Settings → API

---

### NextAuth (Session Management)

```bash
# NextAuth Secret (random string, min 32 characters)
# Generate: openssl rand -base64 32
# Used for: JWT signing, session encryption
NEXTAUTH_SECRET="your-super-secret-key-min-32-characters-long"

# NextAuth URL (your app's public URL)
# Local: http://localhost:3000
# Production: https://your-domain.com
NEXTAUTH_URL="https://elite-listing-ai.vercel.app"
```

**How to generate secret:**
```bash
openssl rand -base64 32
```

---

### AI Integration (OpenAI)

```bash
# OpenAI API Key
# Get from: https://platform.openai.com/api-keys
# Used for: GPT-4 text optimization, Vision image analysis
OPENAI_API_KEY="sk-proj-xxxxx"

# Optional: OpenAI Organization ID (if using org)
OPENAI_ORG_ID="org-xxxxx"
```

**Where to get:** https://platform.openai.com/api-keys

**Usage:**
- Text optimization: ~$0.03 per optimization (GPT-4)
- Image analysis: ~$0.01 per image (GPT-4 Vision)

---

### Payments (Stripe)

```bash
# Stripe Publishable Key (safe for client-side)
# Get from: Stripe Dashboard → Developers → API Keys
# Test mode: pk_test_xxxxx
# Live mode: pk_live_xxxxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_xxxxx"

# Stripe Secret Key (NEVER expose to client-side)
# Get from: Stripe Dashboard → Developers → API Keys
# Test mode: sk_test_xxxxx
# Live mode: sk_live_xxxxx
STRIPE_SECRET_KEY="sk_test_xxxxx"

# Stripe Webhook Secret (for webhook signature verification)
# Get from: Stripe Dashboard → Developers → Webhooks → Add endpoint
# Format: whsec_xxxxx
STRIPE_WEBHOOK_SECRET="whsec_xxxxx"
```

**Where to get:** Stripe Dashboard → Developers → API Keys

**Webhook Setup:**
1. Go to Stripe Dashboard → Developers → Webhooks
2. Click "Add endpoint"
3. URL: `https://your-domain.com/api/webhooks/stripe`
4. Events to listen: `checkout.session.completed`, `charge.refunded`
5. Copy the "Signing secret" (whsec_xxxxx)

---

### E-commerce Integration (Etsy OAuth)

```bash
# Etsy API Key (also called "Client ID")
# Get from: https://www.etsy.com/developers/your-apps
# Click your app → "Keystring"
ETSY_CLIENT_ID="xxxxx"

# Etsy Client Secret
# Get from: https://www.etsy.com/developers/your-apps
# Click your app → "Shared Secret"
ETSY_CLIENT_SECRET="xxxxx"

# Etsy OAuth Redirect URI (must match registered callback)
# Format: https://your-domain.com/api/etsy/callback
# Must be registered in Etsy app settings
ETSY_REDIRECT_URI="https://elite-listing-ai.vercel.app/api/etsy/callback"

# Etsy API Base URL (v3)
ETSY_API_BASE_URL="https://openapi.etsy.com/v3"
```

**Where to get:** https://www.etsy.com/developers/your-apps

**Setup Steps:**
1. Create app at https://www.etsy.com/developers/register
2. Note your "Keystring" (Client ID) and "Shared Secret" (Client Secret)
3. Add redirect URI: `https://your-domain.com/api/etsy/callback`
4. Request scopes: `listings_r`, `listings_w`, `shops_r`

---

### Email (Optional - for transactional emails)

```bash
# SMTP Configuration (e.g., SendGrid, Mailgun, AWS SES)
# If using SendGrid:
SMTP_HOST="smtp.sendgrid.net"
SMTP_PORT="587"
SMTP_USER="apikey"
SMTP_PASS="SG.xxxxx"
SMTP_FROM="noreply@elite-listing-ai.com"
```

**Note:** Supabase Auth can send emails using its built-in SMTP. Custom SMTP is optional.

---

### Analytics & Monitoring (Optional)

```bash
# Vercel Analytics (auto-enabled on Vercel, no key needed)
# Just import: import { Analytics } from '@vercel/analytics/react'

# PostHog (optional - user analytics)
NEXT_PUBLIC_POSTHOG_KEY="phc_xxxxx"
NEXT_PUBLIC_POSTHOG_HOST="https://app.posthog.com"

# Sentry (optional - error tracking)
NEXT_PUBLIC_SENTRY_DSN="https://xxxxx@xxxxx.ingest.sentry.io/xxxxx"
SENTRY_AUTH_TOKEN="xxxxx"
```

---

## Environment-Specific Settings

### Local Development (.env.local)

```bash
# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/elite_listing_ai_dev"

# Supabase (dev project)
NEXT_PUBLIC_SUPABASE_URL="https://xxxxx-dev.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJ..."
SUPABASE_SERVICE_ROLE_KEY="eyJ..."

# NextAuth
NEXTAUTH_SECRET="dev-secret-min-32-chars-long-xxxxx"
NEXTAUTH_URL="http://localhost:3000"

# OpenAI (use test key or limit usage)
OPENAI_API_KEY="sk-proj-xxxxx"

# Stripe (test mode)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_xxxxx"
STRIPE_SECRET_KEY="sk_test_xxxxx"
STRIPE_WEBHOOK_SECRET="whsec_xxxxx"

# Etsy (test credentials)
ETSY_CLIENT_ID="xxxxx"
ETSY_CLIENT_SECRET="xxxxx"
ETSY_REDIRECT_URI="http://localhost:3000/api/etsy/callback"
ETSY_API_BASE_URL="https://openapi.etsy.com/v3"
```

---

### Vercel Preview

```bash
# Same as local, but with preview URLs
NEXTAUTH_URL="https://elite-listing-ai-git-feature-user.vercel.app"
ETSY_REDIRECT_URI="https://elite-listing-ai-git-feature-user.vercel.app/api/etsy/callback"

# Use separate Supabase project or schema
```

---

### Vercel Production

```bash
# Database (production Supabase)
DATABASE_URL="postgresql://postgres.xxxxx:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:5432/postgres"

# Supabase (production project)
NEXT_PUBLIC_SUPABASE_URL="https://xxxxx-prod.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJ..."
SUPABASE_SERVICE_ROLE_KEY="eyJ..."

# NextAuth (strong secret)
NEXTAUTH_SECRET="[STRONG-RANDOM-SECRET-64-CHARS]"
NEXTAUTH_URL="https://elite-listing-ai.com"

# OpenAI (production key with rate limits)
OPENAI_API_KEY="sk-proj-xxxxx"

# Stripe (LIVE mode)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_live_xxxxx"
STRIPE_SECRET_KEY="sk_live_xxxxx"
STRIPE_WEBHOOK_SECRET="whsec_xxxxx"

# Etsy (production app)
ETSY_CLIENT_ID="xxxxx"
ETSY_CLIENT_SECRET="xxxxx"
ETSY_REDIRECT_URI="https://elite-listing-ai.com/api/etsy/callback"
ETSY_API_BASE_URL="https://openapi.etsy.com/v3"

# Monitoring (enable in production)
NEXT_PUBLIC_POSTHOG_KEY="phc_xxxxx"
NEXT_PUBLIC_SENTRY_DSN="https://xxxxx@xxxxx.ingest.sentry.io/xxxxx"
```

---

## Configuration Checklist

### Before First Run (Local)

- [ ] Create Supabase project (free tier)
- [ ] Get DATABASE_URL from Supabase
- [ ] Get SUPABASE_URL and ANON_KEY
- [ ] Generate NEXTAUTH_SECRET (`openssl rand -base64 32`)
- [ ] Create OpenAI account and get API key
- [ ] Create Stripe account (test mode) and get keys
- [ ] Create Etsy developer app and get credentials
- [ ] Copy `.env.example` to `.env.local`
- [ ] Fill in all variables
- [ ] Run `npx prisma generate`
- [ ] Run `npx prisma db push`
- [ ] Run `npm run dev`

### Before Production Deploy (Vercel)

- [ ] Create production Supabase project
- [ ] Set up RLS policies (see POLICIES.md)
- [ ] Generate strong NEXTAUTH_SECRET
- [ ] Set OpenAI usage limits
- [ ] Switch Stripe to live mode
- [ ] Register production Etsy redirect URI
- [ ] Configure all env vars in Vercel Dashboard
- [ ] Set up Stripe webhook endpoint
- [ ] Enable Sentry error tracking
- [ ] Test all integrations in preview deployment

---

## Security Best Practices

### DO ✅

- Store secrets in environment variables
- Use different credentials for dev/prod
- Rotate secrets regularly (every 90 days)
- Use Vercel's encrypted environment variables
- Test with test/sandbox modes first
- Limit API key permissions to minimum required
- Set up billing alerts on paid services

### DON'T ❌

- Never commit secrets to Git
- Never expose service role keys to client-side
- Never use production keys in development
- Never share API keys in screenshots/docs
- Never use weak NEXTAUTH_SECRET
- Never skip webhook signature verification
- Never log secrets in application code

---

## Troubleshooting

### "Invalid API Key" Error

**Problem:** API returns 401 Unauthorized

**Solutions:**
1. Check if key is correctly set in environment
2. Verify no extra spaces/quotes in .env file
3. Restart dev server after changing .env
4. Check if key has required permissions
5. Verify key hasn't expired or been rotated

### "Database Connection Failed"

**Problem:** Cannot connect to PostgreSQL

**Solutions:**
1. Check DATABASE_URL format
2. Verify Supabase project is active
3. Check IP allowlist in Supabase (should be 0.0.0.0/0 for Vercel)
4. Test connection: `npx prisma db pull`
5. Check if using pooling connection string

### "Webhook Signature Verification Failed"

**Problem:** Stripe webhook returns 400

**Solutions:**
1. Verify STRIPE_WEBHOOK_SECRET matches Stripe dashboard
2. Check webhook endpoint URL is correct
3. Ensure using raw body (not parsed JSON)
4. Test with Stripe CLI: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`

### "OAuth Redirect Mismatch"

**Problem:** Etsy returns redirect_uri error

**Solutions:**
1. Check ETSY_REDIRECT_URI matches exactly (including https/http)
2. Verify URI is registered in Etsy app settings
3. No trailing slashes in URL
4. Must use public HTTPS URL (not localhost) for production

---

## Quick Copy Template

Create `.env.local` with this template:

```bash
# === DATABASE ===
DATABASE_URL="postgresql://..."

# === SUPABASE ===
NEXT_PUBLIC_SUPABASE_URL="https://xxxxx.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJ..."
SUPABASE_SERVICE_ROLE_KEY="eyJ..."

# === NEXTAUTH ===
NEXTAUTH_SECRET="[GENERATE WITH: openssl rand -base64 32]"
NEXTAUTH_URL="http://localhost:3000"

# === OPENAI ===
OPENAI_API_KEY="sk-proj-xxxxx"

# === STRIPE ===
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_xxxxx"
STRIPE_SECRET_KEY="sk_test_xxxxx"
STRIPE_WEBHOOK_SECRET="whsec_xxxxx"

# === ETSY ===
ETSY_CLIENT_ID="xxxxx"
ETSY_CLIENT_SECRET="xxxxx"
ETSY_REDIRECT_URI="http://localhost:3000/api/etsy/callback"
ETSY_API_BASE_URL="https://openapi.etsy.com/v3"

# === OPTIONAL ===
# NEXT_PUBLIC_POSTHOG_KEY="phc_xxxxx"
# NEXT_PUBLIC_SENTRY_DSN="https://xxxxx"
```

---

**Last Updated:** January 2025  
**Questions?** See SUPPORT.md
