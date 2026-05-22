'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// status を追加して、オンラインかオフラインかを管理できるようにします
export type Host = { 
  id: string; 
  name: string; 
  ip: string; 
  port: number;
  status: 'online' | 'offline'; 
};

const HostContext = createContext<{
  currentHost: Host;
  setCurrentHost: (host: Host) => void;
  hosts: Host[];
  addHost: (host: Host) => void;
  removeHost: (id: string) => void;
  updateHostStatus: (id: string, status: 'online' | 'offline') => void;
  checkHostStatus: (host: Host) => Promise<'online' | 'offline'>; // 接続確認用関数
}>({
  currentHost: { id: 'default', name: 'Main PC', ip: '127.0.0.1', port: 8000, status: 'offline' },
  setCurrentHost: () => {},
  hosts: [],
  addHost: () => {},
  removeHost: () => {},
  updateHostStatus: () => {},
  checkHostStatus: async () => 'offline',
});

export function HostProvider({ children }: { children: ReactNode }) {
  const [hosts, setHosts] = useState<Host[]>([]);
  const [currentHost, setCurrentHost] = useState<Host>({ 
    id: 'default', name: 'Main PC', ip: '127.0.0.1', port: 8000, status: 'offline' 
  });

  // 接続確認関数（各ホストに対して ping 的なリクエストを送る）
  const checkHostStatus = async (host: Host): Promise<'online' | 'offline'> => {
    try {
      // APIの /health エンドポイント等にアクセスして確認
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), 3000); // 3秒でタイムアウト
      
      const response = await fetch(`http://${host.ip}:${host.port}/health`, { 
        signal: controller.signal 
      });
      clearTimeout(id);
      
      return response.ok ? 'online' : 'offline';
    } catch (e) {
      return 'offline';
    }
  };

  const updateHostStatus = (id: string, status: 'online' | 'offline') => {
    setHosts(prev => prev.map(h => h.id === id ? { ...h, status } : h));
    if (currentHost.id === id) {
      setCurrentHost(prev => ({ ...prev, status }));
    }
  };

  useEffect(() => {
    const saved = localStorage.getItem('linux-hosts');
    if (saved) {
      const parsedHosts = JSON.parse(saved);
      setHosts(parsedHosts);
      if (parsedHosts.length > 0) setCurrentHost(parsedHosts[0]);
    }
  }, []);

  const addHost = (host: Host) => {
    const newHosts = [...hosts, host];
    setHosts(newHosts);
    localStorage.setItem('linux-hosts', JSON.stringify(newHosts));
  };

  const removeHost = (id: string) => {
    const newHosts = hosts.filter(h => h.id !== id);
    setHosts(newHosts);
    localStorage.setItem('linux-hosts', JSON.stringify(newHosts));
  };

  return (
    <HostContext.Provider value={{ currentHost, setCurrentHost, hosts, addHost, removeHost, updateHostStatus, checkHostStatus }}>
      {children}
    </HostContext.Provider>
  );
}

export const useHost = () => useContext(HostContext);