import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';

export const Layout: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans text-slate-900 antialiased selection:bg-indigo-500 selection:text-white">
      {/* Sleek Vertical Collapsible Sidebar */}
      <Sidebar />

      {/* Main Content Area with left offset for compact 72px sidebar */}
      <main className="flex-1 w-full md:pl-[72px] transition-all duration-300 min-h-screen flex flex-col">
        <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
