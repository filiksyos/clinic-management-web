"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useState } from "react";
import Navbar from "./Navbar";
import { FaCalendarCheck, FaUserInjured } from "react-icons/fa";
import { MdDashboard } from "react-icons/md";
import { useAuth } from "@/context/AuthContext"; // Import useAuth

// Reusable NavLink component (copied from Sidebar.tsx)
const NavLink = ({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) => {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      className={`flex items-center gap-3 rounded-lg p-3 transition-colors hover:text-white text-sm duration-300 ${
        isActive
          ? "bg-[#5d7e7d] text-white hover:bg-[#5d7e7d]"
          : "text-[#a6b0cf] hover:bg-[#5d7e7d]/50"
      }`}
      aria-current={isActive ? "page" : undefined}
    >
      {children}
    </Link>
  );
};

// Reusable CollapsibleMenu component (copied from Sidebar.tsx)
const CollapsibleMenu = ({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <li>
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-3 rounded-lg p-3 cursor-pointer transition-colors ${
          isOpen ? "text-white" : "text-[#a6b0cf]"
        }`}
      >
        <div className="flex items-center">{icon}</div>
        <div className="flex w-full flex-1 truncate text-sm">{title}</div>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
          stroke="currentColor"
          className={`size-4 transition-transform duration-500 ${
            isOpen ? "rotate-180" : "rotate-0"
          }`}
        >
          <path
            fillRule="evenodd"
            d="M12.53 16.28a.75.75 0 0 1-1.06 0l-7.5-7.5a.75.75 0 0 1 1.06-1.06L12 14.69l6.97-6.97a.75.75 0 1 1 1.06 1.06l-7.5 7.5Z"
            clipRule="evenodd"
          />
        </svg>
      </div>
      <div
        className={`grid overflow-hidden transition-all duration-500 ${
          isOpen ? "grid-rows-[1fr] mt-2" : "grid-rows-[0fr] mt-0"
        }`}
      >
        <ul className="flex flex-col ml-1 overflow-hidden pl-3 space-y-1">
          {children}
        </ul>
      </div>
    </li>
  );
};

export default function DoctorSidebar() {
  const [isSideNavOpen, setIsSideNavOpen] = useState(true);
  const { userRole } = useAuth(); // Ensure we only show this for doctors

  // Although RoleGuard protects the layout, add an extra check here
  if (userRole !== 'doctor') {
    return null; // Or render a minimal sidebar / loading state
  }

  return (
    <>
      <aside
        id="doctor-nav-menu"
        aria-label="Doctor side navigation"
        className={`fixed top-16 lg:top-0 bottom-0 left-0 z-40 flex w-64 flex-col border-r border-r-slate-200 bg-[#2a2f42] transition-transform lg:translate-x-0 duration-500 ${
          isSideNavOpen ? "translate-x-0" : " -translate-x-full"
        }`}
      >
        <Link
          href="/doctor/dashboard" // Link to doctor dashboard
          className="py-6 mx-8 text-xl font-medium flex items-center gap-1"
        >
          <div className="bg-white p-2 rounded-full">
            <MdDashboard className="text-[#2a2f42] text-3xl" />
          </div>
          <p className="text-[#b2b2b2] font-bold text-2xl uppercase tracking-[0.1em] left-0 right-0 mx-auto text-center bottom-5">
            Clinic
          </p>
        </Link>
        <nav>
          <ul className="px-3 space-y-1">
            <li className="px-3 mb-4 text-[#6A7187]">Dashboard</li>
            <NavLink href="/doctor/dashboard"> {/* Doctor dashboard link */}
              <MdDashboard className="text-xl" />
              <div className="flex w-full truncate text-sm">Doctor Dashboard</div>
            </NavLink>

            <li className="px-3 !mt-3 mb-2 text-[#6A7187]">Management</li>
            
            {/* Keep Patient and Appointment sections, pointing to doctor-specific routes */}
            <CollapsibleMenu title="Patient" icon={<FaUserInjured />}>
              <NavLink href="/doctor/dashboard/patients">List of Patients</NavLink>
              <NavLink href="/doctor/dashboard/patients/create">
                Add New Patient
              </NavLink>
            </CollapsibleMenu>

            <CollapsibleMenu title="Appointments" icon={<FaCalendarCheck />}>
              <NavLink href="/doctor/dashboard/appointments">
                List of Appointments
              </NavLink>
              <NavLink href="/doctor/dashboard/appointments/create">
                Add New Appointment
              </NavLink>
            </CollapsibleMenu>
            
            {/* Add doctor-specific menu items here in the future */}
            {/* e.g., Prescriptions, Medical Records, etc. */}

          </ul>
        </nav>
      </aside>

      {/* Navbar remains the same */}
      <section className="fixed z-[30] top-0 w-full bg-white">
        <Navbar open={isSideNavOpen} setOpen={setIsSideNavOpen} />
      </section>

      {/* Overlay for mobile view */}
      <div
        className={`fixed top-16 lg:top-0 bottom-0 left-0 right-0 z-30 bg-slate-900/20 transition-colors duration-500 lg:hidden ${
          isSideNavOpen ? "block" : "hidden"
        }`}
        onClick={() => setIsSideNavOpen(false)}
      ></div>
    </>
  );
} 