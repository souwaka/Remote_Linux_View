'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallbackName: string;
}

interface State {
  hasError: boolean;
}

export default class ErrorBoundary extends Component<Props, State> {
  public state: State = { hasError: false };

  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(`[Error] ${this.props.fallbackName} 内でクラッシュが発生:`, error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 bg-red-950/40 border border-red-800 rounded-xl text-center text-red-300 font-mono text-xs">
          <p className="font-bold mb-1">⚠️ {this.props.fallbackName} CRASHED</p>
          <p className="text-[10px] text-red-400/70">このエリアは隔離されました。他機能は正常です。</p>
          <button 
            onClick={() => this.setState({ hasError: false })}
            className="mt-2 px-2 py-1 bg-red-900 hover:bg-red-800 text-white rounded text-[10px] transition-all"
          >
            再試行
          </button>
        </div>
      );
    }

    return this.children;
  }
}
