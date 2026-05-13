export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: 'USER' | 'ADMIN';
  kycStatus: 'NOT_SUBMITTED' | 'PENDING' | 'APPROVED' | 'REJECTED';
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface Account {
  id: string;
  userId: string;
  accountNumber: string;
  balance: string | number;
  currency: string;
  isActive: boolean;
  createdAt: string;
}

export interface Transaction {
  id: string;
  senderId?: string;
  receiverId?: string;
  fromAccountId?: string;
  toAccountId?: string;
  amount: string | number;
  type: 'DEPOSIT' | 'WITHDRAWAL' | 'TRANSFER';
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  description?: string;
  createdAt: string;
  fromAccount?: { accountNumber: string };
  toAccount?: { accountNumber: string };
  sender?: { firstName: string; lastName: string };
  receiver?: { firstName: string; lastName: string };
}

export interface KYCDocument {
  id: string;
  userId: string;
  documentType: string;
  documentUrl: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  adminNotes?: string;
  createdAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  status: 'success' | 'error';
  data?: T;
  message?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

export interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalTransactions: number;
  pendingKYC: number;
  totalVolume: number;
}
