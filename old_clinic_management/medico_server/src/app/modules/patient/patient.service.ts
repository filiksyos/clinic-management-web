import { Patient, Prisma } from '@prisma/client';
import httpStatus from 'http-status';
import ApiError from '../../../errors/ApiError';
import { paginationHelpers } from '../../../helpers/paginationHelper';
import { IGenericResponse } from '../../../interfaces/common';
import { IPaginationOptions } from '../../../interfaces/pagination';
import prisma from '../../../shared/prisma';

const getAllPatients = async (
  filters: { searchTerm?: string },
  paginationOptions: IPaginationOptions
): Promise<IGenericResponse<Patient[]>> => {
  const { searchTerm } = filters;
  const { page, limit, skip, sortBy, sortOrder } =
    paginationHelpers.calculatePagination(paginationOptions);

  const andConditions: Prisma.PatientWhereInput[] = [];

  if (searchTerm) {
    andConditions.push({
      OR: [
        {
          firstName: {
            contains: searchTerm,
            mode: 'insensitive',
          },
        },
        {
          lastName: {
            contains: searchTerm,
            mode: 'insensitive',
          },
        },
        {
          contactNumber: {
            contains: searchTerm,
            mode: 'insensitive',
          },
        },
      ],
    });
  }

  // Add not deleted condition
  andConditions.push({
    isDeleted: false,
  });

  const whereConditions: Prisma.PatientWhereInput = { AND: andConditions };

  const result = await prisma.patient.findMany({
    where: whereConditions,
    skip,
    take: limit,
    orderBy: {
      [sortBy]: sortOrder,
    },
  });

  const total = await prisma.patient.count({
    where: whereConditions,
  });

  return {
    meta: {
      page,
      limit,
      total,
    },
    data: result,
  };
};

const getPatientById = async (id: string): Promise<Patient | null> => {
  const result = await prisma.patient.findUnique({
    where: {
      id,
      isDeleted: false,
    },
  });

  if (!result) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Patient not found');
  }

  return result;
};

const createPatient = async (
  adminId: string,
  data: Omit<Patient, 'id' | 'createdAt' | 'updatedAt' | 'adminId'>
): Promise<Patient> => {
  // Check if admin exists
  const admin = await prisma.admin.findUnique({
    where: {
      id: adminId,
      isDeleted: false,
    },
  });

  if (!admin) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Admin not found');
  }

  // Create patient
  const result = await prisma.patient.create({
    data: {
      ...data,
      adminId,
    },
  });

  return result;
};

const updatePatient = async (
  id: string,
  payload: Partial<Patient>
): Promise<Patient> => {
  // Check if patient exists
  const patient = await prisma.patient.findUnique({
    where: {
      id,
      isDeleted: false,
    },
  });

  if (!patient) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Patient not found');
  }

  // Update patient
  const result = await prisma.patient.update({
    where: {
      id,
    },
    data: payload,
  });

  return result;
};

const deletePatient = async (id: string): Promise<Patient> => {
  // Check if patient exists
  const patient = await prisma.patient.findUnique({
    where: {
      id,
      isDeleted: false,
    },
  });

  if (!patient) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Patient not found');
  }

  // Soft delete patient
  const result = await prisma.patient.update({
    where: {
      id,
    },
    data: {
      isDeleted: true,
    },
  });

  return result;
};

export const PatientService = {
  getAllPatients,
  getPatientById,
  createPatient,
  updatePatient,
  deletePatient,
}; 