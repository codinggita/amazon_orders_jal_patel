import React from 'react';
import { Search, Bell, User, Menu } from 'lucide-react';
import { Input } from '../ui/Input';
import { useStore } from '../../store/useStore';

export function TopNavbar() {
  const { toggleSidebar } = useStore();

  return (
    <header className="h-16 bg-slate-950/80 backdrop-blur-md border-b border-slate-800 flex items-center justify-between px-4 sticky top-0 z-10">
      <div className="flex items-center gap-4 flex-1">
        <button 
          onClick={toggleSidebar}
          className="p-2 rounded-md text-slate-400 hover:text-slate-100 hover:bg-slate-800 md:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="max-w-md w-full hidden md:block">
          <Input 
            icon={Search} 
            placeholder="Search orders, tracking numbers, or customers..." 
            className="bg-slate-900 border-slate-700"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button className="relative p-2 text-slate-400 hover:text-slate-100 transition-colors rounded-full hover:bg-slate-800">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-amazon-orange rounded-full border border-slate-950"></span>
        </button>
        
        <div className="h-8 w-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center cursor-pointer overflow-hidden">
          <User className="w-4 h-4 text-slate-400" />
        </div>
      </div>
    </header>
  );
}
