import { z } from 'zod';

export const depositSchema = z.object({
  body: z.object({
    accountId: z.string().uuid('Invalid account ID'),
    amount: z.number().positive('Amount must be positive').max(1000000, 'Amount exceeds maximum limit'),
    description: z.string().max(255).optional(),
  }),
});

export const withdrawalSchema = z.object({
  body: z.object({
    accountId: z.string().uuid('Invalid account ID'),
    amount: z.number().positive('Amount must be positive').max(50000, 'Withdrawal exceeds maximum limit'),
    description: z.string().max(255).optional(),
  }),
});

export const transferSchema = z.object({
  body: z.object({
    fromAccountId: z.string().uuid('Invalid source account ID'),
    toAccountNumber: z.string().min(1, 'Destination account number is required'),
    amount: z.number().positive('Amount must be positive').max(100000, 'Transfer exceeds maximum limit'),
    description: z.string().max(255).optional(),
  }),
});

export const transactionQuerySchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/).transform(Number).optional(),
    limit: z.string().regex(/^\d+$/).transform(Number).optional(),
    type: z.enum(['DEPOSIT', 'WITHDRAWAL', 'TRANSFER']).optional(),
    status: z.enum(['PENDING', 'COMPLETED', 'FAILED']).optional(),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
    accountId: z.string().uuid().optional(),
  }),
});

export type DepositInput = z.infer<typeof depositSchema>['body'];
export type WithdrawalInput = z.infer<typeof withdrawalSchema>['body'];
export type TransferInput = z.infer<typeof transferSchema>['body'];
export type TransactionQuery = z.infer<typeof transactionQuerySchema>['query'];
