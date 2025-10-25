# Elite Listing AI - API Testing Guide

## Setup

1. Add your OpenAI API key to `.env.local`:
```bash
OPENAI_API_KEY="your open ai key here"
```

2. Restart the dev server:
```bash
npm run dev
```

## API Endpoints

### GET /api/optimize

Health check endpoint for the optimization service.

**Request:**
```bash
curl http://localhost:3000/api/optimize
```

**Response:**
```json
{
  "ok": true,
  "status": "optimize endpoint ready",
  "model": "gpt-4o-mini",
  "hasApiKey": true
}
```

### POST /api/optimize

Optimizes listing content using OpenAI GPT-4o-mini. **Currently configured for Etsy only.**

**Request:**
```bash
curl -X POST http://localhost:3000/api/optimize \
  -H "Content-Type: application/json" \
  -d '{
    "platform": "etsy",
    "title": "Handmade Ceramic Coffee Mug",
    "description": "Beautiful artisan ceramic mug perfect for your morning coffee",
    "tags": ["ceramic", "handmade", "coffee", "mug"],
    "photoScore": 85
  }'
```

**Request Schema:**
- `platform` (optional): string - Currently defaults to "etsy" (only supported platform)
- `title` (required): string - Original product title
- `description` (optional): string - Original product description
- `tags` (optional): array of strings - Current tags/keywords
- `photoScore` (optional): number (0-100) - Photo quality score (default: 75)

**Response (Success):**
```json
{
  "ok": true,
  "variant_count": 3,
  "variants": [
    {
      "title": "Handmade Ceramic Coffee Mug - Artisan Crafted for Coffee Lovers",
      "description": "Discover the perfect cup for your daily coffee ritual with this beautifully handmade ceramic mug. Each piece is carefully crafted by skilled artisans, making it a unique addition to your kitchen...",
      "tags": ["ceramic", "handmade", "coffee mug", "artisan", "handcrafted", "unique", "coffee", "kitchenware", "mug", "pottery", "handmade ceramic", "coffee lovers", "gift"],
      "copyScore": 94
    },
    {
      "title": "Artisan Ceramic Coffee Mug - Handcrafted & Unique for Your Morning Brew",
      "description": "Start your day with this stunning handmade ceramic coffee mug that brings warmth and authenticity to your coffee experience. Crafted with love and attention to detail by talented artisans...",
      "tags": ["artisan", "ceramic mug", "handcrafted", "morning coffee", "unique", "handmade", "coffee", "pottery", "breakfast", "cozy", "authentic", "skilled craft", "ritual"],
      "copyScore": 91
    },
    {
      "title": "Handcrafted Ceramic Mug - Perfect Size for Coffee, Tea & Hot Chocolate",
      "description": "This beautifully made ceramic mug is perfect for coffee, tea, or hot chocolate. Each mug is individually shaped by hand, ensuring no two are exactly alike. Made from high-quality clay and fired to perfection...",
      "tags": ["handcrafted", "ceramic", "coffee mug", "tea mug", "hot chocolate", "individual", "unique", "handmade", "high quality", "perfect size", "clay", "fired", "handmade pottery"],
      "copyScore": 89
    }
  ],
  "healthScore": 88,
  "rationale": "Optimized for Etsy with focus on handmade qualities, craftsmanship, and emotional connection. Each variant emphasizes different aspects (artisan quality, morning ritual, versatility) while highlighting the unique, handcrafted nature that Etsy buyers value.",
  "metadata": {
    "model": "gpt-4o-mini",
    "platform": "etsy",
    "originalTitle": "Handmade Ceramic Coffee Mug",
    "photoScore": 85,
    "avgCopyScore": 91,
    "requestId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
  }
}
```

**Algorithm Blueprint Implementation:**
- ✅ Accepts: platform, title, description, tags, photoScore
- ✅ Validates input with Zod
- ✅ Calls OpenAI GPT-4o-mini with platform-specific prompts
- ✅ Returns 3 optimized variants
- ✅ Each variant has: title, description, 13 tags, copyScore (0-100)
- ✅ Calculates healthScore = 0.6 * avg(copyScore) + 0.4 * photoScore
- ✅ Returns rationale explaining optimization strategy

**Response (Validation Error):**
```json
{
  "ok": false,
  "error": {
    "code": "validation_error",
    "message": "Invalid input parameters",
    "details": [
      {
        "code": "invalid_type",
        "expected": "string",
        "path": ["title"],
        "message": "Invalid input: expected string, received undefined"
      }
    ],
    "requestId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
  }
}
```

**Response (OpenAI Error - No API Key):**
```json
{
  "ok": false,
  "error": {
    "code": "missing_api_key",
    "message": "OpenAI API key not configured",
    "requestId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
  }
}
```

**Response (OpenAI Error - Invalid API Key):**
```json
{
  "ok": false,
  "error": {
    "code": "invalid_api_key",
    "message": "401 Incorrect API key provided: sk-....",
    "requestId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
  }
}
```

### POST /api/image/analyze

Analyzes image quality (placeholder - ready for AI vision integration).

**Request:**
```bash
curl -X POST http://localhost:3000/api/image/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "imageUrl": "https://example.com/product-image.jpg"
  }'
```

**Response:**
```json
{
  "ok": true,
  "score": 82
}
```

## Test UI

Visit **http://localhost:3000/test** for an interactive testing interface with:
- Platform dropdown (currently Etsy only)
- Form inputs for title, description, tags, and photo score
- Real-time response display with variant cards
- Health score visualization
- Raw JSON viewer for debugging

## Current Configuration

🎯 **Platform Focus**: **Etsy Only**
- Platform defaults to "etsy" automatically
- AI prompts optimized for Etsy's handmade/craft marketplace
- Emphasizes uniqueness, craftsmanship, and personal touch

## Testing Status

✅ **GET /api/optimize**: Health check endpoint working
✅ **POST /api/optimize**: Full OpenAI integration
✅ **Zod Validation**: Input validation with detailed error responses
✅ **Request ID Tracking**: Every request gets a UUID for logging/debugging
✅ **Error Handling**: Structured error responses with codes and request IDs
✅ **Algorithm Blueprint**: healthScore = 0.6 * avgCopyScore + 0.4 * photoScore
✅ **Test UI**: Interactive form at /test
✅ **Logging**: Console logs with request IDs for debugging

## Server Logging

All requests include request ID tracking:
```
[a1b2c3d4-e5f6-7890] Processing optimization request...
[a1b2c3d4-e5f6-7890] Input validated: platform=etsy, title="Handmade Ceramic Coffee Mug...", photoScore=85
[a1b2c3d4-e5f6-7890] Calling OpenAI API with model gpt-4o-mini...
[a1b2c3d4-e5f6-7890] OpenAI API call successful
[a1b2c3d4-e5f6-7890] Optimization complete: 3 variants, healthScore=88
```

## Next Steps

1. ✅ Add OpenAI API key to `.env.local`
2. ✅ Test with real API calls using /test UI
3. Implement image analysis with OpenAI Vision
4. Connect to Prisma database for saving optimizations
5. Add authentication with NextAuth
6. Implement credit system with Stripe
7. Add support for additional platforms (Shopify, eBay, Amazon)


