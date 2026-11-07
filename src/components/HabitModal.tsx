import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface Habit {
  id?: string;
  name: string;
  description: string;
  category: string;
  frequency: 'daily' | 'weekly';
  daysOfWeek: number[]; // 0-6 (Sun-Sat)
  color: string;
}

interface HabitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (habit: any) => Promise<void>;
  initialData?: Habit | null;
}

export default function HabitModal({ isOpen, onClose, onSubmit, initialData }: HabitModalProps) {
  const [habit, setHabit] = useState<Habit>({
    name: '',
    description: '',
    category: 'Health',
    frequency: 'daily',
    daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
    color: '#10b981'
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setHabit({
        ...initialData,
        daysOfWeek: initialData.daysOfWeek || [0, 1, 2, 3, 4, 5, 6]
      });
    } else {
      setHabit({
        name: '',
        description: '',
        category: 'Health',
        frequency: 'daily',
        daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
        color: '#10b981'
      });
    }
  }, [initialData, isOpen]);

  const toggleDay = (day: number) => {
    if (habit.daysOfWeek.includes(day)) {
      if (habit.daysOfWeek.length > 1) {
        setHabit({ ...habit, daysOfWeek: habit.daysOfWeek.filter(d => d !== day) });
      }
    } else {
      setHabit({ ...habit, daysOfWeek: [...habit.daysOfWeek, day].sort() });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit(habit);
      onClose();
    } catch (error) {
      console.error('Submit error:', error);
    } finally {
      setLoading(false);
    }
  };

  const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 shadow-2xl overflow-hidden"
          >
             <div className="flex items-center justify-between mb-8">
               <h2 className="text-2xl font-bold">{initialData ? 'Refine Ritual' : 'New Ritual'}</h2>
               <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                 <X className="w-5 h-5 text-slate-400" />
               </button>
             </div>

             <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Habit Name</label>
                  <input 
                    required type="text" value={habit.name}
                    onChange={e => setHabit({...habit, name: e.target.value})}
                    placeholder="e.g. Morning Meditation"
                    className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800/50 border border-transparent dark:border-slate-800 rounded-2xl focus:ring-2 focus:ring-slate-900 dark:focus:ring-white outline-none transition-all dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Description (Optional)</label>
                  <textarea 
                    value={habit.description}
                    onChange={e => setHabit({...habit, description: e.target.value})}
                    placeholder="Why is this important to you?"
                    rows={2}
                    className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800/50 border border-transparent dark:border-slate-800 rounded-2xl focus:ring-2 focus:ring-slate-900 dark:focus:ring-white outline-none transition-all dark:text-white resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Category</label>
                    <select 
                      value={habit.category}
                      onChange={e => setHabit({...habit, category: e.target.value})}
                      className="w-full px-4 py-4 bg-slate-50 dark:bg-slate-800/50 border border-transparent dark:border-slate-800 rounded-2xl outline-none dark:text-white"
                    >
                      {['Health', 'Mindset', 'Productivity', 'Social', 'Finance', 'Other'].map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Frequency</label>
                    <select 
                      value={habit.frequency}
                      onChange={e => {
                        const freq = e.target.value as any;
                        setHabit({
                          ...habit, 
                          frequency: freq,
                          daysOfWeek: freq === 'daily' ? [0, 1, 2, 3, 4, 5, 6] : habit.daysOfWeek
                        });
                      }}
                      className="w-full px-4 py-4 bg-slate-50 dark:bg-slate-800/50 border border-transparent dark:border-slate-800 rounded-2xl outline-none dark:text-white"
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                    </select>
                  </div>
                </div>

                {habit.frequency === 'weekly' && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                  >
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Target Days</label>
                    <div className="flex justify-between p-1 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-transparent dark:border-slate-800">
                      {days.map((day, i) => (
                        <button
                          key={i} type="button"
                          onClick={() => toggleDay(i)}
                          className={cn(
                            "w-10 h-10 rounded-xl text-xs font-bold transition-all",
                            habit.daysOfWeek.includes(i)
                              ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-md"
                              : "text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                          )}
                        >
                          {day}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Identity Color</label>
                  <div className="flex gap-3 p-1">
                    {['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'].map(color => (
                      <button 
                        key={color} type="button"
                        onClick={() => setHabit({...habit, color})}
                        className={cn(
                          "w-8 h-8 rounded-full transition-all border-4",
                          habit.color === color ? "border-slate-900 dark:border-white scale-110 shadow-lg" : "border-transparent"
                        )}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>

                <button 
                  disabled={loading}
                  type="submit"
                  className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-[1.5rem] hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-slate-200 dark:shadow-none disabled:opacity-50"
                >
                  {initialData ? 'Save Changes' : 'Establish Habit'}
                </button>
             </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
