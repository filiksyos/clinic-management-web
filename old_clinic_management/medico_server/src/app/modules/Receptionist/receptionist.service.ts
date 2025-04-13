import { Prisma, Receptionist } from '@prisma/client';
import httpStatus from 'http-status';
import ApiError from '../../../errors/ApiError';
import { paginationHelpers } from '../../../helpers/paginationHelper';
import { IGenericResponse } from '../../../interfaces/common';
import { IPaginationOptions } from '../../../interfaces/pagination';
import prisma from '../../../shared/prisma';

const getAllReceptionists = async (
  filters: { searchTerm?: string },
  paginationOptions: IPaginationOptions
): Promise<IGenericResponse<Receptionist[]>> => {
  const { searchTerm } = filters;
  const { page, limit, skip, sortBy, sortOrder } =
    paginationHelpers.calculatePagination(paginationOptions);

  const andConditions: Prisma.ReceptionistWhereInput[] = [];

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

  // Add not deleted condition
  andConditions.push({
    isDeleted: false,
  });

  const whereConditions: Prisma.ReceptionistWhereInput = { AND: andConditions };

  const result = await prisma.receptionist.findMany({
    where: whereConditions,
    skip,
    take: limit,
    orderBy: {
      [sortBy]: sortOrder,
    },
  });

  const total = await prisma.receptionist.count({
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

const getReceptionistById = async (id: string): Promise<Receptionist | null> => {
  const result = await prisma.receptionist.findUnique({
    where: {
      id,
      isDeleted: false,
    },
  });

  if (!result) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Receptionist not found');
  }

  return result;
};

const createReceptionist = async (
  adminId: string,
  data: { firstName: string; lastName: string }
): Promise<Receptionist> => {
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

  // Create receptionist with minimal required fields
  const result = await prisma.receptionist.create({
    data: {
      firstName: data.firstName,
      lastName: data.lastName,
      adminId: adminId
    },
  });

  return result;
};

const updateReceptionist = async (
  id: string,
  payload: { firstName?: string; lastName?: string }
): Promise<Receptionist> => {
  // Check if receptionist exists
  const receptionist = await prisma.receptionist.findUnique({
    where: {
      id,
      isDeleted: false,
    },
  });

  if (!receptionist) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Receptionist not found');
  }

  // Update receptionist
  const result = await prisma.receptionist.update({
    where: {
      id,
    },
    data: payload,
  });

  return result;
};

const deleteReceptionist = async (id: string): Promise<Receptionist> => {
  // Check if receptionist exists
  const receptionist = await prisma.receptionist.findUnique({
    where: {
      id,
      isDeleted: false,
    },
  });

  if (!receptionist) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Receptionist not found');
  }

  // Soft delete receptionist
  const result = await prisma.receptionist.update({
    where: {
      id,
    },
    data: {
      isDeleted: true,
    },
  });

  return result;
};

export const ReceptionistService = {
  getAllReceptionists,
  getReceptionistById,
  createReceptionist,
  updateReceptionist,
  deleteReceptionist,
};
