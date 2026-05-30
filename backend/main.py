import uvicorn
import socketio
import asyncio
import subprocess
import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from api import router
from file_manager import router as file_router  # 💡 新規作成するファイル管理用ルーターをインポート
from terminal_manager import TerminalManager
from urllib.parse import parse_qs

# 1. Socket.IO サーバーの初期化
sio = socketio.AsyncServer(
    async_mode='asgi',
    cors_allowed_origins="*",
    ping_timeout=60,
    ping_interval=25
)

sio_app = socketio.ASGIApp(sio)
app = FastAPI()

# CORS（防御壁）は元の全開放設定を維持！
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

<<<<<<< HEAD
# 元のAPIルーターと、新設したファイル管理用ルーターをそれぞれマウント
=======
# 元のAPIルーターとターミナル用のマウント
>>>>>>> 215d74ddb818deb2537130a90430af00a8861c98
app.include_router(router)
app.include_router(file_router)  # 💡 ここで新しいエンドポイントを一括有効化！
app.mount("/socket.io", sio_app)

term_manager = TerminalManager()

# --- 🎯【追加機能】手元からのマウス操作乗っ取り＆ショートカットAPI ---
# api.pyにルートを追加する代わりに、main.py側で確実にCORSを突破してキャッチします。

@app.post("/api/tv/mouse")
async def post_tv_mouse(payload: dict):
    """
    フロントのトラックパッドから届く移動量やタップを処理し、
    xdotoolでテレビのマウスを直接動かす最速ルート。
    """
    action_type = payload.get("type")
    env = {"DISPLAY": ":0"}

    try:
        if action_type == "move":
            dx = int(payload.get("dx", 0))
            dy = int(payload.get("dy", 0))

            # 応答速度最優先にするため、PopenでOSへ即時投げっぱなし
            subprocess.Popen(
                ["xdotool", "mousemove_relative", "--", str(dx), str(dy)],
                env=env, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, start_new_session=True
            )
            return {"status": "success"}

        elif action_type == "click":
            # マウスのその場左クリック
            subprocess.Popen(
                ["xdotool", "click", "1"],
                env=env, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, start_new_session=True
            )
            return {"status": "success"}

        raise HTTPException(status_code=400, detail="未知のマウスアクション")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ------------------------------------------------------------

# --- ターミナル用イベントハンドラ（元のロジックを完全維持） ---

async def monitor_terminal(tab_id):
    """バックグラウンドで出力監視を行うタスク"""
    while tab_id in term_manager.sessions:
        try:
            await asyncio.sleep(0.02)
            output = term_manager.read_output(tab_id)
            if output:
                await sio.emit('terminal_output', {'data': output}, room=tab_id)
        except Exception:
            break

@sio.event
async def connect(sid, environ):
    query_string = environ.get('QUERY_STRING', '')
    params = parse_qs(query_string)
    tab_id = params.get('tabId', [sid])[0]

    await sio.enter_room(sid, tab_id)
    await sio.save_session(sid, {'tab_id': tab_id})

    if tab_id not in term_manager.sessions:
        term_manager.start_session(tab_id)
        asyncio.create_task(monitor_terminal(tab_id))

@sio.event
async def request_initial_output(sid, data):
    """フロントエンドからの受信準備完了の合図を受けて最新状態を送信"""
    tab_id = data.get('tabId')
    print(f"[Backend] Client ready for tab: {tab_id}")

    output = term_manager.read_output(tab_id)
    if output:
        await sio.emit('terminal_output', {'data': output}, room=sid)

@sio.event
async def terminal_input(sid, data):
    session = await sio.get_session(sid)
    tab_id = session.get('tab_id') if session else None

    if tab_id and tab_id in term_manager.sessions:
        content = data.get('data', data) if isinstance(data, dict) else data
        term_manager.send_input(tab_id, content)

@sio.event
async def disconnect(sid):
    pass

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
