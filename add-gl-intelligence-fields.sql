-- HERA GL Sub-ledger Intelligence - Add Missing Database Fields
-- Run this in Supabase SQL Editor to enable GL validation and auto-fix features

-- Add GL intelligence fields to universal_transactions table
ALTER TABLE universal_transactions ADD COLUMN IF NOT EXISTS gl_account_id UUID;
ALTER TABLE universal_transactions ADD COLUMN IF NOT EXISTS gl_posting_metadata JSONB;
ALTER TABLE universal_transactions ADD COLUMN IF NOT EXISTS gl_validation_status VARCHAR(20) DEFAULT 'pending';
ALTER TABLE universal_transactions ADD COLUMN IF NOT EXISTS gl_validation_errors JSONB;
ALTER TABLE universal_transactions ADD COLUMN IF NOT EXISTS gl_auto_fix_applied BOOLEAN DEFAULT FALSE;
ALTER TABLE universal_transactions ADD COLUMN IF NOT EXISTS gl_confidence_score DECIMAL(3,2) DEFAULT 0.50;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_transactions_gl_validation_status 
ON universal_transactions(organization_id, gl_validation_status);

CREATE INDEX IF NOT EXISTS idx_transactions_gl_auto_fix 
ON universal_transactions(organization_id, gl_auto_fix_applied);

CREATE INDEX IF NOT EXISTS idx_transactions_gl_confidence 
ON universal_transactions(organization_id, gl_confidence_score);

-- Add comments for documentation
COMMENT ON COLUMN universal_transactions.gl_account_id IS 'GL account associated with this transaction';
COMMENT ON COLUMN universal_transactions.gl_posting_metadata IS 'Metadata about GL posting status and details';
COMMENT ON COLUMN universal_transactions.gl_validation_status IS 'Validation status: pending, validated, warning, error, auto_fixed';
COMMENT ON COLUMN universal_transactions.gl_validation_errors IS 'Array of validation errors and warnings';
COMMENT ON COLUMN universal_transactions.gl_auto_fix_applied IS 'Whether auto-fix has been applied to this transaction';
COMMENT ON COLUMN universal_transactions.gl_confidence_score IS 'AI confidence score for transaction validation (0.00-1.00)';

-- Update existing transactions to have default GL values
UPDATE universal_transactions 
SET 
  gl_validation_status = 'pending',
  gl_auto_fix_applied = FALSE,
  gl_confidence_score = 0.50
WHERE gl_validation_status IS NULL;

-- Show the updated schema
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM information_schema.columns 
WHERE table_name = 'universal_transactions' 
  AND column_name LIKE 'gl_%'
ORDER BY column_name;