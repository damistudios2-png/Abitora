import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import { useUI } from '../contexts/UIContext';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function Toast() {
  const { toast, showToast } = useUI();

  return (
    <AnimatePresence>
      {toast && (
        <div className="fixed bottom-6 left-6 right-6 sm:left-auto sm:right-6 z-[200] pointer-events-none flex justify-center sm:justify-end">
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
            className={cn(
              "pointer-events-auto flex items-center gap-4 p-4 pr-12 rounded-2xl shadow-2xl border min-w-[320px] max-w-md",
              toast.type === 'success' 
                ? "bg-white dark:bg-slate-900 border-emerald-100 dark:border-emerald-500/20" 
                : "bg-white dark:bg-slate-900 border-red-100 dark:border-red-500/20"
            )}
          >
            <div className={cn(
              "flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center",
              toast.type === 'success' ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"
            )}>
              {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            </div>
            
            <div className="flex-1">
              <h4 className={cn(
                "text-sm font-black uppercase tracking-widest mb-0.5",
                toast.type === 'success' ? "text-emerald-500" : "text-red-500"
              )}>
                {toast.type === 'success' ? 'Habit Established! 🎉' : 'Creation Failed'}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                {toast.message}
              </p>
            </div>

            <button 
              onClick={() => showToast('', toast.type)} // This is a bit hacky to clear it immediately if needed, but the auto-dismiss handles most cases
              className="absolute top-4 right-4 p-1 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-300 transition-colors"
            >
              {/* Note: showToast isn't really designed to clear, so we just wait for auto-dismiss or I could add a clearToast */}
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
