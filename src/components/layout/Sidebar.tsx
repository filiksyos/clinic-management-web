"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useState } from "react";
import Navbar from "./Navbar";
import { FaCalendarCheck, FaUserInjured, FaCalendarAlt } from "react-icons/fa";
import { MdDashboard } from "react-icons/md";

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

export default function SideBar() {
  const [isSideNavOpen, setIsSideNavOpen] = useState(true);

  return (
    <>
      <aside
        id="nav-menu-1"
        aria-label="Side navigation"
        className={`fixed top-16 lg:top-0 bottom-0 left-0 z-40 flex w-64 flex-col border-r border-r-slate-200 bg-[#2a2f42] transition-transform lg:translate-x-0 duration-500 ${
          isSideNavOpen ? "translate-x-0" : " -translate-x-full"
        }`}
      >
        <Link
          href="/"
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
            <NavLink href="/dashboard">
              <MdDashboard className="text-xl" />
              <div className="flex w-full truncate text-sm">Dashboard</div>
            </NavLink>

            <li className="px-3 !mt-3 mb-2 text-[#6A7187]">Hospital</li>
            
            <CollapsibleMenu title="Patient" icon={<FaUserInjured />}>
              <NavLink href="/dashboard/patients">List of Patients</NavLink>
              <NavLink href="/dashboard/patients/create">
                Add New Patient
              </NavLink>
            </CollapsibleMenu>

            <CollapsibleMenu title="Appointments" icon={<FaCalendarCheck />}>
              <NavLink href="/dashboard/appointments">
                List of Appointments
              </NavLink>
              <NavLink href="/dashboard/appointments/create">
                Add New Appointment
              </NavLink>
            </CollapsibleMenu>
          </ul>
        </nav>
      </aside>

      <section className="fixed z-[30] top-0 w-full bg-white">
        <Navbar open={isSideNavOpen} setOpen={setIsSideNavOpen} />
      </section>

      <div
        className={`fixed top-16 lg:top-0 bottom-0 left-0 right-0 z-30 bg-slate-900/20 transition-colors duration-500 lg:hidden ${
          isSideNavOpen ? "block" : "hidden"
        }`}
        onClick={() => setIsSideNavOpen(false)}
      ></div>
    </>
  );
} 