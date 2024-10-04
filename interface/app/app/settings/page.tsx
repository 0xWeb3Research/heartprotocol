'use client';

import FeesCollected from '@/app/components/FeesCollected';
import Header from '@/app/components/Header';
import Sidebar from '@/app/components/Sidebar';
import React, { useState } from 'react';

const Layout = ({ children, title }: any) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar isOpen={sidebarOpen} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header toggleSidebar={toggleSidebar} title={"Settings"} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-200 p-6">
          {children}
          <FeesCollected />
        </main>
      </div>
    </div>
  );
};

export default Layout;