import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopNavbar } from './TopNavbar';
import { useStore } from '../../store/useStore';

export function DashboardLayout() {
  const { isSidebarOpen, isMobileSidebarOpen, closeMobileSidebar } = useStore();
  const desktopContentPadding = isSidebarOpen ? 'md:pl-64' : 'md:pl-20';

  return (
    <div className="flex h-screen overflow-hidden bg-slate-950 text-slate-100">
      {isMobileSidebarOpen && (
        <div className="fixed inset-0 bg-slate-950/70 z-20 md:hidden" onClick={closeMobileSidebar}></div>
      )}
      <Sidebar />
      <div className={`flex-1 flex flex-col min-w-0 ${desktopContentPadding}`}>
        <TopNavbar />
        <main className="flex-1 overflow-auto bg-slate-950 p-4 md:p-8 custom-scrollbar relative">
          {/* Subtle background glow effect */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-amazon-orange/5 blur-[120px] rounded-full pointer-events-none" />
          <Outlet />
        </main>
      </div>
    </div>
  );
}
