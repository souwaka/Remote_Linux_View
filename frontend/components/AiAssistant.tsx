'use client';
import { useState } from 'react';

export default function AiAssistant() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<{role: string, content: string}[]>([]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMsg = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput("");

    try {
      // 1. Ollama (司令塔) に指示を投げる
      const res = await fetch('http://127.0.0.1:11434/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'gemma2:2b',
          messages: [
            { role: 'system', content: 'あなたは「たまき要塞」の統括管理AIです。Git操作が必要な場合、"GIT_EXEC: [コマンド]" という形式で出力してください。それ以外は丁寧な日本語で回答してください。' },
            { role: 'user', content: input }
          ],
          stream: false
        }),
      });

      const data = await res.json();
      const aiContent = data.message.content;

      // 2. 「GIT_EXEC」命令が含まれているか判定
      if (aiContent.includes('GIT_EXEC:')) {
        const command = aiContent.split('GIT_EXEC:')[1].trim();
        setMessages(prev => [...prev, { role: 'assistant', content: `[システム実行中] ${command}` }]);
        
        // ここでバックエンドのGit APIを叩く（前述の route.ts 実装が必要です）
        const gitRes = await fetch('/api/git', {
          method: 'POST',
          body: JSON.stringify({ command })
        });
        const gitData = await gitRes.json();
        setMessages(prev => [...prev, { role: 'assistant', content: `結果: ${gitData.stdout || gitData.stderr}` }]);
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: aiContent }]);
      }

    } catch (err) {
      console.error("通信失敗:", err);
      setMessages(prev => [...prev, { role: 'assistant', content: "通信エラーだ。Ollamaを確認してくれ。" }]);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#161930] text-white">
      <div className="flex-1 p-4 overflow-y-auto">
        {messages.map((m, i) => (
          <div key={i} className={`mb-2 ${m.role === 'user' ? 'text-blue-300' : 'text-green-300'}`}>
            {m.role === 'user' ? '創: ' : 'AI: '}{m.content}
          </div>
        ))}
      </div>
      <div className="p-4 border-t border-gray-700 flex gap-2">
        <input
          className="flex-1 bg-[#0f1120] p-3 border border-gray-600 rounded"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Gitのバックアップをして..."
        />
        <button onClick={sendMessage} className="bg-purple-600 px-6 rounded hover:bg-purple-700">送信</button>
      </div>
    </div>
  );
}