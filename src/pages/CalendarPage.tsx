import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../lib/firebase';
import { 
  collection, 
  onSnapshot
} from 'firebase/firestore';
import { 
  ChevronLeft, 
  ChevronRight,
  Calendar as CalendarIcon,
  CheckCircle2,
  Trophy,
  Menu
} from 'lucide-react';
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  isToday 
} from 'date-fns';
import Sidebar from '../components/Sidebar';
import { handleFirestoreError, OperationType } from '../lib/db-utils';
import { useUI } from '../contexts/UIContext';


interface CalendarPageProps {
  toggleTheme: () => void;
  theme: 'light' | 'dark';
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function CalendarPage({ toggleTheme, theme, activeTab, setActiveTab }: CalendarPageProps) {
  const { user } = useAuth();
  const { toggleSidebar } = useUI();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [habits, setHabits] = useState<any[]>([]);
  const [completions, setCompletions] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    if (!user) return;

    const habitsRef = collection(db, 'users', user.uid, 'habits');
    const unsubscribeHabits = onSnapshot(habitsRef, (snapshot) => {
      setHabits(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'habits'));

    const completionsRef = collection(db, 'users', user.uid, 'completions');
    const unsubscribeCompletions = onSnapshot(completionsRef, (snapshot) => {
      setCompletions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'completions'));

    return () => {
      unsubscribeHabits();
      unsubscribeCompletions();
    };
  }, [user]);

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentMonth));
    const end = endOfWeek(endOfMonth(currentMonth));
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  const selectedDateCompletions = useMemo(() => {
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    return habits.map(h => {
       const done = completions.find(c => c.habitId === h.id && c.date === dateStr && c.completed);
       return { ...h, done: !!done };
    });
  }, [selectedDate, habits, completions]);

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} toggleTheme={toggleTheme} theme={theme} />

      <main className="flex-1 overflow-y-auto">
        <header className="h-16 flex items-center justify-between px-6 sm:px-8 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <h2 className="font-bold text-lg capitalize">{activeTab}</h2>
          </div>

          {/* Mobile Hamburger Button */}
          <button 
            onClick={toggleSidebar}
            className="lg:hidden p-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all border border-slate-200 dark:border-slate-700 shadow-sm"
          >
            <Menu className="w-5 h-5" />
          </button>
        </header>

        <div className="p-8 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Calendar Grid */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <h1 className="text-2xl font-extrabold">{format(currentMonth, 'MMMM yyyy')}</h1>
              <div className="flex gap-2">
                <button 
                  onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                  className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button 
                   onClick={() => setCurrentMonth(new Date())}
                   className="px-4 py-2 text-xs font-bold uppercase tracking-widest text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  Today
                </button>
                <button 
                  onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                  className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
               <div className="grid grid-cols-7 border-b border-slate-100 dark:border-slate-800">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                    <div key={d} className="py-4 text-center text-[10px] font-black uppercase tracking-widest text-slate-400">
                       {d}
                    </div>
                  ))}
               </div>
               <div className="grid grid-cols-7">
                  {days.map((day, i) => {
                    const dateStr = format(day, 'yyyy-MM-dd');
                    const dayCompletions = completions.filter(c => c.date === dateStr && c.completed);
                    const totalHabits = habits.length;
                    const completionRate = totalHabits > 0 ? (dayCompletions.length / totalHabits) : 0;
                    const isSelected = isSameDay(day, selectedDate);
                    const isTodayDay = isToday(day);
                    const isCurrentMonth = isSameMonth(day, currentMonth);

                    return (
                      <button 
                        key={i}
                        onClick={() => setSelectedDate(day)}
                        className={`aspect-square p-2 border-r border-b border-slate-50 dark:border-slate-800/50 transition-all relative group ${!isCurrentMonth ? 'opacity-30' : ''} ${isSelected ? 'bg-slate-50 dark:bg-slate-800/30' : 'hover:bg-slate-50/50 dark:hover:bg-slate-800/10'}`}
                      >
                         <span className={`text-xs font-bold absolute top-3 left-3 ${isTodayDay ? 'text-emerald-500 underline decoration-2 underline-offset-4' : 'text-slate-500'}`}>
                            {format(day, 'd')}
                         </span>
                         
                         {completionRate > 0 && (
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                               <div 
                                 className="w-8 h-8 rounded-full flex items-center justify-center transition-transform group-hover:scale-110"
                                 style={{ 
                                   backgroundColor: completionRate === 1 ? '#10b981' : `#10b981${Math.round(completionRate * 80)}`,
                                   color: completionRate > 0.5 ? 'white' : '#10b981'
                                 }}
                               >
                                 {completionRate === 1 ? <Trophy className="w-4 h-4" /> : <span className="text-[10px] font-black">{dayCompletions.length}</span>}
                               </div>
                            </div>
                         )}
                      </button>
                    );
                  })}
               </div>
            </div>
          </div>

          {/* Details Sidebar */}
          <div className="space-y-6">
             <div className="p-8 rounded-3xl bg-slate-900 text-white shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                   <CalendarIcon className="w-20 h-20" />
                </div>
                <h3 className="text-xl font-extrabold mb-1">{format(selectedDate, 'EEEE')}</h3>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">{format(selectedDate, 'do MMMM yyyy')}</p>
             </div>

             <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-4">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Performance Breakdown</h4>
                {selectedDateCompletions.length === 0 ? (
                  <p className="text-xs text-slate-500 italic py-4 text-center">No habits established on this date.</p>
                ) : (
                  selectedDateCompletions.map(h => (
                    <div key={h.id} className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
                       <div className="flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: h.color }} />
                          <span className="text-sm font-bold truncate max-w-[140px]">{h.name}</span>
                       </div>
                       {h.done ? (
                         <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                       ) : (
                         <div className="w-4 h-4 rounded-full border border-slate-300 dark:border-slate-600" />
                       )}
                    </div>
                  ))
                )}
             </div>

             {/* Motivational Quote */}
             <div className="p-6 rounded-3xl border-2 border-emerald-500/20 bg-emerald-50/20 dark:bg-emerald-500/5">
                <p className="text-xs font-medium text-emerald-700 dark:text-emerald-400 italic leading-relaxed">
                   "Consistency is the playground of the dull... and the foundation of the great."
                </p>
             </div>
          </div>
        </div>
      </main>
    </div>
  );
}
