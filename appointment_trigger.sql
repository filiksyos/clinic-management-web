-- Enable the pg_net extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Create a function to notify the Edge Function
CREATE OR REPLACE FUNCTION notify_appointment_created()
RETURNS TRIGGER AS $$
BEGIN
  -- Log that the trigger is executing
  RAISE LOG 'Appointment trigger executing for appointment ID: %', NEW.id;

  -- Call the Edge Function URL with proper authentication
  PERFORM
    net.http_post(
      url := 'https://szcvvdedhulcrgpanudt.supabase.co/functions/v1/appointment-notifications',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN6Y3Z2ZGVkaHVsY3JncGFudWR0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMwNjQyMzYsImV4cCI6MjA1ODY0MDIzNn0.rny5kqX0T7t0rsPwqQ_cXvxsOLKSpAFiMoJse1BwMNI'
      ),
      body := jsonb_build_object(
        'record', row_to_json(NEW),
        'schema', TG_TABLE_SCHEMA,
        'table', TG_TABLE_NAME,
        'type', TG_OP
      )
    );
  
  -- Log completion
  RAISE LOG 'Appointment notification sent for appointment ID: %', NEW.id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS appointment_created_trigger ON appointments;

-- Create a new trigger on the appointments table
CREATE TRIGGER appointment_created_trigger
AFTER INSERT ON appointments
FOR EACH ROW
EXECUTE FUNCTION notify_appointment_created();

-- Log that the trigger has been created
DO $$
BEGIN
  RAISE NOTICE 'Appointment notification trigger installed successfully';
END $$; 