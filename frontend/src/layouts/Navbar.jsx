import { useState, useEffect } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import axiosClient from '../api/axios';
import { 
  Search, 
  Bell, 
  User, 
  Settings, 
  LogOut, 
  Menu,
  ShieldCheck,
  PackageCheck,
  LayoutDashboard,
  ShoppingBag,
  Truck,
  BarChart3,
  Layers3
} from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(false);

  useEffect(() => {
    const fetchUnreadStatus = async () => {
      try {
        const res = await axiosClient.get('/notifications');
        const data = res?.data || res;
        // Check if there are any unread notifications
        const hasUnread = Array.isArray(data) && data.some(n => !(n.isRead || n.read));
        setHasUnreadNotifications(hasUnread);
      } catch (err) {
        setHasUnreadNotifications(false);
      }
    };
    fetchUnreadStatus();
  }, []);

  // Filter items matching user authority level
  const navigationItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, roles: ['customer', 'admin', 'vendor'] },
    { name: 'Orders', path: '/orders', icon: ShoppingBag, roles: ['customer', 'admin', 'vendor'] },
    { name: 'Shipping Logs', path: '/shipping', icon: Truck, roles: ['customer', 'admin', 'vendor'] },
    { name: 'Analytics API', path: '/admin/analytics', icon: BarChart3, roles: ['admin'] },
    { name: 'Bulk Updates', path: '/admin/bulk-operations', icon: Layers3, roles: ['admin'] },
  ];
  
  const filteredNavItems = navigationItems.filter(item => {
    return !item.roles || item.roles.includes(user?.role);
  });

  return (
    <header className="sticky top-0 right-0 w-full h-16 glass-effect border-b border-slate-800/80 z-20 px-6 flex items-center justify-between">
      {/* Left items & Navigation */}
      <div className="flex items-center gap-6">
        {/* Branding */}
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-amazon-orange to-amber-500 shadow-lg text-slate-950 font-bold">
            <PackageCheck className="h-5 w-5" />
          </div>
          <div className="hidden xl:block">
            <span className="font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-slate-100 to-slate-300 text-sm font-sans uppercase">
              Amazon Orders
            </span>
          </div>
        </div>

        {/* Dynamic Greeting */}
        <div className="hidden sm:block mr-4 border-r border-slate-800 pr-6">
          <h1 className="text-sm font-semibold text-slate-200 leading-none mb-1">
            Welcome, <span className="text-transparent bg-clip-text bg-gradient-to-r from-amazon-yellow to-amazon-orange font-bold">{user?.name || 'Agent'}</span>
          </h1>
          <span className="text-[10px] text-slate-400 font-medium">
            Management Panel
          </span>
        </div>

        {/* Top Navigation Links */}
        <nav className="flex items-center gap-1 overflow-x-auto scroller-hidden">
          {filteredNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => `
                  flex items-center gap-1.5 px-3 py-2 rounded-lg transition-all text-xs font-semibold whitespace-nowrap cursor-pointer
                  ${isActive 
                    ? 'bg-amazon-orange/15 text-amazon-orange border hover:bg-amazon-orange/25 border-amazon-orange/20 shadow-inner' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50 border border-transparent'}
                `}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Search Bar - Amazon style styling */}
      <div className="hidden md:flex items-center max-w-md w-full mx-6 relative">
        <input 
          type="text" 
          placeholder="Search orders, shipping IDs, or users..." 
          className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2 pl-4 pr-10 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amazon-orange/70 focus:ring-1 focus:ring-amazon-orange/50 transition-all shadow-inner"
        />
        <Search className="absolute right-3.5 h-4 w-4 text-slate-500" />
      </div>

      {/* Right control panel */}
      <div className="flex items-center gap-3">
        {/* Notifications Alert */}
        <button 
          onClick={() => navigate('/notifications')}
          className="p-2 rounded-xl bg-slate-900/65 border border-slate-850 hover:bg-slate-800/75 hover:border-slate-700 text-slate-400 hover:text-slate-200 transition-all relative cursor-pointer"
        >
          <Bell className="h-4.5 w-4.5" />
          {hasUnreadNotifications && (
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-amazon-orange animate-pulse"></span>
          )}
        </button>

        {/* Profile Dropdown Container */}
        <div className="relative">
          <button 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2 p-1.5 pr-3 rounded-xl bg-slate-900/65 border border-slate-850 hover:bg-slate-800/75 hover:border-slate-700 transition-all cursor-pointer"
          >
            <div className="h-7 w-7 rounded-lg bg-gradient-to-tr from-amazon-orange/20 to-amber-500/20 border border-amazon-orange/30 flex items-center justify-center text-xs font-bold text-amazon-yellow uppercase">
              {user?.name?.substring(0, 2) || 'US'}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-semibold text-slate-200 leading-tight">
                {user?.name || 'User Account'}
              </p>
            </div>
          </button>

          {/* Glass Dropdown Menu */}
          {isDropdownOpen && (
            <>
              {/* Back-layer overlay click dismiss trigger */}
              <div 
                className="fixed inset-0 z-40"
                onClick={() => setIsDropdownOpen(false)}
              ></div>
              
              <div className="absolute right-0 mt-2.5 w-56 glass-card rounded-2xl p-2 shadow-2xl border border-slate-800 animate-slide-up z-50">
                {/* User Stats Card */}
                <div className="px-3.5 py-3 border-b border-slate-800/80 mb-2">
                  <div className="flex items-center gap-2 mb-1">
                    <ShieldCheck className="h-4 w-4 text-amazon-orange" />
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-amazon-orange">
                      {user?.role || 'User'} Authorization
                    </span>
                  </div>
                  <p className="text-xs font-bold text-slate-100 truncate">{user?.name}</p>
                  <p className="text-[10px] text-slate-400 truncate">{user?.email}</p>
                </div>

                {/* Dropdown Options */}
                <button 
                  onClick={() => setIsDropdownOpen(false)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 transition-all text-xs text-left cursor-pointer"
                >
                  <User className="h-4 w-4" />
                  <span>Profile Overview</span>
                </button>
                <button 
                  onClick={() => setIsDropdownOpen(false)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 transition-all text-xs text-left cursor-pointer"
                >
                  <Settings className="h-4 w-4" />
                  <span>Settings & Sync</span>
                </button>
                <button 
                  onClick={() => {
                    setIsDropdownOpen(false);
                    logout();
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-400 hover:bg-red-950/20 transition-all text-xs text-left border-t border-slate-800/50 mt-1 cursor-pointer"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Log Out</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
