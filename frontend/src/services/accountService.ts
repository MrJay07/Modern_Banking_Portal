import api from './api';
import type { Account } from '../types';

export const accountService = {
  async getAccounts() {
    const { data } = await api.get<{ status: string; data: { accounts: Account[] } }>('/accounts');
    return data.data.accounts;
  },

  async getAccountSummary() {
    const { data } = await api.get<{
      status: string;
      data: { accounts: Account[]; totalBalance: number };
    }>('/accounts/summary');
    return data.data;
  },

  async createAccount(currency = 'USD') {
    const { data } = await api.post<{ status: string; data: { account: Account } }>('/accounts', {
      currency,
    });
    return data.data.account;
  },
};
