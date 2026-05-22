import os
import pty
import selectors
import fcntl

class TerminalManager:
    def __init__(self):
        self.sessions = {}
        self.selector = selectors.DefaultSelector()

    def start_session(self, sid):
        # 疑似端末を作成
        master_fd, slave_fd = pty.openpty()
        
        pid = os.fork()
        if pid == 0:  # 子プロセス: シェルを起動
            os.setsid()
            os.dup2(slave_fd, 0)
            os.dup2(slave_fd, 1)
            os.dup2(slave_fd, 2)
            os.close(master_fd)
            os.execlp('/bin/bash', 'bash', '--login')
        
        # 親プロセス
        os.close(slave_fd)
        # 非ブロッキングに設定
        fcntl.fcntl(master_fd, fcntl.F_SETFL, os.O_NONBLOCK)
        
        self.sessions[sid] = {'fd': master_fd, 'pid': pid}
        return master_fd

    def send_input(self, sid, data):
        if sid in self.sessions:
            try:
                os.write(self.sessions[sid]['fd'], data.encode('utf-8'))
            except Exception as e:
                print(f"Error sending input: {e}")

    def read_output(self, sid):
        if sid in self.sessions:
            try:
                # 一気に読み出す（timeoutなしの完全非同期）
                return os.read(self.sessions[sid]['fd'], 4096).decode('utf-8', errors='ignore')
            except (OSError, IOError):
                return None
        return None

    def close_session(self, sid):
        if sid in self.sessions:
            os.close(self.sessions[sid]['fd'])
            os.waitpid(self.sessions[sid]['pid'], os.WNOHANG)
            del self.sessions[sid]
