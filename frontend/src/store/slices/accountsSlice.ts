import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { accountService } from '../../services/accountService';
import type { Account } from '../../types';

interface AccountsState {
  accounts: Account[];
  totalBalance: number;
  isLoading: boolean;
  error: string | null;
}

const initialState: AccountsState = {
  accounts: [],
  totalBalance: 0,
  isLoading: false,
  error: null,
};

export const fetchAccounts = createAsyncThunk('accounts/fetchAll', async (_, { rejectWithValue }) => {
  try {
    return await accountService.getAccounts();
  } catch (err: unknown) {
    const message =
      (err as { response?: { data?: { message?: string } } }).response?.data?.message ??
      'Failed to fetch accounts';
    return rejectWithValue(message);
  }
});

export const fetchAccountSummary = createAsyncThunk(
  'accounts/fetchSummary',
  async (_, { rejectWithValue }) => {
    try {
      return await accountService.getAccountSummary();
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } }).response?.data?.message ??
        'Failed to fetch summary';
      return rejectWithValue(message);
    }
  }
);

export const createAccount = createAsyncThunk(
  'accounts/create',
  async (currency: string, { rejectWithValue }) => {
    try {
      return await accountService.createAccount(currency);
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } }).response?.data?.message ??
        'Failed to create account';
      return rejectWithValue(message);
    }
  }
);

const accountsSlice = createSlice({
  name: 'accounts',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAccounts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAccounts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.accounts = action.payload;
      })
      .addCase(fetchAccounts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchAccountSummary.fulfilled, (state, action) => {
        state.accounts = action.payload.accounts;
        state.totalBalance = action.payload.totalBalance;
      })
      .addCase(createAccount.fulfilled, (state, action) => {
        state.accounts.push(action.payload);
      });
  },
});

export default accountsSlice.reducer;
