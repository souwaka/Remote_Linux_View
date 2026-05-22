import psutil

def get_cpu_stats():
    """CPU情報を取得する個別ロジック"""
    try:
        temps = psutil.sensors_temperatures()
        temp_val = temps['coretemp'][0].current if 'coretemp' in temps else 40.0
    except:
        temp_val = 40.0

    return {
        "temp": round(float(temp_val), 1),
        "usage": float(psutil.cpu_percent(interval=None)),
        "cores": [float(c) for c in psutil.cpu_percent(percpu=True)]
    }

def get_memory_stats():
    """メモリ情報を取得する個別ロジック"""
    mem = psutil.virtual_memory()
    swap = psutil.swap_memory()
    return {
        "physical": {
            "usage": float(mem.percent),
            "used": round(mem.used / (1024**3), 1),
            "total": round(mem.total / (1024**3), 1)
        },
        "swap": {
            "usage": float(swap.percent),
            "used": round(swap.used / (1024**3), 1),
            "total": round(swap.total / (1024**3), 1)
        }
    }

def get_disk_stats():
    """ストレージ情報を取得する個別ロジック"""
    disk = psutil.disk_usage('/')
    return {
        "usage": float(disk.percent),
        "used": round(disk.used / (1024**3), 1),
        "total": round(disk.total / (1024**3), 1)
    }
