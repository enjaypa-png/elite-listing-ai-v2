# Current AI Training Data & Prompts - Elite Listing AI

**Date**: November 7, 2025  
**Analysis**: Complete review of all AI prompts and training data currently in use

---

## 📊 Overview

The app currently uses **4 AI-powered endpoints** with different system prompts and training data:

1. **Listing Optimizer** (`/api/optimize`)
2. **Keyword Generator** (`/api/keywords/generate`)
3. **SEO Auditor** (`/api/seo/audit`)
4. **Image Analyzer** (`/api/optimize/image/analyze` + batch)

---

## 🧠 Current Knowledge Base

### Location: `/lib/etsyKnowledgeBase.json`

**Status**: ✅ Comprehensive Etsy Algorithm Intelligence

**Version**: 2.0  
**Last Updated**: 2025-11-05  
**Data Sources**: Etsy official docs, eRank, Marmalead, industry analysis 2024-2025

### Categories (17 total, 114+ insights):

| Category | Impact Level | Insights Count |
|----------|-------------|----------------|
| Search Ranking Core Factors | Critical | 5 |
| AI Personalization & Behavioral | Critical | 6 |
| Image Quality & Visual | Critical | 8 |
| Keyword Strategy & Title | High | 8 |
| Conversion Rate Optimization | Critical | 7 |
| Click-Through Rate (CTR) | High | 7 |
| Customer Service & Shop Health | Critical | 8 |
| Reviews & Social Proof | High | 6 |
| Listing Recency & Refresh | Medium | 6 |
| Pricing & Shipping | Critical | 7 |
| Seasonal & Event | Medium-High | 5 |
| Engagement & Session Metrics | High | 6 |
| Description & Content Quality | Medium-High | 7 |
| External Traffic & Marketing | Medium | 5 |
| Inventory & Variation | Medium | 5 |
| Promotional Tools | Medium | 5 |
| Mobile & App Optimization | Critical | 5 |

**Total Insights**: 114 detailed rules and guidelines

### Key Knowledge Base Features:
- ✅ Critical Dos (10 rules)
- ✅ Critical Don'ts (10 rules)
- ✅ 2025 Priority Focus (5 areas)
- ✅ Helper functions to query insights
- ✅ Enhanced system prompt builder

---

## 🎯 AI Prompt #1: Listing Optimizer

**File**: `/app/api/optimize/route.ts` (lines 298-326)

**Current System Prompt**:
```
You are an elite e-commerce listing optimizer with deep expertise in {platform} algorithm optimization.

CRITICAL RULES:
1. KEYWORD PRIORITY: Primary keyword MUST appear in first 60 characters of title
2. DENSITY CONTROL: Maintain keyword density between 1.5% and 3.0%
3. TITLE COMPOSITION: Maximum 140 characters (Etsy limit), front-load primary keyword
4. TAG REQUIREMENTS: Exactly 13 tags (Etsy requirement)

TONE: {persuasive/minimalist/luxury/seo-heavy}

Generate 3 distinct optimized variants. Each variant MUST include:
1. Optimized title (≤140 chars)
2. Compelling description (150-300 words)
3. Exactly 13 unique, relevant tags
4. Estimated copyScore (0-100)
```

### What It Optimizes:
- Title (max 140 chars, keyword front-loaded)
- Description (150-300 words)
- Tags (exactly 13 for Etsy)
- Generates 3 variants with scores

### Tone Options:
- `persuasive`: Emotional triggers, storytelling, benefits
- `minimalist`: Clean, concise, essential features
- `luxury`: Sophisticated, premium, exclusive
- `seo-heavy`: Maximum keyword usage

### Scoring System:
- **Copy Score** (0-100): 25% clarity + 25% persuasion + 25% SEO density + 25% keyword harmony
- **Clarity**: Based on Flesch readability score
- **Persuasion**: Emotion triggers + description length
- **SEO Density**: Keyword density (1.5-3% optimal)
- **Keyword Harmony**: Position score + tag score
- **CTR Probability**: Title score + emotional appeal + keyword harmony
- **Conversion Probability**: Clarity + persuasion + SEO density

### Output Format:
```json
{
  "variants": [
    {
      "title": "Optimized title",
      "description": "Optimized description",
      "tags": ["tag1", "tag2", ... 13 tags],
      "copyScore": 85,
      "clarity": 90,
      "persuasion": 80,
      "seoDensity": 85,
      "keywordHarmony": 82,
      "ctrProbability": 78,
      "conversionProbability": 84
    }
  ],
  "rationale": "Explanation",
  "primaryKeyword": "extracted keyword"
}
```

### Knowledge Base Integration:
❌ **NOT CURRENTLY USING** etsyKnowledgeBase.json (basic rules only)

---

## 🔑 AI Prompt #2: Keyword Generator

**File**: `/app/api/keywords/generate/route.ts` (lines 75-116)

**Current System Prompt**:
```
You are an expert Etsy SEO and keyword research specialist.

KEYWORD GENERATION RULES:
1. Extract relevant keywords from title and description
2. Generate additional high-value keywords
3. Include a mix of:
   - High-volume primary keywords (5-7)
   - Long-tail secondary keywords (10-13)
   - Niche-specific keywords (2-3)
4. Classify by intent:
   - purchase: buyer-ready
   - discovery: browsing
   - gifting: gift-oriented
   - seasonal: time-sensitive
5. Estimate search volume (1-1000)
6. Estimate competition (low/medium/high)
7. Calculate relevance score (0-100)
```

### What It Generates:
- Primary keywords (5-7)
- Secondary keywords (10-13)
- Search volume estimates
- Competition level
- Intent classification
- CTR potential
- Keyword scores

### Scoring Formula:
```
keywordScore = (searchVolume × ctrPotential) ÷ competitionDensity
```

### Output Format:
```json
{
  "primaryKeywords": [
    {
      "keyword": "handmade ceramic mug",
      "searchVolume": 850,
      "competition": "medium",
      "intent": "purchase",
      "relevanceScore": 95,
      "ctrPotential": 85,
      "keywordScore": 72
    }
  ],
  "secondaryKeywords": [...],
  "totalKeywords": 18,
  "averageRelevance": 87,
  "topIntent": "purchase",
  "suggestions": ["Excellent keyword balance"]
}
```

### Knowledge Base Integration:
❌ **NOT CURRENTLY USING** etsyKnowledgeBase.json

---

## 📊 AI Prompt #3: SEO Auditor

**File**: `/app/api/seo/audit/route.ts` (lines 352-353)

**Current System Prompt**:
```
You are an expert in e-commerce SEO optimization, specializing in Etsy, Shopify, and eBay listings. Provide specific, actionable advice.
```

**Current Analysis**:
- Title optimization (length, format, special chars)
- Description quality (length, paragraphs, bullets)
- Tag effectiveness (count, duplicates, length)
- Keyword density (1.5-3% optimal)
- Readability (Flesch score)
- AI-powered strengths and recommendations

### Scoring System:
```
overallScore = 
  titleOptimization × 0.25 +
  descriptionQuality × 0.20 +
  tagEffectiveness × 0.20 +
  keywordUsage × 0.15 +
  contentStructure × 0.10 +
  metadataCompleteness × 0.10
```

### Output Format:
```json
{
  "overallScore": 78,
  "categoryScores": {
    "titleOptimization": 85,
    "descriptionQuality": 72,
    "tagEffectiveness": 80,
    "keywordUsage": 75,
    "contentStructure": 70,
    "metadataCompleteness": 90
  },
  "issues": [...],
  "strengths": [AI-generated 3 strengths],
  "recommendations": [AI-generated 3 recommendations],
  "competitiveAnalysis": {
    "estimatedRanking": "Good",
    "improvementPotential": 75
  }
}
```

### Knowledge Base Integration:
❌ **NOT CURRENTLY USING** etsyKnowledgeBase.json (generic SEO rules only)

---

## 📸 AI Prompt #4: Image Analyzer

**File**: `/app/api/optimize/image/analyze/route.ts` (lines 85-111)

**Current System Prompt**:
```
You are an expert e-commerce product photography analyst specializing in {platform} listings.
Analyze product images with strict technical compliance and platform optimization rules.

CRITICAL TECHNICAL COMPLIANCE RULES:
1. Resolution: Minimum 2000px (Etsy standard)
2. Aspect Ratio: Prefer 1:1 (square)
3. Product Dominance: ≥70% of image area
4. Background: Clean, neutral, non-cluttered
5. Brightness & Contrast: ≥0.85 luminance index
6. Color Balance: Natural, realistic hues
7. Composition: Centered with strong visual impact
8. Focus: Sharp, high-resolution

PLATFORM ALGORITHM OPTIMIZATION:
- Product properly centered and dominant
- No cluttered/distracting backgrounds
- Color saturation and realism
- Composition for clickthrough potential
- Technical issues that hurt ranking

SCORING SYSTEM (Weighted):
- 40% Technical Compliance
- 30% Algorithm Fit
- 20% Visual Appeal
- 10% Conversion Optimization
```

### What It Analyzes:
- Lighting (0-100)
- Composition (0-100)
- Clarity (0-100)
- Appeal (0-100)
- Technical compliance (0-100)
- Algorithm fit (0-100)
- Product dominance (0-100)
- Background quality (0-100)
- Color balance (0-100)

### Output Format:
```json
{
  "score": 87,
  "lighting": 90,
  "composition": 85,
  "clarity": 88,
  "technicalCompliance": 92,
  "algorithmFit": 85,
  "productDominance": 80,
  "backgroundQuality": 90,
  "colorBalance": 85,
  "estimatedResolution": "2000x2000",
  "aspectRatioEstimate": "1:1",
  "feedback": "Detailed explanation",
  "complianceIssues": [...],
  "suggestions": [...]
}
```

### Batch Analysis (New):
**File**: `/app/api/optimize/images/batch-analyze/route.ts` (lines 55-71)

Same prompt as single image, but processes 10 photos in parallel.

---

## 📈 Current AI Configuration

### Model Used: **GPT-4o** (OpenAI)

**Why GPT-4o?**
- ✅ Supports Vision API (image analysis)
- ✅ JSON mode (structured outputs)
- ✅ Fast response times
- ✅ High accuracy for e-commerce optimization

### Temperature Settings:

| Endpoint | Temperature | Why |
|----------|-------------|-----|
| Listing Optimizer | 0.4 | Lower temp for consistent quality |
| Keyword Generator | 0.7 | Higher temp for creative keyword discovery |
| SEO Auditor | 0.7 | Balanced for analysis + creativity |
| Image Analyzer | 0.3 | Very low for objective scoring |

### Max Tokens:

| Endpoint | Max Tokens | Why |
|----------|------------|-----|
| Listing Optimizer | 2000 | 3 variants with descriptions |
| Keyword Generator | Default | Keyword lists |
| SEO Auditor | Default | Analysis + recommendations |
| Image Analyzer | 1500 | Detailed feedback per photo |
| Batch Analyzer | 1000 | Per photo (×10 = 10,000 total) |

---

## 🎯 What's MISSING (Opportunities)

### 1. Knowledge Base Not Integrated ❌

**Current State**:
- Knowledge base exists (`etsyKnowledgeBase.json`)
- Has 114 insights from Etsy algorithm research
- **But NOT being used** in AI prompts

**What's Missing**:
- Listing optimizer doesn't reference knowledge base
- Keyword generator doesn't use algorithm insights
- SEO auditor doesn't leverage Etsy-specific rules

**Opportunity**: Use `buildEnhancedSystemPrompt()` to inject knowledge base into all prompts

---

### 2. 285-Point System Not Implemented ❌

**Current SEO Audit**:
- Uses 6 generic categories (title, description, tags, keywords, structure, metadata)
- Weighted average scoring
- Generic SEO rules (not Etsy-specific)

**Master Plan Has**:
- Complete 285-point Etsy algorithm breakdown
- Title: 65 points (7 specific rules)
- Tags: 55 points (7 specific rules)
- Description: 55 points (6 specific rules)
- Photos: 65 points (6 specific rules)
- Attributes: 25 points
- Category: 20 points

**What's Missing**: Implementation of 285-point scoring system

---

### 3. No Competitor Analysis Prompts ❌

**Current State**: No competitor-related AI functionality

**Master Plan Has**: Competitor Gap Analyzer (killer feature)

**Missing Prompts**:
- Competitor listing analysis
- Keyword gap identification
- Gap-closing content generation
- Competitive positioning

---

### 4. Limited Photo Analysis Training ❌

**Current Image Analyzer**:
- Basic technical checks (resolution, aspect ratio, composition)
- Platform requirements hardcoded
- Generic feedback

**What's Missing**:
- Photo type classification (product-only, lifestyle, detail, scale)
- Visual trend analysis
- Competitor photo comparison
- Etsy-specific photo best practices from knowledge base

---

## 📋 Current AI Prompts (Full Details)

### Prompt 1: Listing Optimizer
**Model**: GPT-4o  
**Temperature**: 0.4  
**Max Tokens**: 2000

**System Instructions**:
```
CRITICAL RULES:
1. KEYWORD PRIORITY: Primary keyword in first 60 chars
2. DENSITY CONTROL: 1.5-3.0% keyword density
3. TITLE COMPOSITION: Max 140 chars, front-load keyword
4. TAG REQUIREMENTS: Exactly 13 tags (Etsy)

TONE: {user-selected}

Generate 3 variants with title, description, 13 tags, copyScore
```

**What It Does**:
- Analyzes original title/description/tags
- Generates 3 optimized variants
- Scores each variant on 8 metrics
- Deducts 1 credit per optimization

**Knowledge Base Used**: ❌ No (basic rules only)

---

### Prompt 2: Keyword Generator
**Model**: GPT-4o  
**Temperature**: 0.7  
**Max Tokens**: Default

**System Instructions**:
```
Expert Etsy SEO keyword specialist.

RULES:
1. Extract keywords from title/description
2. Generate high-value additional keywords
3. Mix: high-volume primary (5-7) + long-tail secondary (10-13)
4. Classify by intent: purchase/discovery/gifting/seasonal
5. Estimate search volume (1-1000)
6. Estimate competition (low/medium/high)
7. Calculate relevance (0-100)
```

**What It Generates**:
- 5-7 primary keywords
- 10-13 secondary keywords
- Search volume estimates
- Competition levels
- Intent classification
- CTR potential
- Keyword scores

**Knowledge Base Used**: ❌ No

---

### Prompt 3: SEO Auditor
**Model**: GPT-4o  
**Temperature**: 0.7  
**Max Tokens**: Default

**System Instructions**:
```
Expert in e-commerce SEO, specializing in Etsy, Shopify, eBay.
Provide specific, actionable advice.
```

**User Prompt**:
```
Analyze this {platform} listing:
Title: {title}
Description: {description}
Tags: {tags}
Category: {category}

Provide:
1. 3 key strengths
2. 3 specific recommendations
3. Estimated ranking (Excellent/Good/Fair/Poor)
4. Improvement potential (0-100)
```

**What It Analyzes**:
- Title optimization (length, format, keywords)
- Description quality (length, paragraphs, bullets)
- Tag effectiveness (count, duplicates, length)
- Keyword density
- Readability (Flesch score)
- Metadata completeness

**Scoring**: 6 categories, weighted average  
**Knowledge Base Used**: ❌ No (generic SEO rules)

---

### Prompt 4: Image Analyzer (Single)
**Model**: GPT-4o Vision  
**Temperature**: 0.3  
**Max Tokens**: 1500

**System Instructions**:
```
Expert e-commerce product photography analyst for {platform}.

CRITICAL REQUIREMENTS:
1. Resolution: Min 2000px ({platform} standard)
2. Aspect Ratio: Prefer 1:1 (square)
3. Product Dominance: 60-80% of frame
4. Background: Clean, neutral
5. Lighting: Bright, even, no shadows
6. Focus: Sharp, high-resolution

SCORING SYSTEM:
- 40% Technical Compliance
- 30% Algorithm Fit
- 20% Visual Appeal
- 10% Conversion Optimization
```

**What It Scores**:
- Lighting, composition, clarity, appeal
- Technical compliance, algorithm fit
- Product dominance, background quality, color balance
- Estimated resolution and aspect ratio

**Knowledge Base Used**: ❌ No (hardcoded rules)

---

### Prompt 5: Batch Image Analyzer (NEW)
**Model**: GPT-4o Vision  
**Temperature**: 0.3  
**Max Tokens**: 1000 per photo

**Same as single image analyzer**, but processes 10 photos in parallel.

**Additional Logic**:
- Overall score (average of all photos)
- Issues detection (missing photos, low res, wrong ratio)
- Suggestions generation (actionable recommendations)
- Summary stats (excellent/good/needs improvement)

**Knowledge Base Used**: ❌ No

---

## 🔍 Knowledge Base Helper Functions

**Location**: `/lib/etsyKnowledgeBase.ts`

### Available Functions:

1. **`getCategoryInsights(categoryName)`**
   - Get insights for specific category
   - Example: `getCategoryInsights('Image Quality')`
   - Returns: Array of insights

2. **`getAllCategories()`**
   - Get all categories with metadata
   - Returns: Name, impact, insight count

3. **`getOptimizationGuidelines()`**
   - Get dos, don'ts, priorities
   - Returns: Object with 3 arrays

4. **`searchInsights(searchTerm)`**
   - Search across all insights
   - Returns: Matching insights with category

5. **`buildEnhancedSystemPrompt(platform, tone)`** ⭐
   - **MOST IMPORTANT**: Builds comprehensive prompt
   - Injects all knowledge base rules
   - Includes dos, don'ts, priorities
   - Returns: Complete system prompt

6. **`getKnowledgeBaseMetadata()`**
   - Version, last updated, sources
   - Total insights count

7. **`getCriticalCategories()`**
   - Get only "Critical" impact categories

8. **`validateKnowledgeBase()`**
   - Check integrity
   - Returns: isValid, issues array

---

## 💡 Enhanced Prompt Example (Available But Not Used)

**Using**: `buildEnhancedSystemPrompt('etsy', 'persuasive')`

**Returns** (excerpt):
```
You are an elite e-commerce listing optimizer with deep expertise in etsy algorithm optimization, powered by the latest 2025 algorithm intelligence.

═══════════════════════════════════════════════════════════════
📊 ETSY ALGORITHM 2025 - CRITICAL RANKING FACTORS
═══════════════════════════════════════════════════════════════

🎯 SEARCH RANKING CORE (Primary Algorithm Inputs):
1. Query matching: Exact keyword matches in titles, tags, attributes, descriptions rank higher
2. Listing Quality Score combines CTR, conversion rate, favorites, sales velocity
3. Customer & Marketplace Experience includes reviews, message response (<24hrs critical)
4. Shipping price ranking factor: US domestic under $6 receives boost (Oct 2024)
5. Star Seller metrics influence ranking through quality signals

🤖 AI PERSONALIZATION & BEHAVIORAL SIGNALS (44.5% of sales via app):
1. Etsy app 44%+ of GMS; mobile-first, feed-style discovery is primary
2. AI analyzes clicks, favorites, add-to-cart, dwell time, hover behavior
3. ML ranks based on individual buyer's past browsing and purchases
4. Computer vision and NLP classify products by style/aesthetic

📱 MOBILE-FIRST REQUIREMENTS (Critical - Primary Experience):
1. 44%+ of Etsy GMS from mobile app - optimize for mobile-first
2. Thumbnails must work at small sizes; complex images fail on mobile
3. Feed-style browsing means first image is only chance to capture attention

📸 IMAGE QUALITY STANDARDS (First Ranking Factor):
• Minimum 2000 pixels width required
• 5+ high-quality photos strongly recommended
• First thumbnail critical for CTR
• NO collages or text overlays
• Lifestyle context photos increase buyer confidence

... [continues with all 114 insights] ...

═══════════════════════════════════════════════════════════════
✅ CRITICAL DOS (Must Follow):
═══════════════════════════════════════════════════════════════
1. Maintain shipping costs under $6 for US domestic
2. Upload 5+ professional photos, minimum 2000px width
3. Respond to messages within 24 hours consistently
... [10 total dos] ...

═══════════════════════════════════════════════════════════════
❌ CRITICAL DON'TS (Avoid These):
═══════════════════════════════════════════════════════════════
1. Don't use text overlays or collages in images
2. Don't keyword stuff titles/descriptions
3. Don't ignore message response time
... [10 total don'ts] ...

═══════════════════════════════════════════════════════════════
🎯 2025 PRIORITY FOCUS AREAS:
═══════════════════════════════════════════════════════════════
1. Mobile-first visual optimization
2. Behavioral engagement (CTR and dwell time)
3. AI personalization
4. Shop health metrics
5. Customer service excellence
```

**This enhanced prompt is AVAILABLE but NOT CURRENTLY USED in any endpoint!**

---

## 🎯 Summary: What's Currently Being Used

### ✅ What's Working:
1. **Listing Optimizer**: Basic rules (keyword density, title length, 13 tags)
2. **Keyword Generator**: Intent classification, search volume, competition
3. **SEO Auditor**: 6-category generic SEO analysis
4. **Image Analyzer**: Technical compliance, platform requirements
5. **Knowledge Base**: Comprehensive (114 insights) but NOT integrated

### ❌ What's NOT Being Used:
1. **Knowledge Base insights** in any AI prompts
2. **285-point Etsy algorithm** system
3. **Enhanced system prompts** (`buildEnhancedSystemPrompt()`)
4. **Etsy-specific** optimization rules from knowledge base
5. **2025 algorithm priorities** (mobile-first, behavioral, AI personalization)
6. **Critical dos/don'ts** from knowledge base
7. **Competitor analysis** prompts (doesn't exist yet)

---

## 💡 Recommendations

### Immediate (High Impact):
1. **Integrate Knowledge Base** into all AI prompts
   - Use `buildEnhancedSystemPrompt()` in listing optimizer
   - Reference specific insights in keyword generator
   - Add Etsy-specific rules to SEO auditor

2. **Upgrade SEO Audit** with 285-point system
   - Replace generic scoring with master plan code
   - Add Etsy-specific rules from knowledge base

3. **Enhance Image Analyzer** with knowledge base
   - Add photo quality rules from knowledge base
   - Reference image requirements (2000px, 5+ photos, no collages)

### Medium Term:
4. **Add Competitor Analysis** prompts
5. **Add Photo Type Classification** (product-only, lifestyle, detail)
6. **Add Seasonal Optimization** prompts

---

## 📊 Knowledge Base Stats

**Total Data Points**: 114 insights + 10 dos + 10 don'ts + 5 priorities = **139 rules**

**Categories by Impact**:
- **Critical**: 7 categories (most important)
- **High**: 4 categories
- **Medium-High**: 2 categories
- **Medium**: 4 categories

**Last Updated**: November 5, 2025 (2 days ago - current!)

**Sources**: Etsy official docs, eRank, Marmalead, industry analysis

---

## ✅ Ready for Your Training Data

**Current AI prompts are**:
- ✅ Functional (generating good results)
- ⚠️ Basic (not using full knowledge base)
- ⚠️ Generic (not Etsy-specific enough)
- ❌ Missing 285-point system

**You can now**:
1. Provide new training data to enhance existing prompts
2. Add 285-point system rules
3. Integrate knowledge base into prompts
4. Add new specialized prompts (competitor analysis, etc.)

---

**I'm ready to receive your training data and integrate it into the AI!** 🚀
