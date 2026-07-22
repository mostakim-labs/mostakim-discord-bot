'use client';

const PRESETS = [
  '#7c3aed', '#3b82f6', '#10b981', '#f59e0b',
  '#ef4444', '#ec4899', '#8b5cf6', '#06b6d4',
  '#f97316', '#84cc16', '#ffffff', '#6b7280',
];

interface ColorPickerProps {
  value: string;
  onChange: (v: string) => void;
  label?: string;
}

export default function ColorPicker({ value, onChange, label }: ColorPickerProps) {
  return (
    <div className="flex flex-col gap-2">
      {label && <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">{label}</label>}
      <div className="flex items-center gap-3">
        <div className="relative w-10 h-10 rounded-xl overflow-hidden border-2 border-white/20 cursor-pointer shrink-0">
          <input
            type="color"
            value={value}
            onChange={e => onChange(e.target.value)}
            className="absolute inset-0 w-full h-full cursor-pointer opacity-0"
          />
          <div className="w-full h-full rounded-xl" style={{ backgroundColor: value }} />
        </div>
        <input
          type="text"
          value={value}
          onChange={e => onChange(e.target.value)}
          className="w-28 bg-white/[0.06] border border-white/10 text-white rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-violet-500/70 uppercase font-mono"
          maxLength={7}
        />
      </div>
      <div className="flex flex-wrap gap-2 mt-1">
        {PRESETS.map(c => (
          <button
            key={c}
            onClick={() => onChange(c)}
            className={`w-6 h-6 rounded-lg border-2 transition-all ${value === c ? 'border-white scale-110' : 'border-transparent hover:border-white/40'}`}
            style={{ backgroundColor: c }}
            title={c}
          />
        ))}
      </div>
    </div>
  );
}
