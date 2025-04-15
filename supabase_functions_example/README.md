# Implementing Appointment Notifications in the Doctor App

This guide explains how to set up real-time push notifications for the doctor Android app when new appointments are created in the web receptionist app.

```mermaid
sequenceDiagram
    participant Web as Web App (Receptionist)
    participant Supabase as Supabase Database
    participant Function as Supabase Function
    participant FCM as Firebase Cloud Messaging
    participant Android as Android App (Doctor)
    
    Web->>Supabase: Create new appointment
    Supabase->>Function: Database trigger on 'appointments' insert
    Function->>FCM: Send notification to topic "new_appointments"
    FCM-->>Android: Push notification to subscribed devices
    Android->>Android: Display notification to doctor
```

## Overview

The implementation consists of:

1. **Android App Configuration**: Setting up Firebase Cloud Messaging in the doctor Android app.
2. **Supabase Edge Function**: Creating a function that sends notifications via Firebase.
3. **Database Trigger**: Setting up a trigger to call the Edge Function when appointments are created.

## Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/) and create a new project.
2. Add an Android app to the project:
   - Package name: `com.ferhatozcelik.androidmvvmtemplate`
   - Register the app
   - Download the `google-services.json` file
   - Place it in the `doctor_android_version/app` directory

## Step 2: Set Up the Android App

1. The Android app has been updated with Firebase Cloud Messaging integration:
   - Added FCM dependencies
   - Created a Firebase Messaging Service
   - Added topic subscription

2. Build and deploy the Android app.

## Step 3: Get Firebase Service Account Credentials

1. Go to your Firebase project settings (gear icon)
2. Select the "Service accounts" tab
3. Under "Firebase Admin SDK", click "Generate new private key"
4. Download the JSON file - this contains your service account credentials
5. Note your Firebase Project ID from the Project settings

## Step 4: Create a Supabase Edge Function

1. In your Supabase project dashboard, go to Edge Functions
2. Create a new function named `appointment-notifications`
3. Copy the TypeScript code from `index.ts` to your function
4. Deploy the function

## Step 5: Set Up Environment Variables

In your Supabase project dashboard:

1. Go to Settings > API
2. Find the "Project Settings" section
3. Click on "Environment variables"
4. Add the following secrets:
   - `FIREBASE_PROJECT_ID`: Your Firebase project ID
   - `FIREBASE_SERVICE_ACCOUNT`: The entire JSON content of your service account file
   
For the service account, you'll need to format it as a stringified JSON. For example:
```
{"type":"service_account","project_id":"your-project-id","private_key_id":"key-id","private_key":"-----BEGIN PRIVATE KEY-----\nYour Private Key\n-----END PRIVATE KEY-----\n","client_email":"service-account-email","client_id":"client-id","auth_uri":"https://accounts.google.com/o/oauth2/auth","token_uri":"https://oauth2.googleapis.com/token","auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs","client_x509_cert_url":"https://www.googleapis.com/robot/v1/metadata/x509/your-service-account"}
```

## Step 6: Create a Database Trigger

1. In your Supabase project dashboard, go to SQL Editor
2. Execute the SQL from `trigger_migration.sql` after updating the Edge Function URL
3. This will create a trigger that calls your Edge Function when appointments are created

## Testing the Implementation

1. Log in to the web receptionist app and create a new appointment
2. The new appointment should trigger a notification to all subscribed doctor apps

## Troubleshooting

- Check the Firebase Console for delivery reports under Cloud Messaging
- Check the Supabase logs for any errors in your Edge Function
- Verify that the database trigger is correctly configured
- Ensure your service account has the "Firebase Cloud Messaging API Admin" role

## Security Considerations

- The Firebase service account credentials should be kept secure as environment variables
- The Edge Function uses the Supabase service role to access patient data. Ensure it's properly secured
- Consider implementing user-specific notifications if needed in the future

## Extending the Implementation

- Add different notification topics based on appointment type, doctor assignment, etc.
- Implement notification settings in the doctor app
- Add deep linking to navigate directly to the appointment details 