import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

const COLORS = ['#ff9900', '#3b82f6', '#10b981', '#8b5cf6'];

export function CategoryDonutChart({ data }) {
  return (
    <div className="glass-card p-6 rounded-xl border border-slate-800 h-full flex flex-col">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-slate-100">Sales by Category</h3>
        <p className="text-sm text-slate-400">Distribution of orders</p>
      </div>
      <div className="flex-1 min-h-[300px] w-full">
        <ResponsiveContainer width="99%" height="100%" minHeight={300}>
          <PieChart margin={{ top: 0, right: 0, left: 0, bottom: 20 }}>
            <Pie
              data={data}
              cx="50%"
              cy="45%"
              innerRadius={70}
              outerRadius={95}
              paddingAngle={5}
              dataKey="value"
              stroke="none"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px', color: '#f8fafc', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.3)' }}
              itemStyle={{ color: '#f8fafc' }}
              formatter={(value) => [Number(value).toLocaleString(), 'Sales']}
            />
            <Legend verticalAlign="bottom" height={36} iconType="circle" />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
