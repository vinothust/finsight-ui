import api from './api';
import { AuthResponse, User } from '@/types/api';

export const authService = {
  login: async (email: string, password: string): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/login', { email, password });
    return response.data;
  },

  logout: async (): Promise<{ message: string }> => {
    const refreshToken = localStorage.getItem('refreshToken');
    const response = await api.post<{ message: string }>('/auth/logout', { refreshToken });
    return response.data;
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await api.get<any>('/auth/me');
    return response.data?.user || response.data;
  },
};
