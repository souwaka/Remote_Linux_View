# ファイルパス: backend/logic/monitor_resource.py
import psutil

def get_memory_stats():
    mem = psutil.virtual_memory()
    swap = psutil.swap_memory()
    return {
        "physical": {"usage": float(mem.percent), "used": round(mem.used / (1024**3), 1), "total": round(mem.total / (1024**3), 1)},
        "swap": {"usage": float(swap.percent), "used": round(swap.used / (1024**3), 1), "total": round(swap.total / (1024**3), 1)}
    }

def get_disk_stats():
    disk = psutil.disk_usage('/')
    return {"usage": float(disk.percent), "used": round(disk.used / (1024**3), 1), "total": round(disk.total / (1024**3), 1)}
