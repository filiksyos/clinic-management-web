"use client";

import { useEffect, useState } from "react";
import { getAppointmentsForDoctor } from "@/lib/supabase";
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

export default function UpcomingAppointments() {
  const [appointments, setAppointments] = useState<AppointmentWithPatient[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const data = await getAppointmentsForDoctor();
        
        // Filter for only upcoming appointments (after today)
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const upcomingAppointments = data.filter(app => {
          const appDate = new Date(app.appointment_date);
          return appDate > today;
        });
        
        setAppointments(upcomingAppointments);
      } catch (error) {
        console.error("Error fetching appointments:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  // Group appointments by date
  interface GroupedAppointments {
    [date: string]: AppointmentWithPatient[];
  }
  
  const groupedAppointments = appointments.reduce((groups, appointment) => {
    const date = new Date(appointment.appointment_date).toLocaleDateString(undefined, { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    
    if (!groups[date]) {
      groups[date] = [];
    }
    
    groups[date].push(appointment);
    return groups;
  }, {} as GroupedAppointments);

  // Format time for display
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="pt-2 px-[18px]">
      <div className="flex justify-between pb-6">
        <h1 className="font-semibold text-gray-800 uppercase tracking-wide">
          Upcoming Appointments
        </h1>
        <Link 
          href="/doctor/appointments" 
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          View Today&apos;s Appointments
        </Link>
      </div>

      <div className="mb-6">
        {isLoading ? (
          <Card className="p-6">
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="border rounded-lg p-4 animate-pulse">
                  <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
                  {[...Array(2)].map((_, j) => (
                    <div key={j} className="border rounded-lg p-3 mb-2">
                      <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </Card>
        ) : Object.keys(groupedAppointments).length > 0 ? (
          <div className="space-y-6">
            {Object.entries(groupedAppointments).map(([date, apps]) => (
              <Card key={date} className="p-6">
                <h2 className="text-lg font-medium text-gray-800 mb-4">{date}</h2>
                <div className="space-y-3">
                  {apps.map((appointment) => (
                    <div 
                      key={appointment.id} 
                      className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-gray-900">
                              {appointment.patients?.first_name} {appointment.patients?.last_name}
                            </p>
                            <StatusBadge status={appointment.status} />
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            {formatTime(appointment.appointment_date)} • {appointment.patients?.gender}, {appointment.patients?.age} years
                          </p>
                          {appointment.notes && (
                            <p className="text-sm text-gray-500 mt-2 italic">
                              {appointment.notes}
                            </p>
                          )}
                        </div>
                        <div className="flex space-x-2">
                          <Link 
                            href={`/doctor/appointments/${appointment.id}`}
                            className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                          >
                            Details
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-6">
            <div className="text-center py-8">
              <FaCalendarCheck className="mx-auto text-gray-400 text-4xl mb-4" />
              <h3 className="text-xl font-medium text-gray-700 mb-2">No Upcoming Appointments</h3>
              <p className="text-gray-500">You don&apos;t have any upcoming appointments scheduled.</p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
} 