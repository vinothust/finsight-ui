import api from './api';
import { FilterOption } from '@/types/api';

export const filterService = {
  getClusters: async (): Promise<FilterOption[]> => {
    const response = await api.get<{ options: FilterOption[] }>('/filters/options/clusters');
    return response.data.options;
  },

  getAccounts: async (clusterId?: string): Promise<FilterOption[]> => {
    const params = clusterId ? { clusterId } : {};
    const response = await api.get<{ options: FilterOption[] }>('/filters/options/accounts', { params });
    return response.data.options;
  },

  getProjects: async (accountId?: string): Promise<FilterOption[]> => {
    const params = accountId ? { accountId } : {};
    const response = await api.get<{ options: FilterOption[] }>('/filters/options/projects', { params });
    return response.data.options;
  },

  getKPIs: async (): Promise<string[]> => {
    const response = await api.get<{ options: string[] }>('/filters/options/kpis');
    return response.data.options;
  },
};
