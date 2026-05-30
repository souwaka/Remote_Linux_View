'use client';

import { useState, useEffect } from 'react';
import { useHost } from '../context/HostContext';

export default function NetworkInfo() {
  const { hosts, addHost, removeHost, setCurrentHost, currentHost } = useHost();
  const [name, setName] = useState('');
  const [ip, setIp] = useState('');
  const [status, setStatus] = useState<'checking' | 'online' | 'offline'>('checking');

  // ヘルスチェック（ポート番号を動的に監視）
  useEffect(() => {
    if (!currentHost) return;

    let isMounted = true;
    const checkConnection = async () => {
      setStatus('checking');
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 2000);
        
        // ★修正点：IPアドレス側にコロンが含まれている場合はそのまま使用する
        const targetUrl = currentHost.ip.includes(':')
          ? `http://${currentHost.ip}/cpu-stats`
          : `http://${currentHost.ip}:${currentHost.port}/cpu-stats`;
        
        const res = await fetch(targetUrl, {
          signal: controller.signal
        });
        
        clearTimeout(timeout);
        if (isMounted) setStatus(res.ok ? 'online' : 'offline');
      } catch (e) {
        if (isMounted) setStatus('offline');
      }
    };

    checkConnection();
    const timer = setInterval(checkConnection, 5000);
    return () => { isMounted = false; clearInterval(timer); };
  }, [currentHost]);

  // ★修正点：ホスト接続時にポート番号が含まれているか判定するロジック
  const handleConnect = (host: { ip: string; name: string }) => {
    const hasPort = host.ip.includes(':');
    setCurrentHost({ 
      id: Date.now().toString(), 
      name: host.name, 
      ip: host.ip, 
      port: hasPort ? parseInt(host.ip.split(':')[1], 10) : 8000 
    });
  };

  // ★修正点：ホスト登録時にポート番号が手動入力されていれば切り分ける
  const handleAdd = () => {
    if (name && ip) {
      const hasPort = ip.includes(':');
      const baseIp = hasPort ? ip.split(':')[0] : ip;
      const targetPort = hasPort ? parseInt(ip.split(':')[1], 10) : 8000;

      addHost({ 
        id: Date.now().toString(), 
        name, 
        ip: ip, // 入力された値をそのまま保持
        port: targetPort,
        status: 'offline'
      });
      setName('');
      setIp('');
    }
  };

  return (
    <div className="p-6 space-y-8 h-full overflow-y-auto bg-[#0b0c16]">
      {/* 現在の監視対象 */}
      <section className="bg-[#161930] border border-gray-800 rounded-2xl p-6 shadow-xl">
        <h2 className="text-xs font-mono text-gray-500 uppercase tracking-widest mb-4">Current Monitoring Target</h2>
        {currentHost ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className={`w-3 h-3 rounded-full animate-pulse ${
                status === 'online' ? 'bg-green-500 shadow-[0_0_10px_#22c55e]' :
                status === 'offline' ? 'bg-red-500 shadow-[0_0_10px_#ef4444]' : 'bg-yellow-500'
              }`} />
              <div>
                <div className="text-2xl font-bold text-white flex items-center gap-3">
                  {currentHost.name}
                  <span className="text-xs font-mono text-gray-400 bg-gray-950 px-2 py-0.5 rounded border border-gray-800">
                    {/* ★修正点：コロンが重複して表示されるのを防止 */}
                    {currentHost.ip.includes(':') ? currentHost.ip : `${currentHost.ip}:${currentHost.port}`}
                  </span>
                </div>
                <p className="text-sm text-gray-400 mt-1 capitalize">Status: {status}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-gray-500">ホストが選択されていません</div>
        )}
      </section>

      {/* ホスト管理 */}
      <div className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-gray-300">新しいホストを登録</h3>
          <div className="flex gap-2 bg-[#161930] p-3 rounded-xl border border-gray-800">
            <input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} className="flex-1 p-2 bg-gray-950 rounded-lg text-white border border-gray-800 outline-none focus:border-blue-500" />
            <input placeholder="IP Address" value={ip} onChange={(e) => setIp(e.target.value)} className="flex-1 p-2 bg-gray-950 rounded-lg text-white border border-gray-800 outline-none focus:border-blue-500" />
            <button onClick={handleAdd} className="px-6 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-500 transition-all">追加</button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {hosts.map((host) => (
            <div key={host.id} className={`p-4 rounded-xl border transition-all ${currentHost?.id === host.id ? 'border-blue-500 bg-blue-900/10' : 'border-gray-800 bg-[#161930]'}`}>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-white">{host.name}</h3>
                  <p className="text-xs text-gray-500 font-mono">{host.ip}</p>
                </div>
                {currentHost?.id === host.id && <span className="text-[10px] bg-blue-600 text-white px-2 rounded-full">ACTIVE</span>}
              </div>
              
              <div className="flex gap-2">
                <button onClick={() => setCurrentHost(host)} className="flex-1 py-1.5 rounded-lg text-xs font-bold bg-gray-800 hover:bg-blue-600 transition-colors">切替</button>
                
                <button 
                  onClick={() => handleConnect(host)}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold bg-green-900/30 text-green-400 border border-green-900 hover:bg-green-600 hover:text-white transition-all"
                >
                  接続
                </button>
                
                <button onClick={() => removeHost(host.id)} className="p-1.5 bg-gray-800 text-gray-500 hover:text-red-400 rounded-lg">🗑️</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}