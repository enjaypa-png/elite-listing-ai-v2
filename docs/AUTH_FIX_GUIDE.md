# Auth Issue Fix Guide

## Problem: "Invalid login credentials" Error

This error occurs when there's a mismatch between Supabase Auth and the database.

## Quick Fix

### Option 1: Use the Fix Script (Recommended)

```bash
cd /app/elite-listing-ai-v2

# Check user status
node scripts/fix-auth-user.js enjaypa@gmail.com

# If script suggests deletion, run:
node scripts/fix-auth-user.js --delete enjaypa@gmail.com

# Then sign up again with the same email
```

### Option 2: Manual Fix via Supabase Dashboard

1. **Go to Supabase Dashboard → Authentication → Users**
2. **Find the user by email:** `enjaypa@gmail.com`
3. **Check if user exists:**
   - If YES → Reset password or delete user
   - If NO → Go to step 4

4. **Go to Supabase Dashboard → Table Editor → users table**
5. **Find the user by email:** `enjaypa@gmail.com`
6. **Check if user exists:**
   - If YES → Delete the database record
   - If NO → User doesn't exist anywhere (clean slate)

7. **Sign up again** with the same email

### Option 3: SQL Fix (Advanced)

```sql
-- Run in Supabase SQL Editor

-- 1. Check current state
SELECT id, email, name FROM users WHERE email = 'enjaypa@gmail.com';

-- 2. If user exists in DB, delete it
DELETE FROM users WHERE email = 'enjaypa@gmail.com';

-- Note: This will cascade delete all related data (shops, listings, etc.)
```

## Understanding the Issue

### Scenario 1: User in DB but not in Auth
- **Cause:** Database record was created but Auth creation failed
- **Symptom:** Signup says "email exists", signin fails
- **Fix:** Delete DB record, sign up again

### Scenario 2: User in Auth but not in DB
- **Cause:** Auth creation succeeded but DB insert failed
- **Symptom:** Signin succeeds but dashboard fails
- **Fix:** Run fix script to create DB record

### Scenario 3: ID Mismatch
- **Cause:** User was created twice with different IDs
- **Symptom:** Data inconsistency, permission errors
- **Fix:** Delete both records, sign up again

### Scenario 4: Wrong Password
- **Cause:** User forgot password or typo during signup
- **Symptom:** "Invalid credentials" error
- **Fix:** Use password reset flow

## Prevention

The updated `auth-helpers.ts` now includes:
- ✅ Check if user exists before creating
- ✅ Skip duplicate user creation
- ✅ Better error logging
- ✅ Automatic sync detection

## Testing After Fix

```bash
# Run the test suite
cd /app/elite-listing-ai-v2
node test-phase2.js

# Should see:
# ✓ User signup successful
# ✓ User signin successful
# ✓ Dashboard loaded: email@example.com, 10 credits
```

## If All Else Fails

**Nuclear Option: Clean Database**

```sql
-- WARNING: This deletes ALL users and related data!
-- Only use in development

TRUNCATE TABLE credit_ledgers CASCADE;
TRUNCATE TABLE photo_scores CASCADE;
TRUNCATE TABLE optimization_variants CASCADE;
TRUNCATE TABLE optimizations CASCADE;
TRUNCATE TABLE listings CASCADE;
TRUNCATE TABLE shops CASCADE;
TRUNCATE TABLE users CASCADE;

-- Then delete all users from Supabase Auth Dashboard
```

## Common Errors

### Error: "duplicate key value violates unique constraint 'users_email_key'"
- **Meaning:** Email already exists in database
- **Fix:** Delete DB record or use fix script

### Error: "User already registered"
- **Meaning:** Email already exists in Supabase Auth
- **Fix:** Sign in instead, or reset password

### Error: "Invalid login credentials"
- **Meaning:** Password wrong OR user not synced
- **Fix:** Use fix script to check sync status

### Error: "Email not confirmed"
- **Meaning:** User hasn't clicked verification email
- **Fix:** Check spam folder, or disable email verification in Supabase settings

## Support

For persistent issues:
1. Check Supabase logs: Dashboard → Logs
2. Check application logs: `/var/log/supervisor/*.log`
3. Run fix script with email: `node scripts/fix-auth-user.js <email>`
4. Contact support with error messages

---

**Last Updated:** Phase 2 Implementation  
**Status:** Auth flow improved with better error handling
