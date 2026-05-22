from fastapi import APIRouter, HTTPException, Query
import os
import signal
import json
from commands import run_command
from logic.monitor_cpu import get_cpu_stats
from logic.monitor_resource import get_memory_stats, get_disk_stats
from logic.monitor_tasks import get_running_processes

router = APIRouter()
CONFIG_FILE = os.path.expanduser("~/.remote_linux_custom_tasks.json")

# --- カスタムタスク管理用 ---
def load_custom_tasks():
    if not os.path.exists(CONFIG_FILE): return []
    with open(CONFIG_FILE, 'r') as f:
        try: return json.load(f)
        except: return []

@router.post("/api/custom-task")
async def add_custom_task(data: dict):
    task_name = data.get("name")
    tasks = load_custom_tasks()
    if task_name not in tasks:
        tasks.append(task_name)
        with open(CONFIG_FILE, 'w') as f: json.dump(tasks, f)
    return {"status": "success"}

@router.delete("/api/custom-task/{name}")
async def remove_custom_task(name: str):
    tasks = load_custom_tasks()
    if name in tasks:
        tasks.remove(name)
        with open(CONFIG_FILE, 'w') as f: json.dump(tasks, f)
    return {"status": "success"}

# --- ファイルエクスプローラー用 ---
BASE_DIR = os.path.expanduser("~")

@router.get("/api/files")
async def list_files(path: str = Query("/", description="相対パス")):
    target_path = os.path.normpath(os.path.join(BASE_DIR, path.lstrip("/")))
    if not target_path.startswith(os.path.abspath(BASE_DIR)):
        raise HTTPException(status_code=403, detail="アクセス拒否：範囲外のパスです")

    try:
        if not os.path.exists(target_path):
            raise HTTPException(status_code=404, detail="ディレクトリが見つかりません")

        files_data = []
        for entry in os.scandir(target_path):
            try:
                stat = entry.stat()
                files_data.append({
                    "name": entry.name,
                    "type": "folder" if entry.is_dir() else "file",
                    "size": f"{stat.st_size / 1024:.1f} KB" if entry.is_file() else "-",
                    "status": "DIR" if entry.is_dir() else "FILE"
                })
            except (PermissionError, OSError):
                continue
        return {"path": path, "files": sorted(files_data, key=lambda x: x['type'])}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/api/view-file")
async def view_file_api(path: str = Query(..., description="ファイルパス")):
    target_path = os.path.normpath(os.path.join(BASE_DIR, path.lstrip("/")))
    if not target_path.startswith(os.path.abspath(BASE_DIR)):
        raise HTTPException(status_code=403, detail="アクセス拒否")

    if not os.path.isfile(target_path):
        raise HTTPException(status_code=404, detail="ファイルが見つかりません")

    try:
        with open(target_path, 'r', encoding='utf-8', errors='replace') as f:
            content = f.read(100000)
            return {"content": content}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"読み込みエラー: {str(e)}")

# --- システム制御用 ---
@router.post("/api/system/{action}")
async def system_action(action: str):
    if action == "reboot":
        return run_command(["sudo", "reboot"])
    elif action == "shutdown":
        return run_command(["sudo", "shutdown", "-h", "now"])
    else:
        raise HTTPException(status_code=400, detail="Invalid action")

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
        os.kill(pid, signal.SIGTERM)
        return {"status": "success", "pid": pid}
    except Exception as e:
        return {"status": "error", "message": str(e)}
