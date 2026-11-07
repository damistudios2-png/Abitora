import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useUI } from '../contexts/UIContext';
import { 
  User, 
  Mail, 
  Shield, 
  Bell, 
  Moon, 
  Sun, 
  LogOut, 
  ExternalLink,
  ChevronRight,
  Database,
  Cloud,
  Loader2
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import { db } from '../lib/firebase';
import { collection, query, getDocs } from 'firebase/firestore';

interface SettingsProps {
  toggleTheme: () => void;
  theme: 'light' | 'dark';
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function Settings({ toggleTheme, theme, activeTab, setActiveTab }: SettingsProps) {
  const { user, signOut, userProfile, updateDisplayName } = useAuth();
  const { openUpgrade } = useUI();
  const [exporting, setExporting] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState(user?.displayName || '');
  const [updating, setUpdating] = useState(false);

  const handleUpdateName = async () => {
    if (!user || !newName.trim()) return;
    setUpdating(true);
    try {
      await updateDisplayName(newName);
      setEditingName(false);
    } catch (error) {
      console.error('Update profile error:', error);
    } finally {
      setUpdating(false);
    }
  };

  const exportData = async () => {
    if (!user || !userProfile?.isPro) return;
    setExporting(true);
    try {
      const habitsRef = collection(db, 'users', user.uid, 'habits');
      const habitsSnap = await getDocs(habitsRef);
      const habits = habitsSnap.docs.map(d => ({ id: d.id, ...d.data() }));

      const completionsRef = collection(db, 'users', user.uid, 'completions');
      const completionsSnap = await getDocs(completionsRef);
      const completions = completionsSnap.docs.map(d => d.data());

      let csv = 'Habit,Category,Frequency,Date,Completed\n';
      completions.forEach((c: any) => {
        const habit = habits.find((h: any) => h.id === c.habitId) as any;
        if (habit) {
          csv += `"${habit.name}","${habit.category}","${habit.frequency}",${c.date},${c.completed}\n`;
        }
      });

      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.setAttribute('hidden', '');
      a.setAttribute('href', url);
      a.setAttribute('download', `abitora_export_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (error) {
      console.error('Export error:', error);
    } finally {
      setExporting(false);
    }
  };

  const sections: { title: string; icon: any; items: any[] }[] = [
    {

      title: 'Profile Information',
      icon: <User className="w-4 h-4" />,
      items: [
        { 
          label: 'Display Name', 
          value: editingName ? (
            <div className="flex items-center gap-2">
              <input 
                value={newName} onChange={e => setNewName(e.target.value)}
                className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-1 rounded-lg text-xs outline-none focus:ring-1 focus:ring-slate-900 dark:focus:ring-white"
              />
              <button onClick={handleUpdateName} disabled={updating} className="text-emerald-500 font-bold hover:underline">
                {updating ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Save'}
              </button>
              <button onClick={() => setEditingName(false)} className="text-slate-400 font-bold hover:underline">Cancel</button>
            </div>
          ) : user?.displayName || 'Not set', 
          type: 'text',
          action: editingName ? null : () => setEditingName(true)
        },
        { label: 'Email Address', value: user?.email || 'Not set', type: 'text' },
        { label: 'Member Since', value: userProfile?.createdAt?.toDate ? userProfile.createdAt.toDate().toLocaleDateString() : 'New User', type: 'text' }
      ]
    },
    {
      title: 'Preferences',
      icon: <Shield className="w-4 h-4" />,
      items: [
        { 
          label: 'Application Theme', 
          value: theme === 'light' ? 'Light Mode' : 'Dark Mode', 
          action: toggleTheme,
          icon: theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />
        }
      ]
    },
    {
      title: 'Account & Data',
      icon: <Database className="w-4 h-4" />,
      items: [
        { 
          label: 'Export Habit History', 
          value: exporting ? 'Exporting...' : 'Request CSV', 
          action: userProfile?.isPro ? exportData : openUpgrade, 
          type: exporting ? 'status' : 'link',
          icon: exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : null
        },
        { label: 'Manage Subscription', value: userProfile?.isPro ? 'Pro Active' : 'Free Tier', type: 'status', action: openUpgrade, highlight: true }
      ]
    }
  ];

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} toggleTheme={toggleTheme} theme={theme} />

      <main className="flex-1 overflow-y-auto">
        <header className="h-16 flex items-center justify-between px-8 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <h2 className="font-bold text-lg capitalize">{activeTab}</h2>
          </div>
        </header>

        <div className="p-8 max-w-3xl mx-auto space-y-12">
          <div>
            <h1 className="text-3xl font-extrabold mb-1">Control Center</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm">Configure your Abitora environment and security.</p>
          </div>

          <div className="space-y-8">
             {sections.map((section, i) => (
               <div key={i} className="space-y-4">
                  <div className="flex items-center gap-2 text-slate-400">
                     {section.icon}
                     <h3 className="text-xs font-black uppercase tracking-widest">{section.title}</h3>
                  </div>
                  
                  <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                     {section.items.map((item, j) => (
                       <button 
                         key={j}
                         onClick={item.action}
                         disabled={!item.action}
                         className={`w-full flex items-center justify-between p-5 text-left transition-colors border-b last:border-0 border-slate-50 dark:border-slate-800/50 ${item.action ? 'hover:bg-slate-50 dark:hover:bg-slate-800/50' : 'cursor-default'}`}
                       >
                          <span className="text-sm font-bold text-slate-600 dark:text-slate-300">{item.label}</span>
                          <div className="flex items-center gap-3">
                             <span className={`text-xs font-bold ${item.highlight ? 'text-emerald-500' : 'text-slate-400'}`}>{item.value}</span>
                             {item.icon && <div className="text-slate-400">{item.icon}</div>}
                             {item.action && <ChevronRight className="w-4 h-4 text-slate-300" />}
                          </div>
                       </button>
                     ))}
                  </div>
               </div>
             ))}

             <div className="pt-8">
                <button 
                  onClick={() => signOut()}
                  className="w-full flex items-center justify-center gap-2 py-4 bg-red-50 dark:bg-red-500/10 text-red-500 rounded-2xl font-bold text-sm hover:bg-red-100 dark:hover:bg-red-500/20 transition-all border border-red-100 dark:border-red-500/20 shadow-lg shadow-red-100 dark:shadow-none"
                >
                   <LogOut className="w-4 h-4" />
                   Terminate Session
                </button>
                <p className="mt-4 text-center text-[10px] font-black uppercase tracking-widest text-slate-400">
                   Abitora Engine v1.4.2 — Build 2026-Nov
                </p>
             </div>
          </div>
        </div>
      </main>
    </div>
  );
}
