"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { FaCalendarCheck, FaUserInjured } from "react-icons/fa";
import { HiCurrencyDollar } from "react-icons/hi2";
import { getPatients, getAppointments } from "@/lib/supabase";

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

export default function Dashboard() {
  const [patientsCount, setPatientsCount] = useState<number>(0);
  const [appointmentsCount, setAppointmentsCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [patientsData, appointmentsData] = await Promise.all([
          getPatients(),
          getAppointments()
        ]);
        
        setPatientsCount(patientsData.length);
        setAppointmentsCount(appointmentsData.length);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Calculate today's revenue (placeholder for now)
  const todaysRevenue = "$0"; // You can implement actual revenue calculation if needed

  return (
    <div className="pt-2 px-[18px]">
      <div className="flex justify-between pb-6">
        <h1 className="font-semibold text-gray-800 uppercase tracking-wide">
          Dashboard
        </h1>
        <p className="text-sm font-light text-[#74788d]">
          Welcome to Dashboard
        </p>
      </div>

      <div>
        <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
          <h2 className="text-lg font-medium mb-4 text-gray-800">Welcome, Receptionist!</h2>
          <p className="text-gray-600">
            Email: receptionist@clinic.com
          </p>
          <p className="text-gray-600">
            You're now logged in to the clinic management system.
          </p>
        </div>

        <h2 className="text-lg font-medium mb-4 text-gray-800">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <DashboardCard
            title="Patients"
            value={patientsCount}
            icon={<FaUserInjured className="text-blue-500 text-xl" />}
            isLoading={isLoading}
          />
          <DashboardCard
            title="Appointments"
            value={appointmentsCount}
            icon={<FaCalendarCheck className="text-green-500 text-xl" />}
            isLoading={isLoading}
          />
          <DashboardCard
            title="Today's Revenue"
            value={todaysRevenue}
            icon={<HiCurrencyDollar className="text-yellow-500 text-xl" />}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
} 