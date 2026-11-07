import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { UIProvider, useUI } from './contexts/UIContext';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import AuthPage from './pages/AuthPage';
import MyHabits from './pages/MyHabits';
import Analytics from './pages/Analytics';
import CalendarPage from './pages/CalendarPage';
import Settings from './pages/Settings';
import PrivacyPolicy from './pages/PrivacyPolicy';
import UpgradeModal from './components/UpgradeModal';

function AppContent() {
  const { user, loading } = useAuth();
  const { isUpgradeOpen, closeUpgrade } = useUI();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('abitora-theme');
    return (saved as 'light' | 'dark') || 'light';
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('abitora-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const path = window.location.pathname;
  if (path === '/privacy') return <PrivacyPolicy toggleTheme={toggleTheme} theme={theme} />;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900 dark:border-white"></div>
      </div>
    );
  }

  if (!user) {
    if (path === '/auth') return <AuthPage toggleTheme={toggleTheme} theme={theme} />;
    return <LandingPage toggleTheme={toggleTheme} theme={theme} />;
  }

  // State-based routing for authenticated users
  const renderPage = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard toggleTheme={toggleTheme} theme={theme} activeTab={activeTab} setActiveTab={setActiveTab} />;
      case 'habits':
        return <MyHabits toggleTheme={toggleTheme} theme={theme} activeTab={activeTab} setActiveTab={setActiveTab} />;
      case 'analytics':
        return <Analytics toggleTheme={toggleTheme} theme={theme} activeTab={activeTab} setActiveTab={setActiveTab} />;
      case 'calendar':
        return <CalendarPage toggleTheme={toggleTheme} theme={theme} activeTab={activeTab} setActiveTab={setActiveTab} />;
      case 'settings':
        return <Settings toggleTheme={toggleTheme} theme={theme} activeTab={activeTab} setActiveTab={setActiveTab} />;
      default:
        return <Dashboard toggleTheme={toggleTheme} theme={theme} activeTab={activeTab} setActiveTab={setActiveTab} />;
    }
  };

  return (
    <>
      {renderPage()}
      <UpgradeModal isOpen={isUpgradeOpen} onClose={closeUpgrade} />
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <UIProvider>
        <AppContent />
      </UIProvider>
    </AuthProvider>
  );
}
