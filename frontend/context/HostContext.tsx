'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Host = { id: string; name: string; ip: string; port: number };

const HostContext = createContext<{
  currentHost: Host;
  setCurrentHost: (host: Host) => void;
  hosts: Host[];
  addHost: (host: Host) => void;
  removeHost: (id: string) => void;
}>({
  currentHost: { id: 'default', name: 'Main PC', ip: '192.168.43.56', port: 8000 },
  setCurrentHost: () => {},
  hosts: [],
  addHost: () => {},
  removeHost: () => {},
});

export function HostProvider({ children }: { children: ReactNode }) {
  const [hosts, setHosts] = useState<Host[]>([]);
  const [currentHost, setCurrentHost] = useState<Host>({ 
    id: 'default', name: 'Main PC', ip: '192.168.43.56', port: 8000 
  });

  // 初期ロード：localStorageからホスト一覧を読み込む
  useEffect(() => {
    const saved = localStorage.getItem('linux-hosts');
    if (saved) setHosts(JSON.parse(saved));
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
    <HostContext.Provider value={{ currentHost, setCurrentHost, hosts, addHost, removeHost }}>
      {children}
    </HostContext.Provider>
  );
}

export const useHost = () => useContext(HostContext);
