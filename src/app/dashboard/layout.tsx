import SideBar from "@/components/layout/Sidebar";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard | Clinic Management System",
  description: "Manage your clinic operations efficiently",
};

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <SideBar />
      <main className="lg:ps-64 pt-16 lg:pt-20 bg-[#f7f7f9] min-h-screen">{children}</main>
    </>
  );
} 