"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { FaCalendarCheck, FaUserInjured } from "react-icons/fa";
import { HiCurrencyDollar } from "react-icons/hi2";
import { getPatients, getAppointments } from "@/lib/supabase"; // Assuming these functions work for doctors too
import { useAuth } from "@/context/AuthContext"; // Import useAuth
import FullPageLoader from "@/components/ui/FullPageLoader"; // Corrected import path

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

export default function DoctorDashboardPage() {
  const { user, userRole, isLoading: isAuthLoading } = useAuth(); // Get user and role
  const [patientsCount, setPatientsCount] = useState<number>(0);
  const [appointmentsCount, setAppointmentsCount] = useState<number>(0);
  const [isLoadingData, setIsLoadingData] = useState<boolean>(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      // Don't fetch data if auth isn't loaded or user is not a doctor
      if (isAuthLoading || userRole !== 'doctor') {
         setIsLoadingData(false); // Stop data loading if not applicable
         return;
      }
      
      // --- Restore Original Data Fetching Logic ---
      setIsLoadingData(true);
      try {
        // Fetch data relevant to the doctor
        // TODO: Modify getPatients/getAppointments to filter by doctor if needed
        const [patientsData, appointmentsData] = await Promise.all([
          getPatients(), 
          getAppointments()
        ]);
        
        setPatientsCount(patientsData.length);
        setAppointmentsCount(appointmentsData.length);
      } catch (error) {
        console.error("Error fetching doctor dashboard data:", error);
        // Optionally add a toast message here if fetching fails
        // toast.error("Failed to load dashboard data"); 
      } finally {
        setIsLoadingData(false);
      }
      // --- End Original Data Fetching Logic ---
    };

    fetchDashboardData();
  }, [isAuthLoading, userRole]); // Rerun if auth state changes

  // Combine loading states
  const isLoading = isAuthLoading || isLoadingData;

  // Calculate today's revenue (placeholder)
  const todaysRevenue = "$0"; 

  if (isLoading) {
      return <FullPageLoader />;
  }

  // Optional: Add a check if the role is somehow incorrect despite the guard
  if (userRole !== 'doctor') {
      // This shouldn't happen if RoleGuard works, but good for robustness
      return <div className="p-4 text-red-600">Access Denied. You are not logged in as a Doctor.</div>;
  }

  return (
    <div className="pt-2 px-[18px]">
      <div className="flex justify-between pb-6">
        <h1 className="font-semibold text-gray-800 uppercase tracking-wide">
          Doctor Dashboard
        </h1>
        <p className="text-sm font-light text-[#74788d]">
          Welcome to Doctor Dashboard
        </p>
      </div>

      <div>
        <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
          <h2 className="text-lg font-medium mb-4 text-gray-800">Welcome, Doctor!</h2>
          <p className="text-gray-600">
            Email: {user?.email || 'Loading...'}
          </p>
          <p className="text-gray-600">
            You&apos;re now logged in to the clinic management system.
          </p>
        </div>

        <h2 className="text-lg font-medium mb-4 text-gray-800">Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <DashboardCard
            title="Assigned Patients"
            value={patientsCount}
            icon={<FaUserInjured className="text-blue-500 text-xl" />}
            isLoading={isLoading}
          />
          <DashboardCard
            title="Scheduled Appointments"
            value={appointmentsCount}
            icon={<FaCalendarCheck className="text-green-500 text-xl" />}
            isLoading={isLoading}
          />
          <DashboardCard
            title="Today's Consultations"
            value={todaysRevenue} // Placeholder - might represent count instead of revenue
            icon={<HiCurrencyDollar className="text-yellow-500 text-xl" />}
            isLoading={isLoading}
          />
        </div>
        {/* Add more doctor-specific dashboard components here */}
      </div>
    </div>
  );
} 