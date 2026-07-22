'use client';
import { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface StatsCardProps {
  label: string;
  value: string | number;
  icon: ReactNode;
  iconBg?: string;
  sub?: string;
  subColor?: string;
  index?: number;
}

export default function StatsCard({ label, value, icon, iconBg = 'from-violet-600/20 to-blue-600/20', sub, subColor = 'text-white/30', index = 0 }: StatsCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="grad-border"
    >
      <div className="glass rounded-[20px] p-5 flex items-center gap-4">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center bg-gradient-to-br ${iconBg} border border-white/10 shrink-0`}>
          {icon}
        </div>
        <div className="min-w-0 overflow-hidden">
          <p className="text-white/40 text-xs font-semibold uppercase tracking-wider mb-0.5 truncate">{label}</p>
          <p className="text-2xl font-extrabold text-white leading-none truncate">{typeof value === 'number' ? value.toLocaleString() : value}</p>
          {sub && <p className={`text-xs mt-1 truncate ${subColor}`}>{sub}</p>}
        </div>
      </div>
    </motion.div>
  );
}
