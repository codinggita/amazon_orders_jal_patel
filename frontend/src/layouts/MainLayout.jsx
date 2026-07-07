import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const MainLayout = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex overflow-x-hidden">
      {/* Mobile overlay for sidebar */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-slate-950/80 md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Dynamic Collapsible Sidebar */}
      <Sidebar
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
      />

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col min-h-screen transition-all duration-300 pl-0
          ${isCollapsed ? 'md:pl-20' : 'md:pl-64'}`}
      >
        {/* Sticky Glass Navbar */}
        <Navbar
          isCollapsed={isCollapsed}
          setIsCollapsed={setIsCollapsed}
          isMobileOpen={isMobileOpen}
          setIsMobileOpen={setIsMobileOpen}
        />

        {/* Dynamic Page Routes Outlet Container */}
        <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto animate-fade-in overflow-y-auto">
          <Outlet />
        </main>
        
        {/* Mini layout footer */}
        <footer className="py-4 px-6 border-t border-slate-900/80 bg-slate-950/20 text-center text-[10px] text-slate-500">
          Amazon Orders Admin Portal &copy; {new Date().getFullYear()} — Engineered by Jal Patel
        </footer>
      </div>
    </div>
  );
};

export default MainLayout;
