# Dev Parity Mode - Local Development Setup

## 🎯 Goal
Match your local development environment exactly to production (Vercel) with one-click commands.

---

## 🚀 Quick Start (One-Click Setup)

### Prerequisites
- Node.js 18+ installed
- Access to Vercel project
- Vercel CLI installed globally

### Step 1: Install Vercel CLI (if not installed)
```bash
npm install -g vercel
```

### Step 2: Login to Vercel
```bash
vercel login
```

### Step 3: Link Project (first time only)
```bash
cd /path/to/elite-listing-ai-v2
vercel link
```
Select your team and project when prompted.

### Step 4: Sync Environment Variables
```bash
npm run sync-env
```

This pulls all environment variables from Vercel and creates `.env.local`.

**Output:**
```
✓ Vercel CLI found
✓ Logged in as: your@email.com
📥 Pulling environment variables from Vercel...
✓ Environment variables synced to .env.local

📋 Environment variables in .env.local:
  ✓ DATABASE_URL
  ✓ NEXT_PUBLIC_SUPABASE_URL
  ✓ STRIPE_SECRET_KEY
  ✓ STRIPE_WEBHOOK_SECRET
  ✓ OPENAI_API_KEY
  ... (and more)

✓ Dev Parity Mode Ready
```

### Step 5: Start Development Server
```bash
npm run dev
```

### Step 6: Create Test User
In a new terminal:
```bash
npm run seed-user
```

**Response:**
```json
{
  "success": true,
  "message": "Test user created successfully",
  "user": {
    "id": "uuid-here",
    "email": "test@elitelistingai.dev",
    "name": "Test User",
    "credits": 50
  },
  "credentials": {
    "email": "test@elitelistingai.dev",
    "password": "test123",
    "note": "Save these credentials for testing"
  }
}
```

### Step 7: Verify Setup
```bash
npm run health
```

Expected: 8/8 tests pass ✅

---

## 📊 Dev Parity Features

### Environment Display in HealthPanel

Navigate to: `http://localhost:3000/dashboard`

The Health Panel shows:
- **Environment Badge:** "DEV MODE" in yellow (development) or "PRODUCTION" in green
- **Current ENV:** development/production
- **App URL:** Your NEXT_PUBLIC_APP_URL
- **Stripe Status:** Test mode or Live mode
- **Etsy Mode:** Mock or Real API
- **All ENV Variables:** Status of each integration

### Test User Endpoint

**Create Test User:**
```bash
POST http://localhost:3000/api/dev/seed-user

# With custom credentials
curl -X POST http://localhost:3000/api/dev/seed-user \
  -H "Content-Type: application/json" \
  -d '{
    "email": "mytest@example.com",
    "name": "My Test User",
    "password": "mypassword"
  }'
```

**Check if Test User Exists:**
```bash
GET http://localhost:3000/api/dev/seed-user

# Returns existing user info and credentials
```

**Features:**
- Only works in development (blocked in production)
- Creates user with 50 initial credits
- Idempotent (won't create duplicates)
- Returns credentials for immediate testing

### Environment Sync

**Manual Sync:**
```bash
npm run sync-env
```

**What it does:**
1. Authenticates with Vercel
2. Pulls all development environment variables
3. Creates/updates `.env.local`
4. Shows which variables were synced
5. Reminds you to restart dev server

**Safety:**
- `.env.local` is in `.gitignore` (never committed)
- Only pulls development environment
- Shows variable names, not values
- Preserves existing local overrides

---

## 🔧 Environment Variables Reference

### Critical Variables (Required)

```bash
# Database
DATABASE_URL=postgresql://user:pass@host:5432/db
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Stripe (Test Mode for Dev)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# OpenAI
OPENAI_API_KEY=sk-proj-...

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development

# Etsy (Mock Mode)
USE_MOCK_ETSY=true
```

### Optional Variables

```bash
# Sentry (Error Tracking)
SENTRY_DSN=https://...

# Analytics
NEXT_PUBLIC_GA_ID=G-...

# Feature Flags
ENABLE_BETA_FEATURES=true
```

---

## 🧪 Testing Workflows

### 1. Test Credit Purchase Flow

```bash
# Start dev server
npm run dev

# In another terminal, start Stripe webhook listener
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Open browser
open http://localhost:3000/dashboard

# Actions:
# 1. Sign in with test@elitelistingai.dev / test123
# 2. Click "Buy Starter" (10 credits)
# 3. Use test card: 4242 4242 4242 4242
# 4. Verify webhook: POST /api/webhooks/stripe [200]
# 5. Check balance: 50 → 60 credits
```

### 2. Test Optimize Demo

```bash
# In dashboard, click "Optimize Demo"
# Verify:
# - Success toast appears
# - Balance: 60 → 59 credits
# - Transaction table shows USAGE -1
```

### 3. Test Etsy Integration

```bash
# Navigate to /etsy
# Click "Connect Etsy Shop"
# Verify:
# - Mock shop appears (MockArtisanShop)
# - 25 listings displayed
# - "Optimize This" buttons functional
```

---

## 🔄 Keeping Dev Parity

### When to Re-Sync

**Always sync after:**
- New environment variables added to Vercel
- Stripe keys rotated
- Database credentials changed
- API keys updated

**Command:**
```bash
npm run sync-env && npm run dev
```

### Environment Drift Check

Compare your local env with Vercel:
```bash
# List local variables
grep -v '^#' .env.local | grep -v '^$' | cut -d= -f1 | sort

# Check Vercel dashboard
vercel env ls
```

---

## 🐛 Troubleshooting

### "Test user already exists"
```bash
# Check existing user
curl http://localhost:3000/api/dev/seed-user

# To reset, delete from database or use different email
```

### "Module not found" errors
```bash
# Reinstall dependencies
rm -rf node_modules
npm install

# Regenerate Prisma Client
npx prisma generate
```

### Webhook not receiving events
```bash
# Ensure Stripe CLI is forwarding correctly
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Check webhook secret matches .env.local
echo $STRIPE_WEBHOOK_SECRET
```

### ENV variables not loading
```bash
# Restart dev server after sync
npm run dev

# Verify .env.local exists
ls -la .env.local

# Check variable is set
node -e "console.log(process.env.NEXT_PUBLIC_APP_URL)"
```

---

## 📝 Scripts Reference

| Command | Description | When to Use |
|---------|-------------|-------------|
| `npm run dev` | Start dev server | Always |
| `npm run sync-env` | Pull env from Vercel | First time, after env changes |
| `npm run seed-user` | Create test user | First time, after DB reset |
| `npm run health` | Check all endpoints | After changes, before PR |
| `npm run build` | Test production build | Before deploy |

---

## 🎬 Video Tutorial

**Setup from Scratch (5 minutes):**
1. Clone repo (0:00-0:30)
2. Install dependencies (0:30-1:00)
3. Login to Vercel (1:00-1:30)
4. Link project (1:30-2:00)
5. Sync environment (2:00-2:30)
6. Start dev server (2:30-3:00)
7. Seed test user (3:00-3:30)
8. Test purchase flow (3:30-5:00)

---

## ✅ Dev Parity Checklist

Before starting development:
- [ ] Vercel CLI installed (`vercel --version`)
- [ ] Logged into Vercel (`vercel whoami`)
- [ ] Project linked (`vercel link`)
- [ ] Environment synced (`npm run sync-env`)
- [ ] Dev server running (`npm run dev`)
- [ ] Test user created (`npm run seed-user`)
- [ ] Health check passes (`npm run health`)
- [ ] HealthPanel shows "DEV MODE" badge
- [ ] Stripe webhook listener running (if testing payments)

---

## 🚀 Production Deployment

Dev Parity Mode only affects local development. Production deployment remains:
```bash
git push origin main
# Vercel auto-deploys with production environment variables
```

---

## 🔐 Security Notes

- `.env.local` is never committed (in `.gitignore`)
- Test credentials only work in development
- Seed endpoint blocked in production
- Stripe test keys only work with test cards
- Real data never used in development

---

## 📞 Support

**Issues with setup?**
1. Check troubleshooting section above
2. Verify Vercel project access
3. Ensure all prerequisites installed
4. Check Vercel deployment logs

**Need help?**
- GitHub Issues: [Create an issue](https://github.com/enjaypa-png/elite-listing-ai-v2/issues)
- Documentation: `/docs` folder
- Health endpoint: `GET /api/health`
