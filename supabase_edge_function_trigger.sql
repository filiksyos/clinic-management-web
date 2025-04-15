-- Enable the pg_net extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Create a function to notify the Edge Function
CREATE OR REPLACE FUNCTION notify_appointment_created()
RETURNS TRIGGER AS $$
BEGIN
  -- Call the Edge Function URL (update with your actual Supabase project reference)
  PERFORM
    net.http_post(
      url := 'https://szcvvdedhulcrgpanudt.supabase.co/functions/v1/appointment-notifications',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('supabase_functions.key', true)
      ),
      body := jsonb_build_object(
        'record', row_to_json(NEW),
        'schema', TG_TABLE_SCHEMA,
        'table', TG_TABLE_NAME,
        'type', TG_OP
      )
    );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a trigger on the appointments table
DROP TRIGGER IF EXISTS appointment_created_trigger ON appointments;

CREATE TRIGGER appointment_created_trigger
AFTER INSERT ON appointments
FOR EACH ROW
EXECUTE FUNCTION notify_appointment_created(); 