// frontend/components/shared/TaskGatekeeper.ts

class TaskGatekeeper {
  // activeTask を一つだけ保持するのではなく、
  // Set を使って「現在許可されている全タスクID」を管理する
  private activeTasks: Set<string> = new Set();

  // 実行権限を要求する
  requestAccess(taskId: string): boolean {
    // 常に許可を出し、管理リストに追加する（タブ毎の独立性を確保）
    this.activeTasks.add(taskId);
    console.log(`[Gatekeeper] ${taskId} granted access. Active count: ${this.activeTasks.size}`);
    return true;
  }

  // 権限を解放する（コンポーネントのアンマウント時に呼ばれる）
  releaseAccess(taskId: string) {
    if (this.activeTasks.has(taskId)) {
      this.activeTasks.delete(taskId);
      console.log(`[Gatekeeper] ${taskId} released. Active count: ${this.activeTasks.size}`);
    }
  }
}

// アプリケーション全体で一つのマネージャーを共有する
export const gatekeeper = new TaskGatekeeper();
