import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import { adminService } from '@/services/adminService';
import { filterService } from '@/services/filterService';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface ProjectRow {
  id: string; // Project Code
  name: string; // Project Name
  accountName: string;
  clusterId: string;
}

const Projects: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [projects, setProjects] = useState<ProjectRow[]>([]);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await adminService.getAccounts();
        
        // Get project names using the filter service
        // We pass all account IDs to get relevant projects
        const accountIds = response.data.map(a => a.id).join(',');
        const projectOptions = await filterService.getProjects(accountIds);
        const projectMap = new Map(projectOptions.map(p => [String(p.value), p.name]));

        const allProjects: ProjectRow[] = [];
        
        response.data.forEach(account => {
            if (account.projects && Array.isArray(account.projects)) {
                account.projects.forEach(projCode => {
                    allProjects.push({
                        id: projCode,
                        name: projectMap.get(projCode) || projCode, // Fallback to code if name not found
                        accountName: account.name,
                        clusterId: account.clusterId
                    });
                });
            }
        });
        
        setProjects(allProjects);
      } catch (error) {
        console.error('Failed to fetch projects via accounts', error);
      }
    };
    fetchProjects();
  }, []);

  return (
    <div className="min-h-screen bg-muted/30">
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
      
      <main className={cn('transition-all duration-300 min-h-screen', sidebarCollapsed ? 'ml-16' : 'ml-64')}>
        <header className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b">
          <div className="px-6 py-4">
            <h1 className="text-2xl font-bold font-display">Projects</h1>
          </div>
        </header>

        <div className="p-6">
          <div className="rounded-xl border bg-card overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Project Name</TableHead>
                  <TableHead>Project Code</TableHead>
                  <TableHead>Account</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {projects.map((proj, idx) => (
                  <TableRow key={`${proj.id}-${idx}`}>
                    <TableCell className="font-medium">{proj.name}</TableCell>
                    <TableCell className="font-mono text-muted-foreground">{proj.id}</TableCell>
                    <TableCell>
                        <Badge variant="outline" className="font-normal">
                            {proj.accountName}
                        </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
             {projects.length === 0 && (
                <div className="p-8 text-center text-muted-foreground">No projects found</div>
             )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Projects;
