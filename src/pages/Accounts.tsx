import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import { adminService, AdminAccount } from '@/services/adminService';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/utils';

const Accounts: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [accounts, setAccounts] = useState<AdminAccount[]>([]);

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const response = await adminService.getAccounts();
        setAccounts(response.data);
      } catch (error) {
        console.error('Failed to fetch accounts', error);
      }
    };
    fetchAccounts();
  }, []);

  return (
    <div className="min-h-screen bg-muted/30">
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
      
      <main className={cn('transition-all duration-300 min-h-screen', sidebarCollapsed ? 'ml-16' : 'ml-64')}>
        <header className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b">
          <div className="px-6 py-4">
            <h1 className="text-2xl font-bold font-display">Accounts</h1>
          </div>
        </header>

        <div className="p-6">
          <div className="rounded-xl border bg-card overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead className="text-center">Projects</TableHead>
                  <TableHead className="text-right">Revenue</TableHead>
                  <TableHead className="text-right">Avg Margin</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {accounts.map((account) => (
                  <TableRow key={account.id}>
                    <TableCell className="font-medium">{account.name}</TableCell>
                    <TableCell className="text-center">{account.projectCount}</TableCell>
                    <TableCell className="text-right font-mono">{formatCurrency(account.totalRevenue)}</TableCell>
                    <TableCell className="text-right font-mono">{account.avgMargin.toFixed(1)}%</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
             {accounts.length === 0 && (
                <div className="p-8 text-center text-muted-foreground">No accounts found</div>
             )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Accounts;
