import api from './api';
import { UserPreferences, User } from '@/types/api';

export const userService = {
  getPreferences: async (): Promise<UserPreferences> => {
    const response = await api.get<UserPreferences>('/users/me/preferences');
    return response.data;
  },

  updatePreferences: async (preferences: Partial<UserPreferences>): Promise<UserPreferences> => {
    const response = await api.patch<UserPreferences>('/users/me/preferences', preferences);
    return response.data;
  },

  changePassword: async (currentPassword: string, newPassword: string): Promise<void> => {
    await api.patch('/users/me/password', { currentPassword, newPassword });
  },

  getAllUsers: async (): Promise<User[]> => {
    const response = await api.get<User[]>('/users');
    return response.data;
  },
};
