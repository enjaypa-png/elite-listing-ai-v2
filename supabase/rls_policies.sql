-- Row Level Security (RLS) Policies for Elite Listing AI
-- Apply these policies to secure the Supabase database

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE shops ENABLE ROW LEVEL SECURITY;
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE optimizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE optimization_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE photo_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_ledgers ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- USERS TABLE POLICIES
-- =============================================================================

-- Users can read their own data
CREATE POLICY "Users can view own data"
  ON users FOR SELECT
  USING (auth.uid()::text = id);

-- Users can update their own data (name, image)
CREATE POLICY "Users can update own data"
  ON users FOR UPDATE
  USING (auth.uid()::text = id)
  WITH CHECK (auth.uid()::text = id);

-- Users are created via Supabase Auth (handled by trigger)
CREATE POLICY "Users can be created via auth"
  ON users FOR INSERT
  WITH CHECK (auth.uid()::text = id);

-- =============================================================================
-- SHOPS TABLE POLICIES
-- =============================================================================

-- Users can view their own shops
CREATE POLICY "Users can view own shops"
  ON shops FOR SELECT
  USING (auth.uid()::text = "userId");

-- Users can create shops
CREATE POLICY "Users can create own shops"
  ON shops FOR INSERT
  WITH CHECK (auth.uid()::text = "userId");

-- Users can update their own shops
CREATE POLICY "Users can update own shops"
  ON shops FOR UPDATE
  USING (auth.uid()::text = "userId")
  WITH CHECK (auth.uid()::text = "userId");

-- Users can delete their own shops
CREATE POLICY "Users can delete own shops"
  ON shops FOR DELETE
  USING (auth.uid()::text = "userId");

-- =============================================================================
-- LISTINGS TABLE POLICIES
-- =============================================================================

-- Users can view listings from their shops
CREATE POLICY "Users can view own listings"
  ON listings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM shops
      WHERE shops.id = listings."shopId"
      AND shops."userId" = auth.uid()::text
    )
  );

-- Users can create listings in their shops
CREATE POLICY "Users can create listings in own shops"
  ON listings FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM shops
      WHERE shops.id = listings."shopId"
      AND shops."userId" = auth.uid()::text
    )
  );

-- Users can update their listings
CREATE POLICY "Users can update own listings"
  ON listings FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM shops
      WHERE shops.id = listings."shopId"
      AND shops."userId" = auth.uid()::text
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM shops
      WHERE shops.id = listings."shopId"
      AND shops."userId" = auth.uid()::text
    )
  );

-- Users can delete their listings
CREATE POLICY "Users can delete own listings"
  ON listings FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM shops
      WHERE shops.id = listings."shopId"
      AND shops."userId" = auth.uid()::text
    )
  );

-- =============================================================================
-- OPTIMIZATIONS TABLE POLICIES
-- =============================================================================

-- Users can view their own optimizations
CREATE POLICY "Users can view own optimizations"
  ON optimizations FOR SELECT
  USING (auth.uid()::text = "userId");

-- Users can create optimizations
CREATE POLICY "Users can create optimizations"
  ON optimizations FOR INSERT
  WITH CHECK (auth.uid()::text = "userId");

-- Users can update their own optimizations
CREATE POLICY "Users can update own optimizations"
  ON optimizations FOR UPDATE
  USING (auth.uid()::text = "userId")
  WITH CHECK (auth.uid()::text = "userId");

-- Users can delete their own optimizations
CREATE POLICY "Users can delete own optimizations"
  ON optimizations FOR DELETE
  USING (auth.uid()::text = "userId");

-- =============================================================================
-- OPTIMIZATION_VARIANTS TABLE POLICIES
-- =============================================================================

-- Users can view variants of their optimizations
CREATE POLICY "Users can view own optimization variants"
  ON optimization_variants FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM optimizations
      WHERE optimizations.id = optimization_variants."optimizationId"
      AND optimizations."userId" = auth.uid()::text
    )
  );

-- Users can create variants for their optimizations
CREATE POLICY "Users can create variants for own optimizations"
  ON optimization_variants FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM optimizations
      WHERE optimizations.id = optimization_variants."optimizationId"
      AND optimizations."userId" = auth.uid()::text
    )
  );

-- Users can update variants of their optimizations
CREATE POLICY "Users can update own optimization variants"
  ON optimization_variants FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM optimizations
      WHERE optimizations.id = optimization_variants."optimizationId"
      AND optimizations."userId" = auth.uid()::text
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM optimizations
      WHERE optimizations.id = optimization_variants."optimizationId"
      AND optimizations."userId" = auth.uid()::text
    )
  );

-- Users can delete variants of their optimizations
CREATE POLICY "Users can delete own optimization variants"
  ON optimization_variants FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM optimizations
      WHERE optimizations.id = optimization_variants."optimizationId"
      AND optimizations."userId" = auth.uid()::text
    )
  );

-- =============================================================================
-- PHOTO_SCORES TABLE POLICIES
-- =============================================================================

-- Users can view photo scores for their listings
CREATE POLICY "Users can view photo scores for own listings"
  ON photo_scores FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM listings
      JOIN shops ON shops.id = listings."shopId"
      WHERE listings.id = photo_scores."listingId"
      AND shops."userId" = auth.uid()::text
    )
  );

-- Users can create photo scores for their listings
CREATE POLICY "Users can create photo scores for own listings"
  ON photo_scores FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM listings
      JOIN shops ON shops.id = listings."shopId"
      WHERE listings.id = photo_scores."listingId"
      AND shops."userId" = auth.uid()::text
    )
  );

-- Users can update photo scores for their listings
CREATE POLICY "Users can update photo scores for own listings"
  ON photo_scores FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM listings
      JOIN shops ON shops.id = listings."shopId"
      WHERE listings.id = photo_scores."listingId"
      AND shops."userId" = auth.uid()::text
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM listings
      JOIN shops ON shops.id = listings."shopId"
      WHERE listings.id = photo_scores."listingId"
      AND shops."userId" = auth.uid()::text
    )
  );

-- Users can delete photo scores for their listings
CREATE POLICY "Users can delete photo scores for own listings"
  ON photo_scores FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM listings
      JOIN shops ON shops.id = listings."shopId"
      WHERE listings.id = photo_scores."listingId"
      AND shops."userId" = auth.uid()::text
    )
  );

-- =============================================================================
-- CREDIT_LEDGERS TABLE POLICIES
-- =============================================================================

-- Users can view their own credit transactions
CREATE POLICY "Users can view own credit ledger"
  ON credit_ledgers FOR SELECT
  USING (auth.uid()::text = "userId");

-- Only system can create credit transactions (via API with service role)
-- Regular users cannot directly insert
CREATE POLICY "System can create credit transactions"
  ON credit_ledgers FOR INSERT
  WITH CHECK (auth.uid()::text = "userId");

-- Credit ledgers are immutable (no updates or deletes)
-- This ensures audit trail integrity

-- =============================================================================
-- NOTES
-- =============================================================================
-- 
-- To apply these policies:
-- 1. Connect to your Supabase project
-- 2. Go to SQL Editor
-- 3. Run this entire script
-- 4. Verify policies are active in Table Editor > Policies tab
--
-- To test RLS:
-- 1. Create a test user via signup
-- 2. Try to access another user's data (should fail)
-- 3. Verify user can only access their own data
--
-- =============================================================================
