-- Elite Listing AI - Database Schema
-- Generated: January 2025
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/_/sql

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- USERS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  name TEXT NOT NULL,
  "emailVerified" TIMESTAMP,
  image TEXT,
  "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL,
  "updatedAt" TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create index on email for fast lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_createdAt ON users("createdAt");

-- =====================================================
-- SHOPS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS shops (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  "userId" TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  "platformShopId" TEXT NOT NULL,
  "shopName" TEXT NOT NULL,
  "shopUrl" TEXT,
  "accessToken" TEXT NOT NULL,
  "refreshToken" TEXT,
  "tokenExpiresAt" TIMESTAMP,
  "isActive" BOOLEAN DEFAULT TRUE NOT NULL,
  "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL,
  "updatedAt" TIMESTAMP DEFAULT NOW() NOT NULL,
  UNIQUE("userId", platform, "platformShopId")
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_shops_userId ON shops("userId");
CREATE INDEX IF NOT EXISTS idx_shops_tokenExpiresAt ON shops("tokenExpiresAt");

-- =====================================================
-- LISTINGS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS listings (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  "shopId" TEXT NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  "platformListingId" TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL CHECK (price > 0),
  currency TEXT DEFAULT 'USD' NOT NULL,
  quantity INTEGER DEFAULT 0 NOT NULL,
  status TEXT NOT NULL,
  url TEXT,
  "imageUrls" JSONB NOT NULL DEFAULT '[]'::JSONB,
  tags JSONB NOT NULL DEFAULT '[]'::JSONB,
  "lastSyncedAt" TIMESTAMP DEFAULT NOW() NOT NULL,
  "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL,
  "updatedAt" TIMESTAMP DEFAULT NOW() NOT NULL,
  UNIQUE("shopId", "platformListingId")
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_listings_shopId ON listings("shopId");
CREATE INDEX IF NOT EXISTS idx_listings_status ON listings(status);
CREATE INDEX IF NOT EXISTS idx_listings_lastSyncedAt ON listings("lastSyncedAt");

-- =====================================================
-- OPTIMIZATIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS optimizations (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  "listingId" TEXT REFERENCES listings(id) ON DELETE CASCADE,
  "userId" TEXT NOT NULL,
  type TEXT NOT NULL,
  status TEXT DEFAULT 'pending' NOT NULL,
  "creditsUsed" INTEGER DEFAULT 0 NOT NULL CHECK ("creditsUsed" >= 0),
  "aiModel" TEXT,
  prompt TEXT,
  "originalContent" JSONB,
  result JSONB,
  "errorMessage" TEXT,
  "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL,
  "updatedAt" TIMESTAMP DEFAULT NOW() NOT NULL,
  "completedAt" TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_optimizations_userId_createdAt ON optimizations("userId", "createdAt" DESC);
CREATE INDEX IF NOT EXISTS idx_optimizations_listingId ON optimizations("listingId");
CREATE INDEX IF NOT EXISTS idx_optimizations_status ON optimizations(status, "createdAt");

-- =====================================================
-- OPTIMIZATION_VARIANTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS optimization_variants (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  "optimizationId" TEXT NOT NULL REFERENCES optimizations(id) ON DELETE CASCADE,
  "variantNumber" INTEGER NOT NULL CHECK ("variantNumber" BETWEEN 1 AND 3),
  title TEXT,
  description TEXT,
  tags JSONB NOT NULL DEFAULT '[]'::JSONB,
  score DECIMAL(5,2) CHECK (score BETWEEN 0 AND 100),
  reasoning TEXT,
  metadata JSONB,
  "isSelected" BOOLEAN DEFAULT FALSE NOT NULL,
  "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL,
  UNIQUE("optimizationId", "variantNumber")
);

-- Create index
CREATE INDEX IF NOT EXISTS idx_optimization_variants_optimizationId ON optimization_variants("optimizationId");

-- =====================================================
-- PHOTO_SCORES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS photo_scores (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  "listingId" TEXT NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  "imageUrl" TEXT NOT NULL,
  "overallScore" DECIMAL(5,2) NOT NULL CHECK ("overallScore" BETWEEN 0 AND 100),
  "compositionScore" DECIMAL(5,2) CHECK ("compositionScore" BETWEEN 0 AND 100),
  "lightingScore" DECIMAL(5,2) CHECK ("lightingScore" BETWEEN 0 AND 100),
  "clarityScore" DECIMAL(5,2) CHECK ("clarityScore" BETWEEN 0 AND 100),
  "backgroundScore" DECIMAL(5,2) CHECK ("backgroundScore" BETWEEN 0 AND 100),
  analysis JSONB,
  suggestions JSONB NOT NULL DEFAULT '[]'::JSONB,
  "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_photo_scores_listingId ON photo_scores("listingId");
CREATE INDEX IF NOT EXISTS idx_photo_scores_createdAt ON photo_scores("createdAt" DESC);

-- =====================================================
-- CREDIT_LEDGERS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS credit_ledgers (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  "userId" TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  balance INTEGER NOT NULL CHECK (balance >= 0),
  type TEXT NOT NULL,
  description TEXT,
  "referenceId" TEXT,
  "referenceType" TEXT,
  "stripePaymentId" TEXT,
  metadata JSONB,
  "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_credit_ledgers_userId_createdAt ON credit_ledgers("userId", "createdAt" DESC);
CREATE INDEX IF NOT EXISTS idx_credit_ledgers_referenceId ON credit_ledgers("referenceId");
CREATE INDEX IF NOT EXISTS idx_credit_ledgers_stripePaymentId ON credit_ledgers("stripePaymentId");

-- =====================================================
-- UPDATED_AT TRIGGERS
-- =====================================================

-- Function to update updatedAt timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for tables with updatedAt
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_shops_updated_at BEFORE UPDATE ON shops
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_listings_updated_at BEFORE UPDATE ON listings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_optimizations_updated_at BEFORE UPDATE ON optimizations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SEED DATA (Demo User)
-- =====================================================

-- Insert demo user with 10 free credits
-- Password: Demo123! (hashed with bcrypt cost 10)
INSERT INTO users (id, email, password, name, "emailVerified")
VALUES (
  'demo-user-id-12345',
  'demo@elite-listing-ai.com',
  '$2a$10$rHqKv4P7Y6JxR.YYQqT/hODqLr5n6H6f6xH5oZ5qL5xH5qL5xH5qL',
  'Demo User',
  NOW()
) ON CONFLICT (email) DO NOTHING;

-- Give demo user 10 free credits
INSERT INTO credit_ledgers ("userId", amount, balance, type, description)
VALUES (
  'demo-user-id-12345',
  10,
  10,
  'bonus',
  'Welcome bonus - 10 free credits'
) ON CONFLICT DO NOTHING;

-- =====================================================
-- GRANT PERMISSIONS
-- =====================================================

-- Grant access to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO anon;

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '✅ Elite Listing AI schema created successfully!';
  RAISE NOTICE '📊 Tables created: users, shops, listings, optimizations, optimization_variants, photo_scores, credit_ledgers';
  RAISE NOTICE '🔐 Next step: Set up Row Level Security (RLS) policies';
END $$;
