import { useState, useEffect } from 'react';
import { useApi } from './useApi'; // 共通フックをインポート

export const useResourceStats = () => {
  const [stats, setStats] = useState<any>(null);
  const { fetchFromHost } = useApi(); // 共通フックを利用

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // 固定IPを排除し、動的なエンドポイントに変更
        const data = await fetchFromHost('/resource-stats');
        setStats(data);
      } catch (e) {
        console.error("Resource fetch error:", e);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 3000);
    return () => clearInterval(interval);
  }, [fetchFromHost]); // fetchFromHostを依存配列に追加

  return stats;
};
