# Deploying the Fixed Edge Function

We've updated the edge function to fix two key issues:

1. Added mock patient data handling when a patient can't be found
2. Fixed the Firebase private key processing for Deno

## Deployment Instructions

### Using Supabase Dashboard

1. Go to [Supabase Dashboard Functions](https://supabase.com/dashboard/project/szcvvdedhulcrgpanudt/functions)
2. Click on "appointment-notifications"
3. Click "Edit"
4. Paste the complete updated code from `supabase_functions_example/appointment-notifications.ts`
5. Click "Deploy"

## Testing After Deployment

After deploying the fixed function, run:

```bash
node test_edge_function_with_logging.js
```

This will:
1. Call the edge function with proper authentication
2. Log the response details to both console and a log file
3. Provide specific error diagnostics if any issues remain

## Expected Results

If everything works correctly, you should see:
- Status code 200
- A success message in the response
- FCM message details including a message ID

## Common Issues and Solutions

### Firebase Token Creation Problems

If you see errors related to the Firebase token or private key:

1. Make sure the service account credentials are correctly formatted
2. Check that the project ID matches your Firebase project
3. Verify that the Firebase Admin SDK has messaging permissions

### No FCM Messages Received on Android

If the function appears to work but no notifications are received:

1. Check the Android app is subscribing to the "new_appointments" topic on startup
2. Verify the FCM token is being generated and stored correctly
3. Make sure the Android Manifest has the necessary FCM services and permissions

### Database Trigger Not Working

If the SQL trigger doesn't automatically call the edge function:

1. Verify the pg_net extension is enabled
2. Check the SQL trigger is properly set up with the correct function URL
3. Make sure the authorization token in the trigger SQL is valid 