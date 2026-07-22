'use client';
import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, AlertCircle, Info, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContextValue {
  toast: (opts: Omit<Toast, 'id'>) => void;
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const icons: Record<ToastType, React.ElementType> = {
  success: CheckCircle2,
  error: XCircle,
  warning: AlertCircle,
  info: Info,
};

const styles: Record<ToastType, { border: string; icon: string; bg: string }> = {
  success: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', icon: 'text-emerald-400' },
  error:   { bg: 'bg-red-500/10',     border: 'border-red-500/30',     icon: 'text-red-400'     },
  warning: { bg: 'bg-yellow-500/10',  border: 'border-yellow-500/30',  icon: 'text-yellow-400'  },
  info:    { bg: 'bg-blue-500/10',    border: 'border-blue-500/30',    icon: 'text-blue-400'    },
};

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: () => void }) {
  const Icon = icons[toast.type];
  const s = styles[toast.type];

  useEffect(() => {
    const timer = setTimeout(onRemove, toast.duration ?? 4000);
    return () => clearTimeout(timer);
  }, [toast.id, toast.duration, onRemove]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 24, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 500, damping: 38 }}
      className={`flex items-start gap-3 w-80 max-w-[calc(100vw-2rem)] p-4 rounded-2xl border backdrop-blur-xl shadow-2xl ${s.bg} ${s.border}`}
      style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.6)' }}
    >
      <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${s.icon}`} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-white">{toast.title}</p>
        {toast.message && <p className="text-xs text-white/50 mt-0.5 leading-relaxed">{toast.message}</p>}
      </div>
      <button
        onClick={onRemove}
        className="shrink-0 text-white/30 hover:text-white/70 transition-colors mt-0.5"
      >
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  );
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const remove = useCallback((id: string) => {
    setToasts(t => t.filter(x => x.id !== id));
  }, []);

  const add = useCallback((opts: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).slice(2);
    setToasts(t => [...t.slice(-4), { ...opts, id }]); // max 5 visible
  }, []);

  const success = useCallback((title: string, message?: string) => add({ type: 'success', title, message }), [add]);
  const error   = useCallback((title: string, message?: string) => add({ type: 'error',   title, message }), [add]);
  const warning = useCallback((title: string, message?: string) => add({ type: 'warning', title, message }), [add]);
  const info    = useCallback((title: string, message?: string) => add({ type: 'info',    title, message }), [add]);

  return (
    <ToastContext.Provider value={{ toast: add, success, error, warning, info }}>
      {children}
      <div className="fixed bottom-20 right-4 lg:bottom-6 z-[100] flex flex-col gap-2 items-end pointer-events-none">
        <AnimatePresence mode="popLayout">
          {toasts.map(t => (
            <div key={t.id} className="pointer-events-auto">
              <ToastItem toast={t} onRemove={() => remove(t.id)} />
            </div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside ToastProvider');
  return ctx;
}
