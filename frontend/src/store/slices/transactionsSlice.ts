import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { transactionService } from '../../services/transactionService';
import type { Transaction } from '../../types';

interface TransactionsState {
  transactions: Transaction[];
  total: number;
  page: number;
  totalPages: number;
  isLoading: boolean;
  error: string | null;
}

const initialState: TransactionsState = {
  transactions: [],
  total: 0,
  page: 1,
  totalPages: 1,
  isLoading: false,
  error: null,
};

export const fetchTransactions = createAsyncThunk(
  'transactions/fetchAll',
  async (
    filters: { page?: number; limit?: number; type?: string; status?: string } = {},
    { rejectWithValue }
  ) => {
    try {
      return await transactionService.getTransactions(filters);
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } }).response?.data?.message ??
        'Failed to fetch transactions';
      return rejectWithValue(message);
    }
  }
);

const transactionsSlice = createSlice({
  name: 'transactions',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTransactions.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTransactions.fulfilled, (state, action) => {
        state.isLoading = false;
        state.transactions = action.payload.transactions;
        state.total = action.payload.total;
        state.page = action.payload.page;
        state.totalPages = action.payload.totalPages;
      })
      .addCase(fetchTransactions.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export default transactionsSlice.reducer;
