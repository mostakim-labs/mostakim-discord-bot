'use client';
import { ChevronDown } from 'lucide-react';

interface Option { value: string; label: string }

interface SelectProps {
  value: string;
  onChange: (v: string) => void;
  options: Option[];
  placeholder?: string;
  label?: string;
  className?: string;
  disabled?: boolean;
}

export default function Select({ value, onChange, options, placeholder = 'Select…', label, className = '', disabled }: SelectProps) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">{label}</label>}
      <div className="relative">
        <select
          value={value}
          onChange={e => onChange(e.target.value)}
          disabled={disabled}
          className="w-full appearance-none bg-white/[0.06] border border-white/10 text-white rounded-xl px-4 py-3 pr-10 text-sm focus:outline-none focus:border-violet-500/70 focus:bg-violet-500/[0.08] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {placeholder && <option value="" disabled className="bg-[#070710]">{placeholder}</option>}
          {options.map(o => (
            <option key={o.value} value={o.value} className="bg-[#0d0d1a]">{o.label}</option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none" />
      </div>
    </div>
  );
}
