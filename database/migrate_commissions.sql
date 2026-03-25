-- Migration: Fix commissions table for Seller Payout Flow
-- Run this on the LIVE database to apply missing columns and ENUM values.
-- Rivers Rwanda - 2026-03-25

USE rivers_rwanda;

-- Step 1: Add 'completed' to the status ENUM (was missing, caused DB errors on seller confirm-receipt)
ALTER TABLE commissions 
  MODIFY COLUMN status ENUM('pending', 'approved', 'paid', 'completed', 'cancelled') DEFAULT 'pending';

-- Step 2: Add payout_proof_path column (was missing, caused upload proof to fail silently)
ALTER TABLE commissions 
  ADD COLUMN IF NOT EXISTS payout_proof_path VARCHAR(255) NULL AFTER paid_at;

SELECT 'Migration complete. commissions table now has payout_proof_path column and completed status.' AS result;
