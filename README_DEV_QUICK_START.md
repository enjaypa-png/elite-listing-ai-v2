# 🚀 Quick Start - Local Development

## One-Click Setup (5 minutes)

### 1. Install & Login
```bash
npm install -g vercel
vercel login
```

### 2. Setup Project
```bash
cd elite-listing-ai-v2
npm install
vercel link
```

### 3. Sync Environment
```bash
npm run sync-env
```

### 4. Start Development
```bash
npm run dev
```

### 5. Create Test User
```bash
# In new terminal
npm run seed-user
```

**Test Credentials:**
- Email: `test@elitelistingai.dev`
- Password: `test123`
- Initial Credits: 50

### 6. Verify
```bash
npm run health
# Expected: 8/8 tests pass ✅
```

---

## 🎯 What You Get

✅ **Exact Production Environment** - All Vercel env vars synced locally
✅ **Test User with Credits** - Ready for immediate testing
✅ **Health Dashboard** - Real-time system status with ENV display
✅ **Mock Etsy Integration** - 25 sample listings
✅ **Stripe Test Mode** - Safe payment testing

---

## 📖 Full Documentation

See [DEV_PARITY_MODE.md](./DEV_PARITY_MODE.md) for complete setup guide.

---

## 🔧 Common Commands

```bash
npm run dev          # Start dev server
npm run sync-env     # Pull env from Vercel
npm run seed-user    # Create test user
npm run health       # Check all endpoints
npm run build        # Test production build
```

---

## 🧪 Test Workflows

**Credit Purchase:**
1. Open http://localhost:3000/dashboard
2. Sign in with test credentials
3. Click "Buy Starter" (test mode)
4. Balance increases automatically

**Optimize Demo:**
1. In dashboard, click "Optimize Demo"
2. See 3 AI-generated variants
3. Credit deducted (-1)
4. Transaction logged

**Etsy Integration:**
1. Navigate to /etsy
2. Click "Connect Etsy Shop"
3. Browse 25 mock listings
4. Test "Optimize This" buttons

---

## 🎬 Next Steps

After setup:
1. Check HealthPanel at `/dashboard` (shows "DEV MODE" badge)
2. Review environment variables
3. Test all features locally
4. Run health check before submitting PRs

**Ready to code!** 🚀
