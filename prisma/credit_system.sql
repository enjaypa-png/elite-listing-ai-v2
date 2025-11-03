-- Credit Packages
CREATE TABLE IF NOT EXISTS credit_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  credits INTEGER NOT NULL,
  price_cents INTEGER NOT NULL,
  stripe_price_id VARCHAR(100),
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Credit Ledger (tracks all credit transactions)
CREATE TABLE IF NOT EXISTS credit_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  amount INTEGER NOT NULL, -- positive for add, negative for deduct
  balance_after INTEGER NOT NULL,
  transaction_type VARCHAR(50) NOT NULL, -- 'purchase', 'optimization', 'refund', 'bonus'
  reference_id VARCHAR(100) UNIQUE, -- for idempotency (Stripe payment_intent_id, optimization_id, etc)
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_credit_ledger_user ON credit_ledger(user_id);
CREATE INDEX idx_credit_ledger_reference ON credit_ledger(reference_id);

-- Optimizations (tracks optimization requests)
CREATE TABLE IF NOT EXISTS optimizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  platform VARCHAR(50) NOT NULL, -- 'etsy', 'shopify', 'ebay'
  source VARCHAR(50), -- 'manual', 'etsy_import'
  
  -- Original listing data
  original_title TEXT NOT NULL,
  original_description TEXT,
  original_tags TEXT[],
  original_price VARCHAR(50),
  etsy_listing_id BIGINT,
  
  -- Health score
  health_score INTEGER,
  health_analysis JSONB,
  
  -- Status
  status VARCHAR(50) DEFAULT 'processing', -- 'processing', 'completed', 'failed'
  error_message TEXT,
  
  -- Credits
  credits_used INTEGER DEFAULT 1,
  
  created_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP,
  
  CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_optimizations_user ON optimizations(user_id);
CREATE INDEX idx_optimizations_etsy_listing ON optimizations(etsy_listing_id);

-- Optimization Variants (3 variants per optimization)
CREATE TABLE IF NOT EXISTS optimization_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  optimization_id UUID NOT NULL,
  variant_number INTEGER NOT NULL, -- 1, 2, or 3
  
  title TEXT NOT NULL,
  description TEXT,
  tags TEXT[],
  
  -- Variant-specific scores
  seo_score INTEGER,
  readability_score INTEGER,
  engagement_score INTEGER,
  
  -- AI reasoning
  improvements JSONB, -- array of improvement explanations
  
  created_at TIMESTAMP DEFAULT NOW(),
  
  CONSTRAINT fk_optimization FOREIGN KEY (optimization_id) REFERENCES optimizations(id) ON DELETE CASCADE,
  UNIQUE(optimization_id, variant_number)
);

CREATE INDEX idx_variants_optimization ON optimization_variants(optimization_id);

-- Insert default credit packages
INSERT INTO credit_packages (name, credits, price_cents, description) VALUES
  ('Starter Pack', 10, 990, '10 optimizations - Perfect for getting started'),
  ('Pro Pack', 50, 3990, '50 optimizations - Best value for active sellers'),
  ('Business Pack', 200, 12990, '200 optimizations - For high-volume shops')
ON CONFLICT DO NOTHING;
