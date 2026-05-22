'use client';

import { useState, useEffect } from 'react';

export default function FileExplorer() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. マウント時にデータ取得を開始
    let isMounted = true;

    const fetchFiles = async () => {
      try {
        setLoading(true);
        // ここで実際のAPIを叩く
        // const res = await fetch('http://localhost:8000/api/files');
        // const data = await res.json();
        
        // 仮データでシミュレーション
        await new Promise(resolve => setTimeout(resolve, 500));
        if (isMounted) {
          setFiles([
            { name: 'projects', type: 'folder', size: '-', status: 'FOLDER' },
            { name: 'sample.txt', type: 'file', size: '1.2 KB', status: 'FILE' }
          ]);
          setLoading(false);
        }
      } catch (error) {
        console.error("Failed to fetch files:", error);
      }
    };

    fetchFiles();

    // 2. アンマウント時のクリーンアップ
    return () => {
      isMounted = false; // 非同期処理の結果を反映しないようにする
    };
  }, []); // 空の依存配列により、このコンポーネントが破棄されるまで再実行されない

  return (
    <div className="flex flex-col h-full w-full bg-[#111322] text-sm font-sans select-none overflow-hidden">
      {/* パスバー */}
      <div className="flex items-center gap-2 p-3 bg-[#161930] border-b border-gray-800/60 shrink-0">
        <span className="text-amber-500 font-bold font-mono text-xs">📂 Remote Path:</span>
        <div className="flex-1 bg-[#0b0c16] px-3 py-1.5 rounded border border-gray-800/80 text-xs font-mono text-gray-300">
          /home/user
        </div>
        <button className="px-3 py-1.5 bg-[#232642] border border-gray-700 rounded text-xs font-bold text-blue-300 hover:bg-[#2d3154] transition-colors">
          🔄 更新
        </button>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* ディレクトリツリー */}
        <aside className="w-56 border-r border-gray-800/60 p-3 overflow-y-auto shrink-0 bg-[#0d0e1a]/50 font-mono text-xs">
          <div className="space-y-1 text-gray-400">
            <div>▼ 📁 root (/)</div>
            <div className="pl-3">▼ 📁 home</div>
            <div className="pl-6 text-amber-400 font-bold bg-[#232642]/50 px-1.5 py-0.5 rounded">▼ 📁 user</div>
          </div>
        </aside>

        {/* ファイルリスト */}
        <main className="flex-1 flex flex-col overflow-hidden bg-[#0d0e1a]/20">
          <div className="grid grid-cols-12 gap-2 px-4 py-2 bg-[#141629] border-b border-gray-800 text-[11px] font-bold text-gray-500 uppercase shrink-0">
            <div className="col-span-6">名前</div>
            <div className="col-span-2 text-right">サイズ</div>
            <div className="col-span-4 text-center">ステータス</div>
          </div>

          <div className="flex-1 overflow-y-auto p-2 font-mono text-xs text-gray-300">
            {loading ? (
              <div className="p-4 text-center text-gray-600">Loading directory...</div>
            ) : (
              files.map((file, index) => (
                <div key={index} className="grid grid-cols-12 gap-2 px-3 py-1.5 rounded hover:bg-white/5 cursor-pointer items-center">
                  <div className="col-span-6 flex items-center gap-2">
                    <span className="text-base">{file.type === 'folder' ? '📁' : '📄'}</span>
                    <span className={file.type === 'folder' ? 'text-amber-300 font-bold' : ''}>{file.name}</span>
                  </div>
                  <div className="col-span-2 text-right text-gray-400">{file.size}</div>
                  <div className="col-span-4 text-center text-gray-500">{file.status}</div>
                </div>
              ))
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
