import api from './api';
import { Cluster, Account, Project } from '@/types/api';

export const managementService = {
  getClusters: async (): Promise<Cluster[]> => {
    const response = await api.get<Cluster[]>('/clusters');
    return response.data;
  },

  getAccounts: async (): Promise<Account[]> => {
    const response = await api.get<Account[]>('/accounts');
    return response.data;
  },

  getProjects: async (): Promise<Project[]> => {
    const response = await api.get<Project[]>('/projects');
    return response.data;
  },
};
