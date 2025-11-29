# Testing Guide - Elite Listing AI

Quick guide for testing the newly implemented features.

---

## 🚀 Quick Start Testing

### Prerequisites
1. Set environment variable:
   ```bash
   export OPENAI_API_KEY="sk-proj-..."
   ```

2. Start development server:
   ```bash
   cd /app/elite-listing-ai-v2
   npm run dev
   ```

3. Open browser: `http://localhost:3000`

---

## ✅ Test Checklist

### Test 1: Etsy Listing Scraper
**Endpoint:** `POST /api/etsy/scrape`

**Test with curl:**
```bash
curl -X POST http://localhost:3000/api/etsy/scrape \
  -H "Content-Type: application/json" \
  -d '{"url":"https://www.etsy.com/listing/1234567890/product-name"}'
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "listingId": "1234567890",
    "title": "...",
    "description": "...",
    "tags": [...],
    "price": 24.99,
    "images": [...],
    "category": "...",
    "imageCount": 10,
    "tagCount": 13
  }
}
```

**Success Criteria:**
- ✅ Returns 200 status code
- ✅ Extracts title (50-140 chars)
- ✅ Extracts description (200+ chars)
- ✅ Extracts 1-13 tags
- ✅ Extracts 1-10 images
- ✅ Extracts category
- ✅ Handles invalid URLs gracefully

---

### Test 2: R.A.N.K. 285™ Analysis
**Endpoint:** `POST /api/seo/audit`

**Test with curl:**
```bash
curl -X POST http://localhost:3000/api/seo/audit \
  -H "Content-Type: application/json" \
  -d '{
    "platform":"Etsy",
    "title":"Handmade Ceramic Mug",
    "description":"Beautiful handmade ceramic coffee mug",
    "tags":"ceramic,mug,coffee,handmade",
    "category":"Home & Living",
    "photoCount":3
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "overallScore": 49,
  "totalPoints": 140,
  "maxPoints": 285,
  "breakdown": {
    "title": {...},
    "tags": {...},
    "description": {...}
  },
  "priorityIssues": [...],
  "quickWins": [...]
}
```

**Success Criteria:**
- ✅ Returns 285-point breakdown
- ✅ Identifies issues correctly
- ✅ Provides actionable suggestions
- ✅ AI recommendations included

---

### Test 3: Listing Optimization
**Endpoint:** `POST /api/optimize/listing`

**Test with curl:**
```bash
curl -X POST http://localhost:3000/api/optimize/listing \
  -H "Content-Type: application/json" \
  -d '{
    "title":"Ceramic Mug",
    "description":"Nice mug",
    "tags":["mug","coffee"],
    "category":"Home & Living",
    "price":24.99
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "optimized": {
    "titles": [
      {
        "text": "Handmade Ceramic Coffee Mug | ...",
        "approach": "Primary use case",
        "keywords": [...],
        "reasoning": "..."
      },
      ...
    ],
    "tags": ["handmade mug", "pottery mug", ...],
    "description": "✨ HANDMADE CERAMIC COFFEE MUG ✨\n..."
  }
}
```

**Success Criteria:**
- ✅ Returns 3 title variants
- ✅ Returns 13 optimized tags
- ✅ Returns optimized description (500-1000 chars)
- ✅ Includes reasoning for each optimization
- ✅ Response time < 30 seconds

---

### Test 4: Complete UI Workflow
**Page:** `/dashboard/optimize-listing`

**Manual Test Steps:**
1. Navigate to: `http://localhost:3000/dashboard/optimize-listing`
2. Paste Etsy URL: `https://www.etsy.com/listing/[valid-id]/product-name`
3. Click "⚡ Optimize Listing" button
4. Wait for loading animation (~15-30 seconds)
5. Review results:
   - Overall R.A.N.K. score displayed
   - Component breakdown visible
   - Priority issues listed
   - Quick wins shown
   - 3 optimized titles displayed
   - 13 optimized tags shown
   - Optimized description visible
6. Test copy functionality:
   - Click "Copy" on title variant → verify clipboard
   - Click "Copy All Tags" → verify clipboard
   - Click "Copy Description" → verify clipboard
   - Click "Copy Everything" → verify all content copied
7. Click "Analyze Another Listing" → form resets

**Success Criteria:**
- ✅ Loading animation shows all 3 steps
- ✅ All data fetches without errors
- ✅ Results display correctly
- ✅ Copy buttons work
- ✅ Form can be reset and reused
- ✅ No console errors
- ✅ Mobile responsive

---

## 🐛 Common Issues & Solutions

### Issue 1: "Missing OpenAI API Key"
**Symptom:** API returns 500 error
**Solution:** Set OPENAI_API_KEY environment variable

### Issue 2: "Failed to fetch listing"
**Symptom:** Scraper returns error
**Possible Causes:**
- Invalid Etsy URL format
- Listing doesn't exist
- Etsy changed HTML structure
- Rate limiting from Etsy
**Solution:** Try different listing URL, check HTML structure

### Issue 3: "Optimization takes too long"
**Symptom:** Page hangs for >60 seconds
**Possible Causes:**
- OpenAI API slow response
- Network issues
- Large image processing
**Solution:** Increase timeout, optimize prompts

### Issue 4: "Copy to clipboard not working"
**Symptom:** Nothing copied
**Solution:** Check browser permissions for clipboard API

---

## 📊 Performance Benchmarks

### Expected Response Times
- **Scraping:** 2-5 seconds
- **R.A.N.K. Analysis:** 3-8 seconds
- **Optimization:** 15-25 seconds
- **Total Workflow:** 20-35 seconds

### API Costs (OpenAI GPT-4o)
- **Per Optimization:** ~$0.02-0.05
- **Token Usage:**
  - Titles: ~500-1000 tokens
  - Tags: ~300-500 tokens
  - Description: ~800-1500 tokens
- **Total per run:** ~2000-3500 tokens

---

## 🧪 Edge Cases to Test

### Test with Various Listing Types
1. **Short title listing** (< 50 chars)
2. **Long title listing** (> 110 chars)
3. **Minimal tags** (< 5 tags)
4. **Full tags** (13 tags)
5. **Short description** (< 100 chars)
6. **Long description** (> 2000 chars)
7. **Expensive item** (> $500)
8. **Cheap item** (< $10)
9. **Multiple images** (10 images)
10. **Single image** (1 image)

### Test Error Handling
1. **Invalid URL format**
2. **Non-existent listing ID**
3. **Expired listing**
4. **Private listing**
5. **Non-Etsy URL**
6. **Empty URL**
7. **Network timeout**
8. **API rate limit exceeded**

---

## 📝 Test Report Template

```markdown
## Test Report - [Date]

### Environment
- Node Version: 
- OpenAI API Key: Set ✅ / Not Set ❌
- Browser: 

### Test Results
| Test | Status | Notes |
|------|--------|-------|
| Etsy Scraper API | ✅/❌ | |
| R.A.N.K. Analysis | ✅/❌ | |
| Optimization API | ✅/❌ | |
| UI Workflow | ✅/❌ | |
| Copy Functionality | ✅/❌ | |
| Error Handling | ✅/❌ | |

### Issues Found
1. 
2. 
3. 

### Recommendations
1. 
2. 
3. 
```

---

## 🔍 Debugging Tips

### Enable Detailed Logging
```javascript
// In browser console
localStorage.setItem('debug', 'true');
```

### Check API Endpoints
```bash
# Health check
curl http://localhost:3000/api/etsy/scrape
curl http://localhost:3000/api/seo/audit
curl http://localhost:3000/api/optimize/listing
```

### View Backend Logs
```bash
# In development console
# Look for [Etsy Scraper], [SEO Audit], [Optimize Listing] prefixes
```

### Test Individual Components
```bash
# Test scraper only
curl -X POST http://localhost:3000/api/etsy/scrape -d '{"url":"..."}' -H "Content-Type: application/json"

# Test analysis only
curl -X POST http://localhost:3000/api/seo/audit -d '{"platform":"Etsy",...}' -H "Content-Type: application/json"

# Test optimization only
curl -X POST http://localhost:3000/api/optimize/listing -d '{"title":"...",...}' -H "Content-Type: application/json"
```

---

## ✅ Ready for Production Checklist

- [ ] All tests pass locally
- [ ] No console errors
- [ ] API response times acceptable
- [ ] Error messages user-friendly
- [ ] Copy functionality works
- [ ] Mobile responsive
- [ ] Loading states clear
- [ ] OPENAI_API_KEY set in production
- [ ] Rate limiting implemented
- [ ] Monitoring/analytics in place
- [ ] Error tracking configured

---

**Happy Testing! 🚀**

For issues or questions, check:
- AI_SESSION_SUMMARY_2025-01-29.md
- MASTER_AI_HANDOFF.md
- Git commit history
