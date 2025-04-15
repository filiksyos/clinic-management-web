-- Enable the pg_net extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Create a function to notify the Edge Function
CREATE OR REPLACE FUNCTION notify_appointment_created()
RETURNS TRIGGER AS $$
BEGIN
  -- Call the Edge Function URL with your actual Supabase project reference
  PERFORM
    net.http_post(
      url := 'https://szcvvdedhulcrgpanudt.supabase.co/functions/v1/appointment-notifications',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN6Y3Z2ZGVkaHVsY3JncGFudWR0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDA4Mjg1NzgsImV4cCI6MjAxNjQwNDU3OH0.wICFzK5Ssyx6KYFNK1Q9FeXsNLPyctTmW0VZeUjBPgE'
      ),
      body := jsonb_build_object(
        'record', row_to_json(NEW),
        'schema', TG_TABLE_SCHEMA,
        'table', TG_TABLE_NAME,
        'type', TG_OP
      )
    );
  
  -- Debug log
  RAISE LOG 'Appointment notification sent for appointment ID: %', NEW.id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS appointment_created_trigger ON appointments;

-- Create a trigger on the appointments table
CREATE TRIGGER appointment_created_trigger
AFTER INSERT ON appointments
FOR EACH ROW
EXECUTE FUNCTION notify_appointment_created();

-- Execute a test insert to verify the trigger works (uncomment to test)
-- INSERT INTO appointments (patient_id, appointment_date, status) 
-- VALUES ('some-patient-id', NOW(), 'scheduled'); 