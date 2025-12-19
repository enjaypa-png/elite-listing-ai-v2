-- Migration: Add Manus Keyword Engine
-- DO NOT RUN AUTOMATICALLY - Wait for explicit command

-- Create keywords table
CREATE TABLE IF NOT EXISTS "keywords" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "keyword" TEXT NOT NULL UNIQUE,
  "category" TEXT NOT NULL,
  "subcategory" TEXT,
  "type" TEXT NOT NULL DEFAULT 'product',
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS "keywords_category_idx" ON "keywords"("category");
CREATE INDEX IF NOT EXISTS "keywords_type_idx" ON "keywords"("type");

-- Create long_tail_patterns table
CREATE TABLE IF NOT EXISTS "long_tail_patterns" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "pattern" TEXT NOT NULL UNIQUE,
  "description" TEXT,
  "variables" JSONB NOT NULL,
  "category" TEXT NOT NULL DEFAULT 'general',
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create index
CREATE INDEX IF NOT EXISTS "long_tail_patterns_category_idx" ON "long_tail_patterns"("category");
