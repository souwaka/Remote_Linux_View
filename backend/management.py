from fastapi import FastAPI
import subprocess
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/restart-backend")
def restart_backend():
    # 既存のメインバックエンドを確実に停止してから起動
    subprocess.run(["pkill", "-f", "main.py"])
    # 起動スクリプトを呼び出し
    subprocess.Popen(["/home/sou/Remote_Linux_View/backend/start_backend.sh"])
    return {"status": "restarting"}
