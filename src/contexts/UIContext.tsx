import React, { createContext, useContext, useState } from 'react';

interface UIContextType {
  isUpgradeOpen: boolean;
  openUpgrade: () => void;
  closeUpgrade: () => void;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

export function UIProvider({ children }: { children: React.ReactNode }) {
  const [isUpgradeOpen, setIsUpgradeOpen] = useState(false);

  const openUpgrade = () => setIsUpgradeOpen(true);
  const closeUpgrade = () => setIsUpgradeOpen(false);

  return (
    <UIContext.Provider value={{ isUpgradeOpen, openUpgrade, closeUpgrade }}>
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
