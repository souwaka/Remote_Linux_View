# terminal.py
import pty
import os
import subprocess
import asyncio
from fastapi import WebSocket

async def run_terminal(websocket: WebSocket):
    # PTYの作成
    master, slave = pty.openpty()
    proc = subprocess.Popen(
        ["/bin/bash"],
        preexec_fn=os.setsid,
        stdin=slave,
        stdout=slave,
        stderr=slave,
        text=True
    )
    # slave側はプロセスが持っているので閉じる
    os.close(slave)

    async def reader():
        try:
            while True:
                data = os.read(master, 1024).decode("utf-8")
                if not data: break
                await websocket.send_text(data)
        except: pass

    async def writer():
        try:
            while True:
                data = await websocket.receive_text()
                os.write(master, data.encode("utf-8"))
        except: pass

    await asyncio.gather(reader(), writer())
