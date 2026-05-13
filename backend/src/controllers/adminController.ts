import { Request, Response, NextFunction } from 'express';
import prisma from '../config/database';
import { AppError } from '../middleware/errorHandler';

export const getAllUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const page = Number(req.query['page']) || 1;
    const limit = Math.min(Number(req.query['limit']) || 10, 100);
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          role: true,
          kycStatus: true,
          isActive: true,
          createdAt: true,
          _count: { select: { accounts: true } },
        },
      }),
      prisma.user.count(),
    ]);

    res.status(200).json({
      status: 'success',
      data: { users, total, page, limit, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
};

export const getUserById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params['id'] },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        kycStatus: true,
        isActive: true,
        createdAt: true,
        accounts: { select: { id: true, accountNumber: true, balance: true, currency: true, isActive: true } },
        kycDocuments: true,
      },
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    res.status(200).json({ status: 'success', data: { user } });
  } catch (error) {
    next(error);
  }
};

export const toggleUserStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.params['id'] } });
    if (!user) {
      throw new AppError('User not found', 404);
    }

    const updated = await prisma.user.update({
      where: { id: req.params['id'] },
      data: { isActive: !user.isActive },
      select: { id: true, email: true, isActive: true },
    });

    res.status(200).json({ status: 'success', data: { user: updated } });
  } catch (error) {
    next(error);
  }
};

export const getDashboardStats = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const [totalUsers, activeUsers, totalTransactions, pendingKYC] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { isActive: true } }),
      prisma.transaction.count(),
      prisma.kYCDocument.count({ where: { status: 'PENDING' } }),
    ]);

    const transactionVolume = await prisma.transaction.aggregate({
      _sum: { amount: true },
      where: { status: 'COMPLETED' },
    });

    res.status(200).json({
      status: 'success',
      data: {
        totalUsers,
        activeUsers,
        totalTransactions,
        pendingKYC,
        totalVolume: transactionVolume._sum.amount ?? 0,
      },
    });
  } catch (error) {
    next(error);
  }
};
