import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

export function RevenueChart({ data }) {
  return (
    <div className="glass-card p-6 rounded-xl border border-slate-800 h-full flex flex-col">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-slate-100">Revenue Overview</h3>
        <p className="text-sm text-slate-400">Monthly revenue tracking for the current year</p>
      </div>
      <div className="flex-1 min-h-[300px] w-full">
        <ResponsiveContainer width="99%" height="100%" minHeight={300}>
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ff9900" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#ff9900" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#64748b', fontSize: 12 }} 
              dy={10}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#64748b', fontSize: 12 }} 
              width={65}
              domain={['auto', 'auto']}
              tickFormatter={(value) => {
                if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
                if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
                return `$${value}`;
              }}
            />
            <Tooltip 
              contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px', color: '#f8fafc', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.3)' }}
              itemStyle={{ color: '#ff9900' }}
              formatter={(value) => [`$${Number(value).toLocaleString()}`, 'Revenue']}
            />
            <Area 
              type="monotone" 
              dataKey="revenue" 
              stroke="#ff9900" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorRevenue)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
