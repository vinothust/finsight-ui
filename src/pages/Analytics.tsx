import React, { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import FilterPanel from '@/components/FilterPanel';
import DataCharts from '@/components/DataCharts';
import KPICards from '@/components/KPICards';
import { FilterState } from '@/types';
import { mockPnLData } from '@/data/mockData';
import { cn } from '@/lib/utils';

const Analytics: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    clusters: [],
    accounts: [],
    analyzeBy: [],
    years: [],
    months: [],
    marginThreshold: 30,
  });

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
          <KPICards data={mockPnLData} filters={filters} />
          <FilterPanel filters={filters} onFilterChange={setFilters} />
          <DataCharts data={mockPnLData} filters={filters} />
        </div>
      </main>
    </div>
  );
};

export default Analytics;
