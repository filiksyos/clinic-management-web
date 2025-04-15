-- This is an example SQL migration that would be deployed to your Supabase project
-- It creates a trigger that fires when a new appointment is created

-- Create a function to notify the Edge Function
CREATE OR REPLACE FUNCTION notify_appointment_created()
RETURNS TRIGGER AS $$
BEGIN
  -- Call the Edge Function URL
  PERFORM
    net.http_post(
      url := 'https://your-project-reference.supabase.co/functions/v1/appointment-notifications',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('supabase_functions.key', true)
      ),
      body := jsonb_build_object(
        'record', row_to_json(NEW)
      )
    );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a trigger on the appointments table
CREATE OR REPLACE TRIGGER appointment_created_trigger
AFTER INSERT ON appointments
FOR EACH ROW
EXECUTE FUNCTION notify_appointment_created();

-- Alternatively, if you want to use the Supabase built-in webhook system instead
-- of an Edge Function, you could use this approach:

/*
-- Enable the pg_net extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Create a function to send a webhook
CREATE OR REPLACE FUNCTION send_appointment_webhook()
RETURNS TRIGGER AS $$
BEGIN
  -- Send a webhook to Firebase via a proxy service
  PERFORM
    net.http_post(
      url := 'https://your-firebase-webhook-proxy.com/send',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'X-API-Key', 'your-secret-api-key'
      ),
      body := jsonb_build_object(
        'appointment', row_to_json(NEW),
        'event', 'appointment.created',
        'topic', 'new_appointments'
      )
    );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a trigger on the appointments table
CREATE OR REPLACE TRIGGER appointment_webhook_trigger
AFTER INSERT ON appointments
FOR EACH ROW
EXECUTE FUNCTION send_appointment_webhook();
*/ 