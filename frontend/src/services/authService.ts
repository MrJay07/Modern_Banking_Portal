import api from './api';
import type { User, AuthTokens, LoginCredentials, RegisterData } from '../types';

export const authService = {
  async login(credentials: LoginCredentials) {
    const { data } = await api.post<{ status: string; data: { user: User } & AuthTokens }>(
      '/auth/login',
      credentials
    );
    return data.data;
  },

  async register(registerData: RegisterData) {
    const { data } = await api.post<{ status: string; data: { user: User } }>(
      '/auth/register',
      registerData
    );
    return data.data;
  },

  async logout(refreshToken: string) {
    await api.post('/auth/logout', { refreshToken });
  },

  async refresh(refreshToken: string) {
    const { data } = await api.post<{ status: string; data: AuthTokens }>(
      '/auth/refresh',
      { refreshToken }
    );
    return data.data;
  },

  async getMe() {
    const { data } = await api.get<{ status: string; data: { user: User } }>('/auth/me');
    return data.data.user;
  },
};
