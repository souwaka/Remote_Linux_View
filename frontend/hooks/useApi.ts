import { useHost } from '../context/HostContext';
import { useCallback, useState } from 'react';

export const useApi = () => {
  const { currentHost } = useHost();
  const [isError, setIsError] = useState(false); // 接続状態を管理

  const fetchFromHost = useCallback(async (endpoint: string) => {
    try {
      const url = `http://${currentHost.ip}:${currentHost.port}${endpoint}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error();
      setIsError(false); // 成功！
      return response.json();
    } catch (e) {
      setIsError(true); // 失敗！
      throw e;
    }
  }, [currentHost]);

  return { fetchFromHost, isError };
};
