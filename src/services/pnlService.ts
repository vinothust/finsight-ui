import api from './api';
import { PnLData, KPISummary, TrendData, BreakdownData } from '@/types/api';

export interface PnLFilters {
  clusterIds?: string;
  accountIds?: string;
  projectIds?: string;
  years?: string;
  months?: string;
  page?: number;
  pageSize?: number;
}

export const pnlService = {
  getPnLData: async (filters: PnLFilters): Promise<PnLData> => {
    const response = await api.get<PnLData>('/pnl', { params: filters });
    return response.data;
  },

  getKPISummary: async (filters: PnLFilters): Promise<KPISummary> => {
    const response = await api.get<KPISummary>('/pnl/kpis', { params: filters });
    return response.data;
  },

  getRevenueTrend: async (filters: PnLFilters): Promise<TrendData[]> => {
    const response = await api.get<TrendData[]>('/pnl/trend/revenue', { params: filters });
    return response.data;
  },

  getUtilizationTrend: async (filters: PnLFilters): Promise<TrendData[]> => {
    const response = await api.get<TrendData[]>('/pnl/trend/utilization', { params: filters });
    return response.data;
  },

  getRevenueByCluster: async (filters: PnLFilters): Promise<BreakdownData[]> => {
    const response = await api.get<BreakdownData[]>('/pnl/breakdown/cluster', { params: filters });
    return response.data;
  },

  getMarginByAccount: async (filters: PnLFilters): Promise<BreakdownData[]> => {
    const response = await api.get<BreakdownData[]>('/pnl/breakdown/account', { params: filters });
    return response.data;
  },
};
