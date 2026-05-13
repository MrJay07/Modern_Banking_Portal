import { Response, NextFunction } from 'express';
import prisma from '../config/database';
import { AppError } from '../middleware/errorHandler';
import { generateAccountNumber } from '../utils/helpers';
import type { AuthenticatedRequest } from '../middleware/auth';

export const getAccounts = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const accounts = await prisma.account.findMany({
      where: { userId: req.user!.userId, isActive: true },
      orderBy: { createdAt: 'asc' },
    });

    res.status(200).json({ status: 'success', data: { accounts } });
  } catch (error) {
    next(error);
  }
};

export const getAccount = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const account = await prisma.account.findFirst({
      where: { id: req.params['id'], userId: req.user!.userId },
    });

    if (!account) {
      throw new AppError('Account not found', 404);
    }

    res.status(200).json({ status: 'success', data: { account } });
  } catch (error) {
    next(error);
  }
};

export const createAccount = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { currency = 'USD' } = req.body as { currency?: string };

    const existingAccounts = await prisma.account.count({
      where: { userId: req.user!.userId },
    });

    if (existingAccounts >= 5) {
      throw new AppError('Maximum number of accounts reached (5)', 400);
    }

    let accountNumber = generateAccountNumber();
    let attempts = 0;
    while (attempts < 5) {
      const existing = await prisma.account.findUnique({ where: { accountNumber } });
      if (!existing) break;
      accountNumber = generateAccountNumber();
      attempts++;
    }

    const account = await prisma.account.create({
      data: {
        userId: req.user!.userId,
        accountNumber,
        balance: 0,
        currency,
      },
    });

    res.status(201).json({ status: 'success', data: { account } });
  } catch (error) {
    next(error);
  }
};

export const getAccountSummary = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.userId;

    const accounts = await prisma.account.findMany({
      where: { userId, isActive: true },
    });

    const totalBalance = accounts.reduce((sum, acc) => sum + Number(acc.balance), 0);

    const recentTransactions = await prisma.transaction.findMany({
      where: {
        OR: [{ senderId: userId }, { receiverId: userId }],
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        fromAccount: { select: { accountNumber: true } },
        toAccount: { select: { accountNumber: true } },
      },
    });

    res.status(200).json({
      status: 'success',
      data: { accounts, totalBalance, recentTransactions },
    });
  } catch (error) {
    next(error);
  }
};
