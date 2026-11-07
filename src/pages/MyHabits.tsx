import React, { useState, useEffect } from 'react';
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
  orderBy
} from 'firebase/firestore';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit2, 
  Trash2, 
  X,
  CheckCircle2,
  MoreVertical,
  Clock,
  Tag,
  Menu
} from 'lucide-react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'motion/react';
import Sidebar from '../components/Sidebar';
import { handleFirestoreError, OperationType } from '../lib/db-utils';
import { useUI } from '../contexts/UIContext';


import HabitModal from '../components/HabitModal';

interface MyHabitsProps {
  toggleTheme: () => void;
  theme: 'light' | 'dark';
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

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

export default function MyHabits({ toggleTheme, theme, activeTab, setActiveTab }: MyHabitsProps) {
  const { user } = useAuth();
  const { toggleSidebar } = useUI();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [habitToEdit, setHabitToEdit] = useState<Habit | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [habitToDelete, setHabitToDelete] = useState<Habit | null>(null);

  useEffect(() => {
    if (!user) return;

    const habitsRef = collection(db, 'users', user.uid, 'habits');
    const q = query(habitsRef, where('isArchived', '==', false), orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setHabits(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Habit)));
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, `users/${user.uid}/habits`);
    });

    return () => unsubscribe();
  }, [user]);

  const filteredHabits = habits.filter(h => {
    const matchesSearch = h.name.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'All' || h.category === filter;
    return matchesSearch && matchesFilter;
  });

  const handleHabitSubmit = async (habitData: any) => {
    if (!user || !habitToEdit) return;
    try {
      const habitDocRef = doc(db, 'users', user.uid, 'habits', habitToEdit.id);
      await updateDoc(habitDocRef, {
        ...habitData,
        updatedAt: serverTimestamp()
      });
      setHabitToEdit(null);
    } catch (error) {
       handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}/habits/${habitToEdit.id}`);
    }
  };

  const confirmDelete = async () => {
    if (!user || !habitToDelete) return;
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'habits', habitToDelete.id));
      setIsDeleteModalOpen(false);
      setHabitToDelete(null);
    } catch (error) {
       handleFirestoreError(error, OperationType.DELETE, `users/${user.uid}/habits/${habitToDelete.id}`);
    }
  };

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

        <div className="p-8 max-w-7xl mx-auto space-y-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="text-3xl font-extrabold mb-1">Your Rituals</h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm">Manage and curate your daily habits.</p>
            </div>
            <button 
              className="flex items-center gap-2 px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold shadow-lg hover:scale-105 transition-all"
              onClick={() => setActiveTab('dashboard')} 
            >
              <Plus className="w-5 h-5" />
              New Habit
            </button>
          </div>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search habits..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white transition-all shadow-sm dark:text-white"
              />
            </div>
            <div className="flex gap-2 p-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-x-auto shadow-sm">
              {['All', 'Health', 'Mindset', 'Productivity', 'Social', 'Finance'].map(cat => (
                <button 
                  key={cat}
                  onClick={() => setFilter(cat)}
                  className={`px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${filter === cat ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-md' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Habits Grid */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
               <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900 dark:border-white"></div>
               <p className="text-sm text-slate-500 uppercase font-black tracking-widest">Loading Library</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredHabits.length === 0 ? (
                <div className="col-span-full py-20 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
                   <p className="text-slate-400 font-bold mb-4">No habits found matching your criteria.</p>
                   <button onClick={() => { setSearch(''); setFilter('All'); }} className="text-slate-900 dark:text-white underline font-black text-sm">Clear Filters</button>
                </div>
              ) : (
                filteredHabits.map((habit) => (
                  <motion.div 
                    layout
                    key={habit.id}
                    className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm group hover:shadow-xl hover:-translate-y-1 transition-all"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm" style={{ backgroundColor: `${habit.color}20`, color: habit.color }}>
                        <CheckCircle2 className="w-6 h-6" />
                      </div>
                      <div className="flex items-center gap-1">
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
                    </div>

                    <h3 className="text-lg font-bold mb-1 truncate">{habit.name}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 line-clamp-2 h-8 leading-relaxed italic">
                      {habit.description || "No description provided."}
                    </p>

                    <div className="flex flex-wrap gap-2 border-t border-slate-100 dark:border-slate-800 pt-4 mt-auto">
                       <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 text-[10px] font-black uppercase tracking-tighter text-slate-500 dark:text-slate-400">
                          <Tag className="w-3 h-3" />
                          {habit.category}
                       </div>
                       <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 text-[10px] font-black uppercase tracking-tighter text-slate-500 dark:text-slate-400">
                          <Clock className="w-3 h-3" />
                          {habit.frequency}
                       </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          )}
        </div>
      </main>

      <HabitModal 
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setHabitToEdit(null); }}
        onSubmit={handleHabitSubmit}
        initialData={habitToEdit}
      />

      {/* Delete Modal */}
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
                Confirm deletion of <span className="font-bold text-slate-900 dark:text-white">"{habitToDelete?.name}"</span>. This action is permanent.
              </p>
              <div className="flex gap-4">
                <button 
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 font-bold rounded-xl hover:bg-slate-200 transition-colors text-sm"
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmDelete}
                  className="flex-1 py-3 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 transition-colors text-sm"
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

