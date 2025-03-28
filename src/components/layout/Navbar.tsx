"use client";

import { useRouter } from "next/navigation";
import React, { Dispatch, SetStateAction, useState } from "react";

const Navbar = ({
  setOpen,
  open,
}: {
  setOpen: Dispatch<SetStateAction<boolean>>;
  open: boolean;
}) => {
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const router = useRouter();

  const handleNavigate = () => {
    router.push(`/dashboard/profile`);
  };

  const handleLogout = () => {
    // Implement logout logic later
    router.push("/login");
  };

  return (
    <nav
      className={`flex items-center justify-between w-full relative p-3 ps-0 lg:ps-80`}
    >
      <button
        title="Side navigation"
        type="button"
        className={`block h-10 w-10 self-center rounded-lg bg-transparent backdrop-blur-sm visible opacity-100 lg:invisible lg:opacity-0 ${
          open
            ? "[&_span:nth-child(1)]:w-6 [&_span:nth-child(1)]:translate-y-0 [&_span:nth-child(1)]:rotate-45 [&_span:nth-child(3)]:w-0 [&_span:nth-child(2)]:-rotate-45 "
            : ""
        }`}
        aria-haspopup="menu"
        aria-label="Side navigation"
        aria-expanded={open ? "true" : "false"}
        aria-controls="nav-menu-1"
        onClick={() => setOpen(!open)}
      >
        <div className="absolute top-1/2 left-1/2 w-6 -translate-x-1/2 -translate-y-1/2 transform">
          <span
            aria-hidden="true"
            className="absolute block h-0.5 w-9/12 -translate-y-2 transform rounded-full bg-slate-700 transition-all duration-500"
          ></span>
          <span
            aria-hidden="true"
            className="absolute block h-0.5 w-6 transform rounded-full bg-slate-900 transition duration-500"
          ></span>
          <span
            aria-hidden="true"
            className="absolute block h-0.5 w-1/2 origin-top-left translate-y-2 transform rounded-full bg-slate-900 transition-all duration-500"
          ></span>
        </div>
      </button>
      <div className="flex items-center gap-[15px] relative">
        <div
          className="flex items-center gap-[10px] cursor-pointer mr-4 hover:bg-gray-100 rounded-full px-2 py-1 transition-colors"
          onClick={() => setAccountMenuOpen(!accountMenuOpen)}
        >
          <div className="relative">
            <div className="size-8 lg:size-12 rounded-full bg-gray-300 flex items-center justify-center text-gray-700 font-bold">
              R
            </div>
            <div className="w-[10px] h-[10px] rounded-full bg-green-500 absolute bottom-[0px] right-0 border-2 border-white"></div>
          </div>

          <h1 className="text-[1rem] font-[400] text-gray-600 sm:block hidden">
            Receptionist
          </h1>

          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            className={`size-4 text-gray-600 transition-transform duration-500 ${
              accountMenuOpen ? "rotate-180" : "rotate-0"
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
          className={`${
            accountMenuOpen
              ? "translate-y-0 scale-100 opacity-100 visible"
              : "translate-y-[20%] scale-95 opacity-0 invisible"
          } bg-white w-max rounded-md shadow-lg absolute top-8 lg:top-12 right-0 p-[10px] flex flex-col transition-all duration-300 gap-2 z-50 border border-gray-200`}
        >
          <p onClick={handleNavigate} className="flex items-center gap-2 rounded-md p-2 pr-[45px] py-[3px] text-[1rem] text-gray-600 hover:bg-gray-50 hover:cursor-pointer">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-user-round"
            >
              <circle cx="12" cy="8" r="5" />
              <path d="M20 21a8 8 0 0 0-16 0" />
            </svg>
            View Profile
          </p>

          <div
            onClick={handleLogout}
            className="mt-3 border-t border-gray-200 pt-[5px] cursor-pointer"
          >
            <p className="flex items-center gap-2 rounded-md p-2 pr-[45px] py-[3px] text-[1rem] text-red-500 hover:bg-red-50 hover:cursor-pointer">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-power"
              >
                <path d="M12 2v10" />
                <path d="M18.4 6.6a9 9 0 1 1-12.77.04" />
              </svg>
              Logout
            </p>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 