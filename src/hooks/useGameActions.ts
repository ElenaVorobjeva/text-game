import { useCallback } from "react";
import { useNavigate } from "react-router";

import { useGame } from "../state/useGame";
import { gamePath } from "../utils/common";

// Действия «начать» и «перезапустить» вместе с переходом на нужный экран:
// раньше это были функции, которым каждый вызывающий передавал navigate и gameId.
export function useGameActions() {
  const navigate = useNavigate();
  const { gameId, startNewGame, resetGame } = useGame();

  const start = useCallback(() => {
    startNewGame();
    navigate(gamePath(gameId, "game"), { replace: true });
  }, [startNewGame, navigate, gameId]);

  const restart = useCallback(() => {
    resetGame();
    navigate(gamePath(gameId));
  }, [resetGame, navigate, gameId]);

  return { start, restart };
}
