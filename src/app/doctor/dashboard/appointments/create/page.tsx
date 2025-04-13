"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { Card } from "@/components/ui/card";
import { FormSelect } from "@/components/forms/FormSelect";
import { FormInput } from "@/components/forms/FormInput";
import { FormTextarea } from "@/components/forms/FormTextarea";
import { createAppointment, getPatients, Patient, Appointment } from "@/lib/supabase";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import FullPageLoader from "@/components/ui/FullPageLoader"; // Corrected import path

type AppointmentStatus = Appointment['status'];

export default function DoctorCreateAppointmentPage() { // Renamed component
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isFetchingPatients, setIsFetchingPatients] = useState(true);
  const [formData, setFormData] = useState({
    patient_id: "",
    appointment_date: "",
    status: "scheduled" as AppointmentStatus,
    notes: "",
  });

  useEffect(() => {
    async function fetchPatients() {
      try {
        setIsFetchingPatients(true);
        const data = await getPatients();
        setPatients(data);
      } catch (error) {
        console.error("Error fetching patients:", error);
        toast.error("Failed to load patients");
      } finally {
          setIsFetchingPatients(false);
      }
    }

    fetchPatients();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ 
      ...prev, 
      [name]: name === 'status' ? value as AppointmentStatus : value 
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.patient_id) {
      toast.error("Please select a patient");
      return;
    }

    if (!formData.appointment_date) {
      toast.error("Please select an appointment date");
      return;
    }
    
    try {
      setIsLoading(true);
      await createAppointment(formData);
      toast.success("Appointment created successfully");
      router.push("/doctor/dashboard/appointments"); // Redirect to doctor appointments
    } catch (error) {
      console.error("Error creating appointment:", error);
      toast.error("Failed to create appointment");
    } finally {
      setIsLoading(false);
    }
  };

  const patientOptions = patients.map(patient => ({
    value: patient.id,
    label: `${patient.first_name} ${patient.last_name}`
  }));

  const statusOptions = [
    { value: "scheduled", label: "Scheduled" },
    { value: "completed", label: "Completed" },
    { value: "cancelled", label: "Cancelled" },
    { value: "no-show", label: "No Show" },
  ];

  const todayDate = new Date().toISOString().slice(0, 16); // Corrected to allow time selection

  return (
    <div className="mx-5">
      <div className="flex items-center justify-between mt-4">
        <h2 className="text-lg text-gray-800 font-semibold">
          Create Appointment (Doctor View)
        </h2>
        <div className="flex items-center gap-1 text-[#495057] text-sm">
          {/* Updated breadcrumbs */}
          <Link href="/doctor/dashboard">Doctor Dashboard</Link>/
          <Link href="/doctor/dashboard/appointments">Appointments</Link>/
          <Link href="#">Create Appointment</Link>
        </div>
      </div>

      <div className="mt-5">
        {/* Updated back link */}
        <Link
          href="/doctor/dashboard/appointments"
          className="text-white text-sm bg-[#556ee6] py-2 px-4 rounded-md flex items-center gap-2 w-max"
        >
          <ArrowLeftOutlined /> Back to Appointments
        </Link>
      </div>

      <Card className="mt-8 p-6">
        <div className="w-full border border-gray-200 rounded-md border-l-blue-500 px-4 py-4 mb-6 text-gray-800">
          Appointment Information
        </div>

        {isFetchingPatients ? (
           <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <FormSelect
              label="Patient"
              name="patient_id"
              options={patientOptions}
              value={formData.patient_id}
              onChange={handleChange}
              required
            />

            <FormInput
              label="Appointment Date and Time"
              name="appointment_date"
              type="datetime-local"
              value={formData.appointment_date}
              onChange={handleChange}
              min={todayDate} // Set min attribute for date-time
              required
            />

            <FormSelect
              label="Status"
              name="status"
              options={statusOptions}
              value={formData.status}
              onChange={handleChange}
              required
            />

            <FormTextarea
              label="Notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Add any additional notes here..."
            />

            <div className="mt-6">
              <button
                type="submit"
                disabled={isLoading}
                className="bg-[#556ee6] text-white py-2 px-6 rounded hover:bg-blue-700 flex items-center gap-2 disabled:opacity-70"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-white rounded-full border-t-transparent"></div>
                    Creating...
                  </>
                ) : (
                  "Create Appointment"
                )}
              </button>
            </div>
          </form>
        )}
      </Card>
       {/* Render loader overlay if form is submitting */}
      {isLoading && <FullPageLoader />}
    </div>
  );
} 