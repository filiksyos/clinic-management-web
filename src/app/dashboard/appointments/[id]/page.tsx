"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BsSlash } from "react-icons/bs";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { FaEdit } from "react-icons/fa";
import { Card } from "@/components/ui/card";
import { getAppointment, Appointment, Patient } from "@/lib/supabase";
import { toast } from "sonner";
import { useParams, useRouter } from "next/navigation";

// Type for the appointment with joined patient data
type ExtendedAppointment = Appointment & {
  patients: Patient;
};

export default function AppointmentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const appointmentId = params.id as string;
  
  const [appointment, setAppointment] = useState<ExtendedAppointment | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAppointment = async () => {
      try {
        setIsLoading(true);
        const data = await getAppointment(appointmentId);
        setAppointment(data);
      } catch (error) {
        console.error("Error fetching appointment:", error);
        toast.error("Failed to load appointment details");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAppointment();
  }, [appointmentId]);

  if (isLoading) {
    return (
      <div className="mx-5 flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="mx-5 flex justify-center items-center h-64">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900">Appointment not found</h3>
          <div className="mt-2">
            <Link
              href="/dashboard/appointments"
              className="text-blue-600 hover:text-blue-800"
            >
              Return to appointments list
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-500';
      case 'completed':
        return 'bg-green-500';
      case 'cancelled':
        return 'bg-red-500';
      case 'no-show':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  // Format the appointment date
  const formattedDate = new Date(appointment.appointment_date).toLocaleString();
  
  // Get patient name
  const patientName = appointment.patients ? 
    `${appointment.patients.first_name} ${appointment.patients.last_name}` : 
    'Unknown Patient';

  return (
    <div className="mx-5">
      <div className="flex items-center justify-between mt-4">
        <h2 className="text-lg text-gray-800 font-semibold">
          Appointment Details
        </h2>
        <div className="flex items-center gap-1 text-gray-600 text-sm">
          <Link href="/dashboard">Dashboard</Link>
          <BsSlash className="text-[#ccc]" />
          <Link href="/dashboard/appointments">Appointments</Link>
          <BsSlash className="text-[#ccc]" />
          <span>Appointment Details</span>
        </div>
      </div>

      <div className="mt-5 flex justify-between">
        <Link
          href="/dashboard/appointments"
          className="text-white text-sm bg-[#556ee6] py-2 px-4 rounded-md flex items-center gap-2 w-max"
        >
          <ArrowLeftOutlined /> Back to Appointments
        </Link>
        <Link
          href={`/dashboard/appointments/${appointmentId}/edit`}
          className="text-white text-sm bg-green-600 py-2 px-4 rounded-md flex items-center gap-2 w-max"
        >
          <FaEdit size={14} /> Edit Appointment
        </Link>
      </div>

      <Card className="mt-8 p-6">
        <div className="w-full border border-gray-200 rounded-md border-l-blue-500 px-4 py-4 mb-6 text-gray-800">
          Appointment Information
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-medium text-gray-600">Patient</h3>
            <p className="mt-1 text-sm text-gray-900">{patientName}</p>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-600">Appointment Date & Time</h3>
            <p className="mt-1 text-sm text-gray-900">{formattedDate}</p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-600">Status</h3>
            <p className="mt-1">
              <span className={`px-2 py-1 rounded-full text-white text-xs ${getStatusColor(appointment.status)}`}>
                {appointment.status}
              </span>
            </p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-600">Created At</h3>
            <p className="mt-1 text-sm text-gray-900">
              {new Date(appointment.created_at).toLocaleString()}
            </p>
          </div>
        </div>

        <div className="mt-6">
          <h3 className="text-sm font-medium text-gray-600">Notes</h3>
          <p className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">
            {appointment.notes || "No notes available"}
          </p>
        </div>
      </Card>
    </div>
  );
} 