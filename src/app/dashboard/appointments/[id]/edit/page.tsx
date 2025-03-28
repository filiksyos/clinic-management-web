"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { BsSlash } from "react-icons/bs";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { Card } from "@/components/ui/card";
import { FormSelect } from "@/components/forms/FormSelect";
import { FormInput } from "@/components/forms/FormInput";
import { FormTextarea } from "@/components/forms/FormTextarea";
import { 
  getAppointment, 
  updateAppointment, 
  getPatients, 
  Patient, 
  Appointment 
} from "@/lib/supabase";
import { toast } from "sonner";
import { useParams, useRouter } from "next/navigation";

type AppointmentStatus = Appointment['status'];

export default function EditAppointmentPage() {
  const params = useParams();
  const router = useRouter();
  const appointmentId = params.id as string;
  
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [formData, setFormData] = useState({
    patient_id: "",
    appointment_date: "",
    status: "scheduled" as AppointmentStatus,
    notes: "",
  });

  useEffect(() => {
    async function fetchData() {
      try {
        setIsFetching(true);
        const [appointmentData, patientsData] = await Promise.all([
          getAppointment(appointmentId),
          getPatients(),
        ]);
        
        if (!appointmentData) {
          toast.error("Appointment not found");
          router.push("/dashboard/appointments");
          return;
        }
        
        setPatients(patientsData);
        
        // Format the date for the datetime-local input
        const appointmentDate = new Date(appointmentData.appointment_date);
        const formattedDate = appointmentDate.toISOString().slice(0, 16);
        
        setFormData({
          patient_id: appointmentData.patient_id,
          appointment_date: formattedDate,
          status: appointmentData.status,
          notes: appointmentData.notes || "",
        });
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load appointment data");
        router.push("/dashboard/appointments");
      } finally {
        setIsFetching(false);
      }
    }

    fetchData();
  }, [appointmentId, router]);

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
      await updateAppointment(appointmentId, formData);
      toast.success("Appointment updated successfully");
      router.push(`/dashboard/appointments/${appointmentId}`);
    } catch (error) {
      console.error("Error updating appointment:", error);
      toast.error("Failed to update appointment");
    } finally {
      setIsLoading(false);
    }
  };

  // Convert patients to options format for FormSelect
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

  if (isFetching) {
    return (
      <div className="mx-5 flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="mx-5">
      <div className="flex items-center justify-between mt-4">
        <h2 className="text-lg text-[#495057] font-semibold">
          Edit Appointment
        </h2>
        <div className="flex items-center gap-1 text-[#495057] text-sm">
          <Link href="/dashboard">Dashboard</Link>
          <BsSlash className="text-[#ccc]" />
          <Link href="/dashboard/appointments">Appointments</Link>
          <BsSlash className="text-[#ccc]" />
          <span>Edit Appointment</span>
        </div>
      </div>

      <div className="mt-5">
        <Link
          href={`/dashboard/appointments/${appointmentId}`}
          className="text-white text-sm bg-[#556ee6] py-2 px-4 rounded-md flex items-center gap-2 w-max"
        >
          <ArrowLeftOutlined /> Back to Appointment Details
        </Link>
      </div>

      <Card className="mt-8 p-6">
        <div className="w-full border border-gray-200 rounded-md border-l-blue-500 px-4 py-4 mb-6">
          Appointment Information
        </div>

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
                  Updating...
                </>
              ) : (
                "Update Appointment"
              )}
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
} 