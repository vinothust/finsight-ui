import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import FilterPanel from '@/components/FilterPanel';
import DataCharts from '@/components/DataCharts';
import KPICards from '@/components/KPICards';
import { PnLData, FilterState, MONTHS } from '@/types';
import { FilterOption, KPISummary } from '@/types/api';
import { filterService } from '@/services/filterService';
import { pnlService } from '@/services/pnlService';
import { mockPnLData, getYearRange } from '@/data/mockData';
import { cn } from '@/lib/utils';

const Analytics: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    clusters: [],
    accounts: [],
    projects: [],
    analyzeBy: [],
    years: [],
    months: [],
    marginThreshold: 30,
  });

  const [availableClusters, setAvailableClusters] = useState<FilterOption[]>([]);
  const [availableAccounts, setAvailableAccounts] = useState<FilterOption[]>([]);
  const [availableProjects, setAvailableProjects] = useState<FilterOption[]>([]);
  const [availableYears, setAvailableYears] = useState<number[]>(getYearRange());
  const [availableMonths, setAvailableMonths] = useState<string[]>(MONTHS);
  const [pnlData, setPnlData] = useState<PnLData[]>([]);
  const [kpiSummary, setKpiSummary] = useState<KPISummary | undefined>(undefined);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const clusters = await filterService.getClusters();
        setAvailableClusters(clusters);
      } catch (error) {
        console.error("Failed to fetch initial filter data", error);
      }
    };
    fetchInitialData();
  }, []);

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const clusterIds = filters.clusters.join(',');
        const accounts = await filterService.getAccounts(clusterIds);
        setAvailableAccounts(accounts);

        // Cleanup selected accounts that are no longer available
        setFilters(prev => {
          const newAccountIds = accounts.map(a => String(a.value));
          const validAccounts = prev.accounts.filter(id => newAccountIds.includes(id));
          if (validAccounts.length !== prev.accounts.length) {
            return { ...prev, accounts: validAccounts };
          }
          return prev;
        });
      } catch (error) {
        console.error("Failed to fetch accounts", error);
      }
    };
    fetchAccounts();
  }, [filters.clusters]);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        let accountIds = filters.accounts.join(',');

        // If no accounts selected, but clusters are selected, restrict to available accounts
        if (!accountIds && filters.clusters.length > 0) {
          accountIds = availableAccounts.map(a => String(a.value)).join(',');
          if (!accountIds) {
            setAvailableProjects([]);
            return;
          }
        }

        const projects = await filterService.getProjects(accountIds);
        setAvailableProjects(projects);

        // Cleanup selected projects
        setFilters(prev => {
          const newProjectIds = projects.map(p => String(p.value));
          const validProjects = prev.projects.filter(id => newProjectIds.includes(id));
          if (validProjects.length !== prev.projects.length) {
            return { ...prev, projects: validProjects };
          }
          return prev;
        });
      } catch (error) {
        console.error("Failed to fetch projects", error);
      }
    };
    fetchProjects();
  }, [filters.accounts, availableAccounts, filters.clusters]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [pnlResponse, kpiResponse] = await Promise.all([
          pnlService.getPnLData(filters),
          pnlService.getKPISummary(filters)
        ]);
        
        setPnlData(pnlResponse.data as unknown as PnLData[]);
        setKpiSummary(kpiResponse);
      } catch (error) {
        console.error("Failed to fetch analytics data", error);
      }
    };
    fetchData();
  }, [filters]);

  return (
    <div className="min-h-screen bg-muted/30">
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />

      <main
        className={cn(
          'transition-all duration-300 min-h-screen',
          sidebarCollapsed ? 'ml-16' : 'ml-64'
        )}
      >
        <header className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b">
          <div className="px-6 py-4">
            <h1 className="text-2xl font-bold font-display">Analytics</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Deep dive into your financial metrics and trends
            </p>
          </div>
        </header>

        <div className="p-6 space-y-6">
          <KPICards data={pnlData} filters={filters} summary={kpiSummary} />
          <FilterPanel 
            filters={filters} 
            onFilterChange={setFilters}
            availableClusters={availableClusters}
            availableAccounts={availableAccounts}
            availableProjects={availableProjects}
            availableYears={availableYears}
            availableMonths={availableMonths}
          />
          <DataCharts data={pnlData} filters={filters} />
        </div>
      </main>
    </div>
  );
};

export default Analytics;
