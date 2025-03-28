export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          full_name: string;
          role: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          full_name: string;
          role: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string;
          role?: string;
          created_at?: string;
        };
      };
      patients: {
        Row: {
          id: string;
          full_name: string;
          email: string;
          phone: string;
          date_of_birth: string;
          address: string | null;
          medical_history: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          full_name: string;
          email: string;
          phone: string;
          date_of_birth: string;
          address?: string | null;
          medical_history?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string;
          email?: string;
          phone?: string;
          date_of_birth?: string;
          address?: string | null;
          medical_history?: string | null;
          created_at?: string;
        };
      };
      appointments: {
        Row: {
          id: string;
          patient_id: string;
          doctor_id: string | null;
          date: string;
          time: string;
          status: string;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          patient_id: string;
          doctor_id?: string | null;
          date: string;
          time: string;
          status: string;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          patient_id?: string;
          doctor_id?: string | null;
          date?: string;
          time?: string;
          status?: string;
          notes?: string | null;
          created_at?: string;
        };
      };
    };
  };
}; 