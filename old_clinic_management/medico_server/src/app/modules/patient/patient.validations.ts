import { z } from 'zod';

// Schema for Medical Report
const MedicalReportSchema = z.object({
  id: z.string().uuid().optional(),
  patientId: z.string().uuid().optional(),
  reportName: z.string().optional(),
  reportLink: z.string().url().optional(),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
});

// Schema for Patient Health Data
const PatientHealthDataSchema = z.object({
  id: z.string().uuid().optional(),
  patientId: z.string().uuid().optional(),
  dateOfBirth: z.string().nullable().optional(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']).optional(),
  bloodGroup: z
    .enum([
      'O_POSITIVE',
      'O_NEGATIVE',
      'A_POSITIVE',
      'A_NEGATIVE',
      'B_POSITIVE',
      'B_NEGATIVE',
      'AB_POSITIVE',
      'AB_NEGATIVE',
    ])
    .optional(),
  hasAllergies: z.boolean().optional(),
  hasDiabetes: z.boolean().optional(),
  height: z.number().nullable().optional(),
  weight: z.number().nullable().optional(),
  diet: z.string().nullable().optional(),
  pulse: z.number().nullable().optional(),
  smokingStatus: z.boolean().optional(),
  dietaryPreferences: z.string().nullable().optional(),
  pregnancyStatus: z.boolean().optional(),
  mentalHealthHistory: z.string().nullable().optional(),
  immunizationStatus: z.boolean().optional(),
  hasPastSurgeries: z.boolean().optional(),
  recentAnxiety: z.boolean().optional(),
  recentDepression: z.boolean().optional(),
  maritalStatus: z.enum(['UNMARRIED', 'MARRIED']).optional(),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
});

// Simplified Schema for Main Patient Data
const PatientSchema = z.object({
  adminId: z.string(),
  firstName: z.string(),
  lastName: z.string(),
});

// Simplified Create Patient Schema
const createPatientSchema = z.object({
  body: z.object({
    adminId: z.string({
      required_error: "Admin ID is required!"
    }),
    firstName: z.string({
      required_error: "First name is required!"
    }),
    lastName: z.string({
      required_error: "Last name is required!"
    }),
  }),
});

// Simplified Update Patient Schema
const updatePatientSchema = z.object({
  body: z.object({
    firstName: z.string().optional(),
    lastName: z.string().optional(),
  }),
});

export const patientValidation = {
  PatientSchema,
  createPatientSchema,
  updatePatientSchema,
};
