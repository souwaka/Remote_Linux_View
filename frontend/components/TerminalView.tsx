'use client';

import { useEffect, useRef, useState } from 'react';
import { useTaskGate } from './shared/useTaskGate';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import { io, Socket } from 'socket.io-client';
import 'xterm/css/xterm.css';

interface TerminalViewProps {
  tabId: string;
  hostIp: string;
  hostPort: number;
}

export default function TerminalView({ tabId, hostIp, hostPort }: TerminalViewProps) {
  const terminalRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);
  const termInstance = useRef<Terminal | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);
  const inputBuffer = useRef("");

  const isAllowed = useTaskGate(`terminal-${tabId}`);
  const [isDOMReady, setIsDOMReady] = useState(false);

  useEffect(() => {
    if (terminalRef.current) setIsDOMReady(true);
  }, []);

  useEffect(() => {
    if (!isAllowed || !isDOMReady || !terminalRef.current) return;

    const term = new Terminal({
      cursorBlink: true,
      fontSize: 14,
      fontFamily: 'Courier New, Courier, monospace',
      theme: { background: '#000000', foreground: '#ffffff', cursor: '#4ade80' }
    });
    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    term.open(terminalRef.current);

    termInstance.current = term;
    fitAddonRef.current = fitAddon;

    const safeFit = () => {
      requestAnimationFrame(() => {
        if (termInstance.current && !((termInstance.current as any)._core._disposed)) {
          try { fitAddonRef.current?.fit(); } catch (e) {}
        }
      });
    };

    window.addEventListener('resize', safeFit);

    const socket = io(`http://${hostIp}:${hostPort}`, {
      query: { tabId: tabId },
      transports: ['websocket'],
      upgrade: false
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      safeFit();
      socket.emit('request_initial_output', { tabId });
    });

    socket.on('terminal_output', (data: any) => {
      if (data?.data && termInstance.current && !((termInstance.current as any)._core._disposed)) {
        termInstance.current.write(data.data);
      }
    });

    // --- 入力処理の最適化 ---
    term.onData((data) => {
      if (!socketRef.current?.connected) return;

      // 【高速化】印字可能な文字は即座に画面へエコーバック
      // これにより、通信を待たずに文字が入力されているように見える
      if (data.charCodeAt(0) >= 32 && data !== '\x7f') {
        term.write(data);
        inputBuffer.current += data;
      }

      // 送信ロジック
      if (data === '\r') {
        term.write('\r\n');
        socketRef.current.emit('terminal_input', { data: inputBuffer.current + '\r' });
        inputBuffer.current = "";
      } else if (data === '\x7f' || data === '\x08') {
        if (inputBuffer.current.length > 0) {
          inputBuffer.current = inputBuffer.current.slice(0, -1);
          term.write('\b \b');
        }
      } else if (data.charCodeAt(0) < 32) {
        socketRef.current.emit('terminal_input', { data: data });
      }
    });

    safeFit();

    return () => {
      window.removeEventListener('resize', safeFit);
      socket.disconnect();
      if (termInstance.current) {
        termInstance.current.dispose();
        termInstance.current = null;
      }
    };
  }, [isAllowed, isDOMReady, tabId, hostIp, hostPort]);

  return (
    <div
      ref={terminalRef}
      className="w-full h-full p-2 bg-black overflow-hidden"
      translate="no"
      data-lpignore="true"
    />
  );
}
