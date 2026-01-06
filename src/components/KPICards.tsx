import React, { useMemo } from 'react';
import { TrendingUp, TrendingDown, DollarSign, Users, Target, Percent } from 'lucide-react';
import { PnLData, FilterState } from '@/types';
import { KPISummary } from '@/types/api';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface KPICardsProps {
  data: PnLData[];
  filters: FilterState;
  summary?: KPISummary;
}

const KPICards: React.FC<KPICardsProps> = ({ data, filters, summary }) => {
  const metrics = useMemo(() => {
    if (summary) {
      return {
        totalRevenue: summary.revenue,
        totalCost: summary.cost,
        totalProfit: summary.grossProfit,
        avgMargin: summary.margin,
        avgHeadcount: summary.headcount,
        avgUtilization: summary.utilization * 100, // API returns 0.57, UI expects 57 likely
        revenueChange: 0, // Not provided by API
        marginChange: 0,
        utilizationChange: 0,
        projectCount: 0, // Not in summary
        accountCount: 0  // Not in summary
      };
    }

    const filtered = data.filter((row) => {
      if (filters.clusters?.length && !filters.clusters.includes(row.cluster)) return false;
      if (filters.accounts?.length && !filters.accounts.includes(row.account)) return false;
      if (filters.projects?.length && !filters.projects.includes(row.project)) return false;
      if (filters.years?.length && !filters.years.includes(row.year)) return false;
      if (filters.months?.length && !filters.months.includes(row.month)) return false;
      
      const margin = row.margin ?? 0;
      const [min, max] = filters.marginRange || [-100, 100];
      if (margin < min || margin > max) return false;
      
      return true;
    });

    const totalRevenue = filtered.reduce((sum, row) => sum + row.revenue, 0);
    const totalCost = filtered.reduce((sum, row) => sum + row.cost, 0);
    const totalProfit = filtered.reduce((sum, row) => sum + row.grossProfit, 0);
    const avgMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;
    const avgHeadcount = filtered.length > 0 
      ? filtered.reduce((sum, row) => sum + row.headcount, 0) / filtered.length 
      : 0;
    const avgUtilization = filtered.length > 0
      ? filtered.reduce((sum, row) => sum + row.utilization, 0) / filtered.length
      : 0;

    // Calculate trends (comparing to previous period - simplified)
    const revenueChange = 8.2; // Mock positive change
    const marginChange = avgMargin >= (filters.marginRange?.[0] ?? 30) ? 2.5 : -1.8;
    const utilizationChange = 3.1;

    return {
      totalRevenue,
      totalCost,
      totalProfit,
      avgMargin,
      avgHeadcount,
      avgUtilization,
      revenueChange,
      marginChange,
      utilizationChange,
      projectCount: new Set(filtered.map(f => f.project)).size,
      accountCount: new Set(filtered.map(f => f.account)).size,
    };
  }, [data, filters, summary]);

  const formatCurrency = (value: number) => {
    if (value >= 1000000000) return `$${(value / 1000000000).toFixed(1)}B`;
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
    return `$${value.toFixed(0)}`;
  };

  const kpis = [
    {
      title: 'Total Revenue',
      value: formatCurrency(metrics.totalRevenue),
      change: metrics.revenueChange,
      icon: DollarSign,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      title: 'Gross Profit',
      value: formatCurrency(metrics.totalProfit),
      change: metrics.revenueChange * 0.8,
      icon: TrendingUp,
      color: 'text-success',
      bgColor: 'bg-success/10',
    },
    {
      title: 'Avg Margin',
      value: `${metrics.avgMargin.toFixed(1)}%`,
      change: metrics.marginChange,
      icon: Percent,
      color: metrics.avgMargin >= filters.marginThreshold ? 'text-success' : 'text-destructive',
      bgColor: metrics.avgMargin >= filters.marginThreshold ? 'bg-success/10' : 'bg-destructive/10',
    },
    {
      title: 'Avg Utilization',
      value: `${metrics.avgUtilization.toFixed(1)}%`,
      change: metrics.utilizationChange,
      icon: Target,
      color: 'text-warning',
      bgColor: 'bg-warning/10',
    },
    {
      title: 'Avg Headcount',
      value: Math.round(metrics.avgHeadcount).toString(),
      change: null,
      icon: Users,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    // {
    //   title: 'Active Accounts',
    //   value: metrics.accountCount.toString(),
    //   change: null,
    //   icon: DollarSign,
    //   color: 'text-chart-2',
    //   bgColor: 'bg-chart-2/10',
    // },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {kpis.map((kpi) => (
        <Card key={kpi.title} className="overflow-hidden">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className={cn('p-2 rounded-lg', kpi.bgColor)}>
                <kpi.icon size={18} className={kpi.color} />
              </div>
              {kpi.change !== null && (
                <div
                  className={cn(
                    'flex items-center gap-0.5 text-xs font-medium',
                    kpi.change >= 0 ? 'text-success' : 'text-destructive'
                  )}
                >
                  {/* {kpi.change >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />} */}
                  {/* {Math.abs(kpi.change).toFixed(1)}% */}
                </div>
              )}
            </div>
            <div className="mt-3">
              <p className="text-2xl font-bold font-display">{kpi.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{kpi.title}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default KPICards;
