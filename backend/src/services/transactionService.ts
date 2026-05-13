import { Decimal } from '@prisma/client/runtime/library';
import prisma from '../config/database';
import { AppError } from '../middleware/errorHandler';
import logger from '../config/logger';
import type { DepositInput, WithdrawalInput, TransferInput } from '../validations/transaction';

export const processDeposit = async (userId: string, data: DepositInput) => {
  const account = await prisma.account.findFirst({
    where: { id: data.accountId, userId, isActive: true },
  });

  if (!account) {
    throw new AppError('Account not found or access denied', 404);
  }

  const result = await prisma.$transaction(async (tx) => {
    const updated = await tx.account.update({
      where: { id: data.accountId },
      data: { balance: { increment: data.amount } },
    });

    const transaction = await tx.transaction.create({
      data: {
        toAccountId: data.accountId,
        receiverId: userId,
        amount: data.amount,
        type: 'DEPOSIT',
        status: 'COMPLETED',
        description: data.description || 'Deposit',
      },
    });

    return { account: updated, transaction };
  });

  logger.info('Deposit processed', { userId, accountId: data.accountId, amount: data.amount });
  return result;
};

export const processWithdrawal = async (userId: string, data: WithdrawalInput) => {
  const account = await prisma.account.findFirst({
    where: { id: data.accountId, userId, isActive: true },
  });

  if (!account) {
    throw new AppError('Account not found or access denied', 404);
  }

  const currentBalance = new Decimal(account.balance.toString());
  const withdrawalAmount = new Decimal(data.amount.toString());
  if (currentBalance.lessThan(withdrawalAmount)) {
    throw new AppError('Insufficient funds', 400);
  }

  const result = await prisma.$transaction(async (tx) => {
    const updated = await tx.account.update({
      where: { id: data.accountId },
      data: { balance: { decrement: data.amount } },
    });

    const transaction = await tx.transaction.create({
      data: {
        fromAccountId: data.accountId,
        senderId: userId,
        amount: data.amount,
        type: 'WITHDRAWAL',
        status: 'COMPLETED',
        description: data.description || 'Withdrawal',
      },
    });

    return { account: updated, transaction };
  });

  logger.info('Withdrawal processed', { userId, accountId: data.accountId, amount: data.amount });
  return result;
};

export const processTransfer = async (userId: string, data: TransferInput) => {
  const fromAccount = await prisma.account.findFirst({
    where: { id: data.fromAccountId, userId, isActive: true },
  });

  if (!fromAccount) {
    throw new AppError('Source account not found or access denied', 404);
  }

  const fromBalance = new Decimal(fromAccount.balance.toString());
  const transferAmount = new Decimal(data.amount.toString());
  if (fromBalance.lessThan(transferAmount)) {
    throw new AppError('Insufficient funds', 400);
  }

  const toAccount = await prisma.account.findFirst({
    where: { accountNumber: data.toAccountNumber, isActive: true },
  });

  if (!toAccount) {
    throw new AppError('Destination account not found', 404);
  }

  if (fromAccount.id === toAccount.id) {
    throw new AppError('Cannot transfer to the same account', 400);
  }

  const result = await prisma.$transaction(async (tx) => {
    const [updatedFrom, updatedTo] = await Promise.all([
      tx.account.update({
        where: { id: fromAccount.id },
        data: { balance: { decrement: data.amount } },
      }),
      tx.account.update({
        where: { id: toAccount.id },
        data: { balance: { increment: data.amount } },
      }),
    ]);

    const transaction = await tx.transaction.create({
      data: {
        fromAccountId: fromAccount.id,
        toAccountId: toAccount.id,
        senderId: userId,
        receiverId: toAccount.userId,
        amount: data.amount,
        type: 'TRANSFER',
        status: 'COMPLETED',
        description: data.description || 'Transfer',
      },
    });

    return { fromAccount: updatedFrom, toAccount: updatedTo, transaction };
  });

  logger.info('Transfer processed', {
    userId,
    fromAccountId: fromAccount.id,
    toAccountId: toAccount.id,
    amount: data.amount,
  });
  return result;
};

export const getUserTransactions = async (
  userId: string,
  page = 1,
  limit = 10,
  filters: {
    type?: 'DEPOSIT' | 'WITHDRAWAL' | 'TRANSFER';
    status?: 'PENDING' | 'COMPLETED' | 'FAILED';
    accountId?: string;
    startDate?: string;
    endDate?: string;
  } = {}
) => {
  const take = Math.min(limit, 100);
  const skip = (page - 1) * take;

  const where: Record<string, unknown> = {
    OR: [{ senderId: userId }, { receiverId: userId }],
  };

  if (filters.type) where['type'] = filters.type;
  if (filters.status) where['status'] = filters.status;
  if (filters.accountId) {
    where['OR'] = [{ fromAccountId: filters.accountId }, { toAccountId: filters.accountId }];
  }
  if (filters.startDate || filters.endDate) {
    where['createdAt'] = {
      ...(filters.startDate ? { gte: new Date(filters.startDate) } : {}),
      ...(filters.endDate ? { lte: new Date(filters.endDate) } : {}),
    };
  }

  const [transactions, total] = await Promise.all([
    prisma.transaction.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take,
      skip,
      include: {
        fromAccount: { select: { accountNumber: true } },
        toAccount: { select: { accountNumber: true } },
        sender: { select: { firstName: true, lastName: true } },
        receiver: { select: { firstName: true, lastName: true } },
      },
    }),
    prisma.transaction.count({ where }),
  ]);

  return {
    transactions,
    total,
    page,
    limit: take,
    totalPages: Math.ceil(total / take),
  };
};
