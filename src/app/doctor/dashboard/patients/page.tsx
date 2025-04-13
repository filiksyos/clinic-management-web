"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BsSlash } from "react-icons/bs";
import { FaEye, FaEdit, FaTrash } from "react-icons/fa";
import { Card } from "@/components/ui/card";
import { getPatients, deletePatient, Patient } from "@/lib/supabase";
import { toast } from "sonner";
import FullPageLoader from "@/components/ui/FullPageLoader"; // Corrected import path

export default function DoctorPatientsPage() { // Renamed component
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPatients = async () => {
    try {
      setIsLoading(true);
      // TODO: Potentially filter patients assigned to this doctor in getPatients
      const data = await getPatients(); 
      setPatients(data);
    } catch (error) {
      console.error("Error fetching patients:", error);
      toast.error("Failed to load patients");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this patient?")) {
      try {
        await deletePatient(id);
        toast.success("Patient deleted successfully");
        fetchPatients();
      } catch (error) {
        console.error("Error deleting patient:", error);
        toast.error("Failed to delete patient");
      }
    }
  };

  return (
    <div className="mx-5">
      <div className="flex items-center justify-between mt-2">
        <div>
          <h2 className="text-lg text-gray-800 font-semibold">
            PATIENT LIST (Doctor View)
          </h2>
        </div>
        <div className="flex items-center gap-1 text-gray-600 text-sm">
          {/* Updated breadcrumbs for doctor path */}
          <Link href="/doctor/dashboard" className="">
            Doctor Dashboard
          </Link>
          <BsSlash className="text-[#ccc]" />
          <Link href="/doctor/dashboard/patients/">Patients</Link>
        </div>
      </div>
      
      <div className="mt-5">
        {/* Updated link for creating patients */}
        <Link
          href="/doctor/dashboard/patients/create"
          className="text-white text-sm bg-[#556ee6] py-2 px-4 rounded-md"
        >
          + New Patient
        </Link>
      </div>
      
      <Card className="mt-5 p-5">
        {isLoading ? (
          <FullPageLoader /> // Use loader component
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Gender
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Age
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {patients.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                      No patients found
                    </td>
                  </tr>
                ) : (
                  patients.map((patient, index) => (
                    <tr key={patient.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {index + 1}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {patient.first_name} {patient.last_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {patient.gender || "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {patient.age || "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleDelete(patient.id)}
                            className="flex items-center justify-center h-8 w-8 bg-red-600 hover:bg-red-700 text-white rounded-full"
                          >
                            <FaTrash size={14} />
                          </button>
                          {/* Updated links for edit and view actions */}
                          <Link
                            href={`/doctor/dashboard/patients/${patient.id}/edit`}
                            className="flex items-center justify-center h-8 w-8 bg-blue-600 hover:bg-blue-700 text-white rounded-full"
                          >
                            <FaEdit size={14} />
                          </Link>
                          <Link
                            href={`/doctor/dashboard/patients/${patient.id}`}
                            className="flex items-center justify-center h-8 w-8 bg-green-600 hover:bg-green-700 text-white rounded-full"
                          >
                            <FaEye size={14} />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
} 