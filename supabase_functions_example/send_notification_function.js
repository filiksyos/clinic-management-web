// This is an example of a Supabase Edge Function that would be deployed to your Supabase project
// It will be triggered by a database webhook when a new appointment is created

// EdgeFunction: appointment-notifications 
// Trigger: After Insert on appointments table

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'

// Initialize Supabase client with service role for accessing database
const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Firebase Cloud Messaging API endpoint
const FCM_ENDPOINT = 'https://fcm.googleapis.com/fcm/send'
// Get the Firebase Server Key from environment variables
const FIREBASE_SERVER_KEY = Deno.env.get('FIREBASE_SERVER_KEY') || ''

// This function is triggered by a database webhook when a new appointment is created
Deno.serve(async (req) => {
  try {
    // Get the request body which contains the appointment data
    const payload = await req.json()
    
    // Extract the appointment data
    const { record } = payload
    
    if (!record || !record.id || !record.patient_id) {
      return new Response(
        JSON.stringify({ error: 'Invalid appointment data' }),
        { headers: { 'Content-Type': 'application/json' }, status: 400 }
      )
    }
    
    // Get patient details
    const { data: patient, error: patientError } = await supabase
      .from('patients')
      .select('first_name, last_name')
      .eq('id', record.patient_id)
      .single()
    
    if (patientError || !patient) {
      console.error('Error fetching patient:', patientError)
      return new Response(
        JSON.stringify({ error: 'Failed to fetch patient details' }),
        { headers: { 'Content-Type': 'application/json' }, status: 500 }
      )
    }
    
    // Format the appointment date
    const appointmentDate = new Date(record.appointment_date).toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
    
    // Create notification payload
    const notificationPayload = {
      to: '/topics/new_appointments', // Send to all devices subscribed to this topic
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
    }
    
    // Send notification via Firebase Cloud Messaging
    const fcmResponse = await fetch(FCM_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `key=${FIREBASE_SERVER_KEY}`,
      },
      body: JSON.stringify(notificationPayload),
    })
    
    const fcmResult = await fcmResponse.json()
    
    return new Response(
      JSON.stringify({ success: true, result: fcmResult }),
      { headers: { 'Content-Type': 'application/json' }, status: 200 }
    )
    
  } catch (error) {
    console.error('Error processing webhook:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { 'Content-Type': 'application/json' }, status: 500 }
    )
  }
}) 