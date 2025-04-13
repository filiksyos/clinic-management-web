import { Doctor, Prisma } from '@prisma/client';
import prisma from '../../../shared/prisma';
import { IPaginationOptions } from '../../../interfaces/pagination';
import { IGenericResponse } from '../../../interfaces/common';
import { paginationHelpers } from '../../../helpers/paginationHelper';
import { doctorSearchableFields } from './doctor.constants';
import ApiError from '../../../errors/ApiError';
import httpStatus from 'http-status';

// Simplified insertIntoDB function
const insertIntoDB = async (data: { firstName: string; lastName: string; adminId: string }): Promise<Doctor> => {
  // Check if admin exists
  const admin = await prisma.admin.findUnique({
    where: {
      id: data.adminId,
      isDeleted: false,
    },
  });

  if (!admin) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Admin not found');
  }

  const result = await prisma.doctor.create({
    data: {
      firstName: data.firstName,
      lastName: data.lastName,
      adminId: data.adminId,
    },
  });
  return result;
};

// Simplified getAllFromDB function
const getAllFromDB = async (
  filters: { searchTerm?: string },
  options: IPaginationOptions,
): Promise<IGenericResponse<Doctor[]>> => {
  const { limit, page, skip } = paginationHelpers.calculatePagination(options);
  const { searchTerm } = filters;

  const andConditions: Prisma.DoctorWhereInput[] = [];

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

  const whereConditions: Prisma.DoctorWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const result = await prisma.doctor.findMany({
    where: whereConditions,
    skip,
    take: limit,
    orderBy:
      options.sortBy && options.sortOrder && options.sortBy !== 'averageRating'
        ? { [options.sortBy]: options.sortOrder }
        : { createdAt: 'desc' },
  });

  const total = await prisma.doctor.count({
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

// Simplified getByIdFromDB function
const getByIdFromDB = async (id: string): Promise<Doctor | null> => {
  const result = await prisma.doctor.findUnique({
    where: {
      id,
      isDeleted: false,
    },
  });
  return result;
};

// Simplified updateIntoDB function
const updateIntoDB = async (
  id: string,
  payload: { firstName?: string; lastName?: string },
): Promise<Doctor | null> => {
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

  const result = await prisma.doctor.update({
    where: {
      id,
    },
    data: payload,
  });

  return result;
};

// Simplified deleteFromDB function
const deleteFromDB = async (id: string): Promise<Doctor> => {
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

  return await prisma.doctor.delete({
    where: {
      id,
    },
  });
};

// Soft delete function 
const softDelete = async (id: string): Promise<Doctor> => {
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
  insertIntoDB,
  getAllFromDB,
  getByIdFromDB,
  updateIntoDB,
  deleteFromDB,
  softDelete,
};
