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
import AiAssistant from '../components/AiAssistant'; // 🤖 新しく切り出したコンポーネントをインポート！
import { useHost } from '../context/HostContext';

// タブ管理コンポーネントをクライアントサイドのみで読み込む
const TerminalTabs = dynamic(() => import('../components/TerminalTabs'), {
  ssr: false,
});

export default function Home() {
  const { currentView } = useDashboard();
  const { currentHost } = useHost();

  return (
    <div className="flex h-screen w-screen bg-[#0b0c16] text-white font-sans overflow-hidden p-4 gap-4">
      <Sidebar />

      {/* 右側エリア */}
      <div className="flex-1 flex flex-col gap-4 overflow-hidden h-full">
        
        {/* メインのコンテナ */}
        <main className="flex-1 bg-[#111322] rounded-2xl border border-gray-800/50 shadow-2xl relative overflow-hidden flex flex-col">
          
          {/* ターミナル、AIの時だけは親の枠（h-full）を維持して子に100%逆算させる */}
          <div className={`flex-1 flex flex-col ${['terminal', 'ai'].includes(currentView) ? 'overflow-hidden h-full' : 'overflow-auto'}`}>
            
            {/* 各コンポーネントを選択時のみマウントする */}
            {currentView === 'file' && <FileExplorer />}
            {currentView === 'cpu' && <CpuMonitor />}
            {currentView === 'resource' && <ResourceMonitor />}
            {currentView === 'task' && <TaskManager />}
            {currentView === 'network' && <NetworkInfo />}
            
            {/* 🤖 外部化されたAI Assistantコンポーネントを表示 */}
            {currentView === 'ai' && (
              <div className="w-full h-full flex flex-col overflow-hidden">
                <AiAssistant />
              </div>
            )}
            
            {/* TerminalTabs */}
            {currentView === 'terminal' && currentHost && (
              <div className="w-full h-full flex flex-col overflow-hidden">
                <TerminalTabs hostIp={currentHost.ip} hostPort={currentHost.port} />
              </div>
            )}

            {/* 初期表示 */}
            {!['file', 'cpu', 'resource', 'task', 'network', 'terminal', 'ai'].includes(currentView) && (
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