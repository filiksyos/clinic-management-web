import { supabase } from './supabase';
import { Patient, Appointment } from '../utils/types';

// Patient APIs
export const getPatients = async () => {
  const { data, error } = await supabase
    .from('patients')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data;
};

export const getPatientById = async (id: string) => {
  const { data, error } = await supabase
    .from('patients')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) throw error;
  return data;
};

export const createPatient = async (patient: Omit<Patient, 'id' | 'createdAt'>) => {
  const { data, error } = await supabase
    .from('patients')
    .insert([{
      full_name: patient.fullName,
      email: patient.email,
      phone: patient.phone,
      date_of_birth: patient.dateOfBirth,
      address: patient.address,
      medical_history: patient.medicalHistory,
    }])
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

// Appointment APIs
export const getAppointments = async () => {
  const { data, error } = await supabase
    .from('appointments')
    .select('*, patients(full_name)')
    .order('date', { ascending: true });
  
  if (error) throw error;
  return data;
};

export const getAppointmentById = async (id: string) => {
  const { data, error } = await supabase
    .from('appointments')
    .select('*, patients(full_name)')
    .eq('id', id)
    .single();
  
  if (error) throw error;
  return data;
};

export const createAppointment = async (appointment: Omit<Appointment, 'id' | 'createdAt'>) => {
  const { data, error } = await supabase
    .from('appointments')
    .insert([{
      patient_id: appointment.patientId,
      doctor_id: appointment.doctorId,
      date: appointment.date,
      time: appointment.time,
      status: appointment.status,
      notes: appointment.notes,
    }])
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const updateAppointmentStatus = async (id: string, status: Appointment['status']) => {
  const { data, error } = await supabase
    .from('appointments')
    .update({ status })
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}; 