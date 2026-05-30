import os
import subprocess
from fastapi import APIRouter, HTTPException, Query

router = APIRouter()
BASE_DIR = os.path.expanduser("~")

@router.get("/api/files/cat")
async def cat_file_api(path: str = Query(..., description="表示したいファイルの相対パス")):
    """【CAT機能】ファイルの中身を安全に読み込んでフロントに返す"""
    target_path = os.path.normpath(os.path.join(BASE_DIR, path.lstrip("/")))
    if not target_path.startswith(os.path.abspath(BASE_DIR)):
        raise HTTPException(status_code=403, detail="アクセス拒否")
    if not os.path.exists(target_path) or os.path.isdir(target_path):
        raise HTTPException(status_code=404, detail="File Not Found")
    try:
        file_size = os.path.getsize(target_path)
        if file_size > 2 * 1024 * 1024:  # 2MB超えは末尾だけ返す（ログ対策）
            res = subprocess.run(["tail", "-n", "200", target_path], capture_output=True, text=True, encoding="utf-8", errors="ignore")
            return {"path": path, "content": res.stdout, "truncated": True}
        with open(target_path, "r", encoding="utf-8", errors="ignore") as f:
            return {"path": path, "content": f.read(), "truncated": False}
    except Exception as e: raise HTTPException(status_code=500, detail=str(e))

@router.post("/api/files/save")
async def save_file_api(payload: dict):
    """【NANO機能】フロントで編集されたテキストでファイル上書き保存"""
    path = payload.get("path")
    content = payload.get("content", "")
    if not path: raise HTTPException(status_code=400, detail="Path missing")
    target_path = os.path.normpath(os.path.join(BASE_DIR, path.lstrip("/")))
    if not target_path.startswith(os.path.abspath(BASE_DIR)):
        raise HTTPException(status_code=403, detail="アクセス拒否")
    try:
        with open(target_path, "w", encoding="utf-8") as f: f.write(content)
        return {"status": "success"}
    except Exception as e: raise HTTPException(status_code=500, detail=str(e))

@router.post("/api/terminal/inject")
async def inject_command_api(payload: dict):
    """【🚀ターミナル連携】エクスプローラーから既存のターミナルへコマンドを流し込む"""
    tab_id = payload.get("tabId", "1")  
    command = payload.get("command")
    if not command: raise HTTPException(status_code=400, detail="Command missing")

    # main.py のメモリ空間にある term_manager を安全に参照
    from main import term_manager
    
    target_sid = None
    if tab_id in term_manager.sessions:
        target_sid = tab_id
    else:
        for sid in term_manager.sessions.keys():
            if str(tab_id) in str(sid):
                target_sid = sid
                break

    if not target_sid:
        raise HTTPException(status_code=404, detail=f"有効なターミナルセッション（{tab_id}）が見つかりません")

    try:
        term_manager.send_input(target_sid, f"{command}\n")
        return {"status": "success", "target_tab": target_sid}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
