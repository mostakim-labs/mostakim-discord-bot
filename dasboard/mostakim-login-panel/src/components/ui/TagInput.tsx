'use client';
import { useState, KeyboardEvent } from 'react';
import { X, Plus } from 'lucide-react';

interface TagInputProps {
  values: string[];
  onChange: (v: string[]) => void;
  label?: string;
  placeholder?: string;
  description?: string;
}

export default function TagInput({ values, onChange, label, placeholder = 'Add item…', description }: TagInputProps) {
  const [input, setInput] = useState('');

  const add = () => {
    const v = input.trim();
    if (v && !values.includes(v)) onChange([...values, v]);
    setInput('');
  };

  const remove = (i: number) => onChange(values.filter((_, idx) => idx !== i));

  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); add(); }
    if (e.key === 'Backspace' && !input && values.length) remove(values.length - 1);
  };

  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">{label}</label>}
      {description && <p className="text-xs text-white/30">{description}</p>}
      <div className="min-h-[48px] bg-white/[0.06] border border-white/10 rounded-xl px-3 py-2 flex flex-wrap gap-2 focus-within:border-violet-500/70 transition-all">
        {values.map((v, i) => (
          <span key={i} className="flex items-center gap-1 px-2 py-0.5 bg-violet-600/20 border border-violet-500/30 rounded-lg text-violet-300 text-xs font-medium">
            {v}
            <button onClick={() => remove(i)} className="text-violet-400/60 hover:text-violet-300 transition-colors">
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={onKey}
          onBlur={add}
          placeholder={values.length === 0 ? placeholder : ''}
          className="flex-1 min-w-[120px] bg-transparent text-white text-sm placeholder-white/30 outline-none"
        />
      </div>
      <p className="text-xs text-white/25">Press Enter or comma to add</p>
    </div>
  );
}
