import api from './api';
import { PnLData, KPISummary, TrendData, BreakdownData, HierarchicalCluster, HierarchicalAccount, HierarchicalProject } from '@/types/api';
import { FilterState } from '@/types';

export interface PnLQueryParams {
  clusterIds?: string;
  accountIds?: string;
  projectIds?: string;
  years?: string;
  months?: string;
  page?: number;
  pageSize?: number;
}

const mapFiltersToParams = (filters: FilterState, page?: number, pageSize?: number): PnLQueryParams => {
  const params: PnLQueryParams = {};
  
  if (page) params.page = page;
  if (pageSize) params.pageSize = pageSize;

  if (filters.clusters?.length > 0) params.clusterIds = filters.clusters.join(',');
  if (filters.accounts?.length > 0) params.accountIds = filters.accounts.join(',');
  if (filters.projects?.length > 0) params.projectIds = filters.projects.join(',');
  if (filters.years?.length > 0) params.years = filters.years.join(',');
  if (filters.months?.length > 0) params.months = filters.months.join(',');

  return params;
};

export const pnlService = {
  getPnLData: async (filters: FilterState, page?: number, pageSize?: number): Promise<PnLData> => {
    const params = mapFiltersToParams(filters, page, pageSize);
    const response = await api.get<PnLData>('/pnl', { params });
    return response.data;
  },

  getKPISummary: async (filters: FilterState): Promise<KPISummary> => {
    const params = mapFiltersToParams(filters);
    const response = await api.get<KPISummary>('/pnl/summary/kpis', { params });
    return response.data;
  },

  getRevenueTrend: async (filters: FilterState): Promise<TrendData[]> => {
    const params = mapFiltersToParams(filters);
    const response = await api.get<TrendData[]>('/pnl/trend/revenue', { params });
    return response.data;
  },

  getUtilizationTrend: async (filters: FilterState): Promise<TrendData[]> => {
    const params = mapFiltersToParams(filters);
    const response = await api.get<TrendData[]>('/pnl/trend/utilization', { params });
    return response.data;
  },

  getRevenueByCluster: async (filters: FilterState): Promise<BreakdownData[]> => {
    const params = mapFiltersToParams(filters);
    const response = await api.get<BreakdownData[]>('/pnl/breakdown/cluster', { params });
    return response.data;
  },

  getMarginByAccount: async (filters: FilterState): Promise<BreakdownData[]> => {
    const params = mapFiltersToParams(filters);
    const response = await api.get<BreakdownData[]>('/pnl/breakdown/account', { params });
    return response.data;
  },

  getClusterHierarchy: async (filters: FilterState): Promise<HierarchicalCluster[]> => {
    const params = mapFiltersToParams(filters);
    const response = await api.get<{ data: HierarchicalCluster[] }>('/pnl/hierarchy/cluster', { params });
    return response.data.data;
  },

  getAccountHierarchy: async (filters: FilterState): Promise<HierarchicalAccount[]> => {
    const params = mapFiltersToParams(filters);
    const response = await api.get<{ data: HierarchicalAccount[] }>('/pnl/hierarchy/account', { params });
    return response.data.data;
  },

  getProjectHierarchy: async (filters: FilterState): Promise<HierarchicalProject[]> => {
    const params = mapFiltersToParams(filters);
    const response = await api.get<{ data: HierarchicalProject[] }>('/pnl/hierarchy/project', { params });
    return response.data.data;
  },
};

