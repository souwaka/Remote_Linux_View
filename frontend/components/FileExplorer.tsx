'use client';

import { useState, useEffect, useCallback } from 'react';

interface FileItem {
  name: string;
  type: 'folder' | 'file';
  size: string;
  status: string;
}

export default function FileExplorer() {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [currentPath, setCurrentPath] = useState('/');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // 新機能用ステート
  const [searchQuery, setSearchQuery] = useState('');
  const [fileContent, setFileContent] = useState<{name: string, text: string} | null>(null);

  const fetchFiles = useCallback(async (path: string) => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`http://192.168.43.56:8000/api/files?path=${encodeURIComponent(path)}`);
      if (!res.ok) throw new Error('ディレクトリの取得に失敗しました');
      const data = await res.json();
      setFiles(data.files);
      setCurrentPath(data.path);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFiles('/');
  }, [fetchFiles]);

  // ファイル表示用関数
  const handleFileView = async (fileName: string) => {
    try {
      const res = await fetch(`http://192.168.43.56:8000/api/view-file?path=${encodeURIComponent(currentPath + '/' + fileName)}`);
      const data = await res.json();
      setFileContent({ name: fileName, text: data.content });
    } catch (err) {
      alert("ファイルの内容を読み込めませんでした");
    }
  };

  const handleItemClick = (item: FileItem) => {
    if (item.type === 'folder') {
      const newPath = currentPath === '/' ? `/${item.name}` : `${currentPath}/${item.name}`;
      fetchFiles(newPath);
    } else {
      handleFileView(item.name);
    }
  };

  const goUp = () => {
    if (currentPath === '/') return;
    const parentPath = currentPath.substring(0, currentPath.lastIndexOf('/')) || '/';
    fetchFiles(parentPath);
  };

  // 検索フィルタリング
  const filteredFiles = files.filter(f => 
    f.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full w-full bg-[#111322] text-sm font-sans select-none overflow-hidden relative">
      {/* パスバーと検索窓 */}
      <div className="flex flex-col gap-2 p-3 bg-[#161930] border-b border-gray-800/60 shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-amber-500 font-bold font-mono text-xs cursor-pointer" onClick={() => fetchFiles('/')}>📂 Root</span>
          <div className="flex-1 bg-[#0b0c16] px-3 py-1.5 rounded border border-gray-800/80 text-xs font-mono text-gray-300 flex items-center justify-between">
            <span>{currentPath}</span>
            {currentPath !== '/' && <button onClick={goUp} className="text-blue-400 hover:text-blue-300 ml-2">⬆ Up</button>}
          </div>
          <button onClick={() => fetchFiles(currentPath)} className="px-3 py-1.5 bg-[#232642] border border-gray-700 rounded text-xs font-bold text-blue-300 hover:bg-[#2d3154]">🔄 更新</button>
        </div>
        <input 
          type="text" 
          placeholder="ファイル名で検索..." 
          className="bg-[#0b0c16] text-xs p-2 rounded border border-gray-700 w-full text-gray-300"
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="flex-1 overflow-y-auto p-2 font-mono text-xs text-gray-300">
        {error && <div className="p-4 text-center text-red-400">{error}</div>}
        {loading ? <div className="p-4 text-center text-gray-600">Loading...</div> : (
          filteredFiles.map((file, index) => (
            <div key={index} onClick={() => handleItemClick(file)}
              className={`grid grid-cols-12 gap-2 px-3 py-1.5 rounded hover:bg-white/5 cursor-pointer items-center ${file.type === 'folder' ? 'hover:bg-amber-500/10' : ''}`}>
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

      {/* ファイル内容閲覧モーダル */}
      {fileContent && (
        <div className="absolute inset-0 bg-black/90 p-10 z-50 flex flex-col" onClick={() => setFileContent(null)}>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-amber-400 font-bold">{fileContent.name}</h2>
            <button className="text-white bg-red-900 px-3 py-1 rounded">Close</button>
          </div>
          <pre className="bg-[#0b0c16] p-4 h-full overflow-auto text-xs text-gray-300 border border-gray-700 rounded whitespace-pre-wrap">
            {fileContent.text}
          </pre>
        </div>
      )}
    </div>
  );
}
