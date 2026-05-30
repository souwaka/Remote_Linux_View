import { ollama } from 'ollama-ai-provider';
import { generateText } from 'ai'; // streamText から変更

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    const lastMessage = messages[messages.length - 1].content;

    const { text } = await generateText({
      model: ollama('gemma:2b'),
      system: "あなたは創さんのIDE『たまき要塞』の統括管理AIです。的確なシェルコマンドや診断手順を提示してください。",
      prompt: lastMessage,
      temperature: 0.3,
    });

    return new Response(JSON.stringify({ text }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error("AI Error:", error);
    return new Response(JSON.stringify({ error: "通信失敗" }), { status: 500 });
  }
}