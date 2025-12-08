-- Migration: Add payment tracking fields to invoices table
-- Date: 2025-12-05
-- Description: Adds payment_status, payment_reference, and payment_date columns for REVMIS webhook integration

ALTER TABLE invoices ADD COLUMN payment_status VARCHAR(255) NULL;
ALTER TABLE invoices ADD COLUMN payment_reference VARCHAR(255) NULL;
ALTER TABLE invoices ADD COLUMN payment_date DATETIME NULL;

-- Add index for faster lookups by payment_reference
CREATE INDEX idx_invoices_payment_reference ON invoices(payment_reference);
