'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { Save, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

type Status = 'idle' | 'saving' | 'saved' | 'error';

interface SaveBarProps {
  status: Status;
  onSave: () => void;
  onReset?: () => void;
  isDirty?: boolean;
}

export default function SaveBar({ status, onSave, onReset, isDirty }: SaveBarProps) {
  return (
    <AnimatePresence>
      {(isDirty || status !== 'idle') && (
        <motion.div
          className="fixed bottom-20 lg:bottom-6 left-1/2 z-40"
          initial={{ opacity: 0, y: 20, x: '-50%' }}
          animate={{ opacity: 1, y: 0, x: '-50%' }}
          exit={{ opacity: 0, y: 20, x: '-50%' }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        >
          <div className="grad-border shadow-2xl">
            <div className="glass rounded-[20px] px-5 py-3 flex items-center gap-4">
              {status === 'saved' ? (
                <span className="flex items-center gap-2 text-emerald-400 text-sm font-medium">
                  <CheckCircle2 className="w-4 h-4" /> Saved successfully
                </span>
              ) : status === 'error' ? (
                <span className="flex items-center gap-2 text-red-400 text-sm font-medium">
                  <AlertCircle className="w-4 h-4" /> Save failed
                </span>
              ) : (
                <span className="text-white/50 text-sm">You have unsaved changes</span>
              )}
              <div className="flex items-center gap-2">
                {onReset && status !== 'saving' && (
                  <button onClick={onReset} className="px-3 py-1.5 rounded-lg text-sm text-white/40 hover:text-white/70 hover:bg-white/5 transition-all">
                    Reset
                  </button>
                )}
                <button
                  onClick={onSave}
                  disabled={status === 'saving'}
                  className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-gradient-to-r from-violet-600 to-blue-600 text-white text-sm font-semibold hover:opacity-90 transition-all disabled:opacity-50"
                >
                  {status === 'saving' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  {status === 'saving' ? 'Saving…' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
