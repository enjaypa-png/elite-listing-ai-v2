# Vercel Deployment Fix - Prisma Connection Pooling

## Problem
Error: `prepared statement "s3" already exists` when logging in on Vercel

This happens because serverless functions in Vercel create multiple Prisma Client instances, causing duplicate prepared statements in PostgreSQL.

## Solution

### 1. Update Prisma Configuration (Already Done)

**File: `lib/prisma.ts`**
- Added datasource configuration
- Added graceful disconnect on serverless cleanup

**File: `prisma/schema.prisma`**
- Added `jsonProtocol` preview feature for better serverless performance
- Added `directUrl` support for connection pooling

### 2. Configure Connection Pooling in Vercel

You need to update your Vercel environment variables:

#### Option A: Using Supabase Connection Pooler (Recommended)

If you're using Supabase:

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Update `DATABASE_URL` to use the connection pooler:

```
DATABASE_URL="postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true"
```

3. Add `DIRECT_URL` for migrations (non-pooled):

```
DIRECT_URL="postgresql://postgres.[PROJECT-REF]:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"
```

#### Option B: Using External Connection Pooler

If you're using another PostgreSQL provider:

1. Set up a connection pooler (PgBouncer, Supabase Pooler, or similar)
2. Update environment variables:

```
DATABASE_URL="postgresql://user:pass@pooler-url:6543/dbname?pgbouncer=true"
DIRECT_URL="postgresql://user:pass@direct-db-url:5432/dbname"
```

### 3. Regenerate Prisma Client

After updating the schema, regenerate the Prisma Client:

```bash
cd /tmp/elite-listing-ai-v2
npx prisma generate
```

### 4. Redeploy to Vercel

Once the environment variables are updated:

```bash
git add .
git commit -m "fix: Configure Prisma for serverless connection pooling"
git push origin main
```

Vercel will automatically redeploy with the new configuration.

## Additional Configuration (Optional)

### Connection Pool Settings

Add these to your Vercel environment variables for optimal performance:

```
# Connection pool limits
DATABASE_CONNECTION_LIMIT="10"
DATABASE_POOL_TIMEOUT="20"
```

Update `lib/prisma.ts` if needed:

```typescript
new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
  // Optional: Add connection limits
  // Note: These are set at the pool level, not Prisma Client level
})
```

## Verification

After deploying:

1. Try logging in again
2. Check Vercel function logs for errors
3. Monitor database connections in your database dashboard

## Important Notes

- **Connection Pooling is REQUIRED** for serverless deployments
- Without pooling, each function invocation creates new connections
- This quickly exhausts database connection limits
- Use `DATABASE_URL` for queries (pooled)
- Use `DIRECT_URL` for migrations (direct connection)

## Troubleshooting

If the error persists:

1. Verify `DATABASE_URL` uses connection pooler (port 6543 for Supabase)
2. Check Vercel logs for connection errors
3. Ensure database has enough connection slots
4. Try clearing Vercel build cache: Settings → Clear Cache → Redeploy

## Resources

- [Prisma Connection Pooling](https://www.prisma.io/docs/guides/performance-and-optimization/connection-management)
- [Vercel + Prisma](https://vercel.com/guides/nextjs-prisma-postgres)
- [Supabase Connection Pooling](https://supabase.com/docs/guides/database/connecting-to-postgres#connection-pooler)
