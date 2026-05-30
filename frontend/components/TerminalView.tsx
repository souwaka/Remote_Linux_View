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

    // ★配色を最適化したテーマ設定
    const term = new Terminal({
      cursorBlink: true,
      fontSize: 14,
      fontFamily: 'Courier New, Courier, monospace',
      theme: { 
        background: '#0d1117',      // ダークモードの背景に馴染ませる
        foreground: '#e4e4e4',      // 文字は目に優しいライトグレー
        cursor: '#ffffff',          // カーソルは白でクッキリ
        selectionBackground: '#ffffff33', // 選択範囲は半透明の白
        black: '#0d1117',
        green: '#a0a0a0',          // 緑を抑えてグレー調に
        brightGreen: '#ffffff',     // ハイライトは白
      }
    });
    
    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    term.open(terminalRef.current);

    termInstance.current = term;
    fitAddonRef.current = fitAddon;

    const viewport = terminalRef.current.querySelector('.xterm-viewport') as HTMLElement;
    if (viewport) viewport.style.overflowY = 'scroll';

    const safeFit = () => {
      if (termInstance.current && !((termInstance.current as any)._core._disposed)) {
        try { fitAddonRef.current?.fit(); } catch (e) {}
      }
    };

    const timer = setTimeout(safeFit, 300);
    window.addEventListener('resize', safeFit);

    // ★修正済みの接続先URL生成
    const socket = io(`http://${hostIp}`, {
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

    term.onData((data) => {
      if (!socketRef.current?.connected) return;

      if (data.charCodeAt(0) >= 32 && data !== '\x7f') {
        term.write(data);
        inputBuffer.current += data;
      }

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

    return () => {
      clearTimeout(timer);
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
      className="w-full h-full min-h-[400px] bg-[#0d1117] overflow-hidden p-2"
      translate="no"
      data-lpignore="true"
    />
  );
}