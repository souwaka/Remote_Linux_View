'use client';

import dynamic from 'next/dynamic';
import { useDashboard } from '../hooks/useDashboard';
import Sidebar from '../components/Sidebar';
import QuickShortcuts from '../components/QuickShortcuts';
import FileExplorer from '../components/FileExplorer';
import CpuMonitor from '../components/CpuMonitor';
import ResourceMonitor from '../components/ResourceMonitor';
import TaskManager from '../components/TaskManager';
import NetworkInfo from '../components/NetworkInfo';
import { useHost } from '../context/HostContext';

// 単体Viewではなく、タブ管理コンポーネントをクライアントサイドのみで読み込む
const TerminalTabs = dynamic(() => import('../components/TerminalTabs'), {
  ssr: false,
});

export default function Home() {
  const { currentView } = useDashboard();
  const { currentHost } = useHost();

  return (
    <div className="flex h-screen w-screen bg-[#0b0c16] text-white font-sans overflow-hidden p-4 gap-4">
      <Sidebar />

      {/* 右側エリア：高さをh-fullにして画面内に固定 */}
      <div className="flex-1 flex flex-col gap-4 overflow-hidden h-full">
        
        {/* メインのコンテナ：ここから中身をはみ出させない（overflow-hidden） */}
        <main className="flex-1 bg-[#111322] rounded-2xl border border-gray-800/50 shadow-2xl relative overflow-hidden flex flex-col">
          
          {/* ターミナル以外の時は通常スクロール（overflow-auto）させ、
            ターミナルの時だけは親の枠（h-full）を維持して子に100%逆算させる
          */}
          <div className={`flex-1 flex flex-col ${currentView === 'terminal' ? 'overflow-hidden h-full' : 'overflow-auto'}`}>
            
            {/* 各コンポーネントを選択時のみマウントする */}
            {currentView === 'file' && <FileExplorer />}
            {currentView === 'cpu' && <CpuMonitor />}
            {currentView === 'resource' && <ResourceMonitor />}
            {currentView === 'task' && <TaskManager />}
            {currentView === 'network' && <NetworkInfo />}
            
            {/* 修正：TerminalTabs を呼び出し、親のサイズを w-full h-full で流し込む */}
            {currentView === 'terminal' && currentHost && (
              <div className="w-full h-full flex flex-col overflow-hidden">
                <TerminalTabs hostIp={currentHost.ip} hostPort={8000} />
              </div>
            )}

            {/* どれも選択されていない時の初期表示 */}
            {!['file', 'cpu', 'resource', 'task', 'network', 'terminal'].includes(currentView) && (
              <div className="flex flex-col items-center justify-center h-full text-gray-700 bg-[#0d0e1a]">
                <span className="text-4xl mb-4 opacity-10">SYSTEM_READY</span>
                <p className="text-sm font-mono tracking-widest uppercase">Select a module to initialize...</p>
              </div>
            )}
          </div>
        </main>

        <QuickShortcuts />
      </div>
    </div>
  );
}
