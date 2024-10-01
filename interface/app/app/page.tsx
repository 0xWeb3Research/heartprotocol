'use client';

import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import CreateProfileForm from '../components/CreateProfileForm';
import { useAccount } from './layout';

interface AccountData {
  address: string | null;
  publicKey: string | null;
}

const Layout = ({ children, title }: any) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const toggleExpand = () => setIsExpanded(!isExpanded);

  const accountData: AccountData = useAccount() || { address: null, publicKey: null };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar isOpen={sidebarOpen} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header toggleSidebar={toggleSidebar} title={"Dashboard"} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-[#FAF5FF] p-6">
          {children}
          <CreateProfileForm />
        </main>
        <div className="relative mt-4 p-6">
          <div className="flex items-center cursor-pointer" onClick={toggleExpand}>
            <span className="text-sm font-medium">Connected</span>
            <span className="ml-2 w-3 h-3 bg-green-500 rounded-full"></span>
          </div>
          {isExpanded && (
            <div className="mt-2 p-2 bg-gray-100 rounded-md shadow-md">
              <p className="text-sm">Connected Address: {accountData?.address}</p>
              <p className="text-sm">Public Key: {accountData?.publicKey}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Layout;