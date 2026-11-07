import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../lib/firebase';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  updateDoc, 
  doc, 
  deleteDoc, 
  serverTimestamp,
  setDoc,
  orderBy
} from 'firebase/firestore';
import { 
  CheckCircle2, 
  Plus, 
  Flame,
  Award,
  TrendingUp,
  X,
  Trash2,
  Calendar as CalendarIcon,
  ChevronRight,
  MoreVertical,
  LayoutDashboard,
  Edit2,
  Menu
} from 'lucide-react';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isToday, subDays, startOfToday } from 'date-fns';
import { motion, AnimatePresence } from 'motion/react';
import { handleFirestoreError, OperationType } from '../lib/db-utils';
import Sidebar from '../components/Sidebar';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useUI } from '../contexts/UIContext';

import HabitModal from '../components/HabitModal';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Types
interface Habit {
  id: string;
  name: string;
  description: string;
  category: string;
  frequency: 'daily' | 'weekly';
  daysOfWeek: number[];
  color: string;
  isArchived: boolean;
  createdAt: any;
}

interface Completion {
  id: string;
  habitId: string;
  date: string;
  completed: boolean;
  timestamp: any;
}

interface DashboardProps {
  toggleTheme: () => void;
  theme: 'light' | 'dark';
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function Dashboard({ toggleTheme, theme, activeTab, setActiveTab }: DashboardProps) {
  const { user, userProfile } = useAuth();
  const { toggleSidebar, showToast } = useUI();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [completions, setCompletions] = useState<Completion[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [habitToEdit, setHabitToEdit] = useState<Habit | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [habitToDelete, setHabitToDelete] = useState<Habit | null>(null);
  const [greeting, setGreeting] = useState('');

  // Dynamic Greeting Logic
  useEffect(() => {
    const updateGreeting = () => {
      const hour = new Date().getHours();
      if (hour >= 5 && hour < 12) setGreeting('Good morning');
      else if (hour >= 12 && hour < 17) setGreeting('Good afternoon');
      else if (hour >= 17 && hour < 21) setGreeting('Good evening');
      else setGreeting('Good night');
    };

    updateGreeting();
    const interval = setInterval(updateGreeting, 60000); // Sync every minute
    return () => clearInterval(interval);
  }, []);

  // Listeners
  useEffect(() => {
    if (!user) return;

    const habitsRef = collection(db, 'users', user.uid, 'habits');
    const qHabits = query(habitsRef, where('isArchived', '==', false), orderBy('createdAt', 'desc'));
    
    const unsubscribeHabits = onSnapshot(qHabits, (snapshot) => {
      const hList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Habit));
      setHabits(hList);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, `users/${user.uid}/habits`);
    });

    const completionsRef = collection(db, 'users', user.uid, 'completions');
    const unsubscribeCompletions = onSnapshot(completionsRef, (snapshot) => {
      const cList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Completion));
      setCompletions(cList);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, `users/${user.uid}/completions`);
    });

    return () => {
      unsubscribeHabits();
      unsubscribeCompletions();
    };
  }, [user]);

  // Analytics Helpers
  const todayStr = format(startOfToday(), 'yyyy-MM-dd');
  const todayIndex = new Date().getDay();

  const habitsDueToday = useMemo(() => {
    return habits.filter(h => !h.daysOfWeek || h.daysOfWeek.includes(todayIndex));
  }, [habits, todayIndex]);
  
  const todayCompletionsCount = useMemo(() => {
    return habitsDueToday.filter(h => 
      completions.some(c => c.habitId === h.id && c.date === todayStr && c.completed)
    ).length;
  }, [habitsDueToday, completions, todayStr]);

  const completionRate = habitsDueToday.length > 0 ? Math.round((todayCompletionsCount / habitsDueToday.length) * 100) : 0;

  const calculateStreak = (habitId: string) => {
    let streak = 0;
    let currentDate = startOfToday();
    const doneToday = completions.find(c => c.habitId === habitId && c.date === format(currentDate, 'yyyy-MM-dd') && c.completed);
    if (!doneToday) {
      currentDate = subDays(currentDate, 1);
    }
    while (true) {
      const dateStr = format(currentDate, 'yyyy-MM-dd');
      const found = completions.find(c => c.habitId === habitId && c.date === dateStr && c.completed);
      if (found) {
        streak++;
        currentDate = subDays(currentDate, 1);
      } else {
        break;
      }
    }
    return streak;
  };

  const totalStreaksAcrossHabits = useMemo(() => {
    return habits.reduce((acc, h) => acc + calculateStreak(h.id), 0);
  }, [habits, completions]);

  const [dashboardFilter, setDashboardFilter] = useState('All');
  const filteredHabits = useMemo(() => {
    return habitsDueToday.filter(h => dashboardFilter === 'All' || h.category === dashboardFilter);
  }, [habitsDueToday, dashboardFilter]);

  // Actions
  const handleHabitSubmit = async (habitData: any) => {
    if (!user) return;

    try {
      const habitsRef = collection(db, 'users', user.uid, 'habits');
      const habitId = habitToEdit ? habitToEdit.id : doc(habitsRef).id;
      const habitDocRef = doc(db, 'users', user.uid, 'habits', habitId);

      const payload = {
        ...habitData,
        id: habitId,
        userId: user.uid,
        isArchived: false,
        updatedAt: serverTimestamp(),
      };

      if (!habitToEdit) {
        payload.createdAt = serverTimestamp();
      }

      await setDoc(habitDocRef, payload, { merge: true });
      showToast(
        habitToEdit 
          ? 'Your ritual adjustments have been preserved.' 
          : 'Your new habit has been successfully created. Time to build consistency!',
        'success'
      );
      setHabitToEdit(null);
    } catch (error: any) {
      handleFirestoreError(error, habitToEdit ? OperationType.UPDATE : OperationType.CREATE, `users/${user.uid}/habits`);
      showToast(error.message || 'We encountered an error securing your ritual.', 'error');
    }
  };

  const toggleCompletion = async (habitId: string) => {
    if (!user) return;
    const today = format(new Date(), 'yyyy-MM-dd');
    const completionId = `${today}_${habitId}`;
    const completionRef = doc(db, 'users', user.uid, 'completions', completionId);
    const existing = completions.find(c => c.id === completionId);
    try {
      if (existing) {
        await updateDoc(completionRef, {
          completed: !existing.completed,
          timestamp: serverTimestamp()
        });
      } else {
        await setDoc(completionRef, {
          id: completionId,
          habitId,
          userId: user.uid,
          date: today,
          completed: true,
          timestamp: serverTimestamp()
        });
      }
    } catch (error) {
      handleFirestoreError(error, existing ? OperationType.UPDATE : OperationType.CREATE, `users/${user.uid}/completions/${completionId}`);
    }
  };

  const confirmDeleteHabit = async () => {
    if (!user || !habitToDelete) return;
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'habits', habitToDelete.id));
      showToast('Ritual abandoned. Your library has been updated.', 'success');
      setIsDeleteModalOpen(false);
      setHabitToDelete(null);
    } catch (error: any) {
      handleFirestoreError(error, OperationType.DELETE, `users/${user.uid}/habits/${habitToDelete.id}`);
      showToast(error.message || 'Error removing ritual.', 'error');
    }
  };

  const totalCompletions = completions.filter(c => c.completed).length;
  const level = Math.floor(totalCompletions / 10) + 1;
  const levelNames = ['Novice', 'Apprentice', 'Practitioner', 'Dedicated', 'Master', 'Legend'];
  const levelName = levelNames[Math.min(level - 1, levelNames.length - 1)] + ' Builder';

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-slate-900 dark:border-white"></div>
          <p className="text-sm font-medium text-slate-500 animate-pulse">Syncing your routine...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} toggleTheme={toggleTheme} theme={theme} />

      <main className="flex-1 overflow-y-auto">
        <header className="h-16 flex items-center justify-between px-6 sm:px-8 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <h2 className="font-bold text-lg capitalize">{activeTab}</h2>
            <div className="h-4 w-px bg-slate-200 dark:bg-slate-800" />
            <span className="text-sm text-slate-500 dark:text-slate-400 truncate max-w-[120px] sm:max-w-none">{format(new Date(), 'EEEE, MMM do')}</span>
          </div>

          {/* Mobile Hamburger Button */}
          <button 
            onClick={toggleSidebar}
            className="lg:hidden p-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all border border-slate-200 dark:border-slate-700 shadow-sm"
          >
            <Menu className="w-5 h-5" />
          </button>
        </header>

        <div className="p-8 max-w-7xl mx-auto space-y-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="text-3xl font-extrabold mb-1">{greeting || 'Welcome'}, {user?.displayName?.split(' ')[0]}!</h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm">Every day is a new chance to build yourself.</p>
            </div>
            <button 
              onClick={() => { setHabitToEdit(null); setIsModalOpen(true); }}
              className="flex items-center gap-2 px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold shadow-lg hover:scale-105 transition-all"
            >
              <Plus className="w-5 h-5" />
              New Habit
            </button>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">Daily Progress</span>
                <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600">
                  <TrendingUp className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-end justify-between">
                <div>
                  <span className="text-3xl font-black">{completionRate}%</span>
                  <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-tighter">
                    {todayCompletionsCount} of {habitsDueToday.length} habits done
                  </p>
                </div>
                <div className="w-24 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-emerald-500 transition-all duration-700" 
                    style={{ width: `${completionRate}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">Active Streaks</span>
                <div className="p-2 rounded-lg bg-orange-50 dark:bg-orange-500/10 text-orange-600">
                  <Flame className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-end justify-between">
                <div>
                  <span className="text-3xl font-black">{totalStreaksAcrossHabits}</span>
                  <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-tighter">Total momentum</p>
                </div>
                <div className="flex -space-x-1.5">
                  {Array.from({length: Math.min(5, habits.length)}).map((_, i) => (
                    <div key={i} className="w-6 h-6 rounded-full border-2 border-white dark:border-slate-900 bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                      <Flame className="w-3 h-3 text-orange-500" />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">Consistency Level</span>
                <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-500/10 text-blue-600">
                  <Award className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-end justify-between">
                <div>
                  <span className="text-3xl font-black">Lvl {level}</span>
                  <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-tighter">{levelName}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-300" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-xl">Today's Rituals</h3>
                <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-900 rounded-lg">
                   {['All', 'Health', 'Productivity', 'Mindset'].map(cat => (
                     <button 
                       key={cat} 
                       onClick={() => setDashboardFilter(cat)}
                       className={cn(
                         "px-3 py-1 text-[10px] font-bold rounded-md transition-all",
                         dashboardFilter === cat 
                           ? "bg-white dark:bg-slate-800 shadow-sm text-slate-900 dark:text-white" 
                           : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                       )}
                     >
                       {cat}
                     </button>
                   ))}
                </div>
              </div>

              <div className="space-y-3">
                {habitsDueToday.length === 0 ? (
                  <div className="p-16 text-center rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800">
                    <p className="text-slate-400 mb-6 text-sm">Nothing scheduled for today. Enjoy your rest!</p>
                    <button 
                      onClick={() => setActiveTab('habits')}
                      className="px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold text-sm"
                    >
                      Manage Rituals
                    </button>
                  </div>
                ) : filteredHabits.length === 0 ? (
                  <div className="p-16 text-center rounded-3xl border border-slate-200 dark:border-slate-800">
                    <p className="text-slate-400 mb-4 text-sm font-medium">No {dashboardFilter} rituals scheduled for today.</p>
                    <button onClick={() => setDashboardFilter('All')} className="text-sm font-black underline">Clear filter</button>
                  </div>
                ) : (
                  filteredHabits.map((habit) => {
                    const isDone = completions.some(c => c.habitId === habit.id && c.date === todayStr && c.completed);
                    const streak = calculateStreak(habit.id);
                    
                    return (
                      <motion.div 
                        layout
                        key={habit.id}
                        className={cn(
                          "group p-4 rounded-2xl border transition-all flex items-center justify-between",
                          isDone 
                            ? "bg-emerald-50/30 dark:bg-emerald-500/5 border-emerald-100/50 dark:border-emerald-500/10 shadow-none" 
                            : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm"
                        )}
                      >
                        <div className="flex items-center gap-4">
                          <button 
                            onClick={() => toggleCompletion(habit.id)}
                            className={cn(
                              "w-12 h-12 rounded-xl flex items-center justify-center transition-all shadow-sm",
                              isDone 
                                ? "bg-emerald-500 text-white" 
                                : "bg-slate-50 dark:bg-slate-800 text-slate-300 group-hover:bg-slate-100 dark:group-hover:bg-slate-700"
                            )}
                          >
                            <CheckCircle2 className={cn("w-6 h-6", isDone && "scale-110")} />
                          </button>
                          <div>
                            <h4 className={cn("font-bold text-base transition-all", isDone && "text-slate-400 line-through")}>{habit.name}</h4>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-[10px] uppercase font-black tracking-widest text-slate-400/80">{habit.category}</span>
                              <span className="text-slate-300 dark:text-slate-700 text-xs font-light">/</span>
                              <div className="flex items-center gap-1">
                                <Flame className={cn("w-3 h-3", streak > 0 ? "text-orange-500" : "text-slate-300")} />
                                <span className="text-[10px] font-bold text-slate-500">{streak} day streak</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                           <button 
                             onClick={() => { setHabitToEdit(habit); setIsModalOpen(true); }}
                             className="p-2 text-slate-300 hover:text-blue-500 transition-colors"
                           >
                             <Edit2 className="w-4 h-4" />
                           </button>
                           <button 
                             onClick={() => { setHabitToDelete(habit); setIsDeleteModalOpen(true); }}
                             className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                           >
                             <Trash2 className="w-4 h-4" />
                           </button>
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </div>
            </div>

            <div className="space-y-6">
              <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                <h3 className="font-bold mb-4 text-xs uppercase tracking-widest text-slate-400 flex items-center justify-between">
                  Weekly Log
                  <CalendarIcon className="w-3.5 h-3.5" />
                </h3>
                <div className="grid grid-cols-7 gap-2">
                  {eachDayOfInterval({
                    start: startOfWeek(new Date()),
                    end: endOfWeek(new Date())
                  }).map((day, i) => {
                    const dateStr = format(day, 'yyyy-MM-dd');
                    const isDone = completions.some(c => c.date === dateStr && c.completed);
                    const isTodayDay = isToday(day);
                    return (
                      <div key={i} className="flex flex-col items-center gap-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{format(day, 'eee').charAt(0)}</span>
                        <div className={cn(
                          "w-full aspect-square rounded-lg flex items-center justify-center text-[10px] font-black transition-all",
                          isTodayDay && !isDone && "ring-2 ring-slate-900 dark:ring-white ring-offset-2 dark:ring-offset-slate-900",
                          isDone ? "bg-emerald-500 text-white" : "bg-slate-50 dark:bg-slate-800 text-slate-400"
                        )}>
                          {format(day, 'd')}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-slate-900 text-white relative overflow-hidden">
                <div className="absolute -top-4 -right-4 p-4 opacity-10">
                   <Award className="w-24 h-24 rotate-12" />
                </div>
                <p className="text-sm font-medium leading-relaxed italic mb-3 relative z-10">
                  "Excellence is not an act, but a habit."
                </p>
                <div className="flex items-center gap-2 relative z-10">
                   <div className="w-4 h-[2px] bg-emerald-500" />
                   <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Philosophy</span>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                <h3 className="font-bold mb-4 text-xs uppercase tracking-widest text-slate-400">Recent Milestones</h3>
                <div className="space-y-4">
                   {[
                     { label: '5 Day Streak', habit: 'Morning Yoga', color: 'bg-orange-500' },
                     { label: 'First Habit', habit: 'Deep Work', color: 'bg-emerald-500' }
                   ].map((item, i) => (
                     <div key={i} className="flex gap-3 items-start">
                        <div className={cn("w-1.5 h-1.5 rounded-full mt-1.5 shrink-0", item.color)} />
                        <div>
                           <p className="text-[11px] font-bold">{item.label}</p>
                           <p className="text-[10px] text-slate-400 uppercase font-black">{item.habit}</p>
                        </div>
                     </div>
                   ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <HabitModal 
        isOpen={isModalOpen} 
        onClose={() => { setIsModalOpen(false); setHabitToEdit(null); }}
        onSubmit={handleHabitSubmit}
        initialData={habitToEdit}
      />

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {isDeleteModalOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsDeleteModalOpen(false)}
              className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl p-10 shadow-2xl text-center"
            >
              <div className="w-16 h-16 rounded-full bg-red-50 dark:bg-red-500/10 text-red-500 flex items-center justify-center mx-auto mb-6">
                <Trash2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-2">Abandon Ritual?</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm mb-8 leading-relaxed">
                This will permanently delete <span className="font-bold text-slate-900 dark:text-white">"{habitToDelete?.name}"</span> and all historical data. This action cannot be reversed.
              </p>
              <div className="flex gap-4">
                <button 
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 font-bold rounded-xl hover:bg-slate-200 transition-colors text-sm"
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmDeleteHabit}
                  className="flex-1 py-3 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 transition-colors text-sm shadow-lg shadow-red-200 dark:shadow-none"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

