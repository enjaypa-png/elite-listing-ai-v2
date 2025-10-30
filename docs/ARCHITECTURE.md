# Elite Listing AI - Architecture Documentation

**Version:** 2.0  
**Last Updated:** January 2025  
**Status:** Production-Ready Rebuild

---

## Overview

Elite Listing AI is a Next.js 15 application that helps Etsy sellers optimize their product listings using AI-powered analysis and recommendations. The application is built with **100% portability** in mind - all code and data ownership belongs to the user.

---

## Tech Stack

### Frontend
- **Framework:** Next.js 15.5.6 (App Router)
- **Language:** TypeScript 5.9.3
- **UI:** React 19.1.0
- **Styling:** Tailwind CSS 4.1.14
- **State:** React Context + Server Components
- **Analytics:** Vercel Analytics, PostHog
- **Error Tracking:** Sentry

### Backend
- **Runtime:** Node.js (Next.js API Routes)
- **Database:** PostgreSQL (via Supabase)
- **ORM:** Prisma 6.18.0
- **Authentication:** Supabase Auth (email/password + verification)
- **Authorization:** Row Level Security (RLS) on all user tables
- **Session:** Supabase Session Management

### Third-Party Integrations
- **AI:** OpenAI GPT-4 (text optimization), GPT Vision (image analysis)
- **Payments:** Stripe 19.1.0 (checkout + webhooks)
- **E-commerce:** Etsy OAuth 2.0 (listing import)
- **Storage:** Supabase Storage (user uploads)

### Infrastructure
- **Hosting:** Vercel (primary deployment)
- **Database:** Supabase PostgreSQL (hosted)
- **CI/CD:** GitHub Actions (lint, test, deploy)
- **Version Control:** GitHub (source of truth)

---

## Architecture Principles

### 1. **Portability First**
- No vendor lock-in
- Standard Next.js, React, PostgreSQL, Prisma
- Environment variables for all external services
- Can deploy anywhere: Vercel, AWS, GCP, self-hosted

### 2. **Security by Default**
- Row Level Security (RLS) on all user data
- Supabase Auth with email verification
- Strong password enforcement
- Rate limiting on all API routes
- CORS protection
- Input validation (Zod schemas)
- No secrets in code

### 3. **Ownership**
- GitHub repo is source of truth
- All environment variables in Vercel (user's account)
- Supabase project owned by user
- Stripe account owned by user
- No data stored in third-party platforms

### 4. **Developer Experience**
- Type-safe with TypeScript
- Prisma for database queries
- Hot reload (local development)
- Deterministic seeding
- Comprehensive error handling
- Logging for debugging

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         USER BROWSER                         │
│                    (React 19 + Next.js 15)                   │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       │ HTTPS
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                      VERCEL HOSTING                          │
│  ┌────────────────────────────────────────────────────────┐ │
│  │            Next.js 15 Server (App Router)              │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐ │ │
│  │  │   Pages      │  │  API Routes  │  │ Middleware  │ │ │
│  │  │ (Server      │  │  /api/*      │  │ (Auth       │ │ │
│  │  │  Components) │  │              │  │  Check)     │ │ │
│  │  └──────────────┘  └──────────────┘  └─────────────┘ │ │
│  └────────────────────────────────────────────────────────┘ │
└───────────┬──────────────────────┬──────────────────────────┘
            │                      │
            │                      │
            ▼                      ▼
┌─────────────────────┐  ┌─────────────────────────────┐
│   SUPABASE          │  │   EXTERNAL SERVICES         │
│   (User's Project)  │  │                             │
│                     │  │  ┌────────────────────────┐ │
│  ┌───────────────┐ │  │  │  Stripe                │ │
│  │  PostgreSQL   │ │  │  │  (Payments/Webhooks)   │ │
│  │  + RLS        │ │  │  └────────────────────────┘ │
│  └───────────────┘ │  │                             │
│                     │  │  ┌────────────────────────┐ │
│  ┌───────────────┐ │  │  │  OpenAI                │ │
│  │  Auth         │ │  │  │  (GPT-4, Vision)       │ │
│  │  (Email/Pass) │ │  │  └────────────────────────┘ │
│  └───────────────┘ │  │                             │
│                     │  │  ┌────────────────────────┐ │
│  ┌───────────────┐ │  │  │  Etsy OAuth            │ │
│  │  Storage      │ │  │  │  (Listing Import)      │ │
│  └───────────────┘ │  │  └────────────────────────┘ │
└─────────────────────┘  └─────────────────────────────────┘
```

---

## Application Structure

```
elite-listing-ai-v2/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Auth-related routes (grouped)
│   │   ├── login/                # Login page
│   │   └── signup/               # Signup page + verification
│   ├── dashboard/                # Protected dashboard
│   ├── analyze/                  # Listing analysis tool
│   ├── api/                      # API routes
│   │   ├── auth/                 # Auth endpoints
│   │   ├── listings/             # CRUD for listings
│   │   ├── optimize/             # AI optimization
│   │   ├── keywords/             # Keyword generation
│   │   ├── seo/                  # SEO audit
│   │   ├── etsy/                 # Etsy OAuth + import
│   │   └── webhooks/             # Stripe webhooks
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Landing page
│   └── globals.css               # Global styles
├── components/                   # React components
│   ├── ui/                       # shadcn/ui components
│   └── ...                       # Feature components
├── lib/                          # Utility functions
│   ├── prisma.ts                 # Prisma client
│   ├── supabase.ts               # Supabase clients
│   ├── stripe.ts                 # Stripe client
│   ├── openai.ts                 # OpenAI client
│   └── utils.ts                  # Helper functions
├── prisma/                       # Database schema
│   ├── schema.prisma             # Prisma schema (PostgreSQL)
│   ├── migrations/               # Database migrations
│   └── seed.ts                   # Seed data
├── types/                        # TypeScript types
├── middleware.ts                 # Auth middleware
├── .github/                      # CI/CD workflows
│   └── workflows/
│       ├── lint.yml              # Linting
│       ├── test.yml              # Testing
│       └── deploy.yml            # Deployment
├── docs/                         # Documentation
│   ├── ARCHITECTURE.md           # This file
│   ├── FEATURES_INVENTORY.md     # Feature list
│   ├── ROUTE_TABLE.md            # API routes
│   ├── ENV_MATRIX.md             # Environment variables
│   ├── DATA_MODEL.md             # Database schema
│   ├── POLICIES.md               # RLS policies (plain English)
│   ├── ONBOARDING.md             # Setup guide (non-coders)
│   ├── OPERATIONS.md             # Maintenance guide
│   └── SUPPORT.md                # Troubleshooting
└── package.json                  # Dependencies

```

---

## Data Flow

### 1. **User Authentication**
```
User → Login Form → /api/auth/signin → Supabase Auth
  ↓
Verify Credentials → Create Session → Set Cookie
  ↓
Redirect to Dashboard
```

### 2. **Listing Optimization**
```
User → Upload Listing Data → /api/optimize
  ↓
Validate Input (Zod) → Check Credits → Deduct Credits
  ↓
Send to OpenAI GPT-4 → Generate 3 Variants
  ↓
Save to Database (with user_id) → Return Results
  ↓
Display in UI → User Selects Variant
```

### 3. **Etsy Integration**
```
User → Connect Etsy → /api/etsy/oauth → Redirect to Etsy
  ↓
User Approves → Etsy Redirects Back → Exchange Code for Token
  ↓
Save Token to Database (RLS protected) → Import Listings
  ↓
Display Listings in Dashboard
```

### 4. **Payment Flow**
```
User → Select Plan → /api/checkout → Create Stripe Session
  ↓
Redirect to Stripe → User Pays → Stripe Webhook
  ↓
Verify Webhook → Add Credits → Update Database
  ↓
Notify User (email + dashboard)
```

---

## Security Model

### Row Level Security (RLS)

All user data is protected by PostgreSQL RLS policies:

1. **Users Table:**
   - Users can only read/update their own record
   - Admin can read all (for support)

2. **Listings Table:**
   - Users can only access their own listings
   - Queries automatically filtered by `user_id`

3. **Optimizations Table:**
   - Users can only access optimizations they created
   - Foreign key ensures ownership

4. **Credit Ledgers:**
   - Users can only read their own ledger
   - Only backend can write (via service role)

### Authentication Flow
```
1. User signs up → Email sent with verification link
2. User clicks link → Email marked as verified
3. User logs in → Supabase checks email + password
4. Invalid credentials → Return 401 (no details leaked)
5. Valid credentials → Create session (JWT in cookie)
6. All requests → Middleware checks session
7. Expired session → Redirect to login
```

---

## Performance Considerations

### Caching Strategy
- Static pages: ISR (Incremental Static Regeneration)
- API responses: Redis cache (future enhancement)
- Database queries: Prisma query cache
- Assets: CDN (Vercel Edge Network)

### Rate Limiting
- Auth endpoints: 5 requests/min per IP
- API endpoints: 60 requests/min per user
- Webhook endpoints: Validate signature

### Database Optimization
- Indexes on frequently queried fields
- Connection pooling (Prisma)
- Prepared statements (SQL injection prevention)

---

## Error Handling

### Client-Side
- Toast notifications for user-friendly errors
- Error boundaries for React crashes
- Fallback UI for failed components

### Server-Side
- Try-catch blocks on all API routes
- Structured logging (console.log with context)
- Sentry for production error tracking
- Generic error messages (no stack traces to users)

---

## Deployment Architecture

### Environments

1. **Local Development**
   - `npm run dev` or `pnpm dev`
   - Uses local `.env.local` file
   - Connects to development Supabase project

2. **Preview (Vercel)**
   - Auto-deployed on every PR
   - Uses preview environment variables
   - Separate database schema

3. **Production (Vercel)**
   - Deployed from `main` branch
   - Uses production environment variables
   - User's Vercel account

### Environment Variables (per environment)

See `ENV_MATRIX.md` for complete list.

---

## Monitoring & Observability

### Metrics
- Vercel Analytics (page views, performance)
- PostHog (user behavior, funnels)
- Stripe Dashboard (payments, revenue)

### Logs
- Vercel Logs (server-side errors)
- Sentry (error tracking)
- Supabase Logs (database queries)

### Alerts
- Sentry alerts for high error rates
- Stripe alerts for failed payments
- Custom alerts via Vercel Monitoring

---

## Future Architecture Enhancements

1. **Microservices** (if scale requires):
   - Separate image processing service
   - Dedicated queue for AI jobs (BullMQ)
   - Redis for caching and pub/sub

2. **Real-Time Features**:
   - WebSocket for live updates
   - Supabase Realtime for database changes

3. **Multi-Region**:
   - Deploy to multiple Vercel regions
   - Database read replicas

---

## Repository Structure

- **Source of Truth:** GitHub (`https://github.com/[user]/elite-listing-ai-v2`)
- **Branching Strategy:** 
  - `main` → Production
  - `develop` → Development
  - `feature/*` → Feature branches
- **PR Process:**
  - All changes via PR
  - CI checks (lint, build, test)
  - Preview deployment on Vercel

---

**Last Updated:** January 2025  
**Maintained By:** User (full ownership)  
**AI Assistant:** Elite Listing AI Build Agent
