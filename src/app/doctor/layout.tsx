import SideBar from "@/components/layout/Sidebar";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Doctor Dashboard | Clinic Management System",
  description: "Doctor portal for managing patients and appointments",
};

export default function DoctorLayout({
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