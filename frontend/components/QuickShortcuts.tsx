'use client';

import { useState } from 'react';
import { useHost } from '../context/HostContext';
import { TvRemoteModal } from './TvRemoteModal'; // さっき作ったモーダルをインポート

export default function QuickShortcuts() {
  const { currentHost, setCurrentHost } = useHost();
  const [isTvModalOpen, setIsTvModalOpen] = useState(false); // モーダルの開閉状態

  const handleAction = (label: string) => {
    switch (label) {
      case 'TVリモコン':
        setIsTvModalOpen(true); // ポチッと押したらモーダルを開く！
        break;
      case '接続再試行':
        if (currentHost) {
          const host = { ...currentHost };
          setCurrentHost(null);
          setTimeout(() => setCurrentHost(host), 100);
        }
        break;
      case 'ログ確認':
        alert('ログ確認機能は準備中です');
        break;
      default:
        console.log(`${label} clicked`);
    }
  };

  // アイコンは仮置きだったので全削除！スッキリした文字だけのボタンにしたよ
  const shortcuts = [
    { label: 'TVリモコン' },
    { label: 'プロセス監視' },
    { label: '接続再試行' },
    { label: '設定' },
  ];

  return (
    <>
      <div className="h-16 w-full bg-[#161930] rounded-2xl border border-gray-800/80 shadow-lg flex items-center px-6 gap-4 shrink-0">
        <div className="text-xs font-bold text-gray-500 uppercase tracking-widest mr-2">Quick:</div>
        {shortcuts.map((s) => (
          <button
            key={s.label}
            onClick={() => handleAction(s.label)}
            className="flex items-center gap-2 px-4 py-2 bg-[#1c1e36] hover:bg-[#2d3154] border border-gray-700 rounded-lg text-sm font-bold text-gray-300 transition-all hover:text-white active:scale-95"
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* リモコン本体の画面（非表示の時はメモリを喰わないスマート設計） */}
      <TvRemoteModal isOpen={isTvModalOpen} onClose={() => setIsTvModalOpen(false)} />
    </>
  );
}