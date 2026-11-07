import React, { createContext, useContext, useState } from 'react';

interface UIContextType {
  isUpgradeOpen: boolean;
  openUpgrade: () => void;
  closeUpgrade: () => void;
  isSidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleSidebar: () => void;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

export function UIProvider({ children }: { children: React.ReactNode }) {
  const [isUpgradeOpen, setIsUpgradeOpen] = useState(false);
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

  return (
    <UIContext.Provider value={{ 
      isUpgradeOpen, openUpgrade, closeUpgrade, 
      isSidebarCollapsed, setSidebarCollapsed, toggleSidebar 
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
