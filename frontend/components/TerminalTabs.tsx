'use client';

import { useState, useEffect, useRef } from 'react'; // useRef を追加
import TerminalView from './TerminalView';

interface Tab {
  id: string;
  name: string;
}

export default function TerminalTabs({ hostIp, hostPort }: { hostIp: string, hostPort: number }) {
  const [tabs, setTabs] = useState<Tab[]>([]);
  const [activeTabId, setActiveTabId] = useState<string>('');
  
  // 【最重要】これが重複生成を防ぐための防波堤です
  const initialized = useRef(false);

  useEffect(() => {
    // 既に初期化済みなら何もしない（ダブルマウント対策）
    if (initialized.current) return;
    
    addTab();
    initialized.current = true; // 初回実行後にガードを上げる
  }, []);

  const addTab = () => {
    const newId = `tab-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`;
    const newTabName = `ターミナル ${tabs.length + 1}`;
    
    setTabs(prev => [...prev, { id: newId, name: newTabName }]);
    setActiveTabId(newId);
  };

  const removeTab = (idToRemove: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (tabs.length === 1) return;

    const filteredTabs = tabs.filter(tab => tab.id !== idToRemove);
    setTabs(filteredTabs);

    if (activeTabId === idToRemove) {
      setActiveTabId(filteredTabs[filteredTabs.length - 1].id);
    }
  };

  return (
    <div className="flex flex-col w-full h-full p-4 overflow-hidden bg-transparent">
      {/* タブヘッダー */}
      <div className="flex items-center border-b border-gray-800/80 pb-2 mb-2 gap-1 overflow-x-auto shrink-0 select-none">
        {tabs.map((tab) => (
          <div
            key={tab.id}
            onClick={() => setActiveTabId(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 cursor-pointer text-sm font-medium rounded-t-xl border-t-2 border-x border-transparent transition-all duration-200 ${
              activeTabId === tab.id
                ? 'bg-[#0b0c16] text-green-400 border-t-green-500 border-x-gray-800/50 shadow-md'
                : 'text-gray-400 hover:bg-[#16192b] hover:text-gray-200'
            }`}
          >
            <span>{tab.name}</span>
            {tabs.length > 1 && (
              <button onClick={(e) => removeTab(tab.id, e)} className="hover:text-red-400 text-xs ml-1 transition-colors p-0.5 rounded-full hover:bg-red-500/10">×</button>
            )}
          </div>
        ))}

        <button onClick={addTab} className="px-2.5 py-0.5 ml-2 bg-gray-800/60 hover:bg-gray-700 text-gray-300 rounded-lg font-bold text-sm transition-colors border border-gray-700/50">+</button>
      </div>

      {/* ターミナル表示エリア */}
      <div className="flex-1 w-full bg-black rounded-xl border border-gray-800/60 overflow-hidden relative shadow-inner">
        {tabs.map((tab) => (
          <div
            key={tab.id}
            className={`w-full h-full absolute inset-0 ${activeTabId === tab.id ? 'block' : 'hidden'}`}
          >
            <TerminalView tabId={tab.id} hostIp={hostIp} hostPort={hostPort} />
          </div>
        ))}
      </div>
    </div>
  );
}
