"use client";

import Link from "next/link";
import React, { useState } from "react";
import { ArrowLeftOutlined } from "@ant-design/icons";
import MedicoForm from "@/components/Forms/MedicoForm";
import MedicoInput from "@/components/Forms/MedicoInput";
import { Button, Image, Card, Upload } from "antd";
import { FieldValues } from "react-hook-form";
import MedicoSelect from "@/components/Forms/MedicoSelect";
import uploadImageToImgbb from "@/components/ImageUploader/ImageUploader";
import { toast } from "sonner";
import {
  useCreatePatientMutation,
  useUpdatePatientMutation,
} from "@/redux/api/patientApi";
import {
  bloodGroupOptions,
  dietOptions,
  genderOptions,
  maritalOptions,
} from "@/components/SelectOptions/SelectOptions";
import FullPageLoading from "@/components/Loader/FullPageLoader";
import Meta from "@/components/Dashboard/Meta/MetaData";

const CreatePatients = () => {
  const [photo, setPhoto] = useState("");
  const [createPatient, { isLoading: isCreating }] = useCreatePatientMutation();
  const [updatePatient, { isLoading: isUpdating }] = useUpdatePatientMutation();

  const handleFileUpload = async (file: File) => {
    try {
      const image = await uploadImageToImgbb(file);

      if (image) {
        toast.success("Patient Photo Upload successfully");
      }
      setPhoto(image);
    } catch (error) {
      console.error("Failed to upload image:", error);
    }
  };

  const handleCreatePatient = async (values: FieldValues) => {
    try {
      // Generate a unique email using timestamp
      const uniqueEmail = `patient${Date.now()}@example.com`;

      const patientData = {
        password: "patient123",
        patient: {
          firstName: values?.firstName,
          lastName: values?.lastName,
          email: values?.email || uniqueEmail,
          contactNumber: values?.contactNumber || "+1234567890",
          profilePhoto: photo || "",
          address: values?.address || "",
        },
      };

      const patientUpdateData = {
        patientHealthData: {
          gender: values?.gender || null,
          bloodGroup: values?.bloodGroup || null,
          height: values?.height ? Number(values.height) : null,
          weight: values?.weight ? Number(values.weight) : null,
          diet: values?.diet || null,
          pulse: values?.pulse ? Number(values.pulse) : null,
          dietaryPreferences: values?.dietaryPreferences || null,
          maritalStatus: values?.maritalStatus || null,
        },
      };

      try {
        const res = await createPatient(patientData).unwrap();
        
        if (res?.data?.id) {
          try {
            const response = await updatePatient({
              id: res.data.id,
              data: patientUpdateData,
            }).unwrap();

            if (response?.data?.id) {
              toast.success("Patient created successfully!");
              // Optionally redirect to patient list
              // router.push('/admin/patients');
            }
          } catch (updateError: any) {
            console.error('Error updating patient health data:', updateError);
            toast.error('Patient created but health data update failed');
          }
        }
      } catch (createError: any) {
        console.error('Error creating patient:', createError);
        if (createError?.data?.message) {
          toast.error(createError.data.message);
        } else if (createError?.error?.message) {
          toast.error(createError.error.message);
        } else {
          toast.error('Failed to create patient');
        }
      }
    } catch (err: any) {
      console.error('Unexpected error:', err);
      toast.error('An unexpected error occurred');
    }
  };

  const defaultValues = {
    firstName: "",
    lastName: "",
    email: "",
    contactNumber: "",
    address: "",
    gender: "",
    bloodGroup: "",
    height: "",
    weight: "",
    diet: "",
    pulse: "",
    dietaryPreferences: "",
    maritalStatus: "",
  };

  if (isCreating || isUpdating) {
    return <FullPageLoading />;
  }

  return (
    <>
      <Meta
        title="Create Patient| Medico - Hospital & Clinic Management System"
        description="This is the crate of patient page of Medico where admin can create of patient profile and more."
      />
      {/* Header Section */}
      <div className="mx-4 flex items-center justify-between mt-4">
        <h2 className="text-lg text-[#495057] font-semibold">
          Add New Patient
        </h2>
        <div className="flex items-center gap-1 text-[#495057] text-sm">
          <Link href="/admin">Dashboard</Link>/
          <Link href="/admin/patients">Patients</Link>/
          <Link href="#">Add New Patient</Link>
        </div>
      </div>

      <div className="mt-5 ml-4">
        <Link
          href="/admin/patients"
          className="text-white text-sm bg-[#556ee6] py-2 px-4 rounded-md"
        >
          <ArrowLeftOutlined className="mr-1" /> Back to Patient List
        </Link>
      </div>

      {/* Doctor Form */}
      <div className="px-4 sm:px-8 mt-8">
        {/* Section Header */}
        <div className="w-full border border-gray-200 rounded-md border-l-blue-500 px-4 py-4 mb-6">
          Basic Information
        </div>

        <MedicoForm
          onSubmit={handleCreatePatient}
          defaultValues={defaultValues}
        >
          {/* Rows of Input Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
            <MedicoInput label="First Name" type="text" name="firstName" />
            <MedicoInput label="Last Name" type="text" name="lastName" />
            <MedicoInput label="Email" type="text" name="email" />
            <MedicoInput label="Contact No" type="text" name="contactNumber" />

            <MedicoInput label="Address" type="text" name="address" />
            <div className="w-full">
              <p
                className="block text-sm font-medium text-gray-700"
                style={{ marginBottom: "5px" }}
              >
                Profile URL
              </p>
              <Card
                style={{
                  height: "180px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                }}
                cover={
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      height: "180px",
                      width: "180px",
                      margin: "auto",
                      borderRadius: "8px",
                    }}
                  >
                    <Upload
                      customRequest={({ file }) =>
                        handleFileUpload(file as File)
                      }
                      showUploadList={false}
                      accept="image/*"
                    >
                      <Image
                        src="https://i.ibb.co/Gx3Rg6S/download.jpg"
                        alt="User Photo"
                        preview={false}
                        style={{
                          marginTop: "40px",
                          height: "140px",
                          width: "140px",
                          objectFit: "cover",
                          cursor: "pointer",
                          borderRadius: "50%",
                          border: "2px solid #ddd",
                        }}
                      />
                    </Upload>
                  </div>
                }
              />
            </div>
          </div>

          {/* 2nd section */}
          <div className="mt-6 w-full border border-gray-200 rounded-md border-l-blue-500 px-4 py-4 mb-6">
            Medical Information
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
            <MedicoSelect
              name="gender"
              label="Gender"
              options={genderOptions}
            />
            <MedicoSelect
              name="bloodGroup"
              label="Blood Group"
              options={bloodGroupOptions}
            />
            <MedicoInput label="Height" type="text" name="height" />
            <MedicoInput label="Weight" type="text" name="weight" />

            <MedicoSelect name="diet" label="Diet" options={dietOptions} />
            <MedicoInput label="Pulse" type="text" name="pulse" />
            <MedicoInput
              label="Dietary Preferences"
              type="text"
              name="dietaryPreferences"
            />
            <MedicoSelect
              name="maritalStatus"
              label="Marital Status"
              options={maritalOptions}
            />
          </div>

          {/* Submit Button */}
          <Button
            htmlType="submit"
            size="large"
            className="my-4 rounded-md bg-[#485EC4] px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 w-full md:w-auto"
          >
            Add New Patient
          </Button>
        </MedicoForm>
      </div>
    </>
  );
};

export default CreatePatients;
