# ファイルパス: backend/logic/monitor_cpu.py
import psutil

def get_cpu_stats():
    try:
        temps = psutil.sensors_temperatures()
        temp_val = temps['coretemp'][0].current if 'coretemp' in temps else 40.0
    except:
        temp_val = 40.0
    return {
        "temp": round(float(temp_val), 1),
        "usage": float(psutil.cpu_percent(interval=None)),
        "cores": [float(c) for c in psutil.cpu_percent(percpu=True)]
    }
