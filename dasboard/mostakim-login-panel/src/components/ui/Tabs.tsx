'use client';
import { motion } from 'framer-motion';

interface Tab { id: string; label: string; icon?: React.ReactNode }

interface TabsProps {
  tabs: Tab[];
  active: string;
  onChange: (id: string) => void;
  className?: string;
}

export default function Tabs({ tabs, active, onChange, className = '' }: TabsProps) {
  return (
    <div className={`flex gap-1 p-1 bg-white/[0.04] border border-white/[0.08] rounded-xl ${className}`}>
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`relative flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            active === tab.id ? 'text-white' : 'text-white/40 hover:text-white/70'
          }`}
        >
          {active === tab.id && (
            <motion.div
              layoutId="tab-bg"
              className="absolute inset-0 bg-gradient-to-r from-violet-600/30 to-blue-600/30 border border-violet-500/20 rounded-lg"
              transition={{ type: 'spring', stiffness: 500, damping: 35 }}
            />
          )}
          <span className="relative flex items-center gap-1.5">
            {tab.icon}
            {tab.label}
          </span>
        </button>
      ))}
    </div>
  );
}
