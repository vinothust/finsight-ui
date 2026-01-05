import React, { useState } from 'react';
import Sidebar from '@/components/Sidebar';

const Accounts: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
      <div className="flex-1 overflow-auto transition-all duration-300 ease-in-out">
        <div className="p-8">
          <h1 className="text-2xl font-bold mb-4">Accounts</h1>
          <p>Accounts page content goes here.</p>
        </div>
      </div>
    </div>
  );
};

export default Accounts;
