import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useUI } from '../contexts/UIContext';
import { 
  LayoutDashboard, 
  CheckCircle2, 
  Calendar, 
  Settings, 
  BarChart3, 
  LogOut, 
  Moon, 
  Sun,
  Award,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  User as UserIcon
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { motion, AnimatePresence } from 'motion/react';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}


interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  toggleTheme: () => void;
  theme: 'light' | 'dark';
}

export default function Sidebar({ activeTab, setActiveTab, toggleTheme, theme }: SidebarProps) {
  const { user, signOut, userProfile } = useAuth();
  const { openUpgrade } = useUI();
  const [collapsed, setCollapsed] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const menuItems = [
    { id: 'dashboard', icon: <LayoutDashboard className="w-5 h-5" />, label: 'Dashboard' },
    { id: 'habits', icon: <CheckCircle2 className="w-5 h-5" />, label: 'My Habits' },
    { id: 'analytics', icon: <BarChart3 className="w-5 h-5" />, label: 'Analytics' },
    { id: 'calendar', icon: <Calendar className="w-5 h-5" />, label: 'Calendar' },
    { id: 'settings', icon: <Settings className="w-5 h-5" />, label: 'Settings' }
  ];

  return (
    <>
      {/* Mobile Toggle */}
      <div className="lg:hidden fixed bottom-6 right-6 z-50">
        <button 
          onClick={() => setCollapsed(!collapsed)}
          className="p-4 rounded-full bg-slate-900 text-white shadow-2xl"
        >
          {collapsed ? <Menu className="w-6 h-6" /> : <X className="w-6 h-6" />}
        </button>
      </div>

      <aside 
        className={cn(
          "bg-slate-900 text-white flex flex-col transition-all duration-300 fixed lg:relative inset-y-0 left-0 z-40",
          collapsed ? "w-0 lg:w-20 -translate-x-full lg:translate-x-0 overflow-hidden" : "w-64 translate-x-0"
        )}
      >
        <div className="p-8 flex items-center gap-3">
          <img src="/assets/images/abitora_abstract_logo_1794047912747.jpg" alt="Logo" className="w-8 h-8 rounded-lg shrink-0" />
          {!collapsed && <span className="text-xl font-bold tracking-tight whitespace-nowrap">Abitora</span>}
        </div>

        <nav className="flex-1 px-4 py-4 space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                if (window.innerWidth < 1024) setCollapsed(true);
              }}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-medium whitespace-nowrap",
                activeTab === item.id 
                  ? "bg-white/10 text-white shadow-sm" 
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              )}
              title={collapsed ? item.label : undefined}
            >
              <div className="shrink-0">{item.icon}</div>
              {!collapsed && <span>{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-white/5 space-y-4">
           {/* Upgrade Card */}
           {!userProfile?.isPro && !collapsed && (
             <div 
               onClick={openUpgrade}
               className="p-4 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white relative overflow-hidden group cursor-pointer"
             >
                <div className="absolute top-0 right-0 p-2 opacity-20 group-hover:scale-125 transition-transform">
                  <Award className="w-12 h-12" />
                </div>
                <h4 className="font-bold text-sm mb-1">Upgrade to Pro</h4>
                <p className="text-[10px] opacity-80 mb-3 leading-tight">Get unlimited habits and advanced analytics.</p>
                <button className="w-full py-2 bg-white/20 hover:bg-white/30 rounded-lg text-xs font-bold transition-colors">
                  Learn More
                </button>
             </div>
           )}

          <div className={cn("flex items-center justify-between gap-2", collapsed && "flex-col")}>
            <button 
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-white/5 transition-colors text-slate-400 hover:text-white"
              title="Toggle Theme"
            >
              {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5 text-amber-400" />}
            </button>
            
            <div className="relative">
              <button 
                onClick={() => setProfileOpen(!profileOpen)}
                className="p-1 rounded-full border-2 border-transparent hover:border-emerald-500 transition-all overflow-hidden"
              >
                <img 
                  src={user?.photoURL || `https://ui-avatars.com/api/?name=${user?.displayName || 'User'}&background=random`} 
                  alt="Profile" 
                  className="w-8 h-8 rounded-full" 
                />
              </button>

              {/* Profile Dropdown */}
              <AnimatePresence>
                {profileOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} />
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95, y: -10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -10 }}
                      className="absolute bottom-full left-0 mb-4 w-56 bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl z-50 overflow-hidden"
                    >
                      <div className="p-4 border-b border-slate-700">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Account</p>
                        <p className="font-bold text-sm truncate">{user?.displayName || 'User'}</p>
                        <p className="text-[10px] text-slate-400 truncate">{user?.email}</p>
                      </div>
                      <div className="p-2">
                        <button 
                          onClick={() => { setActiveTab('settings'); setProfileOpen(false); }}
                          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs hover:bg-white/5 transition-colors"
                        >
                          <UserIcon className="w-4 h-4" />
                          View Profile
                        </button>
                        <button 
                          onClick={() => { signOut(); setProfileOpen(false); }}
                          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs hover:bg-red-500/10 text-red-400 transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          Sign Out
                        </button>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            <button 
              onClick={() => setCollapsed(!collapsed)}
              className="hidden lg:block p-2 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition-colors"
              title={collapsed ? "Expand" : "Collapse"}
            >
              {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

