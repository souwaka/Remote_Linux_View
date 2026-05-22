from components.monitor import get_cpu_stats

def get_system_stats():
    """システム統計情報の取得を統括する"""
    try:
        # ここに他のロジック(メモリ情報など)が増えたら追加していきます
        return {
            "status": "success",
            "data": {
                "cpu": get_cpu_stats(),
                # "memory": get_memory_stats(),  <- 今後こうやって増やせます
            }
        }
    except Exception as e:
        # ロジック側でエラーが起きても、呼び出し元をクラッシュさせない
        return {
            "status": "error",
            "message": f"Manager Error: {str(e)}"
        }
