import SideBar from "@/components/layout/Sidebar";
import DoctorSidebar from "@/components/layout/DoctorSidebar"; // Assuming a separate sidebar for doctors
import { Metadata } from "next";
import { RoleGuard } from "@/components/auth/RoleGuard";

export const metadata: Metadata = {
  title: "Doctor Dashboard | Clinic Management System",
  description: "Manage your clinic operations efficiently",
};

export default function DoctorDashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <RoleGuard allowedRoles={['doctor']} fallbackUrl="/"> 
      <DoctorSidebar />
      <main className="lg:ps-64 pt-16 lg:pt-20 bg-[#f7f7f9] min-h-screen">{children}</main>
    </RoleGuard>
  );
} 