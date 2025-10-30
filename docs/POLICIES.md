# Elite Listing AI - Row Level Security Policies (Plain English)

**Version:** 2.0  
**Last Updated:** January 2025  
**Database:** PostgreSQL (Supabase)

---

## What is Row Level Security (RLS)?

Row Level Security (RLS) is like having a security guard at every table in your database. It ensures that:

- **Users can only see their own data** (not other users' listings, optimizations, or credit balances)
- **Invalid requests are blocked at the database level** (even if there's a bug in your code)
- **Admins can access everything** (for customer support)

Think of it as automatic filters on every database query:
```sql
-- Without RLS (DANGEROUS)
SELECT * FROM listings;  -- Returns ALL listings from ALL users!

-- With RLS (SAFE)
SELECT * FROM listings;  -- Automatically filtered to only YOUR listings
```

---

## Why RLS is Critical

### Security
- **No accidental data leaks:** Even if your API has a bug, users can't access others' data
- **Defense in depth:** Multiple layers of security (app code + database)
- **Compliance:** Meets GDPR, CCPA data isolation requirements

### Benefits
- **Simpler code:** Don't need `WHERE user_id = ?` in every query
- **Automatic enforcement:** Works with Prisma, raw SQL, admin tools
- **Peace of mind:** Sleep well knowing data is protected

---

## RLS Policies for Each Table

### 1. users Table

**Goal:** Users can only see and update their own profile.

#### SELECT Policy: "Users can view their own profile"

**Plain English:**
- You can read your own user record
- Admins can read all user records (for support)

**SQL Policy:**
```sql
CREATE POLICY "Users can view their own profile"
ON users
FOR SELECT
USING (
  auth.uid() = id  -- Your session user ID matches the row's user ID
  OR 
  auth.jwt()->>'role' = 'admin'  -- OR you're an admin
);
```

**What this means:**
- When you run `SELECT * FROM users`, you'll only see YOUR row
- If you're an admin, you'll see all rows

#### UPDATE Policy: "Users can update their own profile"

**Plain English:**
- You can update your name, image
- You cannot update email or password (use auth system)

**SQL Policy:**
```sql
CREATE POLICY "Users can update their own profile"
ON users
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (
  auth.uid() = id
  AND email = OLD.email  -- Email cannot be changed
  AND password = OLD.password  -- Password cannot be changed here
);
```

#### INSERT Policy: "Anyone can create an account"

**Plain English:**
- Sign-up is public (no auth required)
- But enforced by Supabase Auth

**SQL Policy:**
```sql
-- Handled by Supabase Auth, not direct INSERT
```

#### DELETE Policy: "No direct deletes"

**Plain English:**
- Users cannot delete their own account via database
- Must use account deletion API (which soft-deletes)

**SQL Policy:**
```sql
-- No DELETE policy = no one can delete
```

---

### 2. shops Table

**Goal:** Users can only access their own connected shops.

#### SELECT Policy: "Users can view their own shops"

**SQL Policy:**
```sql
CREATE POLICY "Users can view their own shops"
ON shops
FOR SELECT
USING (auth.uid() = userId);
```

**Example:**
```typescript
// This query automatically filters to your shops only
const myShops = await prisma.shop.findMany();
// Equivalent to:
// SELECT * FROM shops WHERE userId = [your-user-id]
```

#### INSERT Policy: "Users can connect their own shops"

**SQL Policy:**
```sql
CREATE POLICY "Users can connect their own shops"
ON shops
FOR INSERT
WITH CHECK (auth.uid() = userId);
```

**What this prevents:**
- User A cannot create a shop for User B
- Must be authenticated to connect a shop

#### UPDATE Policy: "Users can update their own shops"

**SQL Policy:**
```sql
CREATE POLICY "Users can update their own shops"
ON shops
FOR UPDATE
USING (auth.uid() = userId)
WITH CHECK (
  auth.uid() = userId
  AND userId = OLD.userId  -- Cannot transfer ownership
);
```

#### DELETE Policy: "Users can disconnect their own shops"

**SQL Policy:**
```sql
CREATE POLICY "Users can disconnect their own shops"
ON shops
FOR DELETE
USING (auth.uid() = userId);
```

---

### 3. listings Table

**Goal:** Users can only access listings from their own shops.

#### SELECT Policy: "Users can view listings from their shops"

**Plain English:**
- You can see listings from shops you own
- This requires a JOIN to check shop ownership

**SQL Policy:**
```sql
CREATE POLICY "Users can view listings from their shops"
ON listings
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM shops
    WHERE shops.id = listings.shopId
    AND shops.userId = auth.uid()
  )
);
```

**How it works:**
1. You query listings
2. Database checks: "Does this listing belong to a shop owned by you?"
3. If yes, return it. If no, hide it.

#### INSERT Policy: "Users can add listings to their shops"

**SQL Policy:**
```sql
CREATE POLICY "Users can add listings to their shops"
ON listings
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM shops
    WHERE shops.id = shopId
    AND shops.userId = auth.uid()
  )
);
```

#### UPDATE Policy: "Users can update listings in their shops"

**SQL Policy:**
```sql
CREATE POLICY "Users can update listings in their shops"
ON listings
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM shops
    WHERE shops.id = listings.shopId
    AND shops.userId = auth.uid()
  )
)
WITH CHECK (
  shopId = OLD.shopId  -- Cannot move listing to different shop
);
```

#### DELETE Policy: "Users can delete listings from their shops"

**SQL Policy:**
```sql
CREATE POLICY "Users can delete listings from their shops"
ON listings
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM shops
    WHERE shops.id = listings.shopId
    AND shops.userId = auth.uid()
  )
);
```

---

### 4. optimizations Table

**Goal:** Users can only access their own optimization requests.

#### SELECT Policy: "Users can view their own optimizations"

**SQL Policy:**
```sql
CREATE POLICY "Users can view their own optimizations"
ON optimizations
FOR SELECT
USING (auth.uid() = userId);
```

#### INSERT Policy: "Users can create optimizations"

**SQL Policy:**
```sql
CREATE POLICY "Users can create optimizations"
ON optimizations
FOR INSERT
WITH CHECK (auth.uid() = userId);
```

#### UPDATE Policy: "Users can update their own optimizations"

**SQL Policy:**
```sql
CREATE POLICY "Users can update their own optimizations"
ON optimizations
FOR UPDATE
USING (auth.uid() = userId)
WITH CHECK (
  auth.uid() = userId
  AND userId = OLD.userId  -- Cannot transfer ownership
);
```

#### DELETE Policy: "Users can delete their own optimizations"

**SQL Policy:**
```sql
CREATE POLICY "Users can delete their own optimizations"
ON optimizations
FOR DELETE
USING (auth.uid() = userId);
```

---

### 5. optimization_variants Table

**Goal:** Users can access variants of their own optimizations.

#### SELECT Policy: "Users can view variants of their optimizations"

**SQL Policy:**
```sql
CREATE POLICY "Users can view variants of their optimizations"
ON optimization_variants
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM optimizations
    WHERE optimizations.id = optimization_variants.optimizationId
    AND optimizations.userId = auth.uid()
  )
);
```

#### INSERT Policy: "System creates variants (service role only)"

**Plain English:**
- Only the backend can create variants
- Users cannot manually insert variants

**SQL Policy:**
```sql
CREATE POLICY "System creates variants"
ON optimization_variants
FOR INSERT
WITH CHECK (auth.jwt()->>'role' = 'service_role');
```

#### UPDATE Policy: "Users can select variant"

**SQL Policy:**
```sql
CREATE POLICY "Users can select variant"
ON optimization_variants
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM optimizations
    WHERE optimizations.id = optimizationId
    AND optimizations.userId = auth.uid()
  )
)
WITH CHECK (
  isSelected != OLD.isSelected  -- Only isSelected field can change
);
```

---

### 6. photo_scores Table

**Goal:** Users can access photo scores for their own listings.

#### SELECT Policy: "Users can view photo scores for their listings"

**SQL Policy:**
```sql
CREATE POLICY "Users can view photo scores for their listings"
ON photo_scores
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM listings
    JOIN shops ON shops.id = listings.shopId
    WHERE listings.id = photo_scores.listingId
    AND shops.userId = auth.uid()
  )
);
```

#### INSERT Policy: "System creates photo scores (service role only)"

**SQL Policy:**
```sql
CREATE POLICY "System creates photo scores"
ON photo_scores
FOR INSERT
WITH CHECK (auth.jwt()->>'role' = 'service_role');
```

---

### 7. credit_ledgers Table

**Goal:** Users can view their credit history but cannot modify it.

#### SELECT Policy: "Users can view their own credit history"

**SQL Policy:**
```sql
CREATE POLICY "Users can view their credit history"
ON credit_ledgers
FOR SELECT
USING (auth.uid() = userId);
```

#### INSERT Policy: "Only backend can add credit transactions"

**Plain English:**
- Users cannot grant themselves free credits
- Only backend (service role) can create transactions

**SQL Policy:**
```sql
CREATE POLICY "Only backend can add credit transactions"
ON credit_ledgers
FOR INSERT
WITH CHECK (auth.jwt()->>'role' = 'service_role');
```

#### UPDATE/DELETE Policy: "No updates or deletes (immutable ledger)"

**Plain English:**
- Credit transactions are permanent
- Cannot edit or delete (audit trail)

**SQL Policy:**
```sql
-- No UPDATE or DELETE policies = immutable
```

---

## Enabling RLS on All Tables

### Step 1: Enable RLS

```sql
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE shops ENABLE ROW LEVEL SECURITY;
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE optimizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE optimization_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE photo_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_ledgers ENABLE ROW LEVEL SECURITY;
```

### Step 2: Create All Policies

Run the SQL scripts above for each table.

### Step 3: Test RLS

```sql
-- As user 1
SET request.jwt.claim.sub = 'user-1-id';
SELECT * FROM listings;  -- Should only see user 1's listings

-- As user 2
SET request.jwt.claim.sub = 'user-2-id';
SELECT * FROM listings;  -- Should only see user 2's listings
```

---

## Common RLS Patterns

### Pattern 1: Direct Ownership

**Use when:** Table has a `userId` column

```sql
USING (auth.uid() = userId)
```

**Tables:** users, shops, optimizations, credit_ledgers

---

### Pattern 2: Indirect Ownership (via JOIN)

**Use when:** Table doesn't have `userId` but relates to a table that does

```sql
USING (
  EXISTS (
    SELECT 1 FROM parent_table
    WHERE parent_table.id = child_table.parent_id
    AND parent_table.userId = auth.uid()
  )
)
```

**Tables:** listings (via shops), photo_scores (via listings)

---

### Pattern 3: Service Role Only

**Use when:** Only backend should write (not users)

```sql
WITH CHECK (auth.jwt()->>'role' = 'service_role')
```

**Tables:** optimization_variants (INSERT), photo_scores (INSERT), credit_ledgers (INSERT)

---

## Testing RLS Policies

### Manual Testing

1. **Create two test users:**
   ```sql
   -- User A
   INSERT INTO users (id, email, password, name)
   VALUES ('user-a-id', 'user-a@test.com', 'hash', 'User A');
   
   -- User B
   INSERT INTO users (id, email, password, name)
   VALUES ('user-b-id', 'user-b@test.com', 'hash', 'User B');
   ```

2. **Create test data:**
   ```sql
   -- User A's shop
   INSERT INTO shops (id, userId, platform, platformShopId, shopName)
   VALUES ('shop-a-id', 'user-a-id', 'ETSY', 'etsy-123', 'Shop A');
   
   -- User A's listing
   INSERT INTO listings (id, shopId, platformListingId, title, description, price, status)
   VALUES ('listing-a-id', 'shop-a-id', 'listing-123', 'Product A', 'Desc', 10.0, 'active');
   ```

3. **Test as User A:**
   ```sql
   SET request.jwt.claim.sub = 'user-a-id';
   SELECT * FROM listings;  -- Should return listing-a-id
   ```

4. **Test as User B:**
   ```sql
   SET request.jwt.claim.sub = 'user-b-id';
   SELECT * FROM listings;  -- Should return NOTHING (no access)
   ```

5. **Test unauthorized INSERT:**
   ```sql
   SET request.jwt.claim.sub = 'user-b-id';
   INSERT INTO listings (id, shopId, platformListingId, title, description, price, status)
   VALUES ('listing-b-id', 'shop-a-id', 'listing-456', 'Product B', 'Desc', 15.0, 'active');
   -- Should FAIL (User B doesn't own shop-a-id)
   ```

---

## Automated Testing

### Using Supabase JS Client

```typescript
// test/rls.test.ts
import { createClient } from '@supabase/supabase-js';

test('RLS prevents cross-user access', async () => {
  // User A's client
  const userA = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false }
  });
  await userA.auth.signInWithPassword({ email: 'user-a@test.com', password: 'pass' });
  
  // User B's client
  const userB = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false }
  });
  await userB.auth.signInWithPassword({ email: 'user-b@test.com', password: 'pass' });
  
  // User A creates a listing
  const { data: listing } = await userA
    .from('listings')
    .insert({ shopId: 'shop-a-id', title: 'Test Listing' })
    .select()
    .single();
  
  // User B tries to access User A's listing
  const { data, error } = await userB
    .from('listings')
    .select()
    .eq('id', listing.id);
  
  expect(data).toEqual([]);  // No data returned
  expect(error).toBeNull();  // No error (just empty result)
});
```

---

## Troubleshooting RLS

### Issue: "I can't see any data!"

**Cause:** RLS is enabled but no policies exist

**Solution:**
```sql
-- Check if RLS is enabled
SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';

-- Check existing policies
SELECT * FROM pg_policies WHERE schemaname = 'public';

-- If no policies, create them
```

---

### Issue: "Users can see other users' data!"

**Cause:** RLS not enabled or policy is too permissive

**Solution:**
```sql
-- Verify RLS is enabled
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;

-- Check policy
SELECT * FROM pg_policies WHERE tablename = 'listings';

-- Fix policy if needed
```

---

### Issue: "Backend can't write data!"

**Cause:** Backend is not using service role key

**Solution:**
```typescript
// Use service role key for backend operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY  // This bypasses RLS
);
```

---

## RLS Best Practices

### 1. Enable RLS on ALL tables with user data

**Why:** Even if you think a table doesn't need it, enable it anyway.

---

### 2. Test policies before deploying

**Why:** A bug in RLS can expose all data or block all access.

---

### 3. Use service role sparingly

**Why:** Service role bypasses RLS. Only use for trusted backend operations.

---

### 4. Log RLS violations

**How:**
```sql
-- Add logging to policies
CREATE POLICY "Users can view their listings (logged)"
ON listings
FOR SELECT
USING (
  CASE
    WHEN auth.uid() IS NULL THEN
      (SELECT log_security_event('RLS_VIOLATION', 'listings', 'SELECT', 'No auth token') AND false)
    WHEN NOT EXISTS (...) THEN
      (SELECT log_security_event('RLS_VIOLATION', 'listings', 'SELECT', 'Unauthorized access') AND false)
    ELSE true
  END
);
```

---

### 5. Document all policies

**Why:** Future developers need to understand why policies exist.

---

## Security Checklist

### Before Production Launch

- [ ] RLS enabled on all user data tables
- [ ] All SELECT policies tested (cross-user access blocked)
- [ ] All INSERT policies tested (cannot create for other users)
- [ ] All UPDATE policies tested (cannot modify other users' data)
- [ ] All DELETE policies tested (cannot delete other users' data)
- [ ] Service role key secured (not in client-side code)
- [ ] Anon key is truly anonymous (no elevated permissions)
- [ ] Credit ledger is immutable (no UPDATE/DELETE policies)
- [ ] Admin role policies tested (for support access)
- [ ] RLS violations logged (for monitoring)

---

## Complete RLS Setup Script

See `scripts/setup-rls.sql` for the complete SQL script to set up all RLS policies.

---

**Last Updated:** January 2025  
**Next Steps:** Implement RLS policies in Supabase Dashboard
