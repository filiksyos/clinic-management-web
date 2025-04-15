# Firebase Cloud Messaging Notification Flow

The following diagram illustrates the flow of notifications from your Supabase database to your Android app using Firebase Cloud Messaging.

```mermaid
sequenceDiagram
    participant DB as Supabase Database
    participant Trigger as SQL Trigger
    participant Edge as Edge Function
    participant FCM as Firebase Cloud Messaging
    participant App as Android App

    Note over DB,App: Notification Flow
    
    DB->>Trigger: New appointment inserted
    Trigger->>Edge: HTTP POST to appointment-notifications
    Note right of Edge: Processes appointment data
    Edge->>Edge: Get patient details
    Edge->>Edge: Get FCM access token
    Edge->>FCM: Send notification to 'new_appointments' topic
    FCM->>App: Deliver notification to subscribed devices
    App->>App: Display notification to user
    
    Note over DB,App: Key Components
```

## Detailed Process Explanation

1. **SQL Insert Trigger**: 
   - When a new appointment is inserted into the `appointments` table, a PostgreSQL trigger is activated
   - This trigger uses the `pg_net` extension to make an HTTP call to your Edge Function

2. **Edge Function Processing**:
   - Receives appointment data from the trigger
   - Fetches additional patient details from the database
   - Gets an access token for Firebase by signing a JWT
   - Creates and sends the notification payload to FCM

3. **Firebase Cloud Messaging**:
   - Receives the notification request with an authorization token
   - Delivers the notification to all devices subscribed to the 'new_appointments' topic

4. **Android Application**:
   - Subscribes to the 'new_appointments' topic on startup
   - Receives and processes the notification
   - Displays it to the user with the patient name and appointment time

## Common Failure Points

```mermaid
graph TD
    A[New Appointment Created] --> B{SQL Trigger Working?}
    B -->|No| C[pg_net Extension Not Enabled]
    B -->|No| D[SQL Syntax Errors]
    B -->|Yes| E{Edge Function Called?}
    E -->|No| F[URL Incorrect]
    E -->|No| G[Authorization Issues]
    E -->|Yes| H{FCM Token Generated?}
    H -->|No| I[Firebase Credentials Invalid]
    H -->|Yes| J{Notification Sent?}
    J -->|No| K[FCM Permissions Issue]
    J -->|Yes| L{App Received?}
    L -->|No| M[Topic Subscription Missing]
    L -->|No| N[App in Background/Terminated]
    L -->|Yes| O[Success!]
```

This visual representation should help you understand where potential issues might occur in the notification pipeline and how to address them. 