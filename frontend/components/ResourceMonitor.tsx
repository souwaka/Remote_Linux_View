'use client';

import { useResourceStats } from '../hooks/useResourceStats';

export default function ResourceMonitor() {
  // フックがアンマウント時に適切にクリーンアップされる設計である前提
  const stats = useResourceStats();

  if (!stats) {
    return (
      <div className="flex items-center justify-center h-full w-full text-gray-500 font-mono">
        INITIALIZING_RESOURCE_MONITOR...
      </div>
    );
  }

  const { memory, disk } = stats;

  return (
    <div className="flex flex-col h-full w-full p-6 bg-[#0b0c16] text-white overflow-hidden gap-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">Resource Status Dashboard</h1>
        <span className="text-[10px] text-green-500 font-mono animate-pulse">● LIVE_MONITORING</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
        {/* 1. ストレージ残量エリア */}
        <div className="bg-[#161930] p-6 rounded-2xl border border-gray-800/50 flex flex-col hover:border-gray-600 transition-colors">
          <h3 className="text-lg font-bold mb-4">ストレージ残量</h3>
          <div className="flex flex-col items-center justify-center flex-1">
            <div className="relative w-32 h-32 rounded-full border-8 border-gray-700 border-t-cyan-400 flex items-center justify-center">
              <span className="text-2xl font-bold">{disk.usage}%</span>
            </div>
            <p className="mt-4 text-sm text-gray-400">使用率</p>
            <p className="text-xl font-bold">{disk.used} GB / {disk.total} GB</p>
          </div>
        </div>

        {/* 2. 物理メモリ使用量エリア */}
        <div className="bg-[#161930] p-6 rounded-2xl border border-gray-800/50">
          <h3 className="text-lg font-bold mb-4">物理メモリ使用量</h3>
          <div className="space-y-6">
            <div className="w-full bg-gray-950 h-6 rounded-lg overflow-hidden border border-gray-800">
              <div 
                className="bg-cyan-500 h-full transition-all duration-500" 
                style={{ width: `${memory.physical.usage}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-sm text-gray-400">
              <span>Used: {memory.physical.usage}%</span>
              <span>Free: {100 - memory.physical.usage}%</span>
            </div>
            <p className="text-2xl font-bold">{memory.physical.used} GB / {memory.physical.total} GB</p>
          </div>
        </div>

        {/* 3. 仮想メモリ状況エリア */}
        <div className="bg-[#161930] p-6 rounded-2xl border border-gray-800/50">
          <h3 className="text-lg font-bold mb-4">仮想メモリ状況</h3>
          <div className="space-y-4">
            <div className="text-4xl font-bold text-purple-400">{memory.swap.usage}%</div>
            <p className="text-gray-400">Swap Used: ({memory.swap.used} GB) / {memory.swap.total} GB</p>
            <div className="border-t border-gray-800 pt-4 mt-4">
              <p className="text-xs text-gray-500 font-mono">STATUS: SWAP_ACTIVE</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
