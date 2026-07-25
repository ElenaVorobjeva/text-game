import { useCallback, useEffect, useMemo, useState } from "react";
import {
  addCompletedEnding,
  loadUserProfile,
  USER_KEY,
} from "../user/userProfile";
import { UserContext } from "./userContext";

export function UserProvider({ children }: { children: React.ReactNode }) {
  // Ленивый инициализатор: чтение localStorage не должно идти в теле рендера.
  const [completedEndings, setCompletedEndings] = useState(
    () => loadUserProfile().completedEndings,
  );

  // Профиль кэшируется в состоянии, поэтому запись из соседней вкладки сама
  // сюда не долетит. Событие storage приходит только в остальные вкладки (не в
  // ту, что писала), так что зацикливания на собственной записи не будет.
  useEffect(() => {
    function syncFromStorage(event: StorageEvent) {
      // key === null — сработал clear(), затронуты все ключи
      if (event.key !== null && event.key !== USER_KEY) return;

      setCompletedEndings(loadUserProfile().completedEndings);
    }

    window.addEventListener("storage", syncFromStorage);

    return () => window.removeEventListener("storage", syncFromStorage);
  }, []);

  const hasCompletedEndings = completedEndings.length > 0;

  const isEndingCompleted = useCallback(
    (type: string) => completedEndings.includes(type),
    [completedEndings],
  );

  const completeEnding = useCallback((type: string) => {
    const next = addCompletedEnding(type);

    setCompletedEndings(next.completedEndings);
  }, []);

  const value = useMemo(
    () => ({
      completedEndings,
      hasCompletedEndings,
      isEndingCompleted,
      completeEnding,
    }),
    [completedEndings, hasCompletedEndings, isEndingCompleted, completeEnding],
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}
