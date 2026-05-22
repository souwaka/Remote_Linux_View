'use client';

import { useState, useEffect } from 'react';
import { useApi } from './useApi'; // 共通フックをインポート

export const useTaskStats = () => {
  const [tasks, setTasks] = useState<any[]>([]);
  const { fetchFromHost } = useApi(); // 共通フックを利用

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        // 固定IPを排除し、動的なエンドポイントに変更
        const data = await fetchFromHost('/task-stats');
        setTasks(data.processes || []);
      } catch (e) {
        console.error("Task fetch error:", e);
      }
    };

    fetchTasks();
    const interval = setInterval(fetchTasks, 5000);
    return () => clearInterval(interval);
  }, [fetchFromHost]); // fetchFromHostを依存配列に追加

  return tasks;
};
