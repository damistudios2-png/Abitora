import React, { createContext, useContext, useState } from 'react';

interface UIContextType {
  isUpgradeOpen: boolean;
  openUpgrade: () => void;
  closeUpgrade: () => void;
  isSidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleSidebar: () => void;
  showToast: (message: string, type?: 'success' | 'error') => void;
  toast: { message: string; type: 'success' | 'error' } | null;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

export function UIProvider({ children }: { children: React.ReactNode }) {
  const [isUpgradeOpen, setIsUpgradeOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(() => {
    // Initial check for viewport width
    if (typeof window !== 'undefined') {
      return window.innerWidth < 1024;
    }
    return false;
  });

  const openUpgrade = () => setIsUpgradeOpen(true);
  const closeUpgrade = () => setIsUpgradeOpen(false);
  const toggleSidebar = () => setSidebarCollapsed(prev => !prev);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  return (
    <UIContext.Provider value={{ 
      isUpgradeOpen, openUpgrade, closeUpgrade, 
      isSidebarCollapsed, setSidebarCollapsed, toggleSidebar,
      toast, showToast
    }}>
      {children}
    </UIContext.Provider>
  );
}

export function useUI() {
  const context = useContext(UIContext);
  if (context === undefined) {
    throw new Error('useUI must be used within a UIProvider');
  }
  return context;
}
