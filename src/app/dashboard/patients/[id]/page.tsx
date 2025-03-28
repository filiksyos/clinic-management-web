"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BsSlash } from "react-icons/bs";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { FaEdit } from "react-icons/fa";
import { Card } from "@/components/ui/card";
import { getPatient, Patient } from "@/lib/supabase";
import { toast } from "sonner";
import { useParams, useRouter } from "next/navigation";

export default function PatientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const patientId = params.id as string;
  
  const [patient, setPatient] = useState<Patient | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPatient = async () => {
      try {
        setIsLoading(true);
        const data = await getPatient(patientId);
        setPatient(data);
      } catch (error) {
        console.error("Error fetching patient:", error);
        toast.error("Failed to load patient details");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPatient();
  }, [patientId]);

  if (isLoading) {
    return (
      <div className="mx-5 flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="mx-5 flex justify-center items-center h-64">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900">Patient not found</h3>
          <div className="mt-2">
            <Link
              href="/dashboard/patients"
              className="text-blue-600 hover:text-blue-800"
            >
              Return to patients list
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-5">
      <div className="flex items-center justify-between mt-4">
        <h2 className="text-lg text-gray-800 font-semibold">
          Patient Details
        </h2>
        <div className="flex items-center gap-1 text-gray-600 text-sm">
          <Link href="/dashboard">Dashboard</Link>
          <BsSlash className="text-[#ccc]" />
          <Link href="/dashboard/patients">Patients</Link>
          <BsSlash className="text-[#ccc]" />
          <span>Patient Details</span>
        </div>
      </div>

      <div className="mt-5 flex justify-between">
        <Link
          href="/dashboard/patients"
          className="text-white text-sm bg-[#556ee6] py-2 px-4 rounded-md flex items-center gap-2 w-max"
        >
          <ArrowLeftOutlined /> Back to Patient List
        </Link>
        <Link
          href={`/dashboard/patients/${patientId}/edit`}
          className="text-white text-sm bg-green-600 py-2 px-4 rounded-md flex items-center gap-2 w-max"
        >
          <FaEdit size={14} /> Edit Patient
        </Link>
      </div>

      <Card className="mt-8 p-6">
        <div className="w-full border border-gray-200 rounded-md border-l-blue-500 px-4 py-4 mb-6 text-gray-800">
          Patient Information
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-medium text-gray-600">First Name</h3>
            <p className="mt-1 text-sm text-gray-900">{patient.first_name}</p>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-600">Last Name</h3>
            <p className="mt-1 text-sm text-gray-900">{patient.last_name}</p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-600">Gender</h3>
            <p className="mt-1 text-sm text-gray-900">{patient.gender || "Not specified"}</p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-600">Age</h3>
            <p className="mt-1 text-sm text-gray-900">{patient.age || "Not specified"}</p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-600">Created At</h3>
            <p className="mt-1 text-sm text-gray-900">
              {new Date(patient.created_at).toLocaleString()}
            </p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-600">Last Updated</h3>
            <p className="mt-1 text-sm text-gray-900">
              {new Date(patient.updated_at).toLocaleString()}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
} 