import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const MainLayout = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-mesh text-slate-100 flex overflow-x-hidden relative">
      {/* Premium floating blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-amazon-orange/5 blur-[120px] pointer-events-none animate-blob" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[35%] h-[35%] rounded-full bg-blue-500/5 blur-[100px] pointer-events-none animate-blob" style={{ animationDelay: '2s' }} />
      <div className="absolute top-[40%] left-[60%] w-[25%] h-[25%] rounded-full bg-emerald-500/5 blur-[90px] pointer-events-none animate-blob" style={{ animationDelay: '4s' }} />
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
