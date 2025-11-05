# Knowledge Base Testing Guide - Phase 1

## ✅ Files Created Successfully

1. ✅ `/lib/etsyKnowledgeBase.json` - Complete Etsy algorithm data (18 categories, 100+ insights)
2. ✅ `/lib/etsyKnowledgeBase.ts` - TypeScript wrapper with 11 helper functions
3. ✅ `/app/api/knowledge-base/route.ts` - Info endpoint for testing

**Commit:** `2f966d9` - "feat: Add Etsy Algorithm Knowledge Base (Phase 1)"

---

## 🧪 How to Test (Zero Risk to Main App)

### **Method 1: Using the API Endpoint (Recommended)**

The new `/api/knowledge-base` endpoint lets you test without affecting any existing code.

#### **Test 1: Full Overview**
```bash
curl http://localhost:3000/api/knowledge-base
```

**Expected Response:**
```json
{
  "ok": true,
  "message": "Etsy Algorithm Knowledge Base loaded successfully",
  "data": {
    "metadata": {
      "version": "2.0",
      "lastUpdated": "2025-11-05",
      "dataSources": "Etsy official documentation, eRank, Marmalead...",
      "categoryCount": 18,
      "totalInsights": 100+
    },
    "statistics": {
      "totalCategories": 18,
      "criticalCategories": 7,
      "highImpactCategories": 4,
      "totalDos": 10,
      "totalDonts": 10,
      "priorities": 5
    },
    "categories": [ ... ],
    "guidelines": { ... }
  }
}
```

✅ **Pass Criteria:** Returns `"ok": true` and shows all metadata

---

#### **Test 2: Validate Knowledge Base Integrity**
```bash
curl "http://localhost:3000/api/knowledge-base?action=validate"
```

**Expected Response:**
```json
{
  "ok": true,
  "data": {
    "isValid": true,
    "issues": []
  },
  "message": "Knowledge base is valid"
}
```

✅ **Pass Criteria:** `"isValid": true` with empty issues array

---

#### **Test 3: Get All Categories**
```bash
curl "http://localhost:3000/api/knowledge-base?action=categories"
```

**Expected Response:**
```json
{
  "ok": true,
  "data": {
    "categories": [
      {
        "name": "Search Ranking Core Factors",
        "impact": "Critical - Primary algorithm inputs",
        "insightCount": 5
      },
      {
        "name": "AI Personalization & Behavioral Signals (2025)",
        "impact": "Critical - 44.5% of sales via app...",
        "insightCount": 6
      },
      ... (16 more categories)
    ],
    "total": 18
  }
}
```

✅ **Pass Criteria:** Returns 18 categories with correct counts

---

#### **Test 4: Get Optimization Guidelines**
```bash
curl "http://localhost:3000/api/knowledge-base?action=guidelines"
```

**Expected Response:**
```json
{
  "ok": true,
  "data": {
    "dos": [
      "Maintain shipping costs under $6 for US domestic orders",
      "Upload 5+ professional photos, minimum 2000px width...",
      ... (10 total)
    ],
    "donts": [
      "Don't use text overlays or collages in listing images",
      "Don't keyword stuff titles/descriptions...",
      ... (10 total)
    ],
    "priorities": [
      "Mobile-first visual optimization...",
      ... (5 total)
    ]
  }
}
```

✅ **Pass Criteria:** Returns 10 dos, 10 don'ts, 5 priorities

---

#### **Test 5: Search for Specific Insights**
```bash
# Search for shipping-related insights
curl "http://localhost:3000/api/knowledge-base?action=search&q=shipping"

# Search for mobile-related insights
curl "http://localhost:3000/api/knowledge-base?action=search&q=mobile"

# Search for image requirements
curl "http://localhost:3000/api/knowledge-base?action=search&q=image"
```

**Expected Response:**
```json
{
  "ok": true,
  "data": {
    "query": "shipping",
    "results": [
      {
        "category": "Pricing & Shipping Strategy",
        "insight": "US domestic shipping under $6 receives ranking boost..."
      },
      {
        "category": "Customer Service & Shop Health",
        "insight": "On-time shipping performance tracked..."
      },
      ... (more matches)
    ],
    "count": 5
  }
}
```

✅ **Pass Criteria:** Returns relevant insights matching search term

---

#### **Test 6: Get Specific Category Insights**
```bash
# Get image quality insights
curl "http://localhost:3000/api/knowledge-base?action=category&name=Image%20Quality"

# Get keyword strategy insights
curl "http://localhost:3000/api/knowledge-base?action=category&name=Keyword"

# Get conversion insights
curl "http://localhost:3000/api/knowledge-base?action=category&name=Conversion"
```

**Expected Response:**
```json
{
  "ok": true,
  "data": {
    "categoryName": "Image Quality",
    "insights": [
      "Minimum 2000 pixels width required...",
      "5+ high-quality photos strongly recommended...",
      "First thumbnail image is critical for CTR...",
      ... (8 total)
    ],
    "count": 8,
    "found": true
  }
}
```

✅ **Pass Criteria:** Returns all insights for the category

---

#### **Test 7: Get Critical Categories Only**
```bash
curl "http://localhost:3000/api/knowledge-base?action=critical"
```

**Expected Response:**
```json
{
  "ok": true,
  "data": {
    "categories": [
      { "category": "Search Ranking Core Factors", ... },
      { "category": "AI Personalization & Behavioral Signals", ... },
      { "category": "Image Quality & Visual Requirements", ... },
      ... (7 critical categories total)
    ],
    "count": 7
  }
}
```

✅ **Pass Criteria:** Returns only categories marked as "Critical"

---

### **Method 2: Test TypeScript Functions Directly**

Create a test file to verify helper functions work:

**File:** `/app/elite-listing-ai-v2/test-knowledge-base.ts`

```typescript
import {
  etsyKnowledgeBase,
  getAllCategories,
  getCategoryInsights,
  getOptimizationGuidelines,
  getKnowledgeBaseMetadata,
  buildEnhancedSystemPrompt,
  validateKnowledgeBase,
  searchInsights,
} from './lib/etsyKnowledgeBase';

console.log('=== Testing Knowledge Base ===\n');

// Test 1: Load knowledge base
console.log('1. Knowledge Base Metadata:');
console.log(getKnowledgeBaseMetadata());
console.log('');

// Test 2: Validate structure
console.log('2. Validation:');
const validation = validateKnowledgeBase();
console.log(`Valid: ${validation.isValid}`);
console.log(`Issues: ${validation.issues.length === 0 ? 'None' : validation.issues.join(', ')}`);
console.log('');

// Test 3: Get categories
console.log('3. Categories:');
const categories = getAllCategories();
console.log(`Total: ${categories.length}`);
console.log(`First 3: ${categories.slice(0, 3).map(c => c.name).join(', ')}`);
console.log('');

// Test 4: Get specific insights
console.log('4. Image Quality Insights:');
const imageInsights = getCategoryInsights('Image Quality');
console.log(`Found ${imageInsights.length} insights`);
console.log(`First: ${imageInsights[0]}`);
console.log('');

// Test 5: Get guidelines
console.log('5. Guidelines:');
const guidelines = getOptimizationGuidelines();
console.log(`Dos: ${guidelines.dos.length}`);
console.log(`Don'ts: ${guidelines.donts.length}`);
console.log(`Priorities: ${guidelines.priorities.length}`);
console.log('');

// Test 6: Search functionality
console.log('6. Search for "shipping":');
const searchResults = searchInsights('shipping');
console.log(`Found ${searchResults.length} matches`);
console.log('');

// Test 7: Build enhanced prompt
console.log('7. Enhanced System Prompt (first 500 chars):');
const prompt = buildEnhancedSystemPrompt('etsy', 'persuasive');
console.log(prompt.substring(0, 500) + '...');
console.log('');

console.log('=== All Tests Complete ===');
```

**Run Test:**
```bash
cd /app/elite-listing-ai-v2
npx tsx test-knowledge-base.ts
```

---

### **Method 3: Browser Testing**

1. **Start your dev server:**
   ```bash
   cd /app/elite-listing-ai-v2
   npm run dev
   # or
   yarn dev
   ```

2. **Open browser and visit:**
   ```
   http://localhost:3000/api/knowledge-base
   ```

3. **Test different actions:**
   - http://localhost:3000/api/knowledge-base?action=metadata
   - http://localhost:3000/api/knowledge-base?action=validate
   - http://localhost:3000/api/knowledge-base?action=categories
   - http://localhost:3000/api/knowledge-base?action=search&q=shipping

---

## ✅ Success Criteria Checklist

| Test | Expected Result | Status |
|------|----------------|--------|
| API endpoint loads | `"ok": true` returned | ⬜ |
| Validation passes | `"isValid": true` | ⬜ |
| 18 categories loaded | Total count = 18 | ⬜ |
| All insights present | 100+ total insights | ⬜ |
| Search works | Finds relevant insights | ⬜ |
| Category lookup works | Returns specific insights | ⬜ |
| Guidelines loaded | 10 dos, 10 don'ts, 5 priorities | ⬜ |
| TypeScript imports work | No compilation errors | ⬜ |

---

## 🚨 Troubleshooting

### **Issue: API returns 500 error**
**Solution:** Check that JSON file is valid:
```bash
cat lib/etsyKnowledgeBase.json | python -m json.tool
```

### **Issue: TypeScript import error**
**Solution:** Regenerate TypeScript declarations:
```bash
cd /app/elite-listing-ai-v2
npm run build
# or
yarn build
```

### **Issue: Module not found**
**Solution:** Verify file paths:
```bash
ls -la lib/etsyKnowledgeBase.*
ls -la app/api/knowledge-base/route.ts
```

---

## 🎯 Next Steps After Successful Testing

Once all tests pass:

1. ✅ **Phase 1 Complete** - Knowledge base loaded successfully
2. 📝 **Document findings** - Note any insights that surprised you
3. 🔄 **Ready for Phase 2** - Integrate into optimize API
4. 🧪 **A/B test** - Compare optimization quality before/after

---

## 📊 What This Proves

Successful testing confirms:
- ✅ JSON file is valid and complete
- ✅ TypeScript wrapper functions correctly
- ✅ API endpoint accessible without affecting main app
- ✅ All 18 categories with 100+ insights loaded
- ✅ Search and filtering work
- ✅ Enhanced prompt generation ready
- ✅ **ZERO impact on existing optimize API** (still using hardcoded prompts)

---

## 🔒 Safety Verification

**Confirm these still work (unchanged):**
- ✅ Main app homepage loads
- ✅ Dashboard works
- ✅ Existing optimize API functions
- ✅ No errors in console

If all above work, Phase 1 is **100% safe and successful**! 🎉

---

**Ready to test?** Start with the curl commands above or visit the API endpoint in your browser!
