"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { FaCalendarCheck, FaUserInjured } from "react-icons/fa";
import { getPatients, getAppointments, getTodaysAppointments } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

const DashboardCard = ({
  title,
  value,
  icon,
  isLoading = false,
}: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  isLoading?: boolean;
}) => {
  return (
    <Card className="p-6 flex items-center gap-4 shadow-sm">
      <div className="p-3 bg-blue-100 rounded-full">
        {icon}
      </div>
      <div>
        <h3 className="text-gray-600 text-sm">{title}</h3>
        {isLoading ? (
          <div className="h-8 w-16 bg-gray-200 animate-pulse rounded"></div>
        ) : (
          <p className="text-2xl font-semibold text-gray-900">{value}</p>
        )}
      </div>
    </Card>
  );
};

const AppointmentItem = ({ 
  appointment 
}: { 
  appointment: any 
}) => {
  // Format the appointment time to a readable format
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <Link 
      href={`/doctor/appointments/${appointment.id}`}
      className="block p-4 bg-white rounded-lg shadow-sm mb-3 hover:shadow-md transition-shadow"
    >
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-medium text-gray-900">
            {appointment.patients?.first_name} {appointment.patients?.last_name}
          </h3>
          <p className="text-sm text-gray-600">
            {formatTime(appointment.appointment_date)}
          </p>
        </div>
        <div>
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
            {appointment.status}
          </span>
        </div>
      </div>
    </Link>
  );
};

export default function DoctorDashboard() {
  const [patientsCount, setPatientsCount] = useState<number>(0);
  const [appointmentsCount, setAppointmentsCount] = useState<number>(0);
  const [todayAppointments, setTodayAppointments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [patientsData, appointmentsData, todayData] = await Promise.all([
          getPatients(),
          getAppointments(),
          getTodaysAppointments()
        ]);
        
        setPatientsCount(patientsData.length);
        setAppointmentsCount(appointmentsData.length);
        setTodayAppointments(todayData);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="pt-2 px-[18px]">
      <div className="flex justify-between pb-6">
        <h1 className="font-semibold text-gray-800 uppercase tracking-wide">
          Doctor Dashboard
        </h1>
        <p className="text-sm font-light text-[#74788d]">
          Welcome to Doctor Portal
        </p>
      </div>

      <div>
        <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
          <h2 className="text-lg font-medium mb-4 text-gray-800">Welcome, Doctor!</h2>
          <p className="text-gray-600">
            Email: {user?.email || 'doctornew@clinic.com'}
          </p>
          <p className="text-gray-600">
            You have access to patient records and appointments.
          </p>
        </div>

        <h2 className="text-lg font-medium mb-4 text-gray-800">Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <DashboardCard
            title="Total Patients"
            value={patientsCount}
            icon={<FaUserInjured className="text-blue-500 text-xl" />}
            isLoading={isLoading}
          />
          <DashboardCard
            title="Today's Appointments"
            value={todayAppointments.length}
            icon={<FaCalendarCheck className="text-green-500 text-xl" />}
            isLoading={isLoading}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h2 className="text-lg font-medium mb-4 text-gray-800">Today's Schedule</h2>
            <div>
              {isLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="bg-white p-4 rounded-lg shadow-sm animate-pulse h-16"></div>
                  ))}
                </div>
              ) : todayAppointments.length > 0 ? (
                todayAppointments.map((appointment) => (
                  <AppointmentItem key={appointment.id} appointment={appointment} />
                ))
              ) : (
                <div className="bg-white p-6 rounded-lg shadow-sm text-center">
                  <p className="text-gray-500">No appointments scheduled for today</p>
                </div>
              )}
            </div>
          </div>

          <div>
            <h2 className="text-lg font-medium mb-4 text-gray-800">Quick Actions</h2>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="space-y-3">
                <Link 
                  href="/doctor/appointments"
                  className="block p-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <div className="flex items-center">
                    <FaCalendarCheck className="mr-3" />
                    <span>View All Appointments</span>
                  </div>
                </Link>
                <Link 
                  href="/doctor/patients"
                  className="block p-3 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors"
                >
                  <div className="flex items-center">
                    <FaUserInjured className="mr-3" />
                    <span>View Patient Records</span>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 