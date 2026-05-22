'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

// 現在のViewの種類を定義
export type ViewType = 'network' | 'status' | 'cpu' | 'task' | 'terminal' | 'file';

const DashboardContext = createContext<{
  currentView: ViewType;
  changeView: (view: ViewType) => void;
} | undefined>(undefined);

export const DashboardProvider = ({ children }: { children: ReactNode }) => {
  const [currentView, setCurrentView] = useState<ViewType>('file');

  // 必要に応じて、ここでさらに「ホスト切り替え時のフック」を追加することも可能です
  
  return (
    <DashboardContext.Provider value={{ currentView, changeView: setCurrentView }}>
      {children}
    </DashboardContext.Provider>
  );
};

export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (!context) throw new Error('useDashboard must be used within a DashboardProvider');
  return context;
};
