"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { BsSlash } from "react-icons/bs";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { Card } from "@/components/ui/card";
import { FormInput } from "@/components/forms/FormInput";
import { FormSelect } from "@/components/forms/FormSelect";
import { getPatient, updatePatient } from "@/lib/supabase";
import { toast } from "sonner";
import { useParams, useRouter } from "next/navigation";

const genderOptions = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
];

export default function EditPatientPage() {
  const params = useParams();
  const router = useRouter();
  const patientId = params.id as string;
  
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    gender: "",
    age: "",
  });

  useEffect(() => {
    const fetchPatient = async () => {
      try {
        setIsFetching(true);
        const data = await getPatient(patientId);
        
        if (!data) {
          toast.error("Patient not found");
          router.push("/dashboard/patients");
          return;
        }
        
        setFormData({
          first_name: data.first_name,
          last_name: data.last_name,
          gender: data.gender || "",
          age: data.age ? String(data.age) : "",
        });
      } catch (error) {
        console.error("Error fetching patient:", error);
        toast.error("Failed to load patient data");
        router.push("/dashboard/patients");
      } finally {
        setIsFetching(false);
      }
    };

    fetchPatient();
  }, [patientId, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsLoading(true);
      
      // Convert age to number if provided
      const patientData = {
        ...formData,
        age: formData.age ? parseInt(formData.age) : undefined,
      };
      
      await updatePatient(patientId, patientData);
      toast.success("Patient updated successfully");
      router.push(`/dashboard/patients/${patientId}`);
    } catch (error) {
      console.error("Error updating patient:", error);
      toast.error("Failed to update patient");
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="mx-5 flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="mx-5">
      <div className="flex items-center justify-between mt-4">
        <h2 className="text-lg text-[#495057] font-semibold">
          Edit Patient
        </h2>
        <div className="flex items-center gap-1 text-[#495057] text-sm">
          <Link href="/dashboard">Dashboard</Link>
          <BsSlash className="text-[#ccc]" />
          <Link href="/dashboard/patients">Patients</Link>
          <BsSlash className="text-[#ccc]" />
          <span>Edit Patient</span>
        </div>
      </div>

      <div className="mt-5">
        <Link
          href={`/dashboard/patients/${patientId}`}
          className="text-white text-sm bg-[#556ee6] py-2 px-4 rounded-md flex items-center gap-2 w-max"
        >
          <ArrowLeftOutlined /> Back to Patient Details
        </Link>
      </div>

      <Card className="mt-8 p-6">
        <div className="w-full border border-gray-200 rounded-md border-l-blue-500 px-4 py-4 mb-6">
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
                  Updating...
                </>
              ) : (
                "Update Patient"
              )}
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
} 