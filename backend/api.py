from fastapi import APIRouter, HTTPException, Query
import os
import signal
import json
import subprocess
from commands import run_command
from logic.monitor_cpu import get_cpu_stats
from logic.monitor_resource import get_memory_stats, get_disk_stats
from logic.monitor_tasks import get_running_processes

router = APIRouter()
CONFIG_FILE = os.path.expanduser("~/.remote_linux_custom_tasks.json")
BASE_DIR = os.path.expanduser("~")

# --- カスタムタスク・ファイル管理など（省略なし） ---
def load_custom_tasks():
    if not os.path.exists(CONFIG_FILE): return []
    with open(CONFIG_FILE, 'r') as f:
        try: return json.load(f)
        except: return []

@router.get("/api/files")
async def list_files(path: str = Query("/", description="相対パス")):
    target_path = os.path.normpath(os.path.join(BASE_DIR, path.lstrip("/")))
    if not target_path.startswith(os.path.abspath(BASE_DIR)):
        raise HTTPException(status_code=403, detail="アクセス拒否")
    try:
        if not os.path.exists(target_path): raise HTTPException(status_code=404, detail="Not Found")
        files_data = []
        for entry in os.scandir(target_path):
            try:
                stat = entry.stat()
                files_data.append({
                    "name": entry.name, "type": "folder" if entry.is_dir() else "file",
                    "size": f"{stat.st_size / 1024:.1f} KB" if entry.is_file() else "-",
                    "status": "DIR" if entry.is_dir() else "FILE"
                })
            except: continue
        return {"path": path, "files": sorted(files_data, key=lambda x: x['type'])}
    except Exception as e: raise HTTPException(status_code=500, detail=str(e))

# --- システム制御（再起動・シャットダウン：復元済み） ---
@router.post("/api/system/{action}")
async def system_action(action: str):
    if action == "reboot":
        return run_command(["sudo", "/sbin/reboot"])
    elif action == "shutdown":
        return run_command(["sudo", "/sbin/shutdown", "-h", "now"])
    else:
        raise HTTPException(status_code=400, detail="Invalid action")

# --- リモコン機能（日本語入力対応・修正済み） ---
@router.post("/api/tv/open")
async def open_url(payload: dict):
    url = payload.get("url")
    tv_env = os.environ.copy()
    tv_env.update({
        "DISPLAY": ":0",
        "GTK_IM_MODULE": "fcitx",
        "XMODIFIERS": "@im=fcitx"
    })
    subprocess.Popen(["firefox", "--new-window", url], env=tv_env, start_new_session=True)
    return {"status": "success"}

@router.post("/api/tv/mouse")
async def mouse_action(payload: dict):
    action_type = payload.get("type")
    # xdotool実行用環境変数
    x_env = os.environ.copy()
    x_env["DISPLAY"] = ":0"
    try:
        if action_type == "move":
            subprocess.Popen(["xdotool", "mousemove_relative", "--", str(payload.get("dx", 0)), str(payload.get("dy", 0))], env=x_env)
        elif action_type == "click":
            subprocess.Popen(["xdotool", "click", "1"], env=x_env)
        elif action_type == "key":
            subprocess.Popen(["xdotool", "key", payload.get("key", "space")], env=x_env)
        return {"status": "success"}
    except Exception as e: raise HTTPException(status_code=500, detail=str(e))

# --- 監視系機能 ---
@router.get("/cpu-stats")
async def cpu_stats_api(): return get_cpu_stats()
@router.get("/resource-stats")
async def resource_stats_api(): return {"memory": get_memory_stats(), "disk": get_disk_stats()}
@router.get("/task-stats")
async def task_stats_api(): return {"processes": get_running_processes()}
@router.post("/kill-task/{pid}")
async def kill_task_api(pid: int):
    try: os.kill(pid, signal.SIGTERM); return {"status": "success", "pid": pid}
    except Exception as e: return {"status": "error", "message": str(e)}
