# Firebase Cloud Messaging (FCM) Setup Guide

This guide will help you properly set up Firebase Cloud Messaging with Supabase Edge Functions to send notifications to your Android app.

## Problem Analysis

The issue you're experiencing is that your Supabase Edge Function (`appointment-notifications`) doesn't show any execution history, meaning it's not being triggered when new appointments are created. This could be due to several reasons:

1. The SQL trigger is not properly set up
2. The edge function might have errors that prevent execution
3. The environment variables might be missing in Supabase

## Solution Steps

### 1. Deploy the Simplified Edge Function

1. Go to your Supabase dashboard
2. Navigate to Edge Functions
3. Select the `appointment-notifications` function (or create it if it doesn't exist)
4. Replace the code with the contents of `simplified_edge_function.js` 
5. Deploy the function

```bash
# If using Supabase CLI
supabase functions deploy appointment-notifications --project-ref szcvvdedhulcrgpanudt
```

### 2. Fix the SQL Trigger

1. Open the SQL Editor in your Supabase dashboard
2. Run the SQL from `fix_appointment_trigger.sql` in your Supabase SQL editor
3. This will:
   - Enable the pg_net extension (required for HTTP calls)
   - Create the trigger function
   - Set up the trigger on the appointments table

### 3. Test Direct FCM Messaging (Optional)

To verify that your FCM is working correctly, you can run the Node.js test script:

```bash
# Install Node.js if you haven't already
node test_fcm_notification.js
```

This script will:
- Generate a JWT token
- Get an FCM access token
- Send a test notification to the "new_appointments" topic

If this works but the Supabase trigger doesn't, then the issue is with the Supabase configuration.

## Debugging Checklist

If you're still having issues:

1. **Check Logs**: Go to Supabase Dashboard > Edge Functions > appointment-notifications > Logs
   - Look for any error messages during execution

2. **Test the Edge Function Directly**:
   - Use cURL or Postman to send a POST request directly to the edge function URL:
   ```bash
   curl -X POST "https://szcvvdedhulcrgpanudt.supabase.co/functions/v1/appointment-notifications" \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN6Y3Z2ZGVkaHVsY3JncGFudWR0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDA4Mjg1NzgsImV4cCI6MjAxNjQwNDU3OH0.wICFzK5Ssyx6KYFNK1Q9FeXsNLPyctTmW0VZeUjBPgE" \
     -d '{"record": {"id": "test-id", "patient_id": "some-patient-id", "appointment_date": "2023-05-15T14:30:00Z"}}'
   ```

3. **Test the SQL Trigger**:
   - Insert a test row into the appointments table:
   ```sql
   INSERT INTO appointments (patient_id, appointment_date, status) 
   VALUES ('some-patient-id', NOW(), 'scheduled');
   ```
   - Check for logs in the edge function execution history

## Key Points to Remember

1. **Hardcoded Credentials**: While we're using hardcoded Firebase credentials for testing, in a production environment you should use environment variables.

2. **pg_net Extension**: Make sure the pg_net extension is enabled in your Supabase project.

3. **Topics vs Token**: The current implementation sends notifications to all devices subscribed to the 'new_appointments' topic. Make sure your Android app is subscribing to this topic on startup.

4. **FCM Service Account**: The Firebase service account needs the right permissions to send messages. Verify this in your Firebase Console.

## Android App Configuration

Ensure your Android app is correctly set up:

1. The FirebaseMessagingManager should subscribe to the 'new_appointments' topic
2. Your AppFirebaseMessagingService must be registered in AndroidManifest.xml
3. The app must have a valid google-services.json file

By following these steps, your appointment notifications should start working correctly. 