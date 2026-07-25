import { useCallback, useMemo, useState } from "react";
import { addCompletedEnding, loadUserProfile } from "../user/userProfile";
import { UserContext } from "./userContext";

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [completedEndings, setCompletedEndings] = useState(
    () => loadUserProfile().completedEndings,
  );

  const hasCompletedEndings = completedEndings.length > 0;

  const isEndingCompleted = useCallback(
    (type: string) => completedEndings.includes(type),
    [],
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
    [completedEndings],
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}
