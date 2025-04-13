import { Admin } from '@prisma/client';
import httpStatus from 'http-status';
import jwt, { JwtPayload, Secret } from 'jsonwebtoken';
import config from '../../../config';
import ApiError from '../../../errors/ApiError';
import { jwtHelpers } from '../../../helpers/jwtHelpers';
import prisma from '../../../shared/prisma';
import bcrypt from 'bcrypt';
import { ILoginUser, IRefreshTokenResponse } from './auth.interface';

const loginUser = async (payload: ILoginUser): Promise<IRefreshTokenResponse> => {
  const { email, password } = payload;

  // Check if admin exists
  const admin = await prisma.admin.findUnique({
    where: {
      email,
      isDeleted: false,
    },
  });

  if (!admin) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User does not exist');
  }

  // Check if password is correct
  const isPasswordMatch = await bcrypt.compare(password, admin.password);

  if (!isPasswordMatch) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Password is incorrect');
  }

  // Check if admin is active
  if (admin.status !== 'ACTIVE') {
    throw new ApiError(httpStatus.FORBIDDEN, 'User is blocked');
  }

  // Generate access token
  const { id, email: adminEmail } = admin;
  const accessToken = jwtHelpers.createToken(
    { id, email: adminEmail },
    config.jwt.secret as Secret,
    config.jwt.expires_in as string
  );

  // Generate refresh token
  const refreshToken = jwtHelpers.createToken(
    { id, email: adminEmail },
    config.jwt.refresh_secret as Secret,
    config.jwt.refresh_expires_in as string
  );

  return {
    accessToken,
    refreshToken,
    needsPasswordChange: admin.needPasswordChange,
  };
};

const refreshToken = async (token: string): Promise<IRefreshTokenResponse> => {
  let verifiedToken = null;

  try {
    verifiedToken = jwtHelpers.verifyToken(
      token,
      config.jwt.refresh_secret as Secret
    );
  } catch (err) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Invalid Refresh Token');
  }

  const { id } = verifiedToken;

  // Check if admin exists
  const admin = await prisma.admin.findUnique({
    where: {
      id,
      isDeleted: false,
    },
  });

  if (!admin) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User does not exist');
  }

  // Check if admin is active
  if (admin.status !== 'ACTIVE') {
    throw new ApiError(httpStatus.FORBIDDEN, 'User is blocked');
  }

  // Generate new access token
  const newAccessToken = jwtHelpers.createToken(
    { id: admin.id, email: admin.email },
    config.jwt.secret as Secret,
    config.jwt.expires_in as string
  );

  return {
    accessToken: newAccessToken,
    refreshToken: token,
    needsPasswordChange: admin.needPasswordChange,
  };
};

const changePassword = async (
  admin: Admin,
  oldPassword: string,
  newPassword: string
): Promise<void> => {
  // Check if old password is correct
  const isPasswordMatch = await bcrypt.compare(oldPassword, admin.password);

  if (!isPasswordMatch) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Old Password is incorrect');
  }

  // Hash new password
  const hashedPassword = await bcrypt.hash(
    newPassword,
    Number(config.bycrypt_salt_rounds)
  );

  // Update password
  await prisma.admin.update({
    where: {
      id: admin.id,
    },
    data: {
      password: hashedPassword,
      needPasswordChange: false,
    },
  });
};

export const AuthService = {
  loginUser,
  refreshToken,
  changePassword,
}; 