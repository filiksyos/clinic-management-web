// Supabase Edge Function with hardcoded Firebase credentials
// IMPORTANT: This approach is less secure but easier to set up initially
// For production, use environment variables instead

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

// Initialize Supabase client - will use service role from Edge Function
const supabaseClient = createClient(
  Deno.env.get('SUPABASE_URL') || '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
);

// Hardcoded Firebase project credentials
const FIREBASE_PROJECT_ID = "clinic-management-90817";
const FCM_V1_ENDPOINT = `https://fcm.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/messages:send`;

// Hardcoded Firebase service account credentials
const serviceAccount = {
  "type": "service_account",
  "project_id": "clinic-management-90817",
  "private_key_id": "f9c776b89fc447b2b7893d9201c5d4e07c993781",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCsZ5643uluOSeo\nJ0lzsKTHRewWfsKpgv+YhwrM5/h73AnxupYJHzDgTG1ElLfTd2VKYeZ1zGkrsIx4\nk1lk4xPqUQsmORZPs53tVAPnZrYvxgV9+hf3ncv7hZsVd3gzyyl4Nx2Sm1ve4QP8\nDCK0gdwc4JOwpbHgGzwbgtS3ViWoKiaujfSwzjc7ytfO8NZhROhHWQoGBrIbS1VU\nnDpo4WGVut+6luk1WeReJzqSXvv0z3dX2yDPxi7Aw/6qz5gY5lcMLjDxDrqW5Rt7\n6vD5twPZLpEg+LPgV2n7cfhPSvV6fr22RzRSw+sBJhrPU9iwrKhHRrz5x9Axwmdv\nipWKEoRbAgMBAAECggEATRZR9piZaHL+4+WZJrUDoKSHoTFRqgjMb29maWOJjBxB\niAflYTPEn24c527V2SSIMl+e8+oP1nys+pbsADu2om1VXmRlMQL/qOgJjNS0vpy8\nxOzn/Yxdclv1kX4nTYVYSAvg2bZEuF4FcZQdineMK49RCkm0RJ/42tY/dbB7yvo9\nTlmIrAUj5ARJtvIhkV+qDT5njrk8Hm/KUzhF47WpUKQ1lF4nUM0d8k1iu812JAje\ntsSgs37pCtgXOGoeNyUuAfW7kSnaBTk83Rbr65uTsaO7RoMgOYiDChN3rdDQiJii\nQUzUDYhkWK84rCzAcJN81BbF/ZhA28fgV0dlOGsY5QKBgQDlpXKawBYK+scH5v8D\njCe+nsqFstfNdSWRnw0F5+oRiUy4gm3DYWl5J5Fm6ZjnLnXSIzTqmK7loGBnCznX\nJCpKMRJClMoZS5UrpBqxkONHd6G5Xe3HfYARot7jBhUol6lidyPBUnScUHI3s95S\nx8Xbq/fLzbNhmEllcvWT01RspQKBgQDAMIe4A+EkUNffIZC3eIWPeqlkG/a3d+3+\ntFOlN8PuRnOGJVLTjRgGwKKvpI+sQEa5mndY0Ezj8BBWDLtIe2l/Hoc+7jgrsjRX\nzOmhaVRWlMH/q7+iEy/su7VBu6q/i/bHJKQXJoSSopJEbLKAHoQYN6rPkdhd8rXi\ndftk/ANc/wKBgF+FXhI4a/LNNRR4ZQKYvb9wVVUfetwfKi1UNxqJyLbaoWrt9bIb\nRr/6UWS5Lbybeq6Zrl0WfUlOWEsERF7U0DJkDvBa62VyJu4sKF5Lof4MKNzt0QX1\nkdvEH2nXEd38l5w5aknzfkW2wIui6YsNRaOF+GBxg3fI3F6yXqvKb4dxAoGAWe0b\nQ/4EtaJiL9Sby01IaUdCxUXUXipuoNQto0wBkJdEbMtAAx6s1FQEi1zboQR+U1A0\ncckdgTYN3sWcSCD+zu0w6UA75i4/Eaoe01jejpiSYZgyVZrWvNVjzXsLPQ83jBzX\n7sEmHRqWiA+4QfyFYHODqBYdAHCVrH36AFlvFW8CgYEApn7fALf2HaJt1xmHAs+M\nczAoY3X8JBn1iN5xQZV1NKuPTa7aDJE4pYslOOvSTFrtzW5wUd5L+9TFNWcYY56w\nzVNN+pvJGPtu1Vl6fM2eKrCz15VZwLVQHGAsc+/mR9gOj40ggdJdyh3wSPUc1mF4\n5IuIJlN5ICQG4E69So4Ncqs=\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-fbsvc@clinic-management-90817.iam.gserviceaccount.com",
  "client_id": "112167367436930407979",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40clinic-management-90817.iam.gserviceaccount.com",
  "universe_domain": "googleapis.com"
};

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
    
    // We need to handle the private key differently in Deno
    // First we need to normalize line breaks in the private key
    const privateKey = serviceAccount.private_key.replace(/\\n/g, "\n");
    
    try {
      // Import the key for signing
      const importKey = await crypto.subtle.importKey(
        'pkcs8',
        new TextEncoder().encode(privateKey),
        { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
        false,
        ['sign']
      );
      
      // Create base64url encoded parts
      const base64UrlEncode = (str: string): string => {
        return btoa(str)
          .replace(/\+/g, '-')
          .replace(/\//g, '_')
          .replace(/=+$/, '');
      };
      
      const jwtHeader = base64UrlEncode(JSON.stringify(header));
      const jwtPayload = base64UrlEncode(JSON.stringify(payload));
      
      // Create the content to be signed
      const content = `${jwtHeader}.${jwtPayload}`;
      
      // Sign the content
      const signature = await crypto.subtle.sign(
        { name: 'RSASSA-PKCS1-v1_5' },
        importKey,
        new TextEncoder().encode(content)
      );
      
      // Convert the signature to base64url
      const base64Signature = base64UrlEncode(
        String.fromCharCode(...new Uint8Array(signature))
      );
      
      // Create the complete JWT
      const jwt = `${content}.${base64Signature}`;
      
      // Exchange the JWT for an access token
      const tokenResponse = await fetch(authTokenEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
          assertion: jwt
        })
      });
      
      const tokenData = await tokenResponse.json();
      
      if (tokenData.error) {
        console.error('Token error:', tokenData.error_description || tokenData.error);
        throw new Error(tokenData.error_description || tokenData.error);
      }
      
      return tokenData.access_token;
    } catch (err) {
      console.error('Error in JWT creation or signing:', err);
      throw err;
    }
  } catch (error) {
    console.error('Error getting access token:', error);
    throw error;
  }
}

// This function is triggered by a database webhook when a new appointment is created
serve(async (req: Request) => {
  try {
    console.log('Appointment notification function triggered');
    
    // Get the request body which contains the appointment data
    const payload = await req.json() as WebhookPayload;
    
    // Extract the appointment data
    const { record } = payload;
    
    if (!record || !record.id || !record.patient_id) {
      console.error('Invalid appointment data', record);
      return new Response(
        JSON.stringify({ error: 'Invalid appointment data' }),
        { headers: { 'Content-Type': 'application/json' }, status: 400 }
      );
    }
    
    console.log('Processing appointment:', record.id);
    
    // Get patient details
    const { data: patient, error: patientError } = await supabaseClient
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
    
    console.log('Patient found:', patient.first_name, patient.last_name);
    
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
    console.log('Getting FCM access token...');
    const accessToken = await getAccessToken();
    console.log('FCM access token obtained');
    
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
    
    console.log('Sending notification to FCM...');
    
    // Send notification via Firebase Cloud Messaging V1 API
    const fcmResponse = await fetch(FCM_V1_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify(fcmPayload),
    });
    
    const fcmResult = await fcmResponse.json();
    console.log('FCM response:', fcmResult);
    
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