'use client';
import { ReactNode } from 'react';

interface InputProps {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  label?: string;
  description?: string;
  type?: string;
  icon?: ReactNode;
  className?: string;
  disabled?: boolean;
  multiline?: boolean;
  rows?: number;
  maxLength?: number;
}

export default function Input({
  value, onChange, placeholder, label, description, type = 'text',
  icon, className = '', disabled, multiline, rows = 3, maxLength,
}: InputProps) {
  const base =
    'w-full bg-white/[0.06] border border-white/10 text-white rounded-xl px-4 py-3 text-sm placeholder-white/30 focus:outline-none focus:border-violet-500/70 focus:bg-violet-500/[0.08] transition-all disabled:opacity-50 disabled:cursor-not-allowed resize-none';

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">{label}</label>}
      {description && <p className="text-xs text-white/30 -mt-1">{description}</p>}
      <div className="relative">
        {icon && <span className="absolute left-3 top-3 text-white/30">{icon}</span>}
        {multiline ? (
          <textarea
            value={value}
            onChange={e => onChange(e.target.value)}
            placeholder={placeholder}
            rows={rows}
            maxLength={maxLength}
            disabled={disabled}
            className={`${base} ${icon ? 'pl-10' : ''}`}
          />
        ) : (
          <input
            type={type}
            value={value}
            onChange={e => onChange(e.target.value)}
            placeholder={placeholder}
            maxLength={maxLength}
            disabled={disabled}
            className={`${base} ${icon ? 'pl-10' : ''}`}
          />
        )}
        {maxLength && (
          <span className="absolute bottom-2 right-3 text-xs text-white/20">
            {value.length}/{maxLength}
          </span>
        )}
      </div>
    </div>
  );
}
