import api from './api';
import { User } from '@/types';

export interface AdminAccount {
  id: string;
  name: string;
  clusterId: string;
  projectCount: number;
  totalRevenue: number;
  avgMargin: number;
  projects: string[];
  createdAt: string;
  updatedAt: string;
}

export interface AdminCluster {
  id: string;
  name: string;
  accountCount: number;
  totalRevenue: number;
  avgMargin: number;
  accounts: string[];
  createdAt: string;
  updatedAt: string;
}

export interface AdminUser {
  id: string;
  email: string;
  role: string;
  name: string;
  department: string;
  createdAt: string;
  updatedAt: string;
  preferences: any;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export const adminService = {
  getAccounts: async (): Promise<PaginatedResponse<AdminAccount>> => {
    const response = await api.get<PaginatedResponse<AdminAccount>>('/accounts');
    return response.data;
  },

  getClusters: async (): Promise<PaginatedResponse<AdminCluster>> => {
    const response = await api.get<PaginatedResponse<AdminCluster>>('/clusters');
    return response.data;
  },

  getUsers: async (): Promise<PaginatedResponse<AdminUser>> => {
    const response = await api.get<PaginatedResponse<AdminUser>>('/users');
    return response.data;
  }
};
