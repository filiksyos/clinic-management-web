import { Patient, Prisma } from '@prisma/client';
import { IGenericResponse } from '../../../interfaces/common';
import { IPaginationOptions } from '../../../interfaces/pagination';
import { paginationHelpers } from '../../../helpers/paginationHelper';
import prisma from '../../../shared/prisma';
import ApiError from '../../../errors/ApiError';
import httpStatus from 'http-status';

// Simplified create patient function
const createPatient = async (payload: { adminId: string; firstName: string; lastName: string }): Promise<Patient> => {
  // Check if admin exists
  const admin = await prisma.admin.findUnique({
    where: {
      id: payload.adminId,
      isDeleted: false,
    },
  });

  if (!admin) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Admin not found');
  }

  // Create patient with minimal required fields
  const result = await prisma.patient.create({
    data: {
      firstName: payload.firstName,
      lastName: payload.lastName,
      adminId: payload.adminId,
    },
  });

  return result;
};

// Simplified get all patients function
const getAllFromDB = async (
  filters: { searchTerm?: string },
  options: IPaginationOptions,
): Promise<IGenericResponse<Patient[]>> => {
  const { limit, page, skip } = paginationHelpers.calculatePagination(options);
  const { searchTerm } = filters;

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
      ],
    });
  }

  andConditions.push({
    isDeleted: false,
  });

  const whereConditions: Prisma.PatientWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const result = await prisma.patient.findMany({
    where: whereConditions,
    skip,
    take: limit,
    orderBy:
      options.sortBy && options.sortOrder
        ? { [options.sortBy]: options.sortOrder }
        : {
            createdAt: 'desc',
          },
  });
  const total = await prisma.patient.count({
    where: whereConditions,
  });

  return {
    meta: {
      total,
      page,
      limit,
    },
    data: result,
  };
};

// Simplified get patient by id function
const getByIdFromDB = async (id: string): Promise<Patient | null> => {
  const result = await prisma.patient.findUnique({
    where: {
      id,
      isDeleted: false,
    },
  });
  return result;
};

// Simplified update patient function
const updateIntoDB = async (
  id: string,
  payload: { firstName?: string; lastName?: string },
): Promise<Patient | null> => {
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

  // Update patient with only the allowed fields
  const result = await prisma.patient.update({
    where: {
      id,
    },
    data: payload,
  });

  return result;
};

// Simplified delete patient function
const deleteFromDB = async (id: string): Promise<Patient> => {
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

  // Delete patient
  const result = await prisma.patient.delete({
    where: {
      id,
    },
  });

  return result;
};

// Simplified soft delete function
const softDelete = async (id: string): Promise<Patient> => {
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
    where: { id },
    data: {
      isDeleted: true,
    },
  });

  return result;
};

export const PatientService = {
  getAllFromDB,
  getByIdFromDB,
  updateIntoDB,
  deleteFromDB,
  softDelete,
  createPatient,
};
