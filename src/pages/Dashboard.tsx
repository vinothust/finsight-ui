import React, { useState, useEffect } from 'react';
import { LayoutGrid, BarChart3, Download, Upload, MessageSquare, Sparkles } from 'lucide-react';
import { FilterState, MONTHS } from '@/types';
import { FilterOption } from '@/types/api';
import { filterService } from '@/services/filterService';
import { mockPnLData, getYearRange } from '@/data/mockData';
import { useAuth } from '@/contexts/AuthContext';
import Sidebar from '@/components/Sidebar';
import FilterPanel from '@/components/FilterPanel';
import DataGrid from '@/components/DataGrid';
import DataCharts from '@/components/DataCharts';
import KPICards from '@/components/KPICards';
import AIChatBot from '@/components/AIChatBot';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ROLE_LABELS } from '@/types';
import { cn } from '@/lib/utils';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [view, setView] = useState<'grid' | 'chart'>('grid');
  const [chatOpen, setChatOpen] = useState(false);
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

  const handleExport = () => {
    // Mock export functionality
    const dataStr = JSON.stringify(mockPnLData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'pnl-data-export.json';
    a.click();
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />

      <main
        className={cn(
          'transition-all duration-300 min-h-screen',
          sidebarCollapsed ? 'ml-16' : 'ml-64'
        )}
      >
        {/* Header */}
        <header className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold font-display">Financial Dashboard</h1>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Welcome back, {user?.name || user?.email} · {user?.role ? ROLE_LABELS[user.role] : ''}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Tabs value={view} onValueChange={(v) => setView(v as 'grid' | 'chart')}>
                  <TabsList>
                    <TabsTrigger value="grid" className="gap-2">
                      <LayoutGrid size={16} />
                      Grid
                    </TabsTrigger>
                    <TabsTrigger value="chart" className="gap-2">
                      <BarChart3 size={16} />
                      Charts
                    </TabsTrigger>
                  </TabsList>
                </Tabs>

                <Button variant="outline" className="gap-2">
                  <Upload size={16} />
                  Import
                </Button>

                <Button variant="outline" className="gap-2" onClick={handleExport}>
                  <Download size={16} />
                  Export
                </Button>

                <Button
                  variant={chatOpen ? 'default' : 'gradient'}
                  className="gap-2"
                  onClick={() => setChatOpen(!chatOpen)}
                >
                  <Sparkles size={16} />
                  AI Assistant
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* KPI Cards */}
          <KPICards data={mockPnLData} filters={filters} />

          {/* Filters */}
          <FilterPanel 
            filters={filters} 
            onFilterChange={setFilters}
            availableClusters={availableClusters}
            availableAccounts={availableAccounts}
            availableProjects={availableProjects}
            availableYears={availableYears}
            availableMonths={availableMonths}
          />

          {/* Data View */}
          {view === 'grid' ? (
            <DataGrid data={mockPnLData} filters={filters} />
          ) : (
            <DataCharts data={mockPnLData} filters={filters} />
          )}
        </div>
      </main>

      {/* AI ChatBot */}
      <AIChatBot isOpen={chatOpen} onClose={() => setChatOpen(false)} />

      {/* Floating Chat Button (when closed) */}
      {!chatOpen && (
        <button
          onClick={() => setChatOpen(true)}
          className="fixed right-6 bottom-6 w-14 h-14 bg-gradient-primary text-primary-foreground rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group z-40"
        >
          <MessageSquare size={24} className="group-hover:scale-110 transition-transform" />
        </button>
      )}
    </div>
  );
};

export default Dashboard;
