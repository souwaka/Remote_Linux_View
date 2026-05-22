// frontend/hooks/useCpuStats.ts
import { useState, useEffect } from 'react';
import { useApi } from './useApi'; // 共通フックをインポート

export const useCpuStats = () => {
  const [cpu, setCpu] = useState<any>(null);
  const { fetchFromHost } = useApi(); // 共通フックを利用

  useEffect(() => {
    const fetchCpu = async () => {
      try {
        // 固定IPを排除し、動的なエンドポイントに変更
        const data = await fetchFromHost('/cpu-stats');
        setCpu(data);
      } catch (e) {
        console.error("CPU fetch error:", e);
      }
    };

    fetchCpu();
    const interval = setInterval(fetchCpu, 3000);
    return () => clearInterval(interval);
  }, [fetchFromHost]); // fetchFromHostがホストの切り替えを検知して再取得

  return cpu;
};
