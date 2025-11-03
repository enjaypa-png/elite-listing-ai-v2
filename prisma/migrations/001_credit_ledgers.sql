-- Credit Ledgers Table - Double-entry bookkeeping for credits
-- Tracks all credit transactions with running balance

CREATE TABLE IF NOT EXISTS credit_ledgers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  
  -- Transaction details
  amount INTEGER NOT NULL, -- positive for add, negative for deduct
  balance_after INTEGER NOT NULL CHECK (balance_after >= 0), -- running balance after this transaction
  transaction_type VARCHAR(50) NOT NULL CHECK (transaction_type IN ('purchase', 'usage', 'refund', 'bonus')),
  description TEXT,
  
  -- Idempotency & references
  reference_id VARCHAR(255) UNIQUE NOT NULL, -- idempotency key (stripe_session_id, optimization_id, etc)
  stripe_session_id VARCHAR(255), -- for purchase/refund transactions
  stripe_payment_intent_id VARCHAR(255),
  related_resource_id UUID, -- optimization_id for usage, etc.
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  
  CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Indexes for performance
CREATE INDEX idx_credit_ledgers_user_id ON credit_ledgers(user_id);
CREATE INDEX idx_credit_ledgers_reference_id ON credit_ledgers(reference_id);
CREATE INDEX idx_credit_ledgers_stripe_session ON credit_ledgers(stripe_session_id);
CREATE INDEX idx_credit_ledgers_created_at ON credit_ledgers(created_at DESC);
CREATE INDEX idx_credit_ledgers_user_created ON credit_ledgers(user_id, created_at DESC);

-- View for user balance (aggregated)
CREATE OR REPLACE VIEW user_credit_balances AS
SELECT 
  user_id,
  COALESCE(SUM(amount), 0) AS total_balance,
  COUNT(*) AS transaction_count,
  MAX(created_at) AS last_transaction_at
FROM credit_ledgers
GROUP BY user_id;

-- Function to get user balance efficiently
CREATE OR REPLACE FUNCTION get_user_credit_balance(p_user_id UUID)
RETURNS INTEGER AS $$
  SELECT COALESCE(balance_after, 0)
  FROM credit_ledgers
  WHERE user_id = p_user_id
  ORDER BY created_at DESC
  LIMIT 1;
$$ LANGUAGE SQL STABLE;

-- Function to add credits (with idempotency)
CREATE OR REPLACE FUNCTION add_credits(
  p_user_id UUID,
  p_amount INTEGER,
  p_transaction_type VARCHAR(50),
  p_description TEXT,
  p_reference_id VARCHAR(255),
  p_stripe_session_id VARCHAR(255) DEFAULT NULL,
  p_stripe_payment_intent_id VARCHAR(255) DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS TABLE(success BOOLEAN, new_balance INTEGER, message TEXT) AS $$
DECLARE
  v_current_balance INTEGER;
  v_new_balance INTEGER;
  v_existing_record UUID;
BEGIN
  -- Check for existing transaction (idempotency)
  SELECT id INTO v_existing_record
  FROM credit_ledgers
  WHERE reference_id = p_reference_id;
  
  IF v_existing_record IS NOT NULL THEN
    -- Already processed
    SELECT balance_after INTO v_new_balance
    FROM credit_ledgers
    WHERE id = v_existing_record;
    
    RETURN QUERY SELECT TRUE, v_new_balance, 'Transaction already processed (idempotent)';
    RETURN;
  END IF;
  
  -- Get current balance
  SELECT COALESCE(get_user_credit_balance(p_user_id), 0) INTO v_current_balance;
  
  -- Calculate new balance
  v_new_balance := v_current_balance + p_amount;
  
  -- Ensure balance doesn't go negative (except for refunds)
  IF v_new_balance < 0 AND p_transaction_type != 'refund' THEN
    RETURN QUERY SELECT FALSE, v_current_balance, 'Insufficient credits';
    RETURN;
  END IF;
  
  -- Insert transaction
  INSERT INTO credit_ledgers (
    user_id,
    amount,
    balance_after,
    transaction_type,
    description,
    reference_id,
    stripe_session_id,
    stripe_payment_intent_id,
    metadata
  ) VALUES (
    p_user_id,
    p_amount,
    v_new_balance,
    p_transaction_type,
    p_description,
    p_reference_id,
    p_stripe_session_id,
    p_stripe_payment_intent_id,
    p_metadata
  );
  
  RETURN QUERY SELECT TRUE, v_new_balance, 'Credits added successfully';
END;
$$ LANGUAGE plpgsql;

COMMENT ON TABLE credit_ledgers IS 'Double-entry ledger tracking all credit transactions with running balance';
COMMENT ON FUNCTION add_credits IS 'Idempotent function to add credits to user account';
COMMENT ON FUNCTION get_user_credit_balance IS 'Get current credit balance for a user';
