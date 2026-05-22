import psutil

def get_running_processes():
    processes = []
    # CPU使用率とメモリ使用量が多い順に上位10個を取得
    for proc in psutil.process_iter(['pid', 'name', 'cpu_percent', 'memory_info']):
        try:
            processes.append({
                "pid": proc.info['pid'],
                "name": proc.info['name'],
                "cpu": proc.info['cpu_percent'] or 0.0,
                "mem": round(proc.info['memory_info'].rss / (1024**2), 1)  # MB単位
            })
        except (psutil.NoSuchProcess, psutil.AccessDenied):
            continue
    
    # CPU使用率でソートして上位10を返す
    return sorted(processes, key=lambda x: x['cpu'], reverse=True)[:10]
