# Elite Listing AI - API Route Table

**Version:** 2.0  
**Last Updated:** January 2025

---

## Overview

Complete reference of all API routes, their methods, authentication requirements, request/response formats, and rate limits.

---

## Authentication Routes

### POST /api/auth/signup

**Description:** Create new user account  
**Auth Required:** No  
**Rate Limit:** 5 requests/min per IP

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "name": "John Doe"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Account created. Please check your email to verify.",
  "userId": "usr_abc123"
}
```

**Errors:**
- `400` - Invalid email format
- `400` - Password too weak (min 8 chars)
- `409` - Email already exists
- `500` - Server error

---

### POST /api/auth/signin

**Description:** Login with email and password  
**Auth Required:** No  
**Rate Limit:** 5 requests/min per IP

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Logged in successfully",
  "user": {
    "id": "usr_abc123",
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

**Errors:**
- `401` - Invalid credentials (generic message)
- `403` - Email not verified
- `429` - Too many failed attempts
- `500` - Server error

---

### POST /api/auth/signout

**Description:** Logout current user  
**Auth Required:** Yes  
**Rate Limit:** 10 requests/min

**Response (200):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

### POST /api/auth/verify-email

**Description:** Verify email with token from email link  
**Auth Required:** No  
**Rate Limit:** 10 requests/min

**Request Body:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Email verified successfully"
}
```

**Errors:**
- `400` - Invalid or expired token
- `404` - User not found
- `500` - Server error

---

### POST /api/auth/reset-password

**Description:** Request password reset (sends email)  
**Auth Required:** No  
**Rate Limit:** 3 requests/min per IP

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "If email exists, reset link has been sent"
}
```

---

### POST /api/auth/update-password

**Description:** Set new password using reset token  
**Auth Required:** No  
**Rate Limit:** 5 requests/min

**Request Body:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "password": "NewSecurePass456!"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Password updated successfully"
}
```

**Errors:**
- `400` - Invalid or expired token
- `400` - Password too weak
- `500` - Server error

---

## Optimization Routes

### POST /api/optimize

**Description:** Generate 3 optimized listing variants  
**Auth Required:** Yes  
**Rate Limit:** 30 requests/hour  
**Credits:** 1 credit per request

**Request Body:**
```json
{
  "title": "Handmade Leather Wallet",
  "description": "Beautiful genuine leather wallet...",
  "category": "Accessories",
  "tags": ["leather", "wallet", "handmade"],
  "price": 45.00,
  "tone": "professional" // or "casual", "luxury"
}
```

**Response (200):**
```json
{
  "success": true,
  "optimizationId": "opt_xyz789",
  "creditsUsed": 1,
  "creditsRemaining": 49,
  "variants": [
    {
      "variantNumber": 1,
      "title": "Handcrafted Genuine Leather Wallet | Slim Bifold | Perfect Gift",
      "description": "Discover timeless style with our handcrafted leather wallet...",
      "tags": ["leather wallet", "handmade wallet", "slim wallet", ...],
      "score": 94,
      "reasoning": "Title optimized for Etsy search algorithm...",
      "copyQuality": {
        "clarity": 95,
        "readability": 92,
        "emotionalAppeal": 88,
        "keywordHarmony": 90
      },
      "healthScore": 94,
      "ctrPrediction": 8.2,
      "conversionProbability": 12.5
    },
    // variants 2 and 3...
  ]
}
```

**Errors:**
- `400` - Missing required fields
- `402` - Insufficient credits
- `429` - Rate limit exceeded
- `500` - OpenAI API error

---

### POST /api/optimize/images

**Description:** Analyze product images with AI  
**Auth Required:** Yes  
**Rate Limit:** 60 requests/hour  
**Credits:** 1 credit per image

**Request Body:**
```json
{
  "imageUrls": [
    "https://example.com/image1.jpg",
    "https://example.com/image2.jpg"
  ],
  "platform": "etsy" // or "shopify", "ebay"
}
```

**Response (200):**
```json
{
  "success": true,
  "creditsUsed": 2,
  "creditsRemaining": 47,
  "results": [
    {
      "imageUrl": "https://example.com/image1.jpg",
      "overallScore": 87,
      "scores": {
        "composition": 90,
        "lighting": 85,
        "clarity": 92,
        "background": 80,
        "productFocus": 88,
        "professionalAppeal": 85
      },
      "technicalQuality": {
        "resolution": "High (2000x2000)",
        "format": "JPEG",
        "fileSize": "450 KB",
        "aspectRatio": "1:1"
      },
      "compliance": {
        "etsy": true,
        "issues": []
      },
      "suggestions": [
        "Consider adding more natural lighting",
        "Product could be more centered",
        "Background is slightly distracting"
      ]
    },
    // more images...
  ]
}
```

**Errors:**
- `400` - Invalid image URLs
- `402` - Insufficient credits
- `429` - Rate limit exceeded
- `500` - OpenAI Vision API error

---

### POST /api/keywords/generate

**Description:** Generate optimized keywords for listing  
**Auth Required:** Yes  
**Rate Limit:** 60 requests/hour  
**Credits:** 1 credit per request

**Request Body:**
```json
{
  "title": "Handmade Leather Wallet",
  "description": "Beautiful genuine leather wallet...",
  "category": "Accessories"
}
```

**Response (200):**
```json
{
  "success": true,
  "creditsUsed": 1,
  "creditsRemaining": 46,
  "keywords": [
    {
      "keyword": "handmade leather wallet",
      "searchVolume": 12500,
      "competition": "medium",
      "intent": "purchase",
      "relevance": 98,
      "ctrPotential": 8.5
    },
    {
      "keyword": "genuine leather bifold",
      "searchVolume": 4200,
      "competition": "low",
      "intent": "purchase",
      "relevance": 92,
      "ctrPotential": 7.2
    },
    // 14+ more keywords...
  ],
  "topTags": [
    "leather wallet",
    "handmade wallet",
    "slim wallet",
    // 10 more...
  ]
}
```

**Errors:**
- `400` - Missing required fields
- `402` - Insufficient credits
- `429` - Rate limit exceeded
- `500` - OpenAI API error

---

### POST /api/seo/audit

**Description:** Comprehensive SEO audit of listing  
**Auth Required:** Yes  
**Rate Limit:** 30 requests/hour  
**Credits:** Included in optimization

**Request Body:**
```json
{
  "title": "Handmade Leather Wallet",
  "description": "Beautiful genuine leather wallet...",
  "tags": ["leather", "wallet", "handmade"],
  "platform": "etsy"
}
```

**Response (200):**
```json
{
  "success": true,
  "overallScore": 76,
  "categoryScores": {
    "title": 82,
    "description": 75,
    "tags": 70,
    "keywords": 78,
    "structure": 80,
    "metadata": 65
  },
  "issues": [
    {
      "severity": "critical",
      "category": "tags",
      "message": "Only 3 of 13 tags used",
      "impact": "Missing 77% of tag optimization potential"
    },
    {
      "severity": "warning",
      "category": "title",
      "message": "Primary keyword not in first 60 characters",
      "impact": "Reduced search visibility"
    },
    {
      "severity": "info",
      "category": "description",
      "message": "No call-to-action found",
      "impact": "May reduce conversion rate"
    }
  ],
  "recommendations": [
    "Add 10 more tags using suggested keywords",
    "Move primary keyword to beginning of title",
    "Add clear call-to-action in description",
    "Include product dimensions and materials"
  ],
  "competitiveAnalysis": {
    "estimatedRanking": "Page 3-5",
    "topCompetitorScore": 94,
    "gap": 18
  },
  "metrics": {
    "keywordDensity": 1.8,
    "readabilityScore": 72,
    "titleLength": 28,
    "descriptionLength": 245,
    "tagCount": 3
  }
}
```

**Errors:**
- `400` - Invalid input
- `429` - Rate limit exceeded
- `500` - Server error

---

## Etsy Integration Routes

### GET /api/etsy/auth

**Description:** Start Etsy OAuth flow  
**Auth Required:** Yes  
**Rate Limit:** 10 requests/min

**Response (302):**
Redirects to Etsy OAuth page

---

### GET /api/etsy/callback

**Description:** Etsy OAuth callback (handles code exchange)  
**Auth Required:** Yes  
**Rate Limit:** 10 requests/min

**Query Params:**
- `code` - OAuth authorization code
- `state` - CSRF token

**Response (302):**
Redirects to dashboard with success/error message

---

### POST /api/etsy/import

**Description:** Import listings from connected Etsy shop  
**Auth Required:** Yes  
**Rate Limit:** 5 requests/hour

**Request Body:**
```json
{
  "shopId": "shop_abc123",
  "limit": 50 // optional, default 25
}
```

**Response (200):**
```json
{
  "success": true,
  "imported": 42,
  "skipped": 8,
  "message": "42 listings imported successfully"
}
```

**Errors:**
- `400` - Invalid shop ID
- `401` - Shop not connected or token expired
- `429` - Rate limit exceeded
- `500` - Etsy API error

---

### DELETE /api/etsy/disconnect

**Description:** Disconnect Etsy shop  
**Auth Required:** Yes  
**Rate Limit:** 10 requests/min

**Request Body:**
```json
{
  "shopId": "shop_abc123"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Shop disconnected successfully"
}
```

---

## Listing Routes

### GET /api/listings

**Description:** Get user's listings (with pagination)  
**Auth Required:** Yes  
**Rate Limit:** 60 requests/min

**Query Params:**
- `page` - Page number (default: 1)
- `limit` - Results per page (default: 25, max: 100)
- `shopId` - Filter by shop (optional)

**Response (200):**
```json
{
  "success": true,
  "listings": [
    {
      "id": "lst_xyz123",
      "title": "Handmade Leather Wallet",
      "description": "Beautiful genuine leather wallet...",
      "price": 45.00,
      "currency": "USD",
      "status": "active",
      "imageUrls": ["https://..."],
      "tags": ["leather", "wallet"],
      "lastSyncedAt": "2025-01-15T10:30:00Z"
    },
    // more listings...
  ],
  "pagination": {
    "page": 1,
    "limit": 25,
    "total": 142,
    "pages": 6
  }
}
```

---

### GET /api/listings/:id

**Description:** Get single listing by ID  
**Auth Required:** Yes  
**Rate Limit:** 60 requests/min

**Response (200):**
```json
{
  "success": true,
  "listing": {
    "id": "lst_xyz123",
    "title": "Handmade Leather Wallet",
    "description": "Beautiful genuine leather wallet...",
    "price": 45.00,
    "currency": "USD",
    "quantity": 10,
    "status": "active",
    "url": "https://etsy.com/listing/123456",
    "imageUrls": ["https://..."],
    "tags": ["leather", "wallet", "handmade"],
    "shop": {
      "id": "shop_abc123",
      "shopName": "MyEtsyShop",
      "platform": "ETSY"
    },
    "optimizations": [
      {
        "id": "opt_xyz789",
        "type": "full",
        "status": "completed",
        "createdAt": "2025-01-15T10:30:00Z"
      }
    ],
    "lastSyncedAt": "2025-01-15T10:30:00Z",
    "createdAt": "2025-01-10T08:00:00Z"
  }
}
```

**Errors:**
- `404` - Listing not found
- `403` - Forbidden (not your listing)

---

## Payment Routes

### POST /api/checkout

**Description:** Create Stripe checkout session for credits  
**Auth Required:** Yes  
**Rate Limit:** 10 requests/min

**Request Body:**
```json
{
  "package": "pro" // "starter", "pro", or "business"
}
```

**Response (200):**
```json
{
  "success": true,
  "sessionId": "cs_test_abc123",
  "url": "https://checkout.stripe.com/c/pay/cs_test_abc123"
}
```

**Errors:**
- `400` - Invalid package
- `500` - Stripe error

---

### POST /api/webhooks/stripe

**Description:** Handle Stripe webhooks (payment events)  
**Auth Required:** No (signature verification)  
**Rate Limit:** None (Stripe controlled)

**Headers Required:**
- `stripe-signature` - Webhook signature

**Events Handled:**
- `checkout.session.completed` - Add credits
- `charge.refunded` - Remove credits

**Response (200):**
```json
{
  "received": true
}
```

---

## User Routes

### GET /api/user/profile

**Description:** Get current user profile  
**Auth Required:** Yes  
**Rate Limit:** 60 requests/min

**Response (200):**
```json
{
  "success": true,
  "user": {
    "id": "usr_abc123",
    "email": "user@example.com",
    "name": "John Doe",
    "emailVerified": true,
    "credits": 49,
    "createdAt": "2025-01-01T00:00:00Z"
  }
}
```

---

### GET /api/user/credits

**Description:** Get credit balance and transaction history  
**Auth Required:** Yes  
**Rate Limit:** 60 requests/min

**Response (200):**
```json
{
  "success": true,
  "balance": 49,
  "transactions": [
    {
      "id": "txn_xyz789",
      "amount": -1,
      "balance": 49,
      "type": "usage",
      "description": "Text optimization",
      "createdAt": "2025-01-15T10:30:00Z"
    },
    {
      "id": "txn_abc456",
      "amount": 50,
      "balance": 50,
      "type": "purchase",
      "description": "Pro package",
      "createdAt": "2025-01-15T10:00:00Z"
    },
    // more transactions...
  ]
}
```

---

## Health & Monitoring

### GET /healthz

**Description:** Health check endpoint  
**Auth Required:** No  
**Rate Limit:** None

**Response (200):**
```json
{
  "status": "healthy",
  "timestamp": "2025-01-15T10:30:00Z",
  "services": {
    "database": "up",
    "openai": "up",
    "stripe": "up",
    "etsy": "up"
  }
}
```

---

## Error Response Format

All errors follow this format:

```json
{
  "success": false,
  "error": {
    "code": "INSUFFICIENT_CREDITS",
    "message": "You don't have enough credits for this operation",
    "details": {
      "required": 1,
      "current": 0
    }
  }
}
```

### Common Error Codes

- `AUTH_REQUIRED` - Authentication required
- `INVALID_CREDENTIALS` - Wrong email/password
- `EMAIL_NOT_VERIFIED` - Email verification pending
- `INSUFFICIENT_CREDITS` - Not enough credits
- `RATE_LIMIT_EXCEEDED` - Too many requests
- `INVALID_INPUT` - Validation failed
- `NOT_FOUND` - Resource not found
- `FORBIDDEN` - Access denied
- `INTERNAL_ERROR` - Server error

---

**Last Updated:** January 2025  
**Next Review:** After MVP launch
