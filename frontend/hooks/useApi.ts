import { useHost } from '../context/HostContext';
import { useCallback, useState } from 'react';

export const useApi = () => {
  const { currentHost } = useHost();
  const [isError, setIsError] = useState(false);

  // signal を受け取れるようにし、依存を IP と Port に固定
  const fetchFromHost = useCallback(async (endpoint: string, signal?: AbortSignal) => {
    try {
      const url = `http://${currentHost.ip}:${currentHost.port}${endpoint}`;
      const response = await fetch(url, { signal });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      setIsError(false);
      return await response.json();
    } catch (e: any) {
      if (e.name !== 'AbortError') {
        setIsError(true);
        console.error(`API Fetch Error [${endpoint}]:`, e);
      }
      throw e;
    }
  }, [currentHost.ip, currentHost.port]);

  return { fetchFromHost, isError };
};