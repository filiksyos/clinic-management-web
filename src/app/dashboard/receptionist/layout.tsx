import SideBar from "@/components/layout/Sidebar";
import { Metadata } from "next";
import { RoleGuard } from "@/components/auth/RoleGuard";

export const metadata: Metadata = {
  title: "Receptionist Dashboard | Clinic Management System",
  description: "Manage your clinic operations efficiently",
};

export default function ReceptionistDashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <RoleGuard allowedRoles={['receptionist']} fallbackUrl="/"> 
      <SideBar />
      <main className="lg:ps-64 pt-16 lg:pt-20 bg-[#f7f7f9] min-h-screen">{children}</main>
    </RoleGuard>
  );
} 