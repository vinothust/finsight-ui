export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  [key: string]: any;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface RefreshTokenResponse {
  accessToken: string;
}

export interface UserPreferences {
  theme: string;
  notifications: boolean;
  [key: string]: any;
}

export interface FilterOption {
  id: string | number;
  name: string;
  value: string | number;
  clusterId?: string | number;
  accountId?: string | number;
}

export interface PnLData {
  data: any[];
  total: number;
  page: number;
  pageSize: number;
}

export interface KPISummary {
  revenue: number;
  cost: number;
  grossProfit: number;
  margin: number;
  headcount: number;
  utilization: number;
  revenuePerHead: number;
  costPerHead: number;
}

export interface TrendData {
  month: string;
  revenue?: number;
  cost?: number;
  profit?: number;
  utilization?: number;
  headcount?: number;
}

export interface BreakdownData {
  name: string;
  value?: number;
  margin?: number;
}

export interface Cluster {
  id: string | number;
  name: string;
  accountCount?: number;
  [key: string]: any;
}

export interface Account {
  id: string | number;
  name: string;
  clusterId: string | number;
  [key: string]: any;
}

export interface Project {
  id: string | number;
  name: string;
  accountId: string | number;
  [key: string]: any;
}

export interface HierarchicalResource {
  employeeId: string;
  employeeName: string;
  role: string;
  revenue: number;
  cost: number;
  grossProfit: number;
  margin: number;
  hours?: number;
}

export interface HierarchicalProject {
  projectId: string;
  projectName: string;
  revenue: number;
  cost: number;
  grossProfit: number;
  margin: number;
  headcount: number;
  utilization: number;
  resources?: HierarchicalResource[];
}

export interface HierarchicalAccount {
  accountId: string;
  accountName: string;
  revenue: number;
  cost: number;
  grossProfit: number;
  margin: number;
  projectCount?: number;
  projects?: HierarchicalProject[];
}

export interface HierarchicalCluster {
  clusterId: string;
  clusterName: string;
  revenue: number;
  cost: number;
  grossProfit: number;
  margin: number;
  accountCount: number;
  accounts?: HierarchicalAccount[];
}
