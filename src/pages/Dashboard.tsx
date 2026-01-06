import React, { useState, useEffect, useRef } from 'react';
import { LayoutGrid, BarChart3, MessageSquare } from 'lucide-react';
import { PnLData, FilterState, MONTHS } from '@/types';
import { FilterOption, KPISummary } from '@/types/api';
import { filterService } from '@/services/filterService';
import { pnlService } from '@/services/pnlService';
import { getYearRange } from '@/data/mockData';
import { useAuth } from '@/contexts/AuthContext';
import Sidebar from '@/components/Sidebar';
import FilterPanel from '@/components/FilterPanel';
import DataGrid from '@/components/DataGrid';
import DataCharts from '@/components/DataCharts';
import KPICards from '@/components/KPICards';
import AIChatBot, { AIChatBotRef } from '@/components/AIChatBot';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
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
    marginRange: [30, 100],
  });

  const [availableClusters, setAvailableClusters] = useState<FilterOption[]>([]);
  const [availableAccounts, setAvailableAccounts] = useState<FilterOption[]>([]);
  const [availableProjects, setAvailableProjects] = useState<FilterOption[]>([]);
  const [availableKPIs, setAvailableKPIs] = useState<string[]>([]);
  const [availableYears, setAvailableYears] = useState<number[]>(getYearRange());
  const [availableMonths, setAvailableMonths] = useState<string[]>(MONTHS);
  const [pnlData, setPnLData] = useState<PnLData[]>([]);
  const [gridData, setGridData] = useState<any[]>([]); // New state for hierarchy data
  const [kpiSummary, setKpiSummary] = useState<KPISummary | undefined>(undefined);
  const [hierarchyTab, setHierarchyTab] = useState<string>('cluster');
  
  // Ask Nova Dialog State
  const [askNovaDialogOpen, setAskNovaDialogOpen] = useState(false);
  const [selectedRowForNova, setSelectedRowForNova] = useState<any>(null);
  const [askNovaPrompt, setAskNovaPrompt] = useState('');
  const [isNovaFetching, setIsNovaFetching] = useState(false);
  
  const chatBotRef = useRef<AIChatBotRef>(null);

  const handleAskNova = (row: any) => {
    setSelectedRowForNova(row);
    setAskNovaPrompt('');
    setAskNovaDialogOpen(true);
  };

  const handleSubmitAskNova = async () => {
    if (!selectedRowForNova) return;

    setIsNovaFetching(true);
    try {
        // Construct temporary filters specific to this request
        const specificFilters: FilterState = {
            ...filters,
            clusters: [],
            accounts: [],
            projects: []
        };

        let contextData: any = selectedRowForNova; // Default to row data
        let endpointDescription = '';

        // Fetch detailed data based on hierarchy level
        if (hierarchyTab === 'cluster') {
             // Try to find the correct ID property. Usually it's 'id' or 'clusterId' 
             const clusterId = selectedRowForNova.id || selectedRowForNova.clusterId || selectedRowForNova.key;
             if (clusterId) {
                specificFilters.clusters = [String(clusterId)];
                contextData = await pnlService.getClusterHierarchy(specificFilters);
                endpointDescription = 'Cluster Hierarchy';
             }
        } else if (hierarchyTab === 'account') {
             const accountId = selectedRowForNova.id || selectedRowForNova.accountId || selectedRowForNova.key;
             if (accountId) {
                specificFilters.accounts = [String(accountId)];
                // Include cluster if available for context
                if (selectedRowForNova.clusterId) specificFilters.clusters = [String(selectedRowForNova.clusterId)];
                
                contextData = await pnlService.getAccountHierarchy(specificFilters);
                endpointDescription = 'Account Hierarchy';
             }
        } else if (hierarchyTab === 'project') {
             const projectId = selectedRowForNova.id || selectedRowForNova.projectId || selectedRowForNova.key;
             if (projectId) {
                specificFilters.projects = [String(projectId)];
                // Include account if available
                if (selectedRowForNova.accountId) specificFilters.accounts = [String(selectedRowForNova.accountId)];
                
                contextData = await pnlService.getProjectHierarchy(specificFilters);
                endpointDescription = 'Project Hierarchy';
             }
        }

        const fullPrompt = `User Question: ${askNovaPrompt}\n\nSystem Data Context (${endpointDescription}):\n\`\`\`json\n${JSON.stringify(contextData, null, 2)}\n\`\`\``;
        
        setAskNovaDialogOpen(false);
        setChatOpen(true);
        
        setTimeout(() => {
            chatBotRef.current?.sendMessage(fullPrompt);
        }, 500);

    } catch (error) {
        console.error("Failed to fetch context for Ask Nova", error);
        // Fallback to just sending the row
        const fallbackPrompt = `User Question: ${askNovaPrompt}\n\nContext:\n${JSON.stringify(selectedRowForNova)}`;
        setAskNovaDialogOpen(false);
        setChatOpen(true);
         setTimeout(() => {
            chatBotRef.current?.sendMessage(fallbackPrompt);
        }, 500);
    } finally {
        setIsNovaFetching(false);
    }
  };

  // Set default tab based on role
  useEffect(() => {
    if (user?.role === 'project_manager') setHierarchyTab('project');
    else if (user?.role === 'account_director') {
        // If they can't see cluster, default to account
        setHierarchyTab('account');
    } else {
        setHierarchyTab('cluster');
    }
  }, [user]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const kpiResponse = await pnlService.getKPISummary(filters);
        setKpiSummary(kpiResponse);

        if (view === 'grid') {
          let data = [];
          if (hierarchyTab === 'cluster') data = await pnlService.getClusterHierarchy(filters);
          else if (hierarchyTab === 'account') data = await pnlService.getAccountHierarchy(filters);
          else if (hierarchyTab === 'project') data = await pnlService.getProjectHierarchy(filters);
          else if (hierarchyTab === 'resource') {
            const pnlResponse = await pnlService.getPnLData(filters, 1, 1000); // Fetch reasonably large set for now
            data = pnlResponse.data;
          }
          setGridData(data);
        } else {
          // Fetch flat data for charts
          const response = await pnlService.getPnLData(filters);
          setPnLData(response.data as unknown as PnLData[]);
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
      }
    };
    fetchData();
  }, [filters, view, hierarchyTab]);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const clusters = await filterService.getClusters();
        setAvailableClusters(clusters);
        const kpis = await filterService.getKPIs();
        setAvailableKPIs(kpis);
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
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* KPI Cards */}
          <KPICards data={pnlData} filters={filters} summary={kpiSummary} />

          {/* Filters */}
      <FilterPanel
        filters={filters}
        onFilterChange={setFilters}
        availableClusters={availableClusters}
        availableAccounts={availableAccounts}
        availableProjects={availableProjects}
        availableKPIs={availableKPIs}
        availableYears={availableYears}
        availableMonths={availableMonths}
      />          {/* Data View */}
          {view === 'grid' ? (
             <Tabs value={hierarchyTab} onValueChange={setHierarchyTab} className="w-full">
              <TabsList className="mb-4">
                {(user?.role === 'admin' || user?.role === 'cluster_head') && (
                  <TabsTrigger value="cluster">Cluster</TabsTrigger>
                )}
                {(user?.role === 'admin' || user?.role === 'cluster_head' || user?.role === 'account_director') && (
                  <TabsTrigger value="account">Account</TabsTrigger>
                )}
                <TabsTrigger value="project">Project</TabsTrigger>
                <TabsTrigger value="resource">Resource</TabsTrigger>
              </TabsList>

              <DataGrid 
                data={gridData} 
                filters={filters}
                clusters={availableClusters}
                accounts={availableAccounts}
                projects={availableProjects}
                mode={hierarchyTab as any}
                enablePagination={true}
                onAskNova={handleAskNova} // Pass the handler to DataGrid
              />
            </Tabs>
          ) : (
            <DataCharts 
              data={pnlData} 
              filters={filters} 
              clusters={availableClusters}
              accounts={availableAccounts}
            />
          )}
        </div>
      </main>

      {/* AI ChatBot */}
      <AIChatBot isOpen={chatOpen} onClose={() => setChatOpen(false)} ref={chatBotRef} />

      {/* Floating Chat Button (when closed) */}
      {!chatOpen && (
        <button
          onClick={() => setChatOpen(true)}
          className="fixed right-6 bottom-6 w-14 h-14 bg-gradient-primary text-primary-foreground rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group z-40"
        >
          <MessageSquare size={24} className="group-hover:scale-110 transition-transform" />
        </button>
      )}

      {/* Ask Nova Dialog */}
      <Dialog open={askNovaDialogOpen} onOpenChange={setAskNovaDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Ask Nova</DialogTitle>
            <DialogDescription>
              Enter your question for Nova and select the data context to analyze.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-2">
            <Label>Question for Nova</Label>
            <Textarea
              value={askNovaPrompt}
              onChange={(e) => setAskNovaPrompt(e.target.value)}
              placeholder="What is the revenue trend?"
              rows={2}
            />

            <Label>Data Context</Label>
            <div className="p-3 bg-muted rounded-md text-sm space-y-1">
                <div className="flex gap-2">
                    <span className="font-semibold w-16">Type:</span> 
                    <span>{hierarchyTab.charAt(0).toUpperCase() + hierarchyTab.slice(1)}</span>
                </div>
                <div className="flex gap-2">
                    <span className="font-semibold w-16">Item:</span>
                    <span className="truncate flex-1">
                        {selectedRowForNova?.clusterName || 
                         selectedRowForNova?.accountName || 
                         selectedRowForNova?.projectName || 
                         selectedRowForNova?.employeeName ||
                         selectedRowForNova?.name || 
                         'Selected Item'}
                    </span>
                </div>
            </div>
          </div>

          <DialogFooter className="flex justify-between">
            <Button variant="outline" onClick={() => setAskNovaDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmitAskNova} disabled={isNovaFetching}>
              {isNovaFetching ? 'Sending...' : 'Send to Nova'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dashboard;
