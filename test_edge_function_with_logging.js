const https = require('https');
const fs = require('fs');

// Enable verbose logging
const VERBOSE_LOGGING = true;
const LOG_FILE = 'edge_function_test.log';

// Test data for the appointment notification
const testData = {
  record: {
    id: "test-id-" + Date.now(),  // Make unique for easier tracking
    patient_id: "some-patient-id",
    appointment_date: new Date().toISOString()
  }
};

// Supabase anon key from .env.local
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN6Y3Z2ZGVkaHVsY3JncGFudWR0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMwNjQyMzYsImV4cCI6MjA1ODY0MDIzNn0.rny5kqX0T7t0rsPwqQ_cXvxsOLKSpAFiMoJse1BwMNI";

// Supabase URL and endpoint
const supabaseProject = "szcvvdedhulcrgpanudt";
const functionName = "appointment-notifications";
const edgeFunctionUrl = `https://${supabaseProject}.supabase.co/functions/v1/${functionName}`;

// Log to console and file if enabled
function log(message, isError = false) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}`;
  
  if (isError) {
    console.error(logMessage);
  } else {
    console.log(logMessage);
  }
  
  if (VERBOSE_LOGGING) {
    fs.appendFileSync(LOG_FILE, logMessage + '\n');
  }
}

// Start test logging
log('===== EDGE FUNCTION TEST STARTED =====');
log(`Testing edge function at: ${edgeFunctionUrl}`);
log(`Test data: ${JSON.stringify(testData, null, 2)}`);

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

// Start timer for performance measurement
const startTime = Date.now();

// Create HTTPS request
const req = https.request(edgeFunctionUrl, reqOptions, (res) => {
  const endTime = Date.now();
  const responseTime = endTime - startTime;
  
  log(`Response received in ${responseTime}ms`);
  log(`Status Code: ${res.statusCode}`);
  
  // Log headers in detail
  log('Response Headers:');
  Object.entries(res.headers).forEach(([key, value]) => {
    log(`  ${key}: ${value}`);
  });
  
  // Check for common error codes
  if (res.statusCode === 401) {
    log('Authentication error: Check your Supabase anon key', true);
  } else if (res.statusCode === 403) {
    log('Authorization error: Your key may not have sufficient permissions', true);
  } else if (res.statusCode === 404) {
    log('Function not found: Check the function name and URL', true);
  } else if (res.statusCode === 500) {
    log('Server error: Check the edge function logs in Supabase dashboard', true);
  }
  
  let data = '';
  
  // Collect response data
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  // Process the complete response
  res.on('end', () => {
    log('Response Body:');
    
    try {
      // Try to parse as JSON for nice formatting
      const jsonResponse = JSON.parse(data);
      log(JSON.stringify(jsonResponse, null, 2));
      
      // Check for specific error patterns
      if (jsonResponse.error) {
        if (jsonResponse.error.includes('patient')) {
          log('ERROR: Patient data issue detected. The edge function is having trouble accessing patient data.', true);
          log('SOLUTION: Make sure your patients table exists and has the correct structure with first_name and last_name fields.', true);
        } else if (jsonResponse.error.includes('token')) {
          log('ERROR: Firebase token issue detected. The edge function is having trouble getting a Firebase access token.', true);
          log('SOLUTION: Check the Firebase service account credentials in your edge function.', true);
        }
      }
      
      // Check for success
      if (jsonResponse.success) {
        log('SUCCESS: The edge function processed the request successfully!');
        
        // Check FCM result
        if (jsonResponse.result && jsonResponse.result.name) {
          log(`FCM Notification sent successfully. Message ID: ${jsonResponse.result.name}`);
        }
      }
      
    } catch (e) {
      // If not valid JSON, show raw response
      log('Raw response (not valid JSON):');
      log(data);
      log(`Error parsing JSON: ${e.message}`, true);
    }
    
    log('===== EDGE FUNCTION TEST COMPLETED =====');
  });
});

// Handle request errors
req.on('error', (e) => {
  log(`Network Error: ${e.message}`, true);
  log('===== EDGE FUNCTION TEST FAILED =====');
});

// Send the test data
req.write(postData);
req.end();

log('Request sent. Waiting for response...'); 