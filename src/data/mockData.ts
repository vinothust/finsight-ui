import { User, Cluster, Account, Project, PnLData } from '@/types';

export const mockUsers: User[] = [
  {
    id: '1',
    name: 'John Smith',
    email: 'admin@finsight.com',
    role: 'admin',
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    email: 'sarah.j@finsight.com',
    role: 'cluster_head',
    clusters: ['CL001', 'CL002'],
  },
  {
    id: '3',
    name: 'Michael Chen',
    email: 'michael.c@finsight.com',
    role: 'account_director',
    accounts: ['ACC001', 'ACC002', 'ACC003'],
  },
  {
    id: '4',
    name: 'Emily Davis',
    email: 'emily.d@finsight.com',
    role: 'project_manager',
    projects: ['PRJ001', 'PRJ002'],
  },
];

export const mockClusters: Cluster[] = [
  { id: 'CL001', name: 'North America', accounts: ['ACC001', 'ACC002'] },
  { id: 'CL002', name: 'Europe', accounts: ['ACC003', 'ACC004'] },
  { id: 'CL003', name: 'Asia Pacific', accounts: ['ACC005', 'ACC006'] },
  { id: 'CL004', name: 'Latin America', accounts: ['ACC007'] },
];

export const mockAccounts: Account[] = [
  { id: 'ACC001', name: 'Tech Giants Inc', clusterId: 'CL001', directors: ['3'] },
  { id: 'ACC002', name: 'Financial Services Co', clusterId: 'CL001', directors: ['3'] },
  { id: 'ACC003', name: 'Healthcare Solutions', clusterId: 'CL002', directors: ['3'] },
  { id: 'ACC004', name: 'Retail Global', clusterId: 'CL002', directors: [] },
  { id: 'ACC005', name: 'Manufacturing Plus', clusterId: 'CL003', directors: [] },
  { id: 'ACC006', name: 'Energy Corp', clusterId: 'CL003', directors: [] },
  { id: 'ACC007', name: 'Telecom Leaders', clusterId: 'CL004', directors: [] },
];

export const mockProjects: Project[] = [
  { id: 'PRJ001', name: 'Digital Transformation', accountId: 'ACC001', managers: ['4'] },
  { id: 'PRJ002', name: 'Cloud Migration', accountId: 'ACC001', managers: ['4'] },
  { id: 'PRJ003', name: 'Data Analytics Platform', accountId: 'ACC002', managers: [] },
  { id: 'PRJ004', name: 'Mobile App Development', accountId: 'ACC003', managers: [] },
  { id: 'PRJ005', name: 'ERP Implementation', accountId: 'ACC004', managers: [] },
  { id: 'PRJ006', name: 'IoT Integration', accountId: 'ACC005', managers: [] },
];

const generatePnLData = (): PnLData[] => {
  const data: PnLData[] = [];
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                  'July', 'August', 'September', 'October', 'November', 'December'];
  const years = [2020, 2021, 2022, 2023, 2024, 2025];
  
  mockClusters.forEach(cluster => {
    mockAccounts
      .filter(acc => acc.clusterId === cluster.id)
      .forEach(account => {
        mockProjects
          .filter(proj => proj.accountId === account.id)
          .forEach(project => {
            years.forEach(year => {
              months.forEach((month, monthIndex) => {
                if (year === 2025 && monthIndex > 5) return;
                
                const baseRevenue = 100000 + Math.random() * 400000;
                const costRatio = 0.55 + Math.random() * 0.25;
                const revenue = Math.round(baseRevenue);
                const cost = Math.round(revenue * costRatio);
                const grossProfit = revenue - cost;
                const margin = (grossProfit / revenue) * 100;
                
                data.push({
                  id: `${cluster.id}-${account.id}-${project.id}-${year}-${month}`,
                  cluster: cluster.name,
                  account: account.name,
                  project: project.name,
                  year,
                  month,
                  revenue,
                  cost,
                  grossProfit,
                  margin: Math.round(margin * 100) / 100,
                  headcount: Math.floor(5 + Math.random() * 20),
                  utilization: Math.round((70 + Math.random() * 25) * 100) / 100,
                });
              });
            });
          });
      });
  });
  
  return data;
};

export const mockPnLData = generatePnLData();

export const getYearRange = (): number[] => {
  const currentYear = new Date().getFullYear();
  return Array.from({ length: 11 }, (_, i) => currentYear - 10 + i);
};
