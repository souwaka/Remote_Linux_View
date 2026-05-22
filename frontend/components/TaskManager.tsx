'use client';

import { useState, useMemo } from 'react';
import { useTaskStats } from '../hooks/useTaskStats';

export default function TaskManager() {
  const tasks = useTaskStats(); // フックからタスクリストを取得
  const [sortBy, setSortBy] = useState<'cpu' | 'mem'>('cpu');

  // 安全なソート：tasks が空でもクラッシュしないようにする
  const sortedTasks = useMemo(() => {
    if (!tasks || tasks.length === 0) return [];
    return [...tasks].sort((a, b) => (b[sortBy] ?? 0) - (a[sortBy] ?? 0));
  }, [tasks, sortBy]);

  const killTask = async (pid: number, name: string) => {
    if (!confirm(`プロセス「${name}」 (PID: ${pid}) を強制終了しますか？`)) return;

    try {
      // API呼び出し：ハードコードを避けるため相対パスが理想的ですが、現状維持で記述
      const res = await fetch(`http://192.168.43.56:8000/kill-task/${pid}`, { method: 'POST' });
      const result = await res.json();
      if (result.status === 'success') {
        alert(`${name} を終了しました。`);
      } else {
        alert(`終了失敗: ${result.message}`);
      }
    } catch (e) {
      alert("サーバーとの通信に失敗しました。");
    }
  };

  return (
    <div className="p-6 h-full w-full bg-[#0b0c16] text-white overflow-hidden flex flex-col">
      <div className="flex justify-between items-center mb-6 shrink-0">
        <h2 className="text-xl font-bold tracking-tight">System Processes</h2>
        <div className="flex gap-1 bg-[#161930] p-1 rounded-xl border border-gray-800">
          <button
            onClick={() => setSortBy('cpu')}
            className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${sortBy === 'cpu' ? 'bg-orange-600 shadow-lg' : 'hover:bg-gray-800'}`}
          >
            CPU Load
          </button>
          <button
            onClick={() => setSortBy('mem')}
            className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${sortBy === 'mem' ? 'bg-cyan-600 shadow-lg' : 'hover:bg-gray-800'}`}
          >
            Memory
          </button>
        </div>
      </div>

      <div className="flex-1 bg-[#161930] rounded-2xl border border-gray-800/50 overflow-hidden shadow-2xl flex flex-col">
        <div className="overflow-y-auto flex-1">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-[#111425] text-gray-400 text-xs uppercase z-10">
              <tr>
                <th className="p-4 font-semibold">PID</th>
                <th className="p-4 font-semibold">Process Name</th>
                <th className="p-4 font-semibold text-right">CPU</th>
                <th className="p-4 font-semibold text-right">MEM</th>
                <th className="p-4 font-semibold text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/50">
              {sortedTasks.length > 0 ? (
                sortedTasks.map((task) => (
                  <tr key={task.pid} className="hover:bg-white/5 transition-colors group">
                    <td className="p-4 text-gray-500 font-mono text-sm">{task.pid}</td>
                    <td className="p-4 font-medium text-gray-200">{task.name}</td>
                    <td className="p-4 text-right text-orange-400 font-bold font-mono">{task.cpu}%</td>
                    <td className="p-4 text-right text-cyan-400 font-mono">{task.mem} MB</td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => killTask(task.pid, task.name)}
                        className="opacity-0 group-hover:opacity-100 bg-red-900/30 hover:bg-red-600 text-red-400 hover:text-white px-3 py-1 rounded-md text-xs font-bold border border-red-800 transition-all"
                      >
                        KILL
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="p-10 text-center text-gray-600 italic">
                    Loading process data...
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
