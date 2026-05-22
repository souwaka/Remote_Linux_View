import psutil
import os
import json

def load_custom_tasks():
    config_file = os.path.expanduser("~/.remote_linux_custom_tasks.json")
    if not os.path.exists(config_file):
        return []
    try:
        with open(config_file, 'r') as f:
            return json.load(f)
    except:
        return []

def get_running_processes():
    processes = []
    home_dir = os.path.expanduser("~")
    # カスタムリストを読み込み
    custom_names = load_custom_tasks()

    for proc in psutil.process_iter(['pid', 'name', 'cpu_percent', 'memory_info']):
        try:
            # name() は文字列を返すが、万が一Noneだった場合に備える
            proc_name = proc.name() or ""
            
            # exe() は権限不足でエラーになることがあるためtry-except内で扱う
            try:
                exe_path = proc.exe() or ""
            except (psutil.NoSuchProcess, psutil.AccessDenied):
                exe_path = ""

            # 判定条件
            # 1. パスベース判定（大文字小文字を区別しないように lower() を使用）
            path_check = home_dir in exe_path and ("scripts" in exe_path.lower() or "remote_linux_view" in exe_path.lower())
            
            # 2. 名前リスト判定（完全一致ではなく、リスト内の名称が含まれているかで柔軟に）
            name_check = any(c_name.lower() in proc_name.lower() for c_name in custom_names)
            
            is_custom = path_check or name_check

            processes.append({
                "pid": proc.pid, # 直接pidにアクセスする方が安全
                "name": proc_name,
                "cpu": proc.info['cpu_percent'] or 0.0,
                "mem": round(proc.info['memory_info'].rss / (1024**2), 1),
                "category": "custom" if is_custom else "general"
            })
        except (psutil.NoSuchProcess, psutil.AccessDenied, psutil.ZombieProcess):
            continue

    # ソートして返す
    return sorted(processes, key=lambda x: x['cpu'], reverse=True)[:10]
