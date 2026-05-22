import uvicorn
import socketio
import asyncio
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api import router
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

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)
app.mount("/socket.io", sio_app)

term_manager = TerminalManager()

# --- ターミナル用イベントハンドラ ---

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
    
    # 即座に現在のバッファ内容をフロントエンドへ送る
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
