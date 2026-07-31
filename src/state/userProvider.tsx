import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { addCompletedEnding, loadUser, USER_KEY } from "../user/userProfile";

import { UserContext } from "./userContext";

type Props = {
  children: ReactNode;
};

export function UserProvider({ children }: Props) {
  // Ленивый инициализатор: чтение localStorage не должно идти в теле рендера.
  // Держим весь games-срез — источник правды о собранных концовках. Прогресс
  // в этом же срезе провайдер не читает: им ведает GameProvider.
  const [games, setGames] = useState(() => loadUser().games);

  // Профиль кэшируется в состоянии, поэтому запись из соседней вкладки сама
  // сюда не долетит. Событие storage приходит только в остальные вкладки (не в
  // ту, что писала), так что зацикливания на собственной записи не будет.
  useEffect(() => {
    function syncFromStorage(event: StorageEvent) {
      // key === null — сработал clear(), затронуты все ключи
      if (event.key !== null && event.key !== USER_KEY) return;

      setGames(loadUser().games);
    }

    window.addEventListener("storage", syncFromStorage);

    return () => window.removeEventListener("storage", syncFromStorage);
  }, []);

  const getCompletedEndings = useCallback(
    (gameId: string) => games[gameId]?.completedEndings ?? [],
    [games],
  );

  const hasCompletedEndings = useCallback(
    (gameId: string) => getCompletedEndings(gameId).length > 0,
    [getCompletedEndings],
  );

  const isEndingCompleted = useCallback(
    (gameId: string, endingType: string) =>
      getCompletedEndings(gameId).includes(endingType),
    [getCompletedEndings],
  );

  const completeEnding = useCallback((gameId: string, endingType: string) => {
    const next = addCompletedEnding(gameId, endingType);

    setGames(next.games);
  }, []);

  const value = useMemo(
    () => ({
      getCompletedEndings,
      hasCompletedEndings,
      isEndingCompleted,
      completeEnding,
    }),
    [
      getCompletedEndings,
      hasCompletedEndings,
      isEndingCompleted,
      completeEnding,
    ],
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}
