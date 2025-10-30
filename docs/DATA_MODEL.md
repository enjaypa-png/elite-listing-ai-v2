# Elite Listing AI - Data Model Documentation

**Version:** 2.0  
**Last Updated:** January 2025  
**Database:** PostgreSQL (via Supabase)

---

## Overview

This document describes the complete database schema for Elite Listing AI, including all tables, relationships, indexes, and constraints.

**Database Type:** PostgreSQL 15+  
**ORM:** Prisma 6.18.0  
**Migrations:** Managed by Prisma Migrate

---

## Entity Relationship Diagram

```
┌──────────────┐
│    User      │
│──────────────│
│ id (PK)      │◄─────┐
│ email        │      │
│ password     │      │ One-to-Many
│ name         │      │
│ emailVerified│      │
└──────────────┘      │
       ▲              │
       │              │
       │ One-to-Many  │
       │              │
┌──────┴───────┐  ┌───┴──────────────┐
│    Shop      │  │  CreditLedger    │
│──────────────│  │──────────────────│
│ id (PK)      │  │ id (PK)          │
│ userId (FK)  │  │ userId (FK)      │
│ platform     │  │ amount           │
│ shopName     │  │ balance          │
│ accessToken  │  │ type             │
└──────────────┘  │ referenceId      │
       ▲          └──────────────────┘
       │
       │ One-to-Many
       │
┌──────┴───────┐
│   Listing    │
│──────────────│
│ id (PK)      │◄─────┐
│ shopId (FK)  │      │
│ title        │      │ One-to-Many
│ description  │      │
│ price        │      │
│ tags         │      │
│ imageUrls    │      │
└──────────────┘      │
       ▲              │
       │              │
       │ One-to-Many  │
       │              │
┌──────┴────────┐  ┌──┴────────────┐
│ PhotoScore    │  │ Optimization  │
│───────────────│  │───────────────│
│ id (PK)       │  │ id (PK)       │
│ listingId (FK)│  │ listingId (FK)│
│ imageUrl      │  │ userId        │
│ overallScore  │  │ type          │
│ analysis      │  │ status        │
└───────────────┘  │ result        │
                   └───────────────┘
                          ▲
                          │
                          │ One-to-Many
                          │
                   ┌──────┴──────────────┐
                   │ OptimizationVariant │
                   │─────────────────────│
                   │ id (PK)             │
                   │ optimizationId (FK) │
                   │ variantNumber       │
                   │ title               │
                   │ description         │
                   │ tags                │
                   └─────────────────────┘
```

---

## Tables

### 1. users

**Description:** Core user accounts with authentication credentials.

**Prisma Model:** `User`

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | String (cuid) | No | cuid() | Primary key, user identifier |
| email | String | No | - | Unique email address (username) |
| password | String | No | - | Bcrypt hashed password (min 8 chars) |
| name | String | No | - | User's full name (max 80 chars) |
| emailVerified | DateTime | Yes | null | Timestamp when email was verified |
| image | String | Yes | null | Profile picture URL (optional) |
| createdAt | DateTime | No | now() | Account creation timestamp |
| updatedAt | DateTime | No | updatedAt | Last update timestamp |

**Indexes:**
- Primary key: `id`
- Unique: `email`
- Index: `createdAt` (for analytics)

**Relationships:**
- One-to-many: `shops` (User can have multiple Etsy/Shopify shops)
- One-to-many: `creditLedgers` (Transaction history)

**Constraints:**
- Email must be valid format (validated by Supabase + Zod)
- Password must be hashed with bcrypt (cost factor 10)
- Name required (cannot be null after migration)

**RLS (Row Level Security):**
- Users can only SELECT/UPDATE their own record
- Admin role can SELECT all (for support)
- No DELETE (soft delete via status field in future)

---

### 2. shops

**Description:** Connected e-commerce shops (Etsy, Shopify, etc.) with OAuth tokens.

**Prisma Model:** `Shop`

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | String (cuid) | No | cuid() | Primary key |
| userId | String | No | - | Foreign key to users table |
| platform | String | No | - | Platform name: "ETSY", "SHOPIFY", etc. |
| platformShopId | String | No | - | Shop ID from platform (e.g., Etsy shop ID) |
| shopName | String | No | - | Display name of shop |
| shopUrl | String | Yes | null | Public URL to shop |
| accessToken | String | No | - | OAuth access token (encrypted at rest) |
| refreshToken | String | Yes | null | OAuth refresh token (encrypted) |
| tokenExpiresAt | DateTime | Yes | null | Token expiration timestamp |
| isActive | Boolean | No | true | Whether shop connection is active |
| createdAt | DateTime | No | now() | Shop connected timestamp |
| updatedAt | DateTime | No | updatedAt | Last sync timestamp |

**Indexes:**
- Primary key: `id`
- Composite unique: `(userId, platform, platformShopId)` (prevent duplicate connections)
- Index: `userId` (for user's shops lookup)
- Index: `tokenExpiresAt` (for token refresh jobs)

**Relationships:**
- Many-to-one: `user` (Shop belongs to one user)
- One-to-many: `listings` (Shop has many listings)

**Constraints:**
- Cascade delete: If user deleted, delete all shops
- Platform must be uppercase enum

**RLS:**
- Users can only SELECT/UPDATE/DELETE their own shops
- No cross-user shop access

**Security:**
- Access tokens should be encrypted using AES-256-GCM (future enhancement)
- Tokens never returned in API responses (masked)

---

### 3. listings

**Description:** Product listings imported from connected shops.

**Prisma Model:** `Listing`

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | String (cuid) | No | cuid() | Primary key |
| shopId | String | No | - | Foreign key to shops table |
| platformListingId | String | No | - | Listing ID from platform |
| title | String | No | - | Product title |
| description | String | No | - | Product description (supports Markdown) |
| price | Float | No | - | Product price |
| currency | String | No | "USD" | Currency code (ISO 4217) |
| quantity | Int | No | 0 | Available quantity |
| status | String | No | - | Listing status: "active", "draft", "sold_out" |
| url | String | Yes | null | Public URL to listing |
| imageUrls | JSON | No | [] | Array of image URLs |
| tags | JSON | No | [] | Array of tags/keywords |
| lastSyncedAt | DateTime | No | now() | Last sync with platform |
| createdAt | DateTime | No | now() | Listing import timestamp |
| updatedAt | DateTime | No | updatedAt | Last update timestamp |

**Indexes:**
- Primary key: `id`
- Composite unique: `(shopId, platformListingId)` (prevent duplicates)
- Index: `shopId` (for shop's listings)
- Index: `status` (for filtering active listings)
- Index: `lastSyncedAt` (for sync jobs)

**Relationships:**
- Many-to-one: `shop` (Listing belongs to one shop)
- One-to-many: `optimizations` (Optimization history)
- One-to-many: `photoScores` (Image analysis results)

**Constraints:**
- Cascade delete: If shop deleted, delete all listings
- Price must be positive
- Currency must be valid ISO code

**RLS:**
- Users can only access listings from their own shops
- Enforced via shop ownership check

**JSON Fields:**
```typescript
// imageUrls format
[
  "https://example.com/image1.jpg",
  "https://example.com/image2.jpg"
]

// tags format
[
  "handmade",
  "leather wallet",
  "gift for him"
]
```

---

### 4. optimizations

**Description:** AI optimization requests and results.

**Prisma Model:** `Optimization`

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | String (cuid) | No | cuid() | Primary key |
| listingId | String | Yes | null | Foreign key to listings (null for standalone) |
| userId | String | No | - | User who requested optimization |
| type | String | No | - | Optimization type: "title", "description", "full", "photos" |
| status | String | No | "pending" | Status: "pending", "processing", "completed", "failed" |
| creditsUsed | Int | No | 0 | Credits consumed |
| aiModel | String | Yes | null | AI model used (e.g., "gpt-4", "claude-3") |
| prompt | String | Yes | null | Prompt sent to AI (for debugging) |
| originalContent | JSON | Yes | null | Original content before optimization |
| result | JSON | Yes | null | Full optimization result |
| errorMessage | String | Yes | null | Error message if failed |
| createdAt | DateTime | No | now() | Request timestamp |
| updatedAt | DateTime | No | updatedAt | Last update timestamp |
| completedAt | DateTime | Yes | null | Completion timestamp |

**Indexes:**
- Primary key: `id`
- Index: `userId, createdAt DESC` (for user's optimization history)
- Index: `listingId` (for listing's optimization history)
- Index: `status, createdAt` (for job queue)

**Relationships:**
- Many-to-one: `listing` (optional, can be standalone)
- One-to-many: `variants` (3 variants per optimization)

**Constraints:**
- Cascade delete: If listing deleted, delete optimizations
- Credits used must be non-negative

**RLS:**
- Users can only access their own optimizations
- Filter: `userId = auth.uid()`

**JSON Fields:**
```typescript
// originalContent format
{
  "title": "Original Title",
  "description": "Original Description",
  "tags": ["tag1", "tag2"]
}

// result format
{
  "overallScore": 94,
  "healthIndex": 92,
  "ctrPrediction": 8.5,
  "conversionProbability": 12.3,
  "recommendations": ["...", "..."]
}
```

---

### 5. optimization_variants

**Description:** Individual optimization variants (3 per optimization).

**Prisma Model:** `OptimizationVariant`

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | String (cuid) | No | cuid() | Primary key |
| optimizationId | String | No | - | Foreign key to optimizations table |
| variantNumber | Int | No | - | Variant number (1, 2, or 3) |
| title | String | Yes | null | Optimized title |
| description | String | Yes | null | Optimized description |
| tags | JSON | No | [] | Array of optimized tags (exactly 13) |
| score | Float | Yes | null | AI confidence score (0-100) |
| reasoning | String | Yes | null | AI explanation of changes |
| metadata | JSON | Yes | null | Additional variant data |
| isSelected | Boolean | No | false | Whether user selected this variant |
| createdAt | DateTime | No | now() | Variant creation timestamp |

**Indexes:**
- Primary key: `id`
- Composite unique: `(optimizationId, variantNumber)` (prevent duplicates)
- Index: `optimizationId` (for fetching variants)

**Relationships:**
- Many-to-one: `optimization` (Variant belongs to one optimization)

**Constraints:**
- Cascade delete: If optimization deleted, delete variants
- Variant number must be 1, 2, or 3

**RLS:**
- Inherited from optimization (via join)
- Users can only access variants of their optimizations

---

### 6. photo_scores

**Description:** AI image analysis results.

**Prisma Model:** `PhotoScore`

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | String (cuid) | No | cuid() | Primary key |
| listingId | String | No | - | Foreign key to listings table |
| imageUrl | String | No | - | URL of analyzed image |
| overallScore | Float | No | - | Overall image quality score (0-100) |
| compositionScore | Float | Yes | null | Composition score |
| lightingScore | Float | Yes | null | Lighting score |
| clarityScore | Float | Yes | null | Clarity/sharpness score |
| backgroundScore | Float | Yes | null | Background quality score |
| analysis | JSON | Yes | null | Detailed AI analysis |
| suggestions | JSON | No | [] | Array of improvement suggestions |
| createdAt | DateTime | No | now() | Analysis timestamp |

**Indexes:**
- Primary key: `id`
- Index: `listingId` (for listing's photo scores)
- Index: `createdAt DESC` (for recent analyses)

**Relationships:**
- Many-to-one: `listing` (Photo score belongs to one listing)

**Constraints:**
- Cascade delete: If listing deleted, delete photo scores
- Scores must be 0-100

**RLS:**
- Users can only access photo scores of their own listings
- Enforced via listing ownership

**JSON Fields:**
```typescript
// analysis format
{
  "productFocus": 88,
  "professionalAppeal": 92,
  "technicalQuality": {
    "resolution": "High",
    "format": "JPEG",
    "fileSize": "450 KB"
  },
  "compliance": {
    "etsy": true,
    "issues": []
  }
}

// suggestions format
[
  "Consider adding more natural lighting",
  "Product could be more centered",
  "Background is slightly distracting"
]
```

---

### 7. credit_ledgers

**Description:** Transaction log for credit system (double-entry accounting).

**Prisma Model:** `CreditLedger`

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | String (cuid) | No | cuid() | Primary key |
| userId | String | No | - | Foreign key to users table |
| amount | Int | No | - | Credit amount (positive = add, negative = deduct) |
| balance | Int | No | - | Running balance after this transaction |
| type | String | No | - | Transaction type: "purchase", "usage", "refund", "bonus" |
| description | String | Yes | null | Human-readable description |
| referenceId | String | Yes | null | Reference to related entity (optimization ID, etc.) |
| referenceType | String | Yes | null | Type of reference: "optimization", "purchase", etc. |
| stripePaymentId | String | Yes | null | Stripe payment intent ID (for purchases) |
| metadata | JSON | Yes | null | Additional transaction data |
| createdAt | DateTime | No | now() | Transaction timestamp |

**Indexes:**
- Primary key: `id`
- Composite index: `(userId, createdAt DESC)` (for user's transaction history)
- Index: `referenceId` (for finding related transactions)
- Index: `stripePaymentId` (for payment lookups)

**Relationships:**
- Many-to-one: `user` (Ledger entry belongs to one user)

**Constraints:**
- Cascade delete: NO (preserve financial records)
- Balance must be non-negative after each transaction

**RLS:**
- Users can only SELECT their own ledger entries
- No UPDATE or DELETE (immutable)
- Only backend (service role) can INSERT

**Transaction Types:**
- `purchase`: Credits bought via Stripe
- `usage`: Credits used for optimization
- `refund`: Credits refunded (payment reversed)
- `bonus`: Free credits (referral, promo)

**Example Transactions:**
```sql
-- User purchases 50 credits for $39
INSERT INTO credit_ledgers (userId, amount, balance, type, stripePaymentId)
VALUES ('user_123', 50, 50, 'purchase', 'pi_xxx');

-- User uses 1 credit for optimization
INSERT INTO credit_ledgers (userId, amount, balance, type, referenceId, referenceType)
VALUES ('user_123', -1, 49, 'usage', 'opt_xyz', 'optimization');

-- User gets 3 bonus credits
INSERT INTO credit_ledgers (userId, amount, balance, type, description)
VALUES ('user_123', 3, 52, 'bonus', 'Referral bonus');
```

---

## Indexes Summary

### Performance-Critical Indexes

1. **User lookups:** `users.email` (unique)
2. **Shop ownership:** `shops.userId`
3. **Listing queries:** `listings.shopId`, `listings.status`
4. **Optimization history:** `optimizations.userId, optimizations.createdAt DESC`
5. **Credit balance:** `credit_ledgers.userId, credit_ledgers.createdAt DESC`

### Composite Indexes

1. `shops(userId, platform, platformShopId)` - Prevent duplicate connections
2. `listings(shopId, platformListingId)` - Prevent duplicate imports
3. `optimization_variants(optimizationId, variantNumber)` - Unique variants
4. `credit_ledgers(userId, createdAt)` - Transaction history pagination

---

## Data Integrity

### Foreign Key Constraints

All foreign keys use `CASCADE` on delete except:
- `credit_ledgers` - No cascade (preserve financial records)

### Unique Constraints

- `users.email` - One account per email
- `shops(userId, platform, platformShopId)` - One connection per shop
- `listings(shopId, platformListingId)` - One record per platform listing
- `optimization_variants(optimizationId, variantNumber)` - Exactly 3 variants

### Check Constraints (PostgreSQL)

```sql
-- Price must be positive
ALTER TABLE listings ADD CONSTRAINT price_positive CHECK (price > 0);

-- Scores must be 0-100
ALTER TABLE photo_scores ADD CONSTRAINT score_range CHECK (overallScore BETWEEN 0 AND 100);

-- Credits balance cannot be negative
ALTER TABLE credit_ledgers ADD CONSTRAINT balance_non_negative CHECK (balance >= 0);

-- Variant number must be 1, 2, or 3
ALTER TABLE optimization_variants ADD CONSTRAINT variant_number_range CHECK (variantNumber BETWEEN 1 AND 3);
```

---

## Migration Strategy

### From SQLite (Current) to PostgreSQL (Target)

1. **Update Prisma Schema:**
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```

2. **Create Initial Migration:**
   ```bash
   npx prisma migrate dev --name init_postgresql
   ```

3. **Data Migration (if needed):**
   ```bash
   # Export from SQLite
   npx prisma db pull
   
   # Transform to PostgreSQL compatible SQL
   # (Manual script or tool like pgLoader)
   
   # Import to PostgreSQL
   psql $DATABASE_URL < export.sql
   ```

4. **Verify Migration:**
   ```bash
   npx prisma db pull
   npx prisma generate
   npm run dev
   ```

---

## Seed Data

### Demo User (Development)

```typescript
// prisma/seed.ts
const demoUser = await prisma.user.create({
  data: {
    email: 'demo@elite-listing-ai.com',
    password: await bcrypt.hash('Demo123!', 10),
    name: 'Demo User',
    emailVerified: new Date(),
    creditLedgers: {
      create: {
        amount: 10,
        balance: 10,
        type: 'bonus',
        description: 'Welcome bonus'
      }
    }
  }
});
```

---

## Database Maintenance

### Backup Strategy

- **Frequency:** Daily automated backups (Supabase handles this)
- **Retention:** 7 days for free tier, 30 days for paid
- **Manual Backup:** 
  ```bash
  pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql
  ```

### Cleanup Jobs

- **Old Optimizations:** Archive optimizations older than 90 days
- **Expired Tokens:** Delete shops with expired tokens (>30 days)
- **Orphaned Records:** Clean up listings with deleted shops

---

**Last Updated:** January 2025  
**Next Review:** After RLS implementation
