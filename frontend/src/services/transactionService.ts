import api from './api';
import type { Transaction } from '../types';

interface TransactionFilters {
  page?: number;
  limit?: number;
  type?: string;
  status?: string;
  accountId?: string;
}

interface TransactionListResponse {
  transactions: Transaction[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const transactionService = {
  async getTransactions(filters: TransactionFilters = {}) {
    const { data } = await api.get<{ status: string; data: TransactionListResponse }>(
      '/transactions',
      { params: filters }
    );
    return data.data;
  },

  async getTransaction(id: string) {
    const { data } = await api.get<{ status: string; data: { transaction: Transaction } }>(
      `/transactions/${id}`
    );
    return data.data.transaction;
  },

  async deposit(payload: { accountId: string; amount: number; description?: string }) {
    const { data } = await api.post<{ status: string; data: { transaction: Transaction } }>(
      '/transactions/deposit',
      payload
    );
    return data.data.transaction;
  },

  async withdraw(payload: { accountId: string; amount: number; description?: string }) {
    const { data } = await api.post<{ status: string; data: { transaction: Transaction } }>(
      '/transactions/withdraw',
      payload
    );
    return data.data.transaction;
  },

  async transfer(payload: {
    fromAccountId: string;
    toAccountNumber: string;
    amount: number;
    description?: string;
  }) {
    const { data } = await api.post<{ status: string; data: { transaction: Transaction } }>(
      '/transactions/transfer',
      payload
    );
    return data.data.transaction;
  },
};
