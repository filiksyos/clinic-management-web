// This is a Supabase Edge Function that sends notifications via Firebase when a new appointment is created
// Deploy this to your Supabase project under a function named "appointment-notifications"

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

// Types for our data
interface AppointmentRecord {
  id: string;
  patient_id: string;
  appointment_date: string;
  status: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

interface WebhookPayload {
  record: AppointmentRecord;
  schema: string;
  table: string;
  type: string;
  old_record?: AppointmentRecord;
}

interface Patient {
  first_name: string;
  last_name: string;
}

// Initialize Supabase client with service role for accessing database
const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Firebase Cloud Messaging API V1 endpoint
const FCM_V1_ENDPOINT = 'https://fcm.googleapis.com/v1/projects/{PROJECT_ID}/messages:send';
// Replace {PROJECT_ID} with your actual Firebase project ID
const FIREBASE_PROJECT_ID = Deno.env.get('FIREBASE_PROJECT_ID') || '';
const FCM_ENDPOINT = FCM_V1_ENDPOINT.replace('{PROJECT_ID}', FIREBASE_PROJECT_ID);

// Get the Firebase Service Account credentials from environment variables
// You'll need to add this as a secret in your Supabase project
const FIREBASE_SERVICE_ACCOUNT = Deno.env.get('FIREBASE_SERVICE_ACCOUNT') || '{}';
const serviceAccount = JSON.parse(FIREBASE_SERVICE_ACCOUNT);

// Function to get an OAuth2 access token for the FCM API
async function getAccessToken(): Promise<string> {
  try {
    const now = Math.floor(Date.now() / 1000);
    const authTokenEndpoint = 'https://oauth2.googleapis.com/token';
    
    // Create the JWT header
    const header = {
      alg: 'RS256',
      typ: 'JWT',
      kid: serviceAccount.private_key_id
    };
    
    // Create the JWT payload
    const payload = {
      iss: serviceAccount.client_email,
      sub: serviceAccount.client_email,
      aud: 'https://oauth2.googleapis.com/token',
      iat: now,
      exp: now + 3600, // Token valid for 1 hour
      scope: 'https://www.googleapis.com/auth/firebase.messaging'
    };
    
    // Unfortunately, we need to load a library to sign the JWT
    // In a Supabase Edge Function, you can use this method to sign the JWT
    const importKey = await crypto.subtle.importKey(
      'pkcs8',
      new TextEncoder().encode(serviceAccount.private_key),
      { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
      false,
      ['sign']
    );
    
    const jwt = [
      btoa(JSON.stringify(header)),
      btoa(JSON.stringify(payload))
    ].join('.');
    
    const signature = await crypto.subtle.sign(
      { name: 'RSASSA-PKCS1-v1_5' },
      importKey,
      new TextEncoder().encode(jwt)
    );
    
    const base64Signature = btoa(String.fromCharCode(...new Uint8Array(signature)));
    const signedJwt = `${jwt}.${base64Signature}`;
    
    // Exchange the JWT for an access token
    const tokenResponse = await fetch(authTokenEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        assertion: signedJwt
      })
    });
    
    const tokenData = await tokenResponse.json();
    return tokenData.access_token;
  } catch (error) {
    console.error('Error getting access token:', error);
    throw error;
  }
}

// This function is triggered by a database webhook when a new appointment is created
serve(async (req: Request) => {
  try {
    // Get the request body which contains the appointment data
    const payload = await req.json() as WebhookPayload;
    
    // Extract the appointment data
    const { record } = payload;
    
    if (!record || !record.id || !record.patient_id) {
      return new Response(
        JSON.stringify({ error: 'Invalid appointment data' }),
        { headers: { 'Content-Type': 'application/json' }, status: 400 }
      );
    }
    
    // Get patient details
    const { data: patient, error: patientError } = await supabase
      .from('patients')
      .select('first_name, last_name')
      .eq('id', record.patient_id)
      .single();
    
    if (patientError || !patient) {
      console.error('Error fetching patient:', patientError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch patient details' }),
        { headers: { 'Content-Type': 'application/json' }, status: 500 }
      );
    }
    
    // Format the appointment date
    const appointmentDate = new Date(record.appointment_date).toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
    
    // Get an access token for FCM API
    const accessToken = await getAccessToken();
    
    // Create notification payload for FCM API V1
    const fcmPayload = {
      message: {
        topic: 'new_appointments', // Send to all devices subscribed to this topic
        notification: {
          title: 'New Appointment',
          body: `New appointment scheduled with ${patient.first_name} ${patient.last_name}`,
        },
        data: {
          appointmentId: record.id,
          patientName: `${patient.first_name} ${patient.last_name}`,
          appointmentDate: appointmentDate,
          type: 'new_appointment',
        },
        android: {
          priority: 'high',
        },
      }
    };
    
    // Send notification via Firebase Cloud Messaging V1 API
    const fcmResponse = await fetch(FCM_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify(fcmPayload),
    });
    
    const fcmResult = await fcmResponse.json();
    
    return new Response(
      JSON.stringify({ success: true, result: fcmResult }),
      { headers: { 'Content-Type': 'application/json' }, status: 200 }
    );
    
  } catch (error) {
    console.error('Error processing webhook:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { headers: { 'Content-Type': 'application/json' }, status: 500 }
    );
  }
}); 