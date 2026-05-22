'use client';

import { useState } from 'react';
import { useDashboard, ViewType } from '../hooks/useDashboard';
import { useHost } from '../context/HostContext';

export default function Sidebar() {
  const { currentView, changeView } = useDashboard();
  const { currentHost } = useHost();
  const [isSessionOpen, setIsSessionOpen] = useState(false);

  // ホスト操作用の共通アクション関数
  const handleHostAction = async (action: 'reboot' | 'shutdown') => {
    if (!currentHost) return;
    const confirmMsg = action === 'reboot' ? 'ホストを再起動しますか？' : 'ホストをシャットダウンしますか？';

    if (confirm(confirmMsg)) {
      try {
        // パスを /api/system/${action} に修正しました
        const response = await fetch(`http://${currentHost.ip}:${currentHost.port}/api/system/${action}`, {
          method: 'POST',
        });
        if (response.ok) {
          alert(`ホストへ ${action} 要求を送信しました。`);
        } else {
          alert(`操作に失敗しました。ステータス: ${response.status}`);
        }
      } catch (e) {
        console.error("通信エラー:", e);
        alert("操作に失敗しました。サーバーが起動しているか確認してください。");
      }
    }
  };

  const menuItems: { id: ViewType; label: string; icon: string; color: string }[] = [
    { id: 'network', label: 'ネットワーク情報', icon: '🌐', color: 'bg-blue-900 border-blue-700 text-blue-200' },
    { id: 'resource', label: 'リソース状況', icon: '📋', color: 'bg-indigo-900 border-indigo-700 text-indigo-200' },
    { id: 'cpu', label: 'CPU温度・負荷', icon: '🔥', color: 'bg-red-950 border-red-800 text-red-200' },
    { id: 'task', label: 'タスク管理', icon: '⚙️', color: 'bg-emerald-950 border-emerald-800 text-emerald-200' },
    { id: 'terminal', label: 'ターミナル起動', icon: '💻', color: 'bg-green-700 border-green-600 text-white' },
    { id: 'file', label: 'ファイル管理', icon: '📁', color: 'bg-amber-600 border-amber-500 text-white' },
  ];

  return (
    <aside className="w-64 flex flex-col gap-2 shrink-0 h-full overflow-hidden">
      {/* ヘッダー */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#161930] rounded-lg border border-gray-800/80 mb-1 shrink-0 shadow-md">
        <div className="flex items-center gap-2">
          <span className="text-blue-400 text-sm">■</span>
          <span className="text-sm font-bold tracking-tight">リモートLinux</span>
        </div>
        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
      </div>

      {/* メニューリスト */}
      <div className="flex-1 flex flex-col gap-2 overflow-y-auto pr-1">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => changeView(item.id)}
            className={`w-full py-2.5 px-4 rounded-lg font-bold text-sm transition-all duration-150 border-b-2 flex items-center gap-3 active:translate-y-0.5 active:border-b-0 shrink-0 ${
              currentView === item.id
                ? `${item.color} shadow-lg ring-1 ring-white/20`
                : 'bg-[#232642] border-[#1a1c2e] text-gray-400 hover:bg-[#2d3154] hover:text-white'
            }`}
          >
            <span className="text-lg">{item.icon}</span>
            {item.label}
          </button>
        ))}

        {/* セッション管理 */}
        <div className="mt-4 border-t border-gray-800/60 pt-4 shrink-0">
          <button
            onClick={() => setIsSessionOpen(!isSessionOpen)}
            className={`w-full py-2.5 px-4 rounded-lg font-bold text-sm transition-all duration-150 border-b-2 flex items-center justify-between ${
              isSessionOpen ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-[#1c1e36] border-[#131526] text-gray-400 hover:bg-[#252847]'
            }`}
          >
            <div className="flex items-center gap-3">
              <span>🔒</span> セッション管理
            </div>
            <span className={`text-xs transition-transform ${isSessionOpen ? 'rotate-180' : ''}`}>▼</span>
          </button>

          {isSessionOpen && (
            <div className="flex flex-col gap-1.5 mt-2 pl-2 animate-in fade-in slide-in-from-top-1">
              <button
                onClick={() => handleHostAction('reboot')}
                className="w-full py-2 px-4 bg-amber-900/40 hover:bg-amber-900/70 border border-amber-800/60 rounded-md text-left text-xs font-bold text-amber-200 transition-colors"
              >
                🔄 ホストの再起動
              </button>
              <button
                onClick={() => handleHostAction('shutdown')}
                className="w-full py-2 px-4 bg-red-950/50 hover:bg-red-950/80 border border-red-900/60 rounded-md text-left text-xs font-bold text-red-300 transition-colors"
              >
                🛑 ホストのシャットダウン
              </button>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
