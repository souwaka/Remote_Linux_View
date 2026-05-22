'use client';

import { useCpuStats } from '../hooks/useCpuStats';

export default function CpuMonitor() {
  const cpu = useCpuStats();

  if (!cpu) {
    return (
      <div className="flex items-center justify-center h-full w-full text-gray-500 font-mono">
        WAITING_FOR_CPU_DATA...
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full p-6 bg-[#0b0c16] text-white overflow-hidden gap-6">
      <div className="flex justify-between items-center shrink-0">
        <h1 className="text-2xl font-bold tracking-tight">🔥 CPU Status & Load</h1>
        <span className="text-[10px] text-orange-500 font-mono animate-pulse">● CORE_METRICS_LIVE</span>
      </div>

      {/* メインカード：温度と負荷 */}
      <div className="grid grid-cols-2 gap-6 flex-none">
        <div className="bg-[#161930] p-6 rounded-2xl border border-gray-800/50">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">CPU Temperature</h2>
          <div className="text-5xl font-black text-white">{cpu.temp}°C</div>
          <div className="w-full bg-gray-950 h-3 mt-4 rounded-full overflow-hidden border border-gray-800">
            <div 
              className="bg-rose-500 h-full transition-all duration-300" 
              style={{ width: `${Math.min(cpu.temp, 100)}%` }}
            ></div>
          </div>
        </div>

        <div className="bg-[#161930] p-6 rounded-2xl border border-gray-800/50">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">Total CPU Load</h2>
          <div className="text-5xl font-black text-white">{cpu.usage}%</div>
          <div className="w-full bg-gray-950 h-3 mt-4 rounded-full overflow-hidden border border-gray-800">
            <div 
              className="bg-emerald-500 h-full transition-all duration-300" 
              style={{ width: `${cpu.usage}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* コア負荷分布 */}
      <div className="flex-1 overflow-y-auto">
        <h2 className="text-lg font-bold mb-4">Core Distribution</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
          {cpu.cores && cpu.cores.map((load: number, index: number) => (
            <div key={index} className="bg-[#161930] p-4 rounded-xl border border-gray-800/50 text-center hover:border-cyan-900 transition-colors">
              <p className="text-[10px] text-gray-500 font-mono mb-1">CORE {index}</p>
              <p className="text-xl font-bold text-cyan-400 font-mono">{load}%</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
