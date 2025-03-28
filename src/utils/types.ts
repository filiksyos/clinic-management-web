// Define basic types for our clinic management system

// User type
export type User = {
  id: string;
  email: string;
  role: 'admin' | 'doctor' | 'receptionist' | 'patient';
  fullName: string;
  createdAt: string;
};

// Patient type
export type Patient = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  address?: string;
  medicalHistory?: string;
  createdAt: string;
};

// Appointment type
export type Appointment = {
  id: string;
  patientId: string;
  doctorId?: string;
  date: string;
  time: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  notes?: string;
  createdAt: string;
}; 