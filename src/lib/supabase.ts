import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Create a single supabase client for the entire app
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Define types for our data models
export interface Patient {
  id: string
  first_name: string
  last_name: string
  gender?: string
  age?: number
  created_at: string
  updated_at: string
}

export interface Appointment {
  id: string
  patient_id: string
  appointment_date: string
  status: 'scheduled' | 'completed' | 'cancelled' | 'no-show'
  notes?: string
  created_at: string
  updated_at: string
}

// Role type and authentication helpers
export type UserRole = 'receptionist' | 'doctor';

export async function getUserRole(): Promise<UserRole> {
  try {
    const { data, error } = await supabase.auth.getUser();
    
    if (error) {
      throw error;
    }
    
    const role = data.user?.app_metadata?.role as UserRole;
    return role || 'receptionist'; // Default to receptionist if no role found
  } catch (error) {
    console.error('Error getting user role:', error);
    return 'receptionist';
  }
}

// Patient functions
export async function getPatients() {
  const { data, error } = await supabase
    .from('patients')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data
}

export async function getPatient(id: string) {
  const { data, error } = await supabase
    .from('patients')
    .select('*')
    .eq('id', id)
    .single()
  
  if (error) throw error
  return data
}

export async function createPatient(patientData: Omit<Patient, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('patients')
    .insert([{ ...patientData, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }])
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function updatePatient(id: string, patientData: Partial<Omit<Patient, 'id' | 'created_at'>>) {
  const { data, error } = await supabase
    .from('patients')
    .update({ ...patientData, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function deletePatient(id: string) {
  const { error } = await supabase
    .from('patients')
    .delete()
    .eq('id', id)
  
  if (error) throw error
  return true
}

// Appointment functions
export async function getAppointments() {
  const { data, error } = await supabase
    .from('appointments')
    .select('*, patients(*)')
    .order('appointment_date', { ascending: false })
  
  if (error) throw error
  return data
}

export async function getAppointmentsForDoctor() {
  const { data, error } = await supabase
    .from('appointments')
    .select('*, patients(*)')
    .eq('status', 'scheduled') // Doctors primarily see scheduled appointments
    .order('appointment_date', { ascending: true })
  
  if (error) throw error
  return data
}

export async function getTodaysAppointments() {
  const today = new Date();
  const startOfDay = new Date(today.setHours(0, 0, 0, 0)).toISOString();
  const endOfDay = new Date(today.setHours(23, 59, 59, 999)).toISOString();
  
  const { data, error } = await supabase
    .from('appointments')
    .select('*, patients(*)')
    .gte('appointment_date', startOfDay)
    .lte('appointment_date', endOfDay)
    .order('appointment_date', { ascending: true })
  
  if (error) throw error
  return data
}

export async function getAppointment(id: string) {
  const { data, error } = await supabase
    .from('appointments')
    .select('*, patients(*)')
    .eq('id', id)
    .single()
  
  if (error) throw error
  return data
}

export async function createAppointment(appointmentData: Omit<Appointment, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('appointments')
    .insert([{ ...appointmentData, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }])
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function updateAppointment(id: string, appointmentData: Partial<Omit<Appointment, 'id' | 'created_at'>>) {
  const { data, error } = await supabase
    .from('appointments')
    .update({ ...appointmentData, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function deleteAppointment(id: string) {
  const { error } = await supabase
    .from('appointments')
    .delete()
    .eq('id', id)
  
  if (error) throw error
  return true
} 