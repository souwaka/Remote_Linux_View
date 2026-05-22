from fastapi import APIRouter
import os
import signal
from logic.monitor_cpu import get_cpu_stats
from logic.monitor_resource import get_memory_stats, get_disk_stats
from logic.monitor_tasks import get_running_processes

router = APIRouter()

# --- CPU監視用 ---
@router.get("/cpu-stats")
async def cpu_stats_api():
    return get_cpu_stats()

# --- リソース監視用 ---
@router.get("/resource-stats")
async def resource_stats_api():
    return {
        "memory": get_memory_stats(),
        "disk": get_disk_stats()
    }

# --- タスク(プロセス)監視用 ---
@router.get("/task-stats")
async def task_stats_api():
    return {
        "processes": get_running_processes()
    }

# --- プロセス終了用 ---
@router.post("/kill-task/{pid}")
async def kill_task_api(pid: int):
    try:
        # プロセスに終了シグナル (SIGTERM) を送信
        os.kill(pid, signal.SIGTERM)
        return {"status": "success", "pid": pid}
    except ProcessLookupError:
        return {"status": "error", "message": "Process not found"}
    except PermissionError:
        return {"status": "error", "message": "Permission denied"}
    except Exception as e:
        return {"status": "error", "message": str(e)}
