import { Doctor, Prisma } from '@prisma/client';
import httpStatus from 'http-status';
import ApiError from '../../../errors/ApiError';
import { paginationHelpers } from '../../../helpers/paginationHelper';
import { IGenericResponse } from '../../../interfaces/common';
import { IPaginationOptions } from '../../../interfaces/pagination';
import prisma from '../../../shared/prisma';

const getAllDoctors = async (
  filters: { searchTerm?: string },
  paginationOptions: IPaginationOptions
): Promise<IGenericResponse<Doctor[]>> => {
  const { searchTerm } = filters;
  const { page, limit, skip, sortBy, sortOrder } =
    paginationHelpers.calculatePagination(paginationOptions);

  const andConditions = [];

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

  const whereConditions: Prisma.DoctorWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const result = await prisma.doctor.findMany({
    where: whereConditions,
    skip,
    take: limit,
    orderBy: sortBy && sortOrder && sortBy !== 'averageRating'
      ? { [sortBy]: sortOrder }
      : { createdAt: 'desc' },
  });

  const total = await prisma.doctor.count({
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

const getDoctorById = async (id: string): Promise<Doctor | null> => {
  const result = await prisma.doctor.findUnique({
    where: {
      id,
      isDeleted: false,
    },
  });

  if (!result) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Doctor not found');
  }

  return result;
};

const createDoctor = async (
  adminId: string,
  data: Partial<Doctor>
): Promise<Doctor> => {
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

  // Create doctor
  const result = await prisma.doctor.create({
    data: {
      ...data,
      adminId,
    } as Prisma.DoctorCreateInput,
  });

  return result;
};

const updateDoctor = async (
  id: string,
  payload: Partial<Doctor>
): Promise<Doctor> => {
  // Check if doctor exists
  const doctor = await prisma.doctor.findUnique({
    where: {
      id,
      isDeleted: false,
    },
  });

  if (!doctor) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Doctor not found');
  }

  // Update doctor
  const result = await prisma.doctor.update({
    where: {
      id,
    },
    data: payload,
  });

  return result;
};

const deleteDoctor = async (id: string): Promise<Doctor> => {
  // Check if doctor exists
  const doctor = await prisma.doctor.findUnique({
    where: {
      id,
      isDeleted: false,
    },
  });

  if (!doctor) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Doctor not found');
  }

  // Soft delete doctor
  const result = await prisma.doctor.update({
    where: {
      id,
    },
    data: {
      isDeleted: true,
    },
  });

  return result;
};

export const DoctorService = {
  getAllDoctors,
  getDoctorById,
  createDoctor,
  updateDoctor,
  deleteDoctor,
}; 