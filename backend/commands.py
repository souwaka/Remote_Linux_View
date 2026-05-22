import subprocess

def run_command(command_list):
    try:
        # shell=Falseで安全に実行するよ
        result = subprocess.run(command_list, capture_output=True, text=True, check=True)
        return {"status": "ok", "output": result.stdout}
    except subprocess.CalledProcessError as e:
        return {"status": "error", "output": e.stderr}
    except Exception as e:
        return {"status": "error", "output": str(e)}
