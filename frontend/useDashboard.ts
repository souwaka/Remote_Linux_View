import { useState } from 'react';

// 1. ビューの型を定義（将来的な拡張も容易にします）
export type ViewType = 'console' | 'file' | 'cpu' | 'resource' | 'task' | 'terminal' | 'network';

export const useDashboard = () => {
  // 初期値を 'console' または任意のデフォルト値に設定
  const [currentView, setCurrentView] = useState<ViewType>('console');

  const changeView = (view: ViewType) => {
    setCurrentView(view);
  };

  return {
    currentView,
    changeView,
  };
};
