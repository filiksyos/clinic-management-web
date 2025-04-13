"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BsSlash } from "react-icons/bs";
import { Card } from "@/components/ui/card";
import { getAppointments, deleteAppointment, getPatients, Appointment, Patient } from "@/lib/supabase";
import { toast } from "sonner";
import { FaEye, FaEdit, FaTrash } from "react-icons/fa";
import FullPageLoader from "@/components/ui/FullPageLoader"; // Corrected import path

type ExtendedAppointment = Appointment & {
  patients: Patient;
};

export default function DoctorAppointmentsPage() { // Renamed component
  const [appointments, setAppointments] = useState<ExtendedAppointment[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      // TODO: Filter appointments by doctor if needed
      const [appointmentsData, patientsData] = await Promise.all([
        getAppointments(),
        getPatients(),
      ]);
      
      // Assuming appointmentsData has the patient relationship included
      setAppointments(appointmentsData as ExtendedAppointment[]); 
      setPatients(patientsData);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load appointments");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this appointment?")) {
      try {
        await deleteAppointment(id);
        toast.success("Appointment deleted successfully");
        fetchData();
      } catch (error) {
        console.error("Error deleting appointment:", error);
        toast.error("Failed to delete appointment");
      }
    }
  };

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

  const getPatientName = (patientId: string) => {
    const patient = patients.find(p => p.id === patientId);
    return patient ? `${patient.first_name} ${patient.last_name}` : 'Unknown Patient';
  };

  return (
    <div className="mx-5">
      <div className="flex items-center justify-between mt-2">
        <div>
          <h2 className="text-lg text-gray-800 font-semibold">
            APPOINTMENT LIST (Doctor View)
          </h2>
        </div>
        <div className="flex items-center gap-1 text-gray-600 text-sm">
          {/* Updated breadcrumbs */}
          <Link href="/doctor/dashboard" className="">
            Doctor Dashboard
          </Link>
          <BsSlash className="text-[#ccc]" />
          <Link href="/doctor/dashboard/appointments/">Appointments</Link>
        </div>
      </div>
      
      <div className="mt-5">
        {/* Updated link */}
        <Link
          href="/doctor/dashboard/appointments/create"
          className="text-white text-sm bg-[#556ee6] py-2 px-4 rounded-md"
        >
          + New Appointment
        </Link>
      </div>
      
      <Card className="mt-5 p-5">
        {isLoading ? (
          <FullPageLoader /> // Use loader
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Patient
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {appointments.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                      No appointments found
                    </td>
                  </tr>
                ) : (
                  appointments.map((appointment, index) => (
                    <tr key={appointment.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {index + 1}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {getPatientName(appointment.patient_id)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(appointment.appointment_date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`px-2 py-1 rounded-full text-white text-xs ${getStatusColor(appointment.status)}`}>
                          {appointment.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleDelete(appointment.id)}
                            className="flex items-center justify-center h-8 w-8 bg-red-600 hover:bg-red-700 text-white rounded-full"
                          >
                            <FaTrash size={14} />
                          </button>
                          {/* Updated links */}
                          <Link
                            href={`/doctor/dashboard/appointments/${appointment.id}/edit`}
                            className="flex items-center justify-center h-8 w-8 bg-blue-600 hover:bg-blue-700 text-white rounded-full"
                          >
                            <FaEdit size={14} />
                          </Link>
                          <Link
                            href={`/doctor/dashboard/appointments/${appointment.id}`}
                            className="flex items-center justify-center h-8 w-8 bg-green-600 hover:bg-green-700 text-white rounded-full"
                          >
                            <FaEye size={14} />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
} 