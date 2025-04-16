"use client";

import { useEffect, useState } from "react";
import { getTodaysAppointments } from "@/lib/supabase";
import { Card } from "@/components/ui/card";
import { FaCalendarCheck } from "react-icons/fa";
import Link from "next/link";

// Define interface for appointment data
interface AppointmentWithPatient {
  id: string;
  appointment_date: string;
  status: string;
  notes?: string;
  patients: {
    first_name: string;
    last_name: string;
    gender?: string;
    age?: number;
  };
}

// Appointment status badge component
const StatusBadge = ({ status }: { status: string }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'no-show':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(status)}`}>
      {status}
    </span>
  );
};

export default function DoctorAppointments() {
  const [appointments, setAppointments] = useState<AppointmentWithPatient[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const data = await getTodaysAppointments();
        setAppointments(data);
      } catch (error) {
        console.error("Error fetching appointments:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { 
      weekday: 'short', 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Format time for display
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="pt-2 px-[18px]">
      <div className="flex justify-between pb-6">
        <h1 className="font-semibold text-gray-800 uppercase tracking-wide">
          Today&apos;s Appointments
        </h1>
        <Link 
          href="/doctor/appointments/upcoming" 
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          View Upcoming
        </Link>
      </div>

      <div className="mb-6">
        <Card className="p-6">
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="border rounded-lg p-4 animate-pulse">
                  <div className="h-6 bg-gray-200 rounded w-1/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : appointments.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white">
                <thead>
                  <tr className="w-full h-16 border-b border-gray-200">
                    <th className="text-left pl-4">Patient</th>
                    <th className="text-left">Time</th>
                    <th className="text-left">Status</th>
                    <th className="text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.map((appointment) => (
                    <tr key={appointment.id} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="pl-4 py-4">
                        <div>
                          <p className="font-medium text-gray-900">
                            {appointment.patients?.first_name} {appointment.patients?.last_name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {appointment.patients?.gender}, {appointment.patients?.age} years
                          </p>
                        </div>
                      </td>
                      <td className="py-4">
                        <div>
                          <p className="text-gray-900">{formatTime(appointment.appointment_date)}</p>
                          <p className="text-sm text-gray-500">{formatDate(appointment.appointment_date)}</p>
                        </div>
                      </td>
                      <td className="py-4">
                        <StatusBadge status={appointment.status} />
                      </td>
                      <td className="py-4">
                        <div className="flex space-x-2">
                          <Link 
                            href={`/doctor/appointments/${appointment.id}`}
                            className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                          >
                            View
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <FaCalendarCheck className="mx-auto text-gray-400 text-4xl mb-4" />
              <h3 className="text-xl font-medium text-gray-700 mb-2">No Appointments Today</h3>
              <p className="text-gray-500">You don&apos;t have any appointments scheduled for today.</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
} 