'use client';

import { useHost } from '../context/HostContext';

export default function QuickShortcuts() {
  const { currentHost, setCurrentHost } = useHost();

  const handleAction = (label: string) => {
    switch (label) {
      case '接続再試行':
        // 現在のホスト情報を一時的にクリアして再セットすることで、
        // 依存しているコンポーネント（TerminalView等）の再レンダリングを誘発します
        if (currentHost) {
          const host = { ...currentHost };
          setCurrentHost(null);
          setTimeout(() => setCurrentHost(host), 100);
        }
        break;
      case 'ログ確認':
        alert('ログ確認機能は準備中です');
        break;
      // 他のボタンのアクションもここに追加可能
      default:
        console.log(`${label} clicked`);
    }
  };

  const shortcuts = [
    { label: 'ログ確認', icon: '📝' },
    { label: 'プロセス監視', icon: '📊' },
    { label: '接続再試行', icon: '🔄' },
    { label: '設定', icon: '⚙️' },
  ];

  return (
    <div className="h-16 w-full bg-[#161930] rounded-2xl border border-gray-800/80 shadow-lg flex items-center px-6 gap-4 shrink-0">
      <div className="text-xs font-bold text-gray-500 uppercase tracking-widest mr-2">Quick:</div>
      {shortcuts.map((s) => (
        <button
          key={s.label}
          onClick={() => handleAction(s.label)}
          className="flex items-center gap-2 px-4 py-2 bg-[#1c1e36] hover:bg-[#2d3154] border border-gray-700 rounded-lg text-sm font-bold text-gray-300 transition-all hover:text-white active:scale-95"
        >
          <span>{s.icon}</span>
          {s.label}
        </button>
      ))}
    </div>
  );
}
