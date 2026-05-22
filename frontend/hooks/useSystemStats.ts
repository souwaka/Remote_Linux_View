import { useState, useEffect } from 'react';
import { useApi } from './useApi'; // 追加：共通フックをインポート

export const useSystemStats = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { fetchFromHost } = useApi(); // 追加：fetchFromHost を取得

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 修正：ハードコードされたURLを fetchFromHost に変更
        const result = await fetchFromHost('/cpu-stats');
        
        if (result && result.status === 'success') {
          setStats(result.data);
        }
      } catch (err) {
        console.error('Failed to fetch system stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 3000); // 3秒ごとに更新
    return () => clearInterval(interval);
  }, [fetchFromHost]); // 依存配列に fetchFromHost を追加（ホスト切替時に再実行される）

  return { stats, loading };
};
