# Keyword Generator & SEO Auditor - Diagnostic Guide

## Environment Variables Required

### OPENAI_API_KEY (REQUIRED)
Both APIs require OpenAI API key to function.

**Check in Vercel:**
1. Go to Vercel Dashboard → Your Project
2. Settings → Environment Variables
3. Verify `OPENAI_API_KEY` exists and is set for all environments

**Value should look like:**
```
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxxx
```

## Health Check Endpoints

### Check Keyword Generator Status
```bash
curl https://your-app.vercel.app/api/keywords/generate
```

**Expected Response:**
```json
{
  "ok": true,
  "endpoint": "/api/keywords/generate",
  "status": "ready",
  "hasApiKey": true,
  "model": "gpt-4o",
  "features": [
    "285-point algorithm integration",
    "Buyer intent prioritization",
    "Gift angle optimization",
    "Mobile CTR focus",
    "Conversion-weighted scoring"
  ]
}
```

### Check SEO Auditor Status
```bash
curl https://your-app.vercel.app/api/seo/audit
```

**Expected Response:**
```json
{
  "ok": true,
  "endpoint": "/api/seo/audit",
  "status": "ready",
  "hasApiKey": true,
  "model": "gpt-4o",
  "scoringSystem": "285-point Etsy 2025 algorithm",
  "categories": {
    "title": "50 points",
    "tags": "35 points",
    "description": "30 points",
    "images": "70 points",
    "pricing": "23 points",
    "metadata": "28 points"
  }
}
```

## Common Errors & Solutions

### Error: "keyword generation failed" or "Failed to generate keywords"

**Possible Causes:**

#### 1. Missing OPENAI_API_KEY
**Check:**
```bash
curl https://your-app.vercel.app/api/keywords/generate
```

**If response shows:**
```json
{
  "hasApiKey": false
}
```

**Solution:**
- Add `OPENAI_API_KEY` in Vercel environment variables
- Redeploy application

---

#### 2. OpenAI API Quota Exceeded
**Error message includes:** "insufficient_quota" or "rate_limit_exceeded"

**Solution:**
- Check OpenAI dashboard: https://platform.openai.com/usage
- Add payment method or increase quota
- Wait for rate limit to reset (usually 1 minute)

---

#### 3. Invalid API Key
**Error message includes:** "invalid_api_key" or "Incorrect API key"

**Solution:**
- Verify API key in OpenAI dashboard
- Generate new key if needed
- Update in Vercel and redeploy

---

#### 4. Network/Timeout Errors
**Error message includes:** "timeout" or "ECONNREFUSED"

**Solution:**
- Check OpenAI service status
- Increase Vercel function timeout if needed
- Retry request

---

## Testing Locally

### 1. Set Environment Variable
```bash
export OPENAI_API_KEY=sk-proj-your-key-here
```

### 2. Start Dev Server
```bash
cd /tmp/elite-listing-ai-v2
npm run dev
```

### 3. Test Keyword Generator
```bash
curl -X POST "http://localhost:3001/api/keywords/generate" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Ceramic Mug Handmade",
    "description": "Beautiful handcrafted mug for coffee lovers"
  }'
```

**Expected:** JSON response with primaryKeywords, secondaryKeywords, algorithmInsights

### 4. Test SEO Auditor
```bash
curl -X POST "http://localhost:3001/api/seo/audit" \
  -H "Content-Type: application/json" \
  -d '{
    "platform": "Etsy",
    "title": "Ceramic Mug Handmade",
    "description": "Nice mug",
    "tags": "ceramic, mug, coffee",
    "photoCount": 3
  }'
```

**Expected:** JSON response with 285-point score breakdown

## Vercel Logs

### View Real-Time Logs
1. Go to Vercel Dashboard → Your Project
2. Click on latest deployment
3. Click "Functions" tab
4. Click on `/api/keywords/generate` or `/api/seo/audit`
5. View logs to see actual error messages

### What to Look For:
- `OPENAI_API_KEY is not set` → Add environment variable
- `invalid_api_key` → Check API key value
- `insufficient_quota` → Add OpenAI credits
- `timeout` → Increase function timeout or check OpenAI status
- Full error stack trace with line numbers

## Troubleshooting Checklist

- [ ] `OPENAI_API_KEY` set in Vercel (all environments)
- [ ] API key is valid (test in OpenAI Playground)
- [ ] OpenAI account has credits/quota
- [ ] Deployment succeeded without errors
- [ ] Health check endpoints return `"hasApiKey": true`
- [ ] Function logs show actual error message
- [ ] Request body includes required fields (title, description)

## Quick Fix Commands

### Check API Key Status
```bash
# Production
curl https://your-app.vercel.app/api/keywords/generate

# Look for: "hasApiKey": true or false
```

### Test with Minimal Input
```bash
curl -X POST "https://your-app.vercel.app/api/keywords/generate" \
  -H "Content-Type: application/json" \
  -d '{"title":"Test","description":"Test description"}' \
  -v
```

### View Detailed Error
```bash
# Add -v for verbose output
curl -X POST "https://your-app.vercel.app/api/keywords/generate" \
  -H "Content-Type: application/json" \
  -d '{"title":"Test","description":"Test"}' \
  -v 2>&1 | grep -A 20 "error"
```

## Contact Support

If issues persist after checking:
1. Share Vercel function logs
2. Share response from GET health check
3. Confirm OPENAI_API_KEY is set in Vercel
4. Share exact error message from frontend

## Summary

**Both APIs now include:**
- ✅ Environment variable validation
- ✅ Enhanced error messages with details
- ✅ API key presence check
- ✅ GET health check endpoints
- ✅ Detailed logging for debugging

**Next Steps:**
1. Check health endpoints to verify API key
2. Review Vercel logs for specific error
3. Add OPENAI_API_KEY if missing
4. Redeploy and test
