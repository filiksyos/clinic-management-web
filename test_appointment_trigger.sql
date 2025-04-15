-- This script will insert a test appointment to verify the trigger works
-- Make sure to run appointment_trigger.sql first

-- Start a transaction so we can rollback if needed
BEGIN;

-- Insert a test appointment
INSERT INTO appointments (
  -- These are sample fields, adjust according to your actual table structure
  patient_id,
  appointment_date,
  status
) VALUES (
  'test-patient-id',  -- Replace with an actual patient ID if needed
  NOW(),              -- Current date/time
  'scheduled'         -- Status
);

-- Commit the transaction
COMMIT;

-- Check logs in Supabase Dashboard -> Database -> Logs
-- Also check Edge Function logs in Supabase Dashboard -> Edge Functions -> appointment-notifications -> Logs 