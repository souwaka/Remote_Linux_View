import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function POST(req: Request) {
  try {
    const { command } = await req.json();
    // ここで安全なコマンドのみ実行するように制限をかけるのがポイント
    const { stdout, stderr } = await execAsync(command);
    return new Response(JSON.stringify({ stdout, stderr }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: String(error) }), { status: 500 });
  }
}