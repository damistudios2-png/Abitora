import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Zap, CheckCircle2, Shield, Star, Award, Loader2 } from 'lucide-react';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function UpgradeModal({ isOpen, onClose }: UpgradeModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }} 
            animate={{ opacity: 1, scale: 1, y: 0 }} 
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-2"
          >
            {/* Left Side: Illustration & Benefits */}
            <div className="p-12 bg-slate-900 text-white flex flex-col justify-center relative overflow-hidden">
               <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                  <Star className="w-64 h-64 rotate-12" />
               </div>
               
               <div className="relative z-10">
                 <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-black uppercase tracking-widest mb-6">
                    <Award className="w-3 h-3" />
                    Premium Experience
                 </div>
                 <h2 className="text-4xl font-extrabold mb-6 leading-tight">Master your <br /><span className="text-emerald-400 text-5xl">Rituals.</span></h2>
                 <p className="text-slate-400 text-sm mb-10 leading-relaxed max-w-xs">
                    Unlock the full potential of Abitora with advanced analytics and unlimited habit tracking.
                 </p>

                 <ul className="space-y-5">
                    {[
                      { icon: <Zap className="w-4 h-4" />, text: "Unlimited Active Habits" },
                      { icon: <Star className="w-4 h-4" />, text: "Advanced Performance Insights" },
                      { icon: <Shield className="w-4 h-4" />, text: "Custom Habit Categories" },
                      { icon: <Award className="w-4 h-4" />, text: "Exclusive Achievement Badges" }
                    ].map((item, i) => (
                      <li key={i} className="flex items-center gap-4 text-sm font-medium">
                        <div className="p-2 rounded-lg bg-white/5 text-emerald-400">{item.icon}</div>
                        {item.text}
                      </li>
                    ))}
                 </ul>
               </div>
            </div>

            {/* Right Side: Pricing & CTA */}
            <div className="p-12 flex flex-col justify-center bg-white dark:bg-slate-900">
               <button 
                 onClick={onClose}
                 className="absolute top-8 right-8 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
               >
                 <X className="w-5 h-5 text-slate-400" />
               </button>

               <div className="space-y-8">
                 <div>
                    <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-2">Abitora Pro</h3>
                    <div className="flex items-baseline gap-2">
                       <span className="text-5xl font-black">$5</span>
                       <span className="text-slate-400 font-bold">/ month</span>
                    </div>
                 </div>

                 <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                    <div className="flex gap-4 mb-4">
                       <div className="p-3 rounded-2xl bg-white dark:bg-slate-800 shadow-sm text-amber-500">
                          <Star className="w-6 h-6 fill-current" />
                       </div>
                       <div>
                          <p className="font-bold text-sm">Monthly Subscription</p>
                          <p className="text-xs text-slate-500">Auto-renews every month.</p>
                       </div>
                    </div>
                    <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                       <div className="flex justify-between text-xs font-medium">
                          <span className="text-slate-500">Subtotal</span>
                          <span>$5.00</span>
                       </div>
                       <div className="flex justify-between text-xs font-black">
                          <span>Total due today</span>
                          <span className="text-emerald-600">$5.00</span>
                       </div>
                    </div>
                 </div>

                 <div className="space-y-4">
                    <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/20 text-amber-700 dark:text-amber-400 text-xs font-bold text-center leading-relaxed italic">
                       Payments are currently not available yet. <br /> Check back soon for our official launch!
                    </div>
                    <button 
                      disabled
                      className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black rounded-2xl opacity-50 cursor-not-allowed flex items-center justify-center gap-2"
                    >
                       Coming Soon
                    </button>
                    <p className="text-center text-[10px] font-black uppercase tracking-widest text-slate-400">
                       Security by Abitora Engine
                    </p>
                 </div>
               </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
