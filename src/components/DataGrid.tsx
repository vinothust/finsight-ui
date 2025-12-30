import React, { useState, useMemo } from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown, TrendingUp, TrendingDown } from 'lucide-react';
import { PnLData, FilterState } from '@/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface DataGridProps {
  data: PnLData[];
  filters: FilterState;
}

type SortKey = keyof PnLData;
type SortDirection = 'asc' | 'desc' | null;

const DataGrid: React.FC<DataGridProps> = ({ data, filters }) => {
  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);

  const filteredData = useMemo(() => {
    return data.filter((row) => {
      if (filters.clusters.length && !filters.clusters.includes(row.cluster)) return false;
      if (filters.accounts.length && !filters.accounts.includes(row.account)) return false;
      if (filters.years.length && !filters.years.includes(row.year)) return false;
      if (filters.months.length && !filters.months.includes(row.month)) return false;
      return true;
    });
  }, [data, filters]);

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
    const isAboveThreshold = margin >= filters.marginThreshold;
    
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
        {margin.toFixed(1)}%
      </Badge>
    );
  };

  return (
    <div className="rounded-xl border bg-card overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              {[
                { key: 'cluster', label: 'Cluster' },
                { key: 'account', label: 'Account' },
                { key: 'project', label: 'Project' },
                { key: 'year', label: 'Year' },
                { key: 'month', label: 'Month' },
                { key: 'revenue', label: 'Revenue' },
                { key: 'cost', label: 'Cost' },
                { key: 'grossProfit', label: 'Gross Profit' },
                { key: 'margin', label: 'Margin' },
                { key: 'headcount', label: 'Headcount' },
                { key: 'utilization', label: 'Utilization' },
              ].map(({ key, label }) => (
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
            {sortedData.slice(0, 100).map((row, index) => (
              <TableRow
                key={row.id}
                className={cn(
                  'hover:bg-muted/30 transition-colors',
                  index % 2 === 0 ? 'bg-background' : 'bg-muted/10'
                )}
              >
                <TableCell className="font-medium">{row.cluster}</TableCell>
                <TableCell>{row.account}</TableCell>
                <TableCell>{row.project}</TableCell>
                <TableCell className="text-center">{row.year}</TableCell>
                <TableCell>{row.month}</TableCell>
                <TableCell className="font-mono text-right">{formatCurrency(row.revenue)}</TableCell>
                <TableCell className="font-mono text-right">{formatCurrency(row.cost)}</TableCell>
                <TableCell className="font-mono text-right">{formatCurrency(row.grossProfit)}</TableCell>
                <TableCell>
                  <MarginBadge margin={row.margin} />
                </TableCell>
                <TableCell className="text-center">{row.headcount}</TableCell>
                <TableCell className="text-center">{row.utilization.toFixed(1)}%</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {sortedData.length > 100 && (
        <div className="p-4 text-center text-sm text-muted-foreground border-t bg-muted/30">
          Showing 100 of {sortedData.length} records
        </div>
      )}

      {sortedData.length === 0 && (
        <div className="p-12 text-center text-muted-foreground">
          No data matches your current filters
        </div>
      )}
    </div>
  );
};

export default DataGrid;
