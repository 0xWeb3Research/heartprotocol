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

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const accountData: AccountData = useAccount() || { address: null, publicKey: null };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar isOpen={sidebarOpen} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header toggleSidebar={toggleSidebar} title={"Dashboard"} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-[#FAF5FF] p-6">
          {children}
          <CreateProfileForm />
          <p className="text-sm">Connected Address: {accountData?.address}</p>
          <p className="text-sm">Public Key: {accountData?.publicKey}</p>
        </main>
      </div>
    </div>
  );
};

export default Layout;