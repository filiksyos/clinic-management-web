// Simplified Supabase Edge Function with Firebase notification
// This version includes more debugging and focuses on core functionality
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

// Initialize Supabase client
const supabaseClient = createClient(
  Deno.env.get('SUPABASE_URL') || '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
);

// Firebase configuration
const FIREBASE_PROJECT_ID = "clinic-management-90817";
const FCM_V1_ENDPOINT = `https://fcm.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/messages:send`;

// Hardcoded Firebase service account credentials - replace with your own in production
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

// Function to get an OAuth2 access token for FCM API
async function getAccessToken() {
  console.log("Starting token acquisition");
  try {
    const now = Math.floor(Date.now() / 1000);
    const authTokenEndpoint = 'https://oauth2.googleapis.com/token';
    
    // Create JWT header
    const header = {
      alg: 'RS256',
      typ: 'JWT',
      kid: serviceAccount.private_key_id
    };
    
    // Create JWT payload
    const payload = {
      iss: serviceAccount.client_email,
      sub: serviceAccount.client_email,
      aud: 'https://oauth2.googleapis.com/token',
      iat: now,
      exp: now + 3600, // 1 hour
      scope: 'https://www.googleapis.com/auth/firebase.messaging'
    };
    
    // Process private key correctly
    const privateKey = serviceAccount.private_key.replace(/\\n/g, "\n");
    
    // Base64Url encode function
    const base64UrlEncode = (str) => {
      return btoa(str)
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
    };
    
    // Import the private key
    const importKey = await crypto.subtle.importKey(
      'pkcs8',
      new TextEncoder().encode(privateKey),
      { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
      false,
      ['sign']
    );
    
    // Create JWT components
    const jwtHeader = base64UrlEncode(JSON.stringify(header));
    const jwtPayload = base64UrlEncode(JSON.stringify(payload));
    const content = `${jwtHeader}.${jwtPayload}`;
    
    // Sign the JWT
    const signature = await crypto.subtle.sign(
      { name: 'RSASSA-PKCS1-v1_5' },
      importKey,
      new TextEncoder().encode(content)
    );
    
    // Create complete JWT
    const signatureBytes = new Uint8Array(signature);
    let binaryString = '';
    signatureBytes.forEach(byte => {
      binaryString += String.fromCharCode(byte);
    });
    
    const base64Signature = base64UrlEncode(binaryString);
    const jwt = `${content}.${base64Signature}`;
    
    console.log("JWT created successfully");
    
    // Exchange JWT for access token
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
    
    console.log("Access token acquired successfully");
    return tokenData.access_token;
  } catch (error) {
    console.error('Error getting access token:', error);
    throw error;
  }
}

// Main handler function for the webhook
serve(async (req) => {
  console.log('=========================================');
  console.log('FUNCTION INVOKED:', new Date().toISOString());
  console.log('=========================================');
  
  try {
    // Parse the request body
    let payload;
    try {
      payload = await req.json();
      console.log('Request payload received:', JSON.stringify(payload).substring(0, 200) + '...');
    } catch (e) {
      console.error('Failed to parse request body:', e);
      return new Response(
        JSON.stringify({ error: 'Invalid JSON in request body' }),
        { headers: { 'Content-Type': 'application/json' }, status: 400 }
      );
    }
    
    // Validate payload structure
    if (!payload || !payload.record) {
      console.error('Invalid payload structure:', payload);
      return new Response(
        JSON.stringify({ error: 'Invalid payload structure, expected record field' }),
        { headers: { 'Content-Type': 'application/json' }, status: 400 }
      );
    }
    
    const { record } = payload;
    console.log('Processing appointment record:', JSON.stringify(record));
    
    // Validate appointment data
    if (!record.id || !record.patient_id) {
      console.error('Missing required fields in appointment record');
      return new Response(
        JSON.stringify({ error: 'Missing required fields in appointment record' }),
        { headers: { 'Content-Type': 'application/json' }, status: 400 }
      );
    }
    
    // Fetch patient information
    console.log('Fetching patient data for ID:', record.patient_id);
    const { data: patient, error: patientError } = await supabaseClient
      .from('patients')
      .select('first_name, last_name')
      .eq('id', record.patient_id)
      .single();
    
    if (patientError || !patient) {
      console.error('Error fetching patient data:', patientError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch patient details', details: patientError }),
        { headers: { 'Content-Type': 'application/json' }, status: 500 }
      );
    }
    
    console.log('Patient data retrieved:', patient);
    
    // Format appointment date
    let appointmentDate;
    try {
      appointmentDate = new Date(record.appointment_date).toLocaleString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
      console.log('Formatted appointment date:', appointmentDate);
    } catch (e) {
      console.error('Error formatting date:', e);
      appointmentDate = record.appointment_date; // Fallback to original format
    }
    
    // Get FCM access token
    console.log('Getting FCM access token...');
    const accessToken = await getAccessToken();
    console.log('FCM access token obtained successfully');
    
    // Create FCM payload
    const fcmPayload = {
      message: {
        topic: 'new_appointments',
        notification: {
          title: 'New Appointment',
          body: `New appointment scheduled with ${patient.first_name} ${patient.last_name}`
        },
        data: {
          appointmentId: record.id,
          patientName: `${patient.first_name} ${patient.last_name}`,
          appointmentDate: appointmentDate,
          type: 'new_appointment'
        },
        android: {
          priority: 'high'
        }
      }
    };
    
    console.log('Sending FCM notification with payload:', JSON.stringify(fcmPayload));
    
    // Send FCM notification
    const fcmResponse = await fetch(FCM_V1_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify(fcmPayload)
    });
    
    // Process FCM response
    const fcmResponseText = await fcmResponse.text();
    let fcmResult;
    
    try {
      fcmResult = JSON.parse(fcmResponseText);
      console.log('FCM response:', JSON.stringify(fcmResult));
    } catch (e) {
      console.error('Error parsing FCM response:', e);
      console.log('Raw FCM response:', fcmResponseText);
      fcmResult = { raw: fcmResponseText };
    }
    
    console.log('Notification process completed successfully');
    
    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Notification sent successfully',
        result: fcmResult
      }),
      { headers: { 'Content-Type': 'application/json' }, status: 200 }
    );
    
  } catch (error) {
    // Handle any unexpected errors
    console.error('Unhandled error in function:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      }),
      { headers: { 'Content-Type': 'application/json' }, status: 500 }
    );
  } finally {
    console.log('=========================================');
    console.log('FUNCTION COMPLETED:', new Date().toISOString());
    console.log('=========================================');
  }
}); 