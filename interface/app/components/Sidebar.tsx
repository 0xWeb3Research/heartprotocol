import React from 'react';
import Link from 'next/link';
// @ts-ignore
import { LayoutGrid, Users, BarChart2, Settings, LogOut, Gem } from 'lucide-react';

const SidebarItem = ({ icon, label, href, active }: any) => (
  <Link 
    href={href} 
    className={`flex items-center px-6 py-3 text-gray-600 hover:bg-purple-50 hover:text-purple-600 ${
      active ? 'bg-purple-50 text-purple-600' : ''
    }`}
  >
    {icon}
    <span className="mx-3">{label}</span>
  </Link>
);

const Sidebar = ({ isOpen, activePage }: any) => {
  return (
    <div className={`${isOpen ? 'w-64' : 'w-0'} bg-white shadow-md transition-all duration-300 overflow-hidden`}>
<div className="relative">
  <img src="/black.png" alt="Heart Protocol Logo" className="w-42 h-42 mx-auto mb-4" />
  <span className="absolute top-4 left-4 bg-[#9333EA] text-white text-xs font-bold px-2 py-1 rounded">Early Access Alpha</span>
</div>
      <nav className="mt-8">
        <SidebarItem 
          icon={<LayoutGrid size={20} />} 
          label="Dashboard" 
          href="/app"
          active={activePage === '/app'} 
        />
        <SidebarItem 
          icon={<Gem size={20} />} 
          label="Match" 
          href="/app/match"
          active={activePage === '/app/match'} 
        />
        <SidebarItem 
          icon={<Users size={20} />} 
          label="Matchmaker" 
          href="/app/matchmaker"
          active={activePage === '/app/matchmaker'} 
        />
        <div className="mt-auto">
          <SidebarItem 
            icon={<Settings size={20} />} 
            label="Settings" 
            href="/app/settings"
            active={activePage === '/app/settings'} 
          />
          <SidebarItem 
            icon={<LogOut size={20} />} 
            label="Log Out" 
            href="/logout"
          />
        </div>
      </nav>
    </div>
  );
};

export default Sidebar;