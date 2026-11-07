import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../lib/firebase';
import { 
  collection, 
  query, 
  onSnapshot, 
  orderBy,
  where
} from 'firebase/firestore';
import { 
  BarChart3, 
  TrendingUp, 
  Calendar as CalendarIcon,
  Flame,
  Award,
  Zap,
  Target
} from 'lucide-react';
import { format, subDays, eachDayOfInterval, startOfToday, isSameDay } from 'date-fns';
import { motion } from 'motion/react';
import Sidebar from '../components/Sidebar';

import { handleFirestoreError, OperationType } from '../lib/db-utils';

interface AnalyticsProps {
  toggleTheme: () => void;
  theme: 'light' | 'dark';
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function Analytics({ toggleTheme, theme, activeTab, setActiveTab }: AnalyticsProps) {
  const { user } = useAuth();
  const [habits, setHabits] = useState<any[]>([]);
  const [completions, setCompletions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const habitsRef = collection(db, 'users', user.uid, 'habits');
    const unsubscribeHabits = onSnapshot(habitsRef, (snapshot) => {
      setHabits(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'habits'));

    const completionsRef = collection(db, 'users', user.uid, 'completions');
    const unsubscribeCompletions = onSnapshot(completionsRef, (snapshot) => {
      setCompletions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'completions'));

    return () => {
      unsubscribeHabits();
      unsubscribeCompletions();
    };
  }, [user]);

  // Calculations
  const last7Days = useMemo(() => {
    const today = startOfToday();
    return eachDayOfInterval({
      start: subDays(today, 6),
      end: today
    });
  }, []);

  const weeklyStats = useMemo(() => {
    return last7Days.map(day => {
      const dateStr = format(day, 'yyyy-MM-dd');
      const count = completions.filter(c => c.date === dateStr && c.completed).length;
      const total = habits.length;
      const percentage = total > 0 ? (count / total) * 100 : 0;
      return { day: format(day, 'EEE'), dateStr, count, percentage };
    });
  }, [last7Days, completions, habits]);

  const topHabit = useMemo(() => {
    if (habits.length === 0) return null;
    const counts = habits.map(h => ({
      ...h,
      count: completions.filter(c => c.habitId === h.id && c.completed).length
    }));
    return counts.sort((a, b) => b.count - a.count)[0];
  }, [habits, completions]);

  if (loading) {
     return (
       <div className="h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
         <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900 dark:border-white"></div>
       </div>
     );
  }

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} toggleTheme={toggleTheme} theme={theme} />

      <main className="flex-1 overflow-y-auto">
        <header className="h-16 flex items-center justify-between px-8 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <h2 className="font-bold text-lg capitalize">{activeTab}</h2>
          </div>
        </header>

        <div className="p-8 max-w-7xl mx-auto space-y-8">
          <div>
            <h1 className="text-3xl font-extrabold mb-1">Performance Insight</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm">Visualize your growth and consistency patterns.</p>
          </div>

          {habits.length === 0 ? (
            <div className="p-20 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
               <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-6 text-slate-300">
                  <TrendingUp className="w-8 h-8" />
               </div>
               <h3 className="text-xl font-bold mb-2">No data yet</h3>
               <p className="text-slate-400 max-w-xs mx-auto mb-8">Establish your first habits to begin generating performance analytics.</p>
               <button onClick={() => setActiveTab('dashboard')} className="px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold">Start Building</button>
            </div>
          ) : (
            <>
              {/* Top Row Overview */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                  { label: 'Total Completions', value: completions.filter(c => c.completed).length, icon: <Zap className="w-4 h-4" />, color: 'text-emerald-500' },
                  { label: 'Active Habits', value: habits.length, icon: <Target className="w-4 h-4" />, color: 'text-blue-500' },
                  { label: 'Avg. Consistency', value: `${Math.round(weeklyStats.reduce((acc, s) => acc + s.percentage, 0) / 7)}%`, icon: <TrendingUp className="w-4 h-4" />, color: 'text-teal-500' },
                  { label: 'Milestones Reached', value: Math.floor(completions.filter(c => c.completed).length / 5), icon: <Award className="w-4 h-4" />, color: 'text-amber-500' }
                ].map((stat, i) => (
                  <div key={i} className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">{stat.label}</p>
                    <div className="flex items-center justify-between">
                       <span className="text-2xl font-black">{stat.value}</span>
                       <div className={`p-2 rounded-lg bg-slate-50 dark:bg-slate-800 ${stat.color}`}>{stat.icon}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Chart Section */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                  <div className="flex items-center justify-between mb-10">
                    <h3 className="font-bold text-lg">Weekly Momentum</h3>
                    <div className="flex gap-2">
                       <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400">
                          <div className="w-2 h-2 rounded-full bg-emerald-500" />
                          COMPLETIONS
                       </div>
                    </div>
                  </div>
                  
                  <div className="flex items-end justify-between h-48 gap-4 px-2">
                    {weeklyStats.map((stat, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center gap-4 group">
                        <div className="w-full relative flex flex-col justify-end h-full">
                           <motion.div 
                             initial={{ height: 0 }}
                             animate={{ height: `${stat.percentage}%` }}
                             className="w-full max-w-[40px] mx-auto bg-emerald-500 rounded-t-lg group-hover:bg-emerald-400 transition-all relative"
                           >
                             <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                {stat.count}
                             </div>
                           </motion.div>
                        </div>
                        <span className="text-[10px] font-black text-slate-400 uppercase">{stat.day}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Top Performer */}
                  <div className="p-8 rounded-3xl bg-slate-900 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                       <Award className="w-24 h-24" />
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6">Top Performer</p>
                    {topHabit ? (
                      <>
                        <h4 className="text-xl font-bold mb-1">{topHabit.name}</h4>
                        <p className="text-emerald-400 text-xs font-bold mb-4">{topHabit.count} total completions</p>
                        <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                           <div className="h-full bg-emerald-500" style={{ width: '100%' }} />
                        </div>
                      </>
                    ) : (
                      <p className="text-xs text-slate-500 italic">Tracking data pending...</p>
                    )}
                  </div>

                  {/* Distribution */}
                  <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                    <h3 className="font-bold text-xs uppercase tracking-widest text-slate-400 mb-6">Category Impact</h3>
                    <div className="space-y-4">
                       {['Health', 'Mindset', 'Productivity', 'Social', 'Finance', 'Other'].filter(cat => 
                         habits.some(h => h.category === cat)
                       ).map((cat, i) => {
                         const catHabits = habits.filter(h => h.category === cat);
                         const catCompletions = completions.filter(c => 
                           c.completed && catHabits.some(h => h.id === c.habitId)
                         ).length;
                         const totalCompletions = completions.filter(c => c.completed).length;
                         const percentage = totalCompletions > 0 ? Math.round((catCompletions / totalCompletions) * 100) : 0;
                         
                         return (
                           <div key={i} className="space-y-2">
                              <div className="flex justify-between text-[10px] font-black">
                                 <span className="uppercase">{cat}</span>
                                 <span className="text-slate-400">{percentage}%</span>
                              </div>
                              <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                 <motion.div 
                                   initial={{ width: 0 }}
                                   animate={{ width: `${percentage}%` }}
                                   className="h-full bg-slate-900 dark:bg-white" 
                                 />
                              </div>
                           </div>
                         );
                       })}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
