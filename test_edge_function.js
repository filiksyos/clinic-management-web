const https = require('https');

// Test data for the appointment notification
const testData = {
  record: {
    id: "test-id",
    patient_id: "some-patient-id",
    appointment_date: "2023-05-15T14:30:00Z"
  }
};

// Supabase anon key from .env.local
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN6Y3Z2ZGVkaHVsY3JncGFudWR0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMwNjQyMzYsImV4cCI6MjA1ODY0MDIzNn0.rny5kqX0T7t0rsPwqQ_cXvxsOLKSpAFiMoJse1BwMNI";

// Supabase URL and endpoint
const supabaseProject = "szcvvdedhulcrgpanudt";
const functionName = "appointment-notifications";
const edgeFunctionUrl = `https://${supabaseProject}.supabase.co/functions/v1/${functionName}`;

console.log(`Testing edge function at: ${edgeFunctionUrl}`);

// Prepare request options
const reqOptions = {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${supabaseAnonKey}`
  }
};

// Convert test data to JSON
const postData = JSON.stringify(testData);

// Create HTTPS request
const req = https.request(edgeFunctionUrl, reqOptions, (res) => {
  console.log(`Status Code: ${res.statusCode}`);
  console.log(`Headers: ${JSON.stringify(res.headers)}`);
  
  let data = '';
  
  // Collect response data
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  // Process the complete response
  res.on('end', () => {
    console.log('Response Body:');
    try {
      // Try to parse as JSON for nice formatting
      const jsonResponse = JSON.parse(data);
      console.log(JSON.stringify(jsonResponse, null, 2));
    } catch (e) {
      // If not valid JSON, show raw response
      console.log(data);
    }
  });
});

// Handle request errors
req.on('error', (e) => {
  console.error(`Error: ${e.message}`);
});

// Send the test data
req.write(postData);
req.end();

console.log('Request sent. Waiting for response...'); 