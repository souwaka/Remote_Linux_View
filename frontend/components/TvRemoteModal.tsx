'use client';

import React from 'react';
import { useHost } from '../context/HostContext';

interface TvRemoteModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TvRemoteModal: React.FC<TvRemoteModalProps> = ({ isOpen, onClose }) => {
  const { currentHost } = useHost();
  const baseUrl = `http://${currentHost.ip}`;

  const openUrl = async (url: string) => {
    try {
      await fetch(`${baseUrl}/api/tv/open`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });
    } catch (err) { console.error('URL起動失敗:', err); }
  };

  const sendControl = async (payload: object) => {
    try {
      await fetch(`${baseUrl}/api/tv/mouse`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } catch (err) { console.error('制御失敗:', err); }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md">
      <div className="w-full max-w-5xl rounded-2xl border border-zinc-800 bg-[#0d1117] p-6 shadow-2xl text-gray-200 transition-all">
        
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div className="flex items-center space-x-2">
            <span className="text-xl">🌟</span>
            <h2 className="text-lg font-bold tracking-wide text-white">テレビ・インテリジェント マウス＆ショートカットリモコン</h2>
          </div>
          <button onClick={onClose} className="rounded-md px-3 py-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-white transition text-sm">
            閉じる
          </button>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* ① ショートカット */}
          <div className="flex flex-col space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-blue-400 mb-1">🌐 お気に入りショートカット</h3>
            <div className="flex flex-col space-y-2">
              {[
                { name: '🎬 U-NEXT', url: 'https://video.unext.jp', bg: 'bg-cyan-900', text: 'text-cyan-200' },
                { name: '📺 YouTube', url: 'https://www.youtube.com', bg: 'bg-red-900', text: 'text-red-200' },
                { name: '🟢 TVer', url: 'https://tver.jp', bg: 'bg-teal-900', text: 'text-teal-200' },
                { name: '📦 Amazon Prime', url: 'https://www.amazon.co.jp/gp/video/storefront', bg: 'bg-amber-900', text: 'text-amber-200' }
              ].map((site) => (
                <button 
                  key={site.name}
                  onClick={() => openUrl(site.url)} 
                  className={`w-full py-3 ${site.bg} hover:opacity-80 rounded-xl text-xs font-bold ${site.text} border border-white/10 transition active:scale-95 text-left px-4 flex items-center justify-between shadow-lg`}
                >
                  <span>{site.name} を開く</span>
                  <span>▶</span>
                </button>
              ))}
            </div>
          </div>

          {/* ② 基本操作 */}
          <div className="flex flex-col space-y-4 bg-zinc-900/30 p-4 rounded-xl border border-zinc-800/50">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-purple-400">基本システム操作</h3>
            <button 
              onClick={() => sendControl({ type: 'key', key: 'space' })}
              className="w-full py-4 bg-gradient-to-r from-purple-700 to-indigo-700 text-white font-bold rounded-xl shadow-lg transition active:scale-95"
            >
              ⏯️ 再生 / 一時停止
            </button>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => sendControl({ type: 'key', key: 'Left' })} className="py-2.5 bg-zinc-800 hover:bg-zinc-700 rounded-lg font-medium text-xs text-zinc-300">⏮️ 前のタブ</button>
              <button onClick={() => sendControl({ type: 'key', key: 'Right' })} className="py-2.5 bg-zinc-800 hover:bg-zinc-700 rounded-lg font-medium text-xs text-zinc-300">次のタブ ⏭️</button>
            </div>
            <div className="mt-2 text-[11px] text-zinc-500 bg-[#161b22] p-2.5 rounded-lg border border-zinc-800">
              🟢 現在のホスト: {currentHost.ip}
            </div>
          </div>

          {/* ③ トラックパッド */}
          <div className="flex flex-col space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-green-400">🟢 仮想トラックパッド</h3>
            <div 
              className="h-[200px] rounded-xl border border-dashed border-green-800/40 bg-gradient-to-b from-[#0f160e] to-[#080c07] flex flex-col items-center justify-center p-4 cursor-move active:border-green-500 transition-colors select-none"
              onMouseMove={(e) => { if (e.buttons === 1) sendControl({ type: 'move', dx: e.movementX * 1.6, dy: e.movementY * 1.6 }); }}
            >
              <span className="text-2xl animate-pulse">🖱️</span>
              <p className="text-xs text-green-400 font-bold mt-2">ドラッグで移動</p>
            </div>
            <button 
              onClick={() => sendControl({ type: 'click' })} 
              className="py-2.5 bg-green-950/60 hover:bg-green-900/80 border border-green-800/40 rounded-lg text-xs font-bold text-green-300 transition active:scale-95"
            >
              🖱️ 左クリック (決定)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};