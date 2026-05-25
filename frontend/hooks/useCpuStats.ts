import { useState, useEffect } from 'react';
import { useApi } from './useApi';

export const useCpuStats = () => {
  const [cpu, setCpu] = useState<any>(null);
  const { fetchFromHost } = useApi();

  useEffect(() => {
    // 画面遷移時に通信そのものを叩き切るためのコントローラー
    const controller = new AbortController();

    const fetchCpu = async () => {
      try {
        const data = await fetchFromHost('/cpu-stats', controller.signal);
        setCpu(data);
      } catch (e: any) {
        // AbortErrorは無視してログを汚さない
        if (e.name !== 'AbortError') {
          console.error("CPU fetch error:", e);
        }
      }
    };

    // 初回取得
    fetchCpu();
    
    // 定期取得
    const interval = setInterval(fetchCpu, 3000);

    // アンマウント時にタイマー解除 ＋ 通信即時キャンセル
    return () => {
      controller.abort();
      clearInterval(interval);
    };
  }, [fetchFromHost]); // fetchFromHostが安定しているため、これでループが保護される

  return cpu;
};