import { Response, NextFunction } from 'express';
import * as transactionService from '../services/transactionService';
import type { AuthenticatedRequest } from '../middleware/auth';

export const deposit = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const result = await transactionService.processDeposit(req.user!.userId, req.body);
    res.status(201).json({ status: 'success', data: result });
  } catch (error) {
    next(error);
  }
};

export const withdraw = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const result = await transactionService.processWithdrawal(req.user!.userId, req.body);
    res.status(201).json({ status: 'success', data: result });
  } catch (error) {
    next(error);
  }
};

export const transfer = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const result = await transactionService.processTransfer(req.user!.userId, req.body);
    res.status(201).json({ status: 'success', data: result });
  } catch (error) {
    next(error);
  }
};

export const getTransactions = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const page = Number(req.query['page']) || 1;
    const limit = Number(req.query['limit']) || 10;
    const filters = {
      type: req.query['type'] as 'DEPOSIT' | 'WITHDRAWAL' | 'TRANSFER' | undefined,
      status: req.query['status'] as 'PENDING' | 'COMPLETED' | 'FAILED' | undefined,
      accountId: req.query['accountId'] as string | undefined,
      startDate: req.query['startDate'] as string | undefined,
      endDate: req.query['endDate'] as string | undefined,
    };

    const result = await transactionService.getUserTransactions(
      req.user!.userId,
      page,
      limit,
      filters
    );

    res.status(200).json({ status: 'success', data: result });
  } catch (error) {
    next(error);
  }
};

export const getTransaction = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const prisma = (await import('../config/database')).default;
    const { AppError } = await import('../middleware/errorHandler');

    const transaction = await prisma.transaction.findFirst({
      where: {
        id: req.params['id'],
        OR: [{ senderId: req.user!.userId }, { receiverId: req.user!.userId }],
      },
      include: {
        fromAccount: { select: { accountNumber: true } },
        toAccount: { select: { accountNumber: true } },
        sender: { select: { firstName: true, lastName: true } },
        receiver: { select: { firstName: true, lastName: true } },
      },
    });

    if (!transaction) {
      throw new AppError('Transaction not found', 404);
    }

    res.status(200).json({ status: 'success', data: { transaction } });
  } catch (error) {
    next(error);
  }
};
