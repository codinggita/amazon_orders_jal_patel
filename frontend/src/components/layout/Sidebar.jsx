import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  Package, 
  Truck, 
  BarChart3, 
  Users, 
  ShieldCheck, 
  Bell, 
  Activity, 
  ServerCrash, 
  Settings, 
  LogOut,
  ChevronLeft
} from 'lucide-react';
import { useStore } from '../../store/useStore';
import { cn } from '../../lib/utils';

const navGroups = [
  {
    title: 'Overview',
    items: [{ title: 'Dashboard', icon: LayoutDashboard, href: '/' }]
  },
  {
    title: 'Operations',
    items: [
      { title: 'Orders', icon: Package, href: '/orders' },
      { title: 'Shipping', icon: Truck, href: '/shipping' }
    ]
  },
  {
    title: 'Insights',
    items: [{ title: 'Analytics', icon: BarChart3, href: '/analytics' }]
  },
  {
    title: 'Management',
    items: [
      { title: 'Users', icon: Users, href: '/users' },
      { title: 'Admin', icon: ShieldCheck, href: '/admin' }
    ]
  },
  {
    title: 'System',
    items: [
      { title: 'Notifications', icon: Bell, href: '/notifications' },
      { title: 'Activity Logs', icon: Activity, href: '/logs' },
      { title: 'System Health', icon: ServerCrash, href: '/health' }
    ]
  }
];

export function Sidebar() {
  const { isSidebarOpen, toggleSidebar } = useStore();

  return (
    <motion.aside
      initial={{ width: 260 }}
      animate={{ width: isSidebarOpen ? 260 : 80 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="h-screen bg-slate-950 border-r border-slate-800 flex flex-col z-20 relative"
    >
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800">
        <div className="flex items-center gap-2 overflow-hidden">
          <div className="w-8 h-8 rounded bg-amazon-orange flex items-center justify-center shrink-0">
            <span className="text-slate-950 font-bold text-xl">a</span>
          </div>
          {isSidebarOpen && (
            <motion.span 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              className="text-lg font-semibold text-slate-100 whitespace-nowrap"
            >
              Operations
            </motion.span>
          )}
        </div>
        <button 
          onClick={toggleSidebar}
          className="p-1 rounded-md text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors hidden md:block"
        >
          <ChevronLeft className={cn("w-5 h-5 transition-transform duration-300", !isSidebarOpen && "rotate-180")} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto py-4 custom-scrollbar">
        {navGroups.map((group, index) => (
          <div key={index} className="mb-6">
            {isSidebarOpen && (
              <h3 className="px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                {group.title}
              </h3>
            )}
            <ul className="space-y-1 px-2">
              {group.items.map((item) => (
                <li key={item.title}>
                  <NavLink
                    to={item.href}
                    className={({ isActive }) => cn(
                      "flex items-center gap-3 px-3 py-2 rounded-md transition-all group relative",
                      isActive 
                        ? "bg-slate-800 text-amazon-orange" 
                        : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/50"
                    )}
                  >
                    {({ isActive }) => (
                      <>
                        <item.icon className={cn("w-5 h-5 shrink-0 transition-colors", isActive ? "text-amazon-orange" : "group-hover:text-slate-100")} />
                        {isSidebarOpen && (
                          <span className="font-medium whitespace-nowrap">{item.title}</span>
                        )}
                        {/* Active Indicator Line */}
                        {isActive && isSidebarOpen && (
                          <motion.div 
                            layoutId="active-nav"
                            className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-amazon-orange rounded-r-md"
                          />
                        )}
                      </>
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="p-4 border-t border-slate-800">
        <ul className="space-y-1">
          <li>
            <NavLink to="/settings" className="flex items-center gap-3 px-3 py-2 rounded-md text-slate-400 hover:text-slate-100 hover:bg-slate-800/50 transition-colors">
              <Settings className="w-5 h-5 shrink-0" />
              {isSidebarOpen && <span className="font-medium">Settings</span>}
            </NavLink>
          </li>
          <li>
            <button className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors">
              <LogOut className="w-5 h-5 shrink-0" />
              {isSidebarOpen && <span className="font-medium">Logout</span>}
            </button>
          </li>
        </ul>
      </div>
    </motion.aside>
  );
}
