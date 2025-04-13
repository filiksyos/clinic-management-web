"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { Card } from "@/components/ui/card";
import { FormInput } from "@/components/forms/FormInput";
import { FormSelect } from "@/components/forms/FormSelect";
import { createPatient } from "@/lib/supabase";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import FullPageLoader from "@/components/ui/FullPageLoader";

const genderOptions = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
];

export default function ReceptionistCreatePatientPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    gender: "",
    age: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsLoading(true);
      
      const patientData = {
        ...formData,
        age: formData.age ? parseInt(formData.age) : undefined,
      };
      
      await createPatient(patientData);
      toast.success("Patient created successfully");
      router.push("/dashboard/receptionist/patients");
    } catch (error) {
      console.error("Error creating patient:", error);
      toast.error("Failed to create patient");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-5">
      <div className="flex items-center justify-between mt-4">
        <h2 className="text-lg text-gray-800 font-semibold">
          Add New Patient
        </h2>
        <div className="flex items-center gap-1 text-[#495057] text-sm">
          <Link href="/dashboard/receptionist">Dashboard</Link>/
          <Link href="/dashboard/receptionist/patients">Patients</Link>/
          <Link href="#">Add New Patient</Link>
        </div>
      </div>

      <div className="mt-5">
        <Link
          href="/dashboard/receptionist/patients"
          className="text-white text-sm bg-[#556ee6] py-2 px-4 rounded-md flex items-center gap-2 w-max"
        >
          <ArrowLeftOutlined /> Back to Patient List
        </Link>
      </div>

      <Card className="mt-8 p-6">
        <div className="w-full border border-gray-200 rounded-md border-l-blue-500 px-4 py-4 mb-6 text-gray-800">
          Patient Information
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              label="First Name"
              name="first_name"
              value={formData.first_name}
              onChange={handleChange}
              required
            />
            
            <FormInput
              label="Last Name"
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
              required
            />

            <FormSelect
              label="Gender"
              name="gender"
              options={genderOptions}
              value={formData.gender}
              onChange={handleChange}
            />

            <FormInput
              label="Age"
              name="age"
              type="number"
              value={formData.age}
              onChange={handleChange}
            />
          </div>

          <div className="mt-6">
            <button
              type="submit"
              disabled={isLoading}
              className="bg-[#556ee6] text-white py-2 px-6 rounded hover:bg-blue-700 flex items-center gap-2 disabled:opacity-70"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-white rounded-full border-t-transparent"></div>
                  Saving...
                </>
              ) : (
                "Save Patient"
              )}
            </button>
          </div>
        </form>
      </Card>
      {isLoading && <FullPageLoader />}
    </div>
  );
} 