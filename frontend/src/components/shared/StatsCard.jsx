import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

export function StatsCard({ title, value, trend, icon: Icon, color = 'blue', delay = 0 }) {
  const isPositive = trend >= 0;
  
  const colorMap = {
    blue: 'text-blue-500 bg-blue-500/10',
    orange: 'text-amazon-orange bg-amazon-orange/10',
    green: 'text-emerald-500 bg-emerald-500/10',
    red: 'text-rose-500 bg-rose-500/10',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="glass-card rounded-xl p-6 border border-slate-800 flex flex-col justify-between h-32 hover:border-slate-700 transition-colors"
    >
      <div className="flex items-center justify-between">
        <span className="text-slate-400 text-sm font-medium">{title}</span>
        <div className={cn("p-2 rounded-lg", colorMap[color])}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <div className="mt-4 flex items-end justify-between">
        <h3 className="text-2xl font-bold text-slate-100">{value}</h3>
        {trend !== undefined && (
          <div className={cn("flex items-center text-sm font-medium", isPositive ? "text-emerald-500" : "text-rose-500")}>
            {isPositive ? <ArrowUpRight className="w-4 h-4 mr-1" /> : <ArrowDownRight className="w-4 h-4 mr-1" />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
    </motion.div>
  );
}
