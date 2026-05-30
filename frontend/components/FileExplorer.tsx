'use client';

import { useState, useEffect, useCallback } from 'react';
import { useHost } from '../context/HostContext';
import TerminalView from './TerminalView'; // ★インポートを追加

interface FileItem {
  name: string;
  type: 'folder' | 'file';
  size: string;
  status: string;
}

export default function FileExplorer() {
  const { currentHost } = useHost();
  const [files, setFiles] = useState<FileItem[]>([]);
  const [currentPath, setCurrentPath] = useState('/');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [fileContent, setFileContent] = useState<{name: string} | null>(null);

  const fetchFiles = useCallback(async (path: string) => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`http://${currentHost.ip}/api/files?path=${encodeURIComponent(path)}`);
      if (!res.ok) throw new Error('ディレクトリの取得に失敗しました');
      const data = await res.json();
      setFiles(data.files);
      setCurrentPath(data.path);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [currentHost]);

  const injectToTerminal = async (command: string) => {
    try {
      await fetch(`http://${currentHost.ip}/api/terminal/inject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tabId: '1', command })
      });
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchFiles('/');
  }, [fetchFiles]);

  const handleItemClick = (item: FileItem) => {
    if (item.type === 'folder') {
      const newPath = currentPath === '/' ? `/${item.name}` : `${currentPath}/${item.name}`;
      fetchFiles(newPath);
    } else {
      // ファイルクリックでモーダル（ターミナル）を開く
      setFileContent({ name: item.name });
      // 開いた瞬間に cat を注入
      setTimeout(() => injectToTerminal(`cat ${item.name}`), 500);
    }
  };

  const goUp = () => {
    if (currentPath === '/') return;
    const parentPath = currentPath.substring(0, currentPath.lastIndexOf('/')) || '/';
    fetchFiles(parentPath);
  };

  const filteredFiles = files.filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="flex flex-col h-full w-full bg-[#111322] text-sm font-sans select-none overflow-hidden relative">
      {/* (中略：ファイルリスト表示部分は変更なし) */}
      <div className="flex flex-col gap-2 p-3 bg-[#161930] border-b border-gray-800/60 shrink-0">
        <div className="flex items-center gap-2">
            <span className="text-amber-500 font-bold font-mono text-xs cursor-pointer" onClick={() => fetchFiles('/')}>📂 Root</span>
            <div className="flex-1 bg-[#0b0c16] px-3 py-1.5 rounded border border-gray-800/80 text-xs font-mono text-gray-300 flex items-center justify-between">
                <span>{currentPath}</span>
                {currentPath !== '/' && <button onClick={goUp} className="text-blue-400 hover:text-blue-300 ml-2">⬆ Up</button>}
            </div>
            <button onClick={() => fetchFiles(currentPath)} className="px-3 py-1.5 bg-[#232642] border border-gray-700 rounded text-xs font-bold text-blue-300 hover:bg-[#2d3154]">🔄 更新</button>
        </div>
        <input type="text" placeholder="ファイル名で検索..." className="bg-[#0b0c16] text-xs p-2 rounded border border-gray-700 w-full text-gray-300" onChange={(e) => setSearchQuery(e.target.value)} />
      </div>

      <div className="flex-1 overflow-y-auto p-2 font-mono text-xs text-gray-300">
        {loading ? <div className="p-4 text-center text-gray-600">Loading...</div> : (
          filteredFiles.map((file, index) => (
            <div key={index} onClick={() => handleItemClick(file)} className="grid grid-cols-12 gap-2 px-3 py-1.5 rounded hover:bg-white/5 cursor-pointer items-center">
              <div className="col-span-6 flex items-center gap-2"><span className="text-base">{file.type === 'folder' ? '📁' : '📄'}</span><span>{file.name}</span></div>
            </div>
          ))
        )}
      </div>

      {/* ★修正後のモーダル：preを廃止しTerminalViewをマウント */}
      {fileContent && (
        <div className="absolute inset-0 bg-black/90 p-4 z-50 flex flex-col" onClick={() => setFileContent(null)}>
          <div className="flex justify-between items-center mb-2 pb-2 border-b border-gray-800">
            <h2 className="text-amber-400 font-bold">💻 Terminal: {fileContent.name}</h2>
            <div className="flex gap-2">
              <button onClick={(e) => { e.stopPropagation(); injectToTerminal(`nano ${fileContent.name}`); }} className="text-white bg-indigo-700 px-3 py-1 rounded text-xs">✏️ 編集</button>
              <button onClick={(e) => { e.stopPropagation(); injectToTerminal(`python3 ${fileContent.name}`); }} className="text-white bg-green-700 px-3 py-1 rounded text-xs">▶ 実行</button>
              <button onClick={() => setFileContent(null)} className="text-gray-400 bg-gray-800 px-3 py-1 rounded text-xs">閉じる</button>
            </div>
          </div>
          <div className="flex-1 w-full bg-black border border-gray-700 rounded overflow-hidden">
             {/* ここでモーダル専用のターミナルインスタンスが立ち上がる */}
             <TerminalView tabId={`view-${fileContent.name}`} hostIp={currentHost.ip} hostPort={8001} />
          </div>
        </div>
      )}
    </div>
  );
}