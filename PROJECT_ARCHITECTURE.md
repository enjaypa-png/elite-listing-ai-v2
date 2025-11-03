# Elite Listing AI - Project Architecture Documentation

## 🏗️ System Overview

**Elite Listing AI** is a Next.js 15 application that provides AI-powered listing optimization for Etsy sellers. The platform uses GPT-4 for text generation, OpenAI Vision for image analysis, and integrates with Stripe for payments and Supabase for authentication and data storage.

---

## 📦 Technology Stack

### Core Framework
- **Framework**: Next.js 15.5.6 (App Router)
- **React Version**: 19.1.0
- **TypeScript**: 5.9.3
- **Node.js**: Latest LTS

### Routing
- **Router**: Next.js App Router (file-based routing in `/app` directory)
- **API Routes**: Server-side API endpoints in `/app/api`
- **Pages**: Client/Server components in `/app`

### UI & Styling
- **Design System**: Custom design tokens (`/design-system/tokens.json`)
- **Theme Provider**: React Context-based (`ThemeProvider`)
- **Styling Method**: Inline styles with design tokens
- **Component Library**: Custom UI primitives (`/components/ui`)
- **Fonts**: Inter (Google Fonts)

### Database & ORM
- **Database**: PostgreSQL (Supabase hosted)
- **ORM**: Prisma 6.18.0
- **Schema Location**: `/prisma/schema.prisma`
- **Migrations**: Prisma Migrate

### Authentication
- **Provider**: Supabase Auth
- **Strategy**: Email/Password
- **Session**: Cookie-based (HTTP-only)
- **Security**: bcryptjs for password hashing

### Payments
- **Provider**: Stripe 19.1.0
- **Integration**: Stripe Checkout
- **Webhooks**: `/api/webhooks/stripe`
- **Credit System**: Double-entry ledger (`CreditLedger` model)

### AI Services
- **Text Generation**: OpenAI GPT-4 (openai@6.5.0)
- **Image Analysis**: OpenAI Vision API
- **Use Cases**: 
  - Listing title/description optimization
  - Tag generation
  - SEO audits
  - Image quality scoring

### Third-Party Integrations
- **Etsy API**: OAuth 2.0 + PKCE for shop connection
- **Analytics**: Vercel Analytics
- **Monitoring**: Sentry (error tracking), PostHog (analytics)
- **Caching**: Upstash Redis

---

## 📂 Directory Structure

```
elite-listing-ai-v2/
├── app/                          # Next.js App Router
│   ├── layout.tsx                # Root layout (ThemeProvider wrapper)
│   ├── page.tsx                  # Landing page
│   ├── api/                      # API routes
│   │   ├── auth/                 # Authentication endpoints
│   │   │   ├── signup/route.ts
│   │   │   ├── signin/route.ts
│   │   │   └── signout/route.ts
│   │   ├── optimize/             # Listing optimization
│   │   │   ├── route.ts          # Text optimization (GPT-4)
│   │   │   └── image/
│   │   │       └── analyze/route.ts  # Image analysis (Vision API)
│   │   ├── keywords/
│   │   │   └── generate/route.ts # Keyword generation
│   │   ├── seo/
│   │   │   └── audit/route.ts    # SEO audit
│   │   ├── checkout/route.ts     # Stripe checkout session
│   │   ├── webhooks/
│   │   │   └── stripe/route.ts   # Stripe webhook handler
│   │   ├── user/
│   │   │   ├── profile/route.ts  # User profile
│   │   │   └── credits/route.ts  # Credit balance
│   │   ├── listings/route.ts     # Listing CRUD
│   │   └── etsy/                 # Etsy integration
│   │       ├── connect/route.ts  # Initiate OAuth
│   │       ├── callback/route.ts # OAuth callback
│   │       ├── import/route.ts   # Import listings
│   │       ├── sync/route.ts     # Sync listings
│   │       └── disconnect/route.ts
│   ├── auth/                     # Auth pages
│   │   ├── signin/page.tsx
│   │   └── signup/page.tsx
│   ├── dashboard/page.tsx        # User dashboard
│   ├── analyze/page.tsx          # Image analysis UI
│   └── test/page.tsx             # Testing page
│
├── components/                   # Reusable components
│   ├── ui/                       # UI primitives (design system)
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Card.tsx
│   │   ├── Modal.tsx
│   │   ├── Navbar.tsx
│   │   ├── Footer.tsx
│   │   ├── Container.tsx
│   │   ├── Alert.tsx
│   │   └── index.ts
│   ├── Button.tsx                # Legacy (to be removed)
│   └── Logo.tsx
│
├── design-system/                # Design tokens & theme
│   ├── tokens.json               # Color, typography, spacing
│   └── theme-provider.tsx        # React Context provider
│
├── lib/                          # Utility libraries
│   ├── supabase.ts               # Supabase client config
│   ├── auth-helpers.ts           # Auth utility functions
│   ├── auth-simple.ts            # Simplified auth
│   ├── prisma.ts                 # Prisma client singleton
│   ├── openai.ts                 # OpenAI client config
│   ├── stripe.ts                 # Stripe helper functions
│   ├── etsy-oauth.ts             # Etsy OAuth utilities
│   └── etsy-api.ts               # Etsy API client
│
├── prisma/                       # Database schema
│   └── schema.prisma             # Prisma schema definition
│
├── public/                       # Static assets
│   ├── logo.png                  # App logo
│   └── favicon.ico
│
├── types/                        # TypeScript types
│   └── next-auth.d.ts
│
├── .env.local                    # Environment variables (local)
├── package.json                  # Dependencies
├── tsconfig.json                 # TypeScript config
├── next.config.js                # Next.js config
└── tailwind.config.js            # Tailwind config
```

---

## 🔐 Authentication Flow

### Architecture
```
User → Sign Up/Sign In Page → API Route → Supabase Auth → Database → Session Cookie
```

### Components
1. **Client Pages**:
   - `/app/auth/signup/page.tsx` - Registration form
   - `/app/auth/signin/page.tsx` - Login form

2. **API Routes**:
   - `POST /api/auth/signup` - Create user account
   - `POST /api/auth/signin` - Authenticate user
   - `POST /api/auth/signout` - Clear session

3. **Libraries**:
   - `/lib/auth-helpers.ts` - `signUp()`, `signIn()`, `getCurrentUser()`
   - `/lib/supabase.ts` - Supabase client instances

### Flow Diagram
```
┌─────────────┐
│   Browser   │
└──────┬──────┘
       │ 1. Submit credentials
       ▼
┌─────────────────────┐
│  /auth/signin/page  │
└──────┬──────────────┘
       │ 2. POST to API
       ▼
┌──────────────────────┐
│ /api/auth/signin     │
│ - Validate input     │
│ - Call Supabase Auth │
└──────┬───────────────┘
       │ 3. Authenticate
       ▼
┌──────────────────────┐
│   Supabase Auth      │
│ - Verify password    │
│ - Create session     │
└──────┬───────────────┘
       │ 4. Return JWT
       ▼
┌──────────────────────┐
│  Set HTTP-only       │
│  session cookie      │
└──────┬───────────────┘
       │ 5. Redirect
       ▼
┌──────────────────────┐
│    /dashboard        │
└──────────────────────┘
```

### Security Features
- ✅ Password hashing with bcryptjs
- ✅ HTTP-only session cookies
- ✅ Email verification support
- ✅ CSRF protection (Next.js built-in)
- ✅ Rate limiting (can be added via middleware)

---

## 💳 Stripe Payment Integration

### Architecture
```
User → Checkout Button → Create Session → Stripe Checkout → Webhook → Add Credits
```

### Components
1. **Client**:
   - Dashboard "Buy Credits" buttons
   - Package selection UI

2. **API Routes**:
   - `POST /api/checkout` - Create Stripe checkout session
   - `GET /api/checkout` - Get credit packages info
   - `POST /api/webhooks/stripe` - Handle payment events

3. **Library**:
   - `/lib/stripe.ts` - Helper functions:
     - `createCheckoutSession()`
     - `createCustomer()`
     - `createRefund()`

### Credit Packages
```typescript
const CREDIT_PACKAGES = {
  starter: {
    credits: 10,
    price: 900,  // $9.00 in cents
    name: 'Starter'
  },
  pro: {
    credits: 50,
    price: 3900, // $39.00 (13% savings)
    name: 'Pro'
  },
  business: {
    credits: 200,
    price: 12900, // $129.00 (19% savings)
    name: 'Business'
  }
}
```

### Payment Flow
```
┌─────────────┐
│  Dashboard  │
└──────┬──────┘
       │ 1. Click "Purchase"
       ▼
┌─────────────────────┐
│ POST /api/checkout  │
│ - Package selection │
│ - User info         │
└──────┬──────────────┘
       │ 2. Create session
       ▼
┌─────────────────────┐
│  Stripe Checkout    │
│ - Payment form      │
│ - Card processing   │
└──────┬──────────────┘
       │ 3. Payment success
       ▼
┌─────────────────────────┐
│  Stripe Webhook         │
│  /api/webhooks/stripe   │
│  - Verify signature     │
│  - Process event        │
└──────┬──────────────────┘
       │ 4. checkout.session.completed
       ▼
┌─────────────────────────┐
│  Add Credits            │
│  - Check idempotency    │
│  - Update CreditLedger  │
│  - Calculate balance    │
└──────┬──────────────────┘
       │ 5. Credits available
       ▼
┌─────────────────────────┐
│  User Dashboard         │
│  Updated balance shown  │
└─────────────────────────┘
```

### Database Integration
**Credit Ledger Table** (Double-Entry Accounting):
```typescript
{
  userId: string,
  amount: number,        // +10 for purchase, -1 for usage
  balance: number,       // Running balance
  type: "purchase" | "usage" | "refund" | "bonus",
  description: string,   // "Pro package - 50 credits"
  referenceId: string,   // Stripe session ID
  stripePaymentId: string,
  metadata: { sessionId, packageType, amountPaid }
}
```

---

## 🗄️ Supabase Integration

### Purpose
- Authentication (email/password)
- PostgreSQL database hosting
- Row Level Security (RLS) policies

### Configuration Files
- `/lib/supabase.ts` - Client instances
- `/prisma/schema.prisma` - Database schema
- `/supabase/rls_policies.sql` - Security policies (created in Phase 2)

### Database Models (7 tables)
1. **users** - User accounts
2. **shops** - Connected Etsy shops
3. **listings** - Imported product listings
4. **optimizations** - Optimization requests
5. **optimization_variants** - Generated variants (1, 2, 3)
6. **photo_scores** - Image analysis results
7. **credit_ledgers** - Credit transactions

### Supabase Client Types
```typescript
// Client-side (browser) - RLS enforced
const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
)

// Server-side (API routes) - Bypasses RLS
const supabaseAdmin = createClient(
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false } }
)
```

### Key Functions
- `getCurrentUser()` - Get authenticated user
- `signUp()` - Register new user
- `signIn()` - Authenticate user
- `signOut()` - Clear session

---

## 🖼️ Image Scoring System

### Architecture
```
User → Upload Image → OpenAI Vision API → Analysis → Score → Suggestions
```

### API Route
**`POST /api/optimize/image/analyze`**

Location: `/app/api/optimize/image/analyze/route.ts`

### Flow
```typescript
1. Receive image URL + platform (Etsy/Shopify/eBay)
2. Deduct 1 credit from user balance
3. Call OpenAI Vision API with:
   - Image URL
   - Structured prompt for scoring
   - Platform-specific requirements
4. Parse AI response:
   - Overall score (0-100)
   - 9 individual metrics
   - Detailed suggestions
5. Save to PhotoScore table
6. Return results to client
```

### Scoring Metrics (9 dimensions)
```typescript
{
  lighting: number,          // 0-100
  composition: number,       // 0-100
  clarity: number,           // 0-100
  productDominance: number,  // 0-100
  backgroundQuality: number, // 0-100
  colorBalance: number,      // 0-100
  technicalCompliance: number, // Platform requirements
  algorithmFit: number,      // Platform algorithm preferences
  visualAppeal: number       // Emotional appeal
}
```

### Weighted Score Calculation
```
Overall Score = (
  40% Technical Quality (clarity, lighting, composition)
+ 30% Algorithm Fit (platform-specific)
+ 20% Visual Appeal (aesthetics)
+ 10% Conversion Factors (product dominance, background)
)
```

### Platform-Specific Requirements
- **Etsy**: Lifestyle imagery, warm tones, handmade feel
- **Shopify**: Clean backgrounds, product-focused
- **eBay**: Multiple angles, detailed shots

### Database Storage
**PhotoScore Model**:
```prisma
model PhotoScore {
  id              String   @id @default(cuid())
  listingId       String
  imageUrl        String
  overallScore    Float    // 0-100
  compositionScore Float?
  lightingScore   Float?
  clarityScore    Float?
  backgroundScore Float?
  analysis        Json?    // Full AI response
  suggestions     Json     // Improvement tips
  createdAt       DateTime @default(now())
}
```

---

## 🤖 Major Modules

### 1. Listing Optimizer Module

**Purpose**: Generate optimized titles, descriptions, and tags using GPT-4

**API Route**: `POST /api/optimize`

**Location**: `/app/api/optimize/route.ts`

**Input**:
```typescript
{
  platform: "etsy" | "shopify" | "ebay",
  title: string,
  description: string,
  tags: string[],
  tone: "persuasive" | "minimalist" | "luxury" | "seo-heavy"
}
```

**Process**:
1. Validate input (Zod schema)
2. Check user credits (1 credit per optimization)
3. Build GPT-4 prompt with:
   - Platform-specific rules (Etsy: 140 char titles, 13 tags)
   - Tone preferences
   - SEO best practices
4. Call OpenAI API (3 separate calls for 3 variants)
5. Parse responses into structured variants
6. Calculate health scores for each variant
7. Save to Optimization + OptimizationVariant tables
8. Deduct credit from user balance
9. Return 3 variants with scores

**Output** (per variant):
```typescript
{
  variantNumber: 1 | 2 | 3,
  title: string,           // Optimized title (≤140 chars for Etsy)
  description: string,     // Optimized description (150-300 words)
  tags: string[],          // 13 tags for Etsy
  copyScore: number,       // 0-100 (writing quality)
  ctrProbability: number,  // 0-100 (click-through rate estimate)
  conversionProbability: number, // 0-100 (purchase probability)
  reasoning: string        // AI's explanation
}
```

**Health Score Formula**:
```
Health Score = (
  40% SEO Quality
+ 30% Engagement Potential (CTR)
+ 20% Competitive Strength
+ 10% Compliance (platform rules)
)
```

---

### 2. Dashboard Module

**Purpose**: User home page with stats, quick actions, and credit management

**Page**: `/app/dashboard/page.tsx`

**Components**:
- Header (logo, email, sign out)
- Stats cards:
  - Available credits
  - Total optimizations
  - Account status
- Quick action buttons:
  - Optimize Listing
  - Analyze Images
  - Generate Keywords
  - SEO Audit

**Data Fetching**:
- `GET /api/user/profile` - User info + credit balance
- Real-time credit balance updates

**State Management**:
```typescript
const [user, setUser] = useState<User | null>(null)
const [loading, setLoading] = useState(true)
const [error, setError] = useState('')
```

---

### 3. Auth Module

**Purpose**: User registration, login, and session management

**Pages**:
- `/app/auth/signin/page.tsx` - Login form
- `/app/auth/signup/page.tsx` - Registration form

**API Routes**:
- `POST /api/auth/signup` - Create account
  - Validate email/password
  - Hash password with bcryptjs
  - Create user in Supabase Auth
  - Create user record in database
  - Give 10 free credits (welcome bonus)
  
- `POST /api/auth/signin` - Login
  - Validate credentials
  - Check Supabase Auth
  - Set session cookie
  - Return user data

- `POST /api/auth/signout` - Logout
  - Clear session cookie
  - Redirect to landing page

**Form Validation**:
- Email: Must be valid email format
- Password: Min 8 characters, complexity requirements
- Name: Required for signup

---

### 4. SEO Audit Module

**Purpose**: Analyze listing SEO and provide actionable recommendations

**API Route**: `POST /api/seo/audit`

**Location**: `/app/api/seo/audit/route.ts`

**Input**:
```typescript
{
  platform: "etsy" | "shopify" | "ebay",
  title: string,
  description: string,
  tags: string,  // Comma-separated
  images?: string[]
}
```

**Analysis Categories**:
1. **Title Optimization** (0-100):
   - Length (ideal: 100-140 chars for Etsy)
   - Keyword placement
   - Keyword density
   - Emotional triggers
   
2. **Description Quality** (0-100):
   - Length (ideal: 150-300 words)
   - Readability (Flesch score)
   - Keyword usage
   - Structure (bullets, headers)
   
3. **Tags/Keywords** (0-100):
   - Relevance
   - Search volume estimates
   - Competition level
   - Long-tail keywords
   
4. **Metadata** (0-100):
   - Alt text presence
   - Schema markup (if applicable)
   - Meta descriptions

**Issue Detection**:
```typescript
{
  type: "critical" | "warning" | "info",
  category: "title" | "description" | "tags" | "structure",
  message: string,
  suggestion: string,
  priority: number
}
```

**Output**:
```typescript
{
  overallScore: number,  // 0-100
  categoryScores: {
    title: number,
    description: number,
    tags: number,
    keywords: number,
    structure: number,
    metadata: number
  },
  issues: Issue[],
  recommendations: string[],
  competitiveAnalysis: {
    marketPosition: "strong" | "average" | "weak",
    differentiators: string[]
  }
}
```

---

### 5. Keyword Generator Module

**Purpose**: Generate relevant keywords with search volume and competition data

**API Route**: `POST /api/keywords/generate`

**Location**: `/app/api/keywords/generate/route.ts`

**Input**:
```typescript
{
  title: string,
  description: string,
  category: string  // Product category
}
```

**Process**:
1. Extract keywords from title/description using NLP
2. Call GPT-4 to generate related keywords
3. Classify keywords by intent:
   - Purchase intent ("buy", "shop")
   - Discovery intent ("ideas", "inspiration")
   - Seasonal ("christmas", "summer")
4. Estimate search volume (AI-based estimates)
5. Calculate competition level
6. Score CTR potential

**Output** (16+ keywords):
```typescript
{
  keyword: string,
  searchVolume: "high" | "medium" | "low",
  competition: "high" | "medium" | "low",
  intent: "purchase" | "discovery" | "gifting" | "seasonal",
  ctrPotential: number,  // 0-100
  relevanceScore: number // 0-100
}
```

---

### 6. Etsy Integration Module

**Purpose**: Connect Etsy shops and import/sync listings

**API Routes**:
- `GET /api/etsy/connect` - Initiate OAuth flow
- `GET /api/etsy/callback` - Handle OAuth callback
- `POST /api/etsy/import` - Import listings from shop
- `POST /api/etsy/sync` - Sync listing updates
- `POST /api/etsy/disconnect` - Remove shop connection

**OAuth Flow** (PKCE):
```
1. Generate code_verifier and code_challenge
2. Redirect to Etsy authorization URL
3. User grants permission
4. Etsy redirects to callback with code
5. Exchange code for access_token
6. Store tokens in Shop table (encrypted)
7. Fetch shop info and listings
```

**Import Process**:
```typescript
1. POST /api/etsy/import { shopId, limit: 25 }
2. Fetch listings from Etsy API v3
3. For each listing:
   - Fetch images
   - Parse tags/titles/descriptions
   - Check for duplicates
   - Insert or update Listing record
4. Return: { imported, updated, skipped }
```

**Sync Process**:
```typescript
1. POST /api/etsy/sync { shopId }
2. Get all listings from database for shop
3. For each listing:
   - Fetch latest data from Etsy
   - Compare with database
   - Update if changed
4. Update lastSyncedAt timestamp
```

---

## 🔄 Data Flow Examples

### Example 1: User Signs Up
```
Browser
  → POST /api/auth/signup {email, password, name}
  → Validate input (Zod)
  → Hash password (bcryptjs)
  → Create user in Supabase Auth
  → Create user record in users table
  → Create credit ledger entry (+10 credits, "bonus")
  → Set session cookie
  → Return {success: true, userId}
  → Redirect to /dashboard
```

### Example 2: User Optimizes Listing
```
Browser (/dashboard)
  → Click "Optimize Listing"
  → Enter title, description, tags
  → POST /api/optimize {platform, title, description, tags, tone}
  → Check user credits (must have ≥1)
  → Build GPT-4 prompt
  → Call OpenAI API 3 times (3 variants)
  → Parse responses
  → Calculate health scores
  → Create Optimization record
  → Create 3 OptimizationVariant records
  → Deduct 1 credit (CreditLedger entry: -1)
  → Return {variants: [...], healthScore: 85}
  → Display 3 optimized variants
```

### Example 3: User Purchases Credits
```
Browser (/dashboard)
  → Click "Buy Credits" (Pro package)
  → POST /api/checkout {package: "pro"}
  → Create Stripe checkout session
  → Return {url: "stripe.com/checkout/..."}
  → Redirect to Stripe
  → User enters payment info
  → Stripe processes payment
  → Stripe sends webhook to /api/webhooks/stripe
  → Verify webhook signature
  → Parse checkout.session.completed event
  → Check idempotency (referenceId)
  → Create CreditLedger entry (+50 credits, "purchase")
  → Update balance
  → User sees 50 credits in dashboard
```

---

## 🔌 API Endpoints Reference

### Authentication
| Method | Endpoint | Purpose | Auth Required |
|--------|----------|---------|---------------|
| POST | `/api/auth/signup` | Register new user | No |
| POST | `/api/auth/signin` | Login user | No |
| POST | `/api/auth/signout` | Logout user | Yes |

### User Management
| Method | Endpoint | Purpose | Auth Required |
|--------|----------|---------|---------------|
| GET | `/api/user/profile` | Get user info + credits | Yes |
| GET | `/api/user/credits` | Get credit history | Yes |

### AI Features
| Method | Endpoint | Purpose | Auth Required |
|--------|----------|---------|---------------|
| POST | `/api/optimize` | Generate 3 listing variants | Yes |
| POST | `/api/optimize/image/analyze` | Score product image | Yes |
| POST | `/api/keywords/generate` | Generate keywords | Yes |
| POST | `/api/seo/audit` | SEO analysis | Yes |

### Payments
| Method | Endpoint | Purpose | Auth Required |
|--------|----------|---------|---------------|
| GET | `/api/checkout` | Get credit packages | Yes |
| POST | `/api/checkout` | Create Stripe session | Yes |
| POST | `/api/webhooks/stripe` | Handle payment events | No (verified) |

### Etsy Integration
| Method | Endpoint | Purpose | Auth Required |
|--------|----------|---------|---------------|
| GET | `/api/etsy/connect` | Start OAuth | Yes |
| GET | `/api/etsy/callback` | OAuth callback | Yes |
| POST | `/api/etsy/import` | Import listings | Yes |
| POST | `/api/etsy/sync` | Sync listings | Yes |
| POST | `/api/etsy/disconnect` | Remove shop | Yes |

### Listings
| Method | Endpoint | Purpose | Auth Required |
|--------|----------|---------|---------------|
| GET | `/api/listings` | Get user listings (paginated) | Yes |

---

## 🔒 Security Considerations

### Authentication Security
- ✅ Passwords hashed with bcryptjs (10 rounds)
- ✅ HTTP-only session cookies
- ✅ Supabase Auth handles token refresh
- ✅ CSRF protection (Next.js built-in)
- ✅ Rate limiting (TODO: add via middleware)

### Database Security
- ✅ Prisma parameterized queries (SQL injection protection)
- ✅ Row Level Security policies (RLS) in Supabase
- ✅ User data isolation (userId foreign keys)
- ✅ Cascade deletes for data cleanup

### API Security
- ✅ Input validation with Zod
- ✅ Authentication middleware on all protected routes
- ✅ Stripe webhook signature verification
- ✅ Environment variables for secrets
- ✅ No sensitive data in client-side code

### Credit System Security
- ✅ Double-entry ledger (immutable audit trail)
- ✅ Server-side credit checks (never trust client)
- ✅ Idempotency keys (prevent double-charging)
- ✅ Transaction atomicity (Prisma transactions)

---

## 📊 Database Schema Relationships

```
┌──────────┐
│   User   │
└────┬─────┘
     │
     ├─────────┐
     │         │
     ▼         ▼
┌────────┐  ┌───────────────┐
│  Shop  │  │ CreditLedger  │
└────┬───┘  └───────────────┘
     │
     ▼
┌─────────┐
│ Listing │
└────┬────┘
     │
     ├─────────┐
     │         │
     ▼         ▼
┌──────────────┐  ┌──────────────┐
│ Optimization │  │ PhotoScore   │
└──────┬───────┘  └──────────────┘
       │
       ▼
┌─────────────────────┐
│ OptimizationVariant │
└─────────────────────┘
```

**Cascade Delete Rules**:
- Delete User → Deletes all Shops, CreditLedgers
- Delete Shop → Deletes all Listings
- Delete Listing → Deletes all Optimizations, PhotoScores
- Delete Optimization → Deletes all OptimizationVariants

---

## 🚀 Deployment Architecture

### Hosting
- **Platform**: Vercel (Next.js hosting)
- **Database**: Supabase (PostgreSQL)
- **File Storage**: Vercel blob storage (images, if needed)
- **CDN**: Vercel Edge Network

### Environment Variables
```bash
# Database
DATABASE_URL=postgresql://...
NEXT_PUBLIC_SUPABASE_URL=https://...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...

# AI Services
OPENAI_API_KEY=sk-...

# Payments
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_APP_URL=https://...

# Etsy
ETSY_API_KEY=...
ETSY_REDIRECT_URI=https://.../api/etsy/callback

# Analytics
NEXT_PUBLIC_POSTHOG_KEY=...
SENTRY_DSN=...
```

### Build Process
```bash
1. npm install
2. prisma generate  # Generate Prisma client
3. next build       # Build Next.js app
4. Deploy to Vercel
```

---

## 🧩 Component Hierarchy

### Global Layout
```
RootLayout (app/layout.tsx)
  └── ThemeProvider (design-system/theme-provider.tsx)
      └── {children}
```

### Landing Page
```
HomePage (app/page.tsx)
  ├── Navbar
  ├── Container
  │   ├── Hero Section
  │   │   ├── Heading
  │   │   ├── Description
  │   │   └── Button (x2)
  │   ├── Features Section
  │   │   └── Card (x3)
  │   └── Social Proof Section
  └── Footer
```

### Dashboard
```
DashboardPage (app/dashboard/page.tsx)
  ├── Header (custom)
  │   ├── Logo
  │   └── Button (Sign Out)
  └── Container
      ├── Welcome Section
      ├── Stats Cards
      │   └── Card (x3)
      └── Quick Actions
          └── Button (x4)
```

### Auth Pages
```
SignInPage (app/auth/signin/page.tsx)
  └── Centered Container
      ├── Logo
      ├── Heading
      ├── Form
      │   ├── Input (email)
      │   ├── Input (password)
      │   └── Button (submit)
      └── Link (to signup)
```

---

## 📝 File Path Dependencies

### Core Files & Their Dependencies

**`app/layout.tsx`**
- Imports: `design-system/theme-provider.tsx`
- Exports: RootLayout component
- Purpose: Wraps entire app with ThemeProvider

**`design-system/theme-provider.tsx`**
- Imports: `design-system/tokens.json`, React
- Exports: ThemeProvider, useTheme hook
- Purpose: Provides design tokens via Context

**`components/ui/Button.tsx`**
- Imports: `design-system/tokens.json`, Next Link
- Exports: Button component
- Used by: All pages with buttons

**`app/api/optimize/route.ts`**
- Imports:
  - `lib/openai.ts` (OpenAI client)
  - `lib/auth-helpers.ts` (getCurrentUser)
  - `lib/prisma.ts` (database)
  - `zod` (validation)
- Exports: POST handler
- Purpose: Listing optimization logic

**`lib/supabase.ts`**
- Imports: `@supabase/supabase-js`
- Exports: supabase, supabaseAdmin, getSupabaseServer
- Used by: All auth-related files

**`prisma/schema.prisma`**
- Dependencies: PostgreSQL database
- Generates: `@prisma/client`
- Used by: All files importing `lib/prisma.ts`

---

## 🔄 System Interactions

### Authentication System
```
Components: SignInPage, SignUpPage
     ↓
API Routes: /api/auth/{signup,signin,signout}
     ↓
Libraries: lib/auth-helpers.ts, lib/supabase.ts
     ↓
Database: users table (Supabase PostgreSQL)
     ↓
Response: Session cookie + user data
```

### Credit Purchase System
```
Components: Dashboard (Buy Credits button)
     ↓
API Route: /api/checkout
     ↓
Library: lib/stripe.ts
     ↓
External: Stripe Checkout
     ↓
Webhook: /api/webhooks/stripe
     ↓
Database: credit_ledgers table (add credits)
     ↓
Response: Updated balance in dashboard
```

### Listing Optimization System
```
Components: Optimize form
     ↓
API Route: /api/optimize
     ↓
Libraries: lib/openai.ts, lib/prisma.ts
     ↓
External: OpenAI GPT-4 API (3 calls)
     ↓
Database: optimizations + optimization_variants tables
     ↓
Credit System: Deduct 1 credit from user balance
     ↓
Response: 3 optimized variants with scores
```

### Image Scoring System
```
Components: Image upload form
     ↓
API Route: /api/optimize/image/analyze
     ↓
Library: lib/openai.ts (Vision API)
     ↓
External: OpenAI Vision API
     ↓
Database: photo_scores table
     ↓
Credit System: Deduct 1 credit
     ↓
Response: 9 scores + suggestions
```

---

## 📈 Performance Considerations

### Optimization Strategies
- ✅ Server-side rendering (SSR) for SEO
- ✅ API route caching (Redis via Upstash)
- ✅ Prisma connection pooling
- ✅ Image optimization (Next.js Image component)
- ✅ Code splitting (automatic in Next.js)
- ✅ Static asset CDN (Vercel Edge)

### Future Enhancements
- [ ] Implement API rate limiting
- [ ] Add Redis caching for frequently accessed data
- [ ] Optimize database queries with indexes
- [ ] Implement background job queue for long-running tasks
- [ ] Add lazy loading for images

---

## 🧪 Testing Strategy

### Current State
- Manual testing via browser
- API testing via curl/Postman

### Recommended Testing
```typescript
// Unit Tests (Jest + React Testing Library)
- Component rendering
- Form validation
- Utility functions

// Integration Tests
- API route handlers
- Database operations
- Authentication flow

// E2E Tests (Playwright)
- User signup → dashboard flow
- Listing optimization flow
- Payment flow (test mode)
```

---

## 📚 Key Takeaways for AI Collaboration

### When Adding New Features
1. **Check authentication**: Use `getCurrentUser()` from `lib/auth-helpers.ts`
2. **Validate input**: Use Zod schemas
3. **Check credits**: Query `credit_ledgers` table for balance
4. **Use design system**: Import from `@/components/ui`
5. **Follow patterns**: Look at existing API routes for structure

### When Debugging
1. **Check logs**: Vercel deployment logs
2. **Verify environment variables**: `.env.local` file
3. **Test database connection**: Check Supabase dashboard
4. **Validate API keys**: OpenAI, Stripe, Etsy
5. **Check Prisma schema**: Run `prisma generate` after changes

### When Deploying
1. **Run build locally**: `npm run build`
2. **Check TypeScript**: `npx tsc --noEmit`
3. **Update environment variables**: Vercel dashboard
4. **Run migrations**: `prisma migrate deploy`
5. **Monitor**: Check Vercel analytics + Sentry

---

## 📞 Support & Resources

### Documentation Links
- Next.js: https://nextjs.org/docs
- Prisma: https://www.prisma.io/docs
- Supabase: https://supabase.com/docs
- Stripe: https://stripe.com/docs
- OpenAI: https://platform.openai.com/docs

### Internal Docs
- Design System Audit: `/DESIGN_SYSTEM_AUDIT.md`
- API Testing: `/API_TESTING.md`
- Etsy OAuth Notes: `/ETSY_OAUTH_NOTES.md`
- Features Inventory: `/docs/FEATURES_INVENTORY.md`

---

**Document Version**: 1.0  
**Last Updated**: January 2025  
**Maintainer**: Development Team
