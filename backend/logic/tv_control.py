import subprocess
import time

class TvController:
    def __init__(self):
        # ウィンドウIDをキャッシュするための変数
        self.firefox_window_id = None

    def _ensure_firefox_active(self):
        """
        Firefoxをアクティブにする処理。
        IDをキャッシュすることで、毎回検索する負荷を排除する。
        """
        try:
            env = {"DISPLAY": ":0"}
            
            # キャッシュがない、またはIDが見つからない時だけ再検索
            if not self.firefox_window_id:
                # search の結果を保持
                result = subprocess.run(
                    ["xdotool", "search", "--onlyvisible", "--class", "firefox"],
                    capture_output=True, text=True, env=env
                )
                if result.returncode == 0:
                    # 最初のウィンドウIDを取得
                    self.firefox_window_id = result.stdout.splitlines()[0]
                else:
                    return # 見つからない場合は終了

            # キャッシュしたIDをアクティブ化
            subprocess.run(["xdotool", "windowactivate", self.firefox_window_id], env=env)
            
        except Exception:
            # 万が一エラーが起きたらキャッシュをクリアして次回再検索させる
            self.firefox_window_id = None

    def send_action(self, action: str):
        """
        リモコンからの物理キーコマンドを処理する
        """
        # 操作のたびにFirefoxを前面へ
        self._ensure_firefox_active()

        env = {"DISPLAY": ":0"}

        try:
            if action == "play_pause":
                subprocess.run(["xdotool", "key", "space"], env=env)
            elif action == "tab_next":
                subprocess.run(["xdotool", "key", "ctrl+Tab"], env=env)
            elif action == "tab_prev":
                subprocess.run(["xdotool", "key", "ctrl+shift+Tab"], env=env)
            elif action == "scroll_up":
                subprocess.run(["xdotool", "key", "Page_Up"], env=env)
            elif action == "scroll_down":
                subprocess.run(["xdotool", "key", "Page_Down"], env=env)
            elif action == "tab_key":
                subprocess.run(["xdotool", "key", "Tab"], env=env)
            elif action == "enter_key":
                subprocess.run(["xdotool", "key", "Return"], env=env)
            
            # 高速連続キー操作系もキャッシュのおかげで軽快になるはず
            elif action == "jump_to_subscriptions":
                for _ in range(15):
                    subprocess.run(["xdotool", "key", "Tab"], env=env)
                    time.sleep(0.02)
            elif action == "jump_to_mix_list":
                for _ in range(30):
                    subprocess.run(["xdotool", "key", "Tab"], env=env)
                    time.sleep(0.02)
            else:
                return {"status": "error", "message": "未知のアクション"}
            
            return {"status": "success"}

        except Exception as e:
            return {"status": "error", "message": str(e)}

    def get_current_tabs(self):
        return {"tabs": [{"title": "YouTube", "url": "https://www.youtube.com"}]}
