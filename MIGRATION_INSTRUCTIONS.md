# MIGRATION INSTRUCTIONS - FOR YOU TO RUN

## ✅ Migration SQL is Ready

**Location:** `/prisma/migrations/READY_TO_RUN_add_manus_keywords.sql`

---

## 🎯 How to Run the Migration

### Option 1: Via Supabase SQL Editor (Recommended)

1. Go to Supabase Dashboard
2. Navigate to SQL Editor
3. Click "New query"
4. Copy the entire contents of `/prisma/migrations/READY_TO_RUN_add_manus_keywords.sql`
5. Paste into SQL editor
6. Click "Run"
7. Verify: "Success. No rows returned"

---

### Option 2: Via Vercel/Prisma CLI (If you have env vars)

**On your local machine with proper env vars:**
```bash
npx prisma migrate deploy
```

---

### Option 3: Via Database Client (psql)

```bash
psql $DATABASE_URL < prisma/migrations/READY_TO_RUN_add_manus_keywords.sql
```

---

## ✅ What the Migration Creates

**Table 1: `keywords`**
- Stores all Manus keywords
- Fields: id, keyword, category, subcategory, type, isActive, timestamps
- Indexes on category and type

**Table 2: `long_tail_patterns`**
- Stores expansion patterns
- Fields: id, pattern, description, variables (JSONB), category, isActive, timestamps
- Index on category

---

## 🌱 After Migration: Run Seed Script

**Once migration succeeds, run seed:**

```bash
# In Vercel/production environment with DATABASE_URL set:
npx ts-node prisma/seedKeywords.ts
```

**Expected Output:**
```
🌱 Starting Manus keyword database seed...
Seeding Product Keywords...
  ✓ Jewelry: 30 keywords
  ✓ WallArt: 25 keywords
  ✓ Weddings: 25 keywords
  ... (continues for all 11 categories)
Seeding Materials...
  ✓ Materials: 140 items
Seeding Styles...
  ✓ Styles: 110 items
  ... (etc)
✅ Seed completed successfully!
   Total keywords seeded: ~700
```

---

## ✅ Verification Queries

**After seeding, run these in Supabase SQL Editor:**

```sql
-- Check keywords table
SELECT COUNT(*) FROM keywords;
-- Expected: ~700

-- Check by category
SELECT category, COUNT(*) 
FROM keywords 
GROUP BY category 
ORDER BY category;

-- Check patterns
SELECT COUNT(*) FROM long_tail_patterns;
-- Expected: 50

-- Sample keywords
SELECT * FROM keywords LIMIT 10;
```

---

## 🚨 If Migration Fails

**Common issues:**

1. **"relation already exists"** → Tables already created, safe to ignore
2. **"syntax error"** → Check PostgreSQL version compatibility
3. **"permission denied"** → Need database admin access

**Solutions:**
- Add `IF NOT EXISTS` (already included)
- Check Supabase permissions
- Run as database owner

---

## ✅ Status

**Migration File:** Ready at `/prisma/migrations/READY_TO_RUN_add_manus_keywords.sql`
**Seed Script:** Ready at `/prisma/seedKeywords.ts`
**Dataset:** Ready at `/prisma/manusDataset.json`

**Waiting for you to:**
1. Run the migration SQL
2. Run the seed script
3. Confirm tables created and data loaded

**Then I will test Step 5 end-to-end.**
