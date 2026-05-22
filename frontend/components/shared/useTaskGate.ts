import { useState, useEffect } from 'react';
import { gatekeeper } from './TaskGatekeeper';

export function useTaskGate(taskId: string) {
  const [isAllowed, setIsAllowed] = useState(false);

  useEffect(() => {
    // マウント時に権限を要求
    const granted = gatekeeper.requestAccess(taskId);
    setIsAllowed(granted);

    // アンマウント時に権限を解放
    return () => {
      gatekeeper.releaseAccess(taskId);
    };
  }, [taskId]);

  return isAllowed;
}
