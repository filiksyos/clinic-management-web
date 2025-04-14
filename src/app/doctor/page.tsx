"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { FaCalendarCheck, FaUserInjured } from "react-icons/fa";
import { getPatients, getAppointments, getTodaysAppointments } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";

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
      </div>
    </div>
  );
} 