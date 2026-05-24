import React, { useState, useEffect } from 'react';

interface TabInfo {
  title: string;
  url: string;
}

interface TvRemoteModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TvRemoteModal: React.FC<TvRemoteModalProps> = ({ isOpen, onClose }) => {
  const [tabs, setTabs] = useState<TabInfo[]>([]);

  // 【環境設定】テレビ（antiX）のIPアドレス
  const API_BASE = 'http://192.168.43.56:8000';

  // 通常のタブ一覧を軽量に自動取得（3秒おき）
  const fetchNormalTabs = async () => {
    try {
      const tabsRes = await fetch(`${API_BASE}/api/tv/tabs`);
      if (tabsRes.ok) {
        const tabsData = await tabsRes.json();
        setTabs(tabsData.tabs || []);
      }
    } catch (err) {
      console.error('タブ取得失敗:', err);
    }
  };

  // アクション送信（Popenによる完全非同期・投げっぱなし）
  const sendAction = async (action: string) => {
    try {
      await fetch(`${API_BASE}/api/tv/control`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
    } catch (err) {
      console.error('アクション送信失敗:', err);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchNormalTabs();
      const timer = setInterval(() => fetchNormalTabs(), 3000);
      return () => clearInterval(timer);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md">
      <div className="w-full max-w-5xl rounded-2xl border border-zinc-800 bg-[#0d1117] p-6 shadow-2xl text-gray-200 transition-all">
        
        {/* ヘッダー */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div className="flex items-center space-x-2">
            <span className="text-xl">🌟</span>
            <h2 className="text-lg font-bold tracking-wide text-white">テレビ・インテリジェント マウス＆ショートカットリモコン</h2>
          </div>
          <button onClick={onClose} className="rounded-md px-3 py-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-white transition text-sm">
            閉じる
          </button>
        </div>

        {/* メイン3カラム構成 */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* ① 左側：ボスのアイデア！お気に入り動画サイト・ショートカットエリア */}
          <div className="flex flex-col space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-blue-400 mb-1">🌐 お気に入りショートカット</h3>
            
            <div className="flex flex-col space-y-2">
              <button 
                onClick={() => sendAction('open_url:https://video.unext.jp')} 
                className="w-full py-3 bg-gradient-to-r from-cyan-950 to-blue-900 hover:from-cyan-900 hover:to-blue-800 rounded-xl text-xs font-bold text-cyan-200 border border-cyan-700/40 transition active:scale-95 text-left px-4 flex items-center justify-between shadow-lg"
              >
                <span>🎬 U-NEXT (ユーネクスト) を開く</span>
                <span className="text-cyan-400">▶</span>
              </button>

              <button 
                onClick={() => sendAction('open_url:https://www.youtube.com')} 
                className="w-full py-3 bg-gradient-to-r from-red-950 to-red-900 hover:from-red-900 hover:to-red-800 rounded-xl text-xs font-bold text-red-200 border border-red-700/40 transition active:scale-95 text-left px-4 flex items-center justify-between shadow-lg"
              >
                <span>📺 YouTube を開く</span>
                <span className="text-red-400">▶</span>
              </button>

              <button 
                onClick={() => sendAction('open_url:https://tver.jp')} 
                className="w-full py-3 bg-gradient-to-r from-teal-950 to-emerald-900 hover:from-teal-900 hover:to-emerald-800 rounded-xl text-xs font-bold text-teal-200 border border-teal-700/40 transition active:scale-95 text-left px-4 flex items-center justify-between shadow-lg"
              >
                <span>🟢 TVer (ティーバー) を開く</span>
                <span className="text-teal-400">▶</span>
              </button>

              <button 
                onClick={() => sendAction('open_url:https://www.amazon.co.jp/gp/video/storefront')} 
                className="w-full py-3 bg-gradient-to-r from-slate-900 to-amber-950 hover:from-slate-800 hover:to-amber-900 rounded-xl text-xs font-bold text-amber-200 border border-amber-700/30 transition active:scale-95 text-left px-4 flex items-center justify-between shadow-lg"
              >
                <span>📦 Amazon Prime Video を開く</span>
                <span className="text-amber-400">▶</span>
              </button>
            </div>

            <hr className="border-zinc-800 my-1" />
            
            <button 
              onClick={() => sendAction('open_url:about:blank')} 
              className="w-full py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-xs font-medium text-zinc-300 transition text-center"
            >
              🏠 まっさらなブラウザホームへ
            </button>
          </div>

          {/* ② 中央：超シンプルに洗練された基本システムリモコン */}
          <div className="flex flex-col space-y-4 bg-zinc-900/30 p-4 rounded-xl border border-zinc-800/50">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-purple-400">基本システム操作</h3>
            
            {/* メインの再生・停止（xdotoolで最前面にしてから叩くので確実に効く） */}
            <button 
              onClick={() => sendAction('play_pause')}
              className="w-full py-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold rounded-xl shadow-lg transition active:scale-95 text-base"
            >
              ⏯️ 再生 / 一時停止 (Space)
            </button>

            {/* ブラウザのタブ切り替え（複数サービス開いたときに便利） */}
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => sendAction('tab_prev')} className="py-2.5 bg-zinc-800 hover:bg-zinc-700 rounded-lg font-medium text-xs text-zinc-300 transition">
                ⏮️ 前のタブ
              </button>
              <button onClick={() => sendAction('tab_next')} className="py-2.5 bg-zinc-800 hover:bg-zinc-700 rounded-lg font-medium text-xs text-zinc-300 transition">
                次のタブ ⏭️
              </button>
            </div>

            {/* 現在開いているタブの生存確認エリア */}
            <div className="mt-2">
              <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider block mb-1.5">現在の閲覧情報</span>
              <div className="p-2.5 rounded-lg border border-zinc-800 bg-[#161b22] text-xs truncate font-mono text-zinc-400">
                {tabs.length === 0 ? "⏳ ブラウザ確認中..." : `🌐 ${tabs[0].title}`}
              </div>
            </div>
          </div>

          {/* ③ 右側：完全マウス乗っ取り・仮想トラックパッドパネル */}
          <div className="flex flex-col space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-green-400 flex items-center gap-1">
              <span className="animate-pulse">🟢</span> 仮想トラックパッド (画面操作)
            </h3>

            {/* トラックパッド本体 */}
            <div 
              className="h-[200px] rounded-xl border border-dashed border-green-800/40 bg-gradient-to-b from-[#0f160e] to-[#080c07] flex flex-col items-center justify-center p-4 cursor-move select-none relative active:border-green-500 transition-colors shadow-inner"
              onMouseMove={(e) => {
                if (e.buttons === 1) { // ドラッグ中（クリックしながら移動）
                  fetch(`${API_BASE}/api/tv/mouse`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ type: 'move', dx: e.movementX * 1.6, dy: e.movementY * 1.6 }), // キビキビ動く1.6倍速
                  }).catch(() => {});
                }
              }}
              onClick={() => {
                // パッドをポンッと叩けば左クリック！
                fetch(`${API_BASE}/api/tv/mouse`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ type: 'click' }),
                }).catch(() => {});
              }}
            >
              <div className="text-center pointer-events-none space-y-1.5">
                <span className="text-2xl block animate-pulse">🖱️</span>
                <p className="text-xs text-green-400 font-bold">ここをドラッグしてマウス移動</p>
                <p className="text-[10px] text-zinc-500">エリア内タップでテレビ側を左クリック</p>
              </div>
            </div>

            {/* クリック補助・決定キー */}
            <div className="grid grid-cols-2 gap-2">
              <button 
                onClick={() => fetch(`${API_BASE}/api/tv/mouse`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'click' }) })}
                className="py-2.5 bg-green-950/60 hover:bg-green-900/80 border border-green-800/40 rounded-lg text-xs font-bold text-green-300 transition active:scale-95"
              >
                🖱️ 左クリック (選択)
              </button>
              <button 
                onClick={() => sendAction('enter_key')} 
                className="py-2.5 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-xs font-medium text-zinc-300 transition active:scale-95"
              >
                ⌨️ Enterキー
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};