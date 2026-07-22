'use client';
import { motion } from 'framer-motion';

interface ToggleProps {
  enabled: boolean;
  onChange: (v: boolean) => void;
  label?: string;
  description?: string;
  size?: 'sm' | 'md';
  disabled?: boolean;
}

export default function Toggle({ enabled, onChange, label, description, size = 'md', disabled }: ToggleProps) {
  const w = size === 'sm' ? 'w-9' : 'w-12';
  const h = size === 'sm' ? 'h-5' : 'h-6';
  const dot = size === 'sm' ? 'w-3.5 h-3.5' : 'w-4.5 h-4.5';
  const tx = size === 'sm' ? 'translate-x-4' : 'translate-x-6';

  return (
    <div className={`flex items-center gap-3 ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
      <button
        type="button"
        onClick={() => !disabled && onChange(!enabled)}
        className={`relative inline-flex shrink-0 ${h} ${w} rounded-full border-2 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-violet-500/50 ${
          enabled
            ? 'bg-gradient-to-r from-violet-600 to-blue-600 border-violet-500/50'
            : 'bg-white/10 border-white/20'
        }`}
        aria-checked={enabled}
        role="switch"
        disabled={disabled}
      >
        <motion.span
          layout
          transition={{ type: 'spring', stiffness: 700, damping: 35 }}
          className={`${dot} inline-block rounded-full bg-white shadow-lg ${enabled ? tx : 'translate-x-0.5'} my-auto absolute top-0 bottom-0 flex items-center`}
          style={{ top: '50%', transform: `translateY(-50%) translateX(${enabled ? (size === 'sm' ? '16px' : '24px') : '2px'})` }}
        />
      </button>
      {(label || description) && (
        <div>
          {label && <p className="text-sm font-medium text-white/90">{label}</p>}
          {description && <p className="text-xs text-white/40">{description}</p>}
        </div>
      )}
    </div>
  );
}
