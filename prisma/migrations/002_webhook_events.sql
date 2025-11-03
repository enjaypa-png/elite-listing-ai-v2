-- Webhook Events Table - Store last webhook event per user
CREATE TABLE IF NOT EXISTS webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  event_type VARCHAR(100) NOT NULL,
  event_id VARCHAR(255) NOT NULL UNIQUE,
  
  -- Event data
  stripe_session_id VARCHAR(255),
  stripe_payment_intent_id VARCHAR(255),
  amount INTEGER,
  credits INTEGER,
  
  -- Status
  status VARCHAR(50) DEFAULT 'processed', -- 'processed', 'failed', 'duplicate'
  error_message TEXT,
  
  -- Idempotency tracking
  reference_id VARCHAR(255),
  is_duplicate BOOLEAN DEFAULT false,
  
  -- Timestamps
  stripe_created_at TIMESTAMP,
  processed_at TIMESTAMP DEFAULT NOW(),
  
  CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

CREATE INDEX idx_webhook_events_user ON webhook_events(user_id);
CREATE INDEX idx_webhook_events_event_id ON webhook_events(event_id);
CREATE INDEX idx_webhook_events_processed_at ON webhook_events(processed_at DESC);

-- View for latest webhook per user
CREATE OR REPLACE VIEW user_latest_webhooks AS
SELECT DISTINCT ON (user_id)
  user_id,
  event_type,
  event_id,
  status,
  credits,
  is_duplicate,
  processed_at
FROM webhook_events
ORDER BY user_id, processed_at DESC;

COMMENT ON TABLE webhook_events IS 'Stores webhook events for debugging and health monitoring';
