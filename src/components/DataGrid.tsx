import React, { useState, useMemo } from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown, TrendingUp, TrendingDown, Sparkles } from 'lucide-react';
import { PnLData, FilterState } from '@/types';
import { FilterOption } from '@/types/api';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface DataGridProps {
  data: any[];
  filters: FilterState;
  clusters: FilterOption[];
  accounts: FilterOption[];
  projects: FilterOption[];
  mode?: 'legacy' | 'cluster' | 'account' | 'project' | 'resource';
  enablePagination?: boolean;
  onAskNova?: (row: any) => void;
}

type SortKey = string;
type SortDirection = 'asc' | 'desc' | null;

const ITEMS_PER_PAGE = 10;

const DataGrid: React.FC<DataGridProps> = ({ data, filters, clusters, accounts, projects, mode = 'legacy', enablePagination = false, onAskNova }) => {
  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const filteredData = useMemo(() => {
    // Apply margin range filter to all modes
    const dataWithMarginFilter = data.filter(row => {
        const margin = row.margin ?? 0;
        const [min, max] = filters.marginRange || [-100, 100];
        return margin >= min && margin <= max;
    });

    if (mode !== 'legacy') return dataWithMarginFilter;
    
    return dataWithMarginFilter.filter((row) => {
      if (filters.clusters.length && !filters.clusters.includes(row.cluster)) return false;
      if (filters.accounts.length && !filters.accounts.includes(row.account)) return false;
      if (filters.projects?.length && !filters.projects.includes(row.project)) return false;
      if (filters.years.length && !filters.years.includes(row.year)) return false;
      if (filters.months.length && !filters.months.includes(row.month)) return false;
      return true;
    });
  }, [data, filters, mode]);

  // Reset to first page when data or filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [filters, mode, data.length]);

  const sortedData = useMemo(() => {
    if (!sortKey || !sortDirection) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];

      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
      }

      const aStr = String(aVal);
      const bStr = String(bVal);
      return sortDirection === 'asc' ? aStr.localeCompare(bStr) : bStr.localeCompare(aStr);
    });
  }, [filteredData, sortKey, sortDirection]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      if (sortDirection === 'asc') setSortDirection('desc');
      else if (sortDirection === 'desc') {
        setSortKey(null);
        setSortDirection(null);
      }
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };

  const SortIcon = ({ columnKey }: { columnKey: SortKey }) => {
    if (sortKey !== columnKey) return <ArrowUpDown size={14} className="opacity-30" />;
    if (sortDirection === 'asc') return <ArrowUp size={14} className="text-primary" />;
    return <ArrowDown size={14} className="text-primary" />;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const MarginBadge = ({ margin }: { margin: number }) => {
    const value = margin ?? 0;
    const isAboveThreshold = value >= 30; // Using 30% as standard threshold for coloring
    
    return (
      <Badge
        variant="secondary"
        className={cn(
          'font-mono',
          isAboveThreshold 
            ? 'bg-success/10 text-success border-success/20' 
            : 'bg-destructive/10 text-destructive border-destructive/20'
        )}
      >
        {isAboveThreshold ? <TrendingUp size={12} className="mr-1" /> : <TrendingDown size={12} className="mr-1" />}
        {value.toFixed(1)}%
      </Badge>
    );
  };

  const getClusterName = (id: string) => clusters.find(c => String(c.id) === String(id) || String(c.value) === String(id))?.name || id;
  const getAccountName = (id: string) => accounts.find(a => String(a.id) === String(id) || String(a.value) === String(id))?.name || id;
  const getProjectName = (id: string) => projects.find(p => String(p.id) === String(id) || String(p.value) === String(id))?.name || id;

  const columns = useMemo(() => {
    const metrics = [
      { key: 'revenue', label: 'Revenue', format: formatCurrency },
      { key: 'cost', label: 'Cost', format: formatCurrency },
      { key: 'grossProfit', label: 'Gross Profit', format: formatCurrency },
      { key: 'margin', label: 'Margin', component: (row: any) => <MarginBadge margin={row.margin} /> },
    ];

    const actionColumn = onAskNova ? [{
        key: 'actions',
        label: 'Actions',
        component: (row: any) => (
          <Button
            variant="ghost" 
            size="sm"
            className="h-8 w-8 p-0 text-primary/70 hover:text-primary hover:bg-primary/10"
            onClick={(e) => { e.stopPropagation(); onAskNova(row); }}
            title="Ask Nova about this record"
          >
            <Sparkles className="h-4 w-4" />
            <span className="sr-only">Ask Nova</span>
          </Button>
        )
      }] : [];

    if (mode === 'cluster') {
      return [
        { key: 'clusterName', label: 'Cluster' },
        ...metrics,
        { key: 'accountCount', label: 'Accounts' },
        ...actionColumn
      ];
    }
    if (mode === 'account') {
      return [
        { key: 'accountName', label: 'Account' },
        ...metrics,
        { key: 'projectCount', label: 'Projects' },
        ...actionColumn
      ];
    }
    if (mode === 'project') {
      return [
        { key: 'projectName', label: 'Project' },
        ...metrics,
        { key: 'headcount', label: 'Headcount' },
        { key: 'utilization', label: 'Utilization', format: (v: number) => `${(v || 0).toFixed(1)}%` },
        ...actionColumn
      ];
    }
    
    if (mode === 'resource') {
      return [
        { key: 'employeeName', label: 'Employee Name' },
        { key: 'employeeId', label: 'Employee ID' },
        { key: 'project', label: 'Project', format: getProjectName },
        ...metrics,
        { key: 'utilization', label: 'Utilization', format: (v: number) => `${(v || 0).toFixed(1)}%` },
        ...actionColumn
      ];
    }
    
    // Legacy
    return [
        { key: 'cluster', label: 'Cluster', format: getClusterName },
        { key: 'account', label: 'Account', format: getAccountName },
        { key: 'project', label: 'Project', format: getProjectName },
        { key: 'year', label: 'Year' },
        { key: 'month', label: 'Month' },
        ...metrics,
        { key: 'headcount', label: 'Headcount' },
        { key: 'utilization', label: 'Utilization', format: (v: number) => `${(v || 0).toFixed(1)}%` },
        ...actionColumn
    ];
  }, [mode, clusters, accounts, projects, onAskNova]);

  const totalPages = Math.ceil(sortedData.length / ITEMS_PER_PAGE);

  const paginatedData = useMemo(() => {
    if (!enablePagination) return sortedData;
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return sortedData.slice(start, start + ITEMS_PER_PAGE);
  }, [sortedData, currentPage, enablePagination]);

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(p => p + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(p => p - 1);
  };

  return (
    <div className="rounded-xl border bg-card flex flex-col overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              {columns.map(({ key, label }) => (
                <TableHead
                  key={key}
                  className="cursor-pointer select-none font-semibold hover:bg-muted/80 transition-colors"
                  onClick={() => handleSort(key as SortKey)}
                >
                  <div className="flex items-center gap-2">
                    {label}
                    <SortIcon columnKey={key as SortKey} />
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.map((row, index) => (
              <TableRow
                key={row.id || index}
                className={cn(
                  'hover:bg-muted/30 transition-colors',
                  index % 2 === 0 ? 'bg-background' : 'bg-muted/10'
                )}
              >
                {columns.map(({ key, format, component }) => (
                  <TableCell key={key}>
                    {component ? component(row) : (format ? format(row[key]) : row[key])}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {paginatedData.length === 0 && (
        <div className="p-12 text-center text-muted-foreground">
          No data matches your current filters
        </div>
      )}

      {enablePagination && totalPages > 1 && (
        <div className="py-2 px-4 border-t bg-muted/20">
            <Pagination className="justify-center">
                <PaginationContent>
                    <PaginationItem>
                        <PaginationPrevious 
                            href="#"
                            onClick={(e) => { e.preventDefault(); handlePrevPage(); }}
                            className={cn(currentPage <= 1 ? "pointer-events-none opacity-50" : "")}
                        />
                    </PaginationItem>
                    
                    <PaginationItem>
                        <span className="flex h-9 items-center justify-center px-4 text-sm font-medium">
                            Page {currentPage} of {totalPages}
                        </span>
                    </PaginationItem>

                    <PaginationItem>
                        <PaginationNext 
                            href="#" 
                            onClick={(e) => { e.preventDefault(); handleNextPage(); }}
                            className={cn(currentPage >= totalPages ? "pointer-events-none opacity-50" : "")}
                        />
                    </PaginationItem>
                </PaginationContent>
            </Pagination>
        </div>
      )}
    </div>
  );
};

export default DataGrid;
