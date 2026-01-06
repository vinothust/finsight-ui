import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import { adminService, AdminCluster } from '@/services/adminService';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn, formatCurrency } from '@/lib/utils';

const Clusters: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [clusters, setClusters] = useState<AdminCluster[]>([]);

  useEffect(() => {
    const fetchClusters = async () => {
      try {
        const response = await adminService.getClusters();
        setClusters(response.data);
      } catch (error) {
        console.error('Failed to fetch clusters', error);
      }
    };
    fetchClusters();
  }, []);

  return (
    <div className="min-h-screen bg-muted/30">
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
      
      <main className={cn('transition-all duration-300 min-h-screen', sidebarCollapsed ? 'ml-16' : 'ml-64')}>
        <header className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b">
          <div className="px-6 py-4">
            <h1 className="text-2xl font-bold font-display">Clusters</h1>
          </div>
        </header>

        <div className="p-6">
          <div className="rounded-xl border bg-card overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead className="text-center">Accounts</TableHead>
                  <TableHead className="text-right">Revenue</TableHead>
                  <TableHead className="text-right">Avg Margin</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clusters.map((cluster) => (
                  <TableRow key={cluster.id}>
                    <TableCell className="font-medium">{cluster.name}</TableCell>
                    <TableCell className="text-center">{cluster.accountCount}</TableCell>
                    <TableCell className="text-right font-mono">{formatCurrency(cluster.totalRevenue)}</TableCell>
                    <TableCell className="text-right font-mono">{cluster.avgMargin.toFixed(1)}%</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
             {clusters.length === 0 && (
                <div className="p-8 text-center text-muted-foreground">No clusters found</div>
             )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Clusters;
