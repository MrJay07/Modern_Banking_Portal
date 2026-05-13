import bcrypt from 'bcryptjs';
import prisma from '../config/database';
import { AppError } from '../middleware/errorHandler';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  getRefreshTokenExpiry,
} from '../utils/jwt';
import { generateAccountNumber, isExpired, sanitizeUser } from '../utils/helpers';
import logger from '../config/logger';
import type { RegisterInput, LoginInput } from '../validations/auth';

export const registerUser = async (data: RegisterInput) => {
  const existingUser = await prisma.user.findUnique({ where: { email: data.email } });
  if (existingUser) {
    throw new AppError('User with this email already exists', 409);
  }

  const hashedPassword = await bcrypt.hash(data.password, 10);

  const user = await prisma.$transaction(async (tx) => {
    const newUser = await tx.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
      },
    });

    let accountNumber = generateAccountNumber();
    let attempts = 0;
    while (attempts < 5) {
      const existing = await tx.account.findUnique({ where: { accountNumber } });
      if (!existing) break;
      accountNumber = generateAccountNumber();
      attempts++;
    }

    await tx.account.create({
      data: {
        userId: newUser.id,
        accountNumber,
        balance: 0,
        currency: 'USD',
      },
    });

    return newUser;
  });

  logger.info('New user registered', { userId: user.id, email: user.email });
  return sanitizeUser(user);
};

export const loginUser = async (data: LoginInput) => {
  const user = await prisma.user.findUnique({ where: { email: data.email } });
  if (!user) {
    throw new AppError('Invalid email or password', 401);
  }

  if (!user.isActive) {
    throw new AppError('Your account has been deactivated', 401);
  }

  const isPasswordValid = await bcrypt.compare(data.password, user.password);
  if (!isPasswordValid) {
    throw new AppError('Invalid email or password', 401);
  }

  const tokenPayload = { userId: user.id, email: user.email, role: user.role };
  const accessToken = generateAccessToken(tokenPayload);
  const { token: refreshToken } = generateRefreshToken(user.id);

  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      token: refreshToken,
      expiresAt: getRefreshTokenExpiry(),
    },
  });

  logger.info('User logged in', { userId: user.id });
  return { accessToken, refreshToken, user: sanitizeUser(user) };
};

export const refreshAccessToken = async (refreshToken: string) => {
  const payload = verifyRefreshToken(refreshToken);

  const storedToken = await prisma.refreshToken.findUnique({ where: { token: refreshToken } });
  if (!storedToken) {
    throw new AppError('Invalid refresh token', 401);
  }

  if (isExpired(storedToken.expiresAt)) {
    await prisma.refreshToken.delete({ where: { id: storedToken.id } });
    throw new AppError('Refresh token expired', 401);
  }

  const user = await prisma.user.findUnique({ where: { id: payload.userId } });
  if (!user || !user.isActive) {
    throw new AppError('User not found or inactive', 401);
  }

  const tokenPayload = { userId: user.id, email: user.email, role: user.role };
  const newAccessToken = generateAccessToken(tokenPayload);
  const { token: newRefreshToken } = generateRefreshToken(user.id);

  await prisma.$transaction([
    prisma.refreshToken.delete({ where: { id: storedToken.id } }),
    prisma.refreshToken.create({
      data: {
        userId: user.id,
        token: newRefreshToken,
        expiresAt: getRefreshTokenExpiry(),
      },
    }),
  ]);

  return { accessToken: newAccessToken, refreshToken: newRefreshToken };
};

export const logoutUser = async (refreshToken: string) => {
  await prisma.refreshToken.deleteMany({ where: { token: refreshToken } });
  logger.info('User logged out');
};
