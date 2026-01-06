import React, { useMemo } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from 'recharts';
import { PnLData, FilterState, MONTHS } from '@/types';
import { FilterOption } from '@/types/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface DataChartsProps {
  data: PnLData[];
  filters: FilterState;
  clusters?: FilterOption[];
  accounts?: FilterOption[];
}

const CHART_COLORS = [
  'hsl(193, 100%, 16%)',
  'hsl(193, 70%, 35%)',
  'hsl(193, 50%, 50%)',
  'hsl(38, 92%, 50%)',
  'hsl(0, 84%, 60%)',
  'hsl(142, 76%, 36%)',
];

const DataCharts: React.FC<DataChartsProps> = ({ data, filters, clusters = [], accounts = [] }) => {
  const getClusterName = (id: string) => clusters.find(c => String(c.id) === String(id) || String(c.value) === String(id))?.name || id;
  const getAccountName = (id: string) => accounts.find(a => String(a.id) === String(id) || String(a.value) === String(id))?.name || id;

  const filteredData = useMemo(() => {
    return data.filter((row) => {
      if (filters.clusters.length && !filters.clusters.includes(row.cluster)) return false;
      if (filters.accounts.length && !filters.accounts.includes(row.account)) return false;
      if (filters.projects.length && !filters.projects.includes(row.project)) return false;
      if (filters.years.length && !filters.years.includes(row.year)) return false;
      if (filters.months.length && !filters.months.includes(row.month)) return false;
      return true;
    });
  }, [data, filters]);

  // Revenue by Month (trend)
  const revenueByMonth = useMemo(() => {
    const grouped: Record<string, { month: string; revenue: number; cost: number; profit: number }> = {};
    
    filteredData.forEach((row) => {
      const key = `${row.year}-${MONTHS.indexOf(row.month).toString().padStart(2, '0')}`;
      if (!grouped[key]) {
        grouped[key] = { month: `${row.month.slice(0, 3)} ${row.year}`, revenue: 0, cost: 0, profit: 0 };
      }
      grouped[key].revenue += row.revenue;
      grouped[key].cost += row.cost;
      grouped[key].profit += row.grossProfit;
    });

    return Object.entries(grouped)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([_, value]) => value)
      .slice(-12);
  }, [filteredData]);

  // Revenue by Cluster
  const revenueByCluster = useMemo(() => {
    const grouped: Record<string, number> = {};
    
    filteredData.forEach((row) => {
      const name = getClusterName(row.cluster);
      grouped[name] = (grouped[name] || 0) + row.revenue;
    });

    return Object.entries(grouped)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [filteredData, clusters]);

  // Margin by Account
  const marginByAccount = useMemo(() => {
    const grouped: Record<string, { revenue: number; profit: number }> = {};
    
    filteredData.forEach((row) => {
      const name = getAccountName(row.account);
      if (!grouped[name]) {
        grouped[name] = { revenue: 0, profit: 0 };
      }
      grouped[name].revenue += row.revenue;
      grouped[name].profit += row.grossProfit;
    });

    return Object.entries(grouped)
      .map(([name, { revenue, profit }]) => ({
        name,
        margin: revenue > 0 ? (profit / revenue) * 100 : 0,
      }))
      .sort((a, b) => b.margin - a.margin)
      .slice(0, 10);
  }, [filteredData, accounts]);

  // Utilization trend
  const utilizationTrend = useMemo(() => {
    const grouped: Record<string, { month: string; utilization: number; count: number }> = {};
    
    filteredData.forEach((row) => {
      const key = `${row.year}-${MONTHS.indexOf(row.month).toString().padStart(2, '0')}`;
      if (!grouped[key]) {
        grouped[key] = { month: `${row.month.slice(0, 3)} ${row.year}`, utilization: 0, count: 0 };
      }
      grouped[key].utilization += row.utilization;
      grouped[key].count += 1;
    });

    return Object.entries(grouped)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([_, value]) => ({
        month: value.month,
        utilization: value.utilization / value.count,
      }))
      .slice(-12);
  }, [filteredData]);

  const formatCurrency = (value: number) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
    return `$${value}`;
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload) return null;
    
    return (
      <div className="bg-popover border rounded-lg shadow-lg p-3">
        <p className="font-medium text-sm mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: {typeof entry.value === 'number' && entry.name.toLowerCase().includes('margin')
              ? `${entry.value.toFixed(1)}%`
              : typeof entry.value === 'number' && entry.name.toLowerCase().includes('utilization')
              ? `${entry.value.toFixed(1)}%`
              : formatCurrency(entry.value)}
          </p>
        ))}
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Revenue Trend */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-display">Revenue & Profit Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueByMonth}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={CHART_COLORS[0]} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={CHART_COLORS[0]} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={CHART_COLORS[5]} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={CHART_COLORS[5]} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tickFormatter={formatCurrency} tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  name="Revenue"
                  stroke={CHART_COLORS[0]}
                  fill="url(#colorRevenue)"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="profit"
                  name="Profit"
                  stroke={CHART_COLORS[5]}
                  fill="url(#colorProfit)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Revenue by Cluster */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-display">Revenue by Cluster</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={revenueByCluster}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {revenueByCluster.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Margin by Account */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-display">Margin by Account (Top 10)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={marginByAccount} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={120}
                  tick={{ fontSize: 11 }}
                  stroke="hsl(var(--muted-foreground))"
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar
                  dataKey="margin"
                  name="Margin %"
                  fill={CHART_COLORS[0]}
                  radius={[0, 4, 4, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Utilization Trend */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-display">Utilization Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={utilizationTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="utilization"
                  name="Utilization %"
                  stroke={CHART_COLORS[3]}
                  strokeWidth={2}
                  dot={{ fill: CHART_COLORS[3], strokeWidth: 0, r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DataCharts;
