'use client';

import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

const Layout = ({ children, title }: any) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar isOpen={sidebarOpen} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header toggleSidebar={toggleSidebar} title={"Dashboard"} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-[#FAF5FF] p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;