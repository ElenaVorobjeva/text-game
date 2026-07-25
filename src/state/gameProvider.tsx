import { useMemo, useState } from "react";
import type { Chapter, Choice, GameStateData } from "../types/game";
import {
  canEnterChapter,
  createInitialGameState,
  enterChapter,
  getAvailableChoices,
  getCurrentScene,
  makeChoice,
} from "../engine/gameEngine";
import { loadGame, saveGame, clearSave } from "../utils/saveLoad";
import { addCompletedEnding } from "../user/userProfile";
import { GameContext } from "./gameContext";

export function GameProvider({ children }: { children: React.ReactNode }) {
  // Ленивые инициализаторы: loadGame читает localStorage и может его очистить,
  // а побочным эффектам не место в теле рендера — React волен вызывать его
  // повторно (в StrictMode так и происходит).
  const [gameState, setGameState] = useState<GameStateData>(
    () => loadGame() ?? createInitialGameState(),
  );

  const [hasSave, setHasSave] = useState(() => Boolean(loadGame()));

  const scene = useMemo(() => getCurrentScene(gameState), [gameState]);

  const choices = useMemo(
    () => getAvailableChoices(scene, gameState),
    [scene, gameState],
  );

  function startNewGame() {
    const initialState = createInitialGameState();

    saveGame(initialState);
    setGameState(initialState);
    setHasSave(true);
  }

  function continueGame() {
    const saved = loadGame();
    if (!saved) return false;

    setGameState(saved);
    setHasSave(true);

    return true;
  }

  function resetGame() {
    clearSave();

    const initialState = createInitialGameState();

    setGameState(initialState);
    setHasSave(false);
  }

  function choose(choice: Choice) {
    const nextState = makeChoice(choice, gameState);

    // Дошли до концовки — отмечаем её в профиле пользователя. Это мета-прогресс:
    // он живёт отдельно от сохранения и переживает «Начать заново».
    const nextScene = getCurrentScene(nextState);
    if (nextScene.isEnding && nextScene.endingType) {
      addCompletedEnding(nextScene.endingType);
    }

    saveGame(nextState);
    setGameState(nextState);
    setHasSave(true);
  }

  function chooseChapter(chapter: Chapter): boolean {
    const next = enterChapter(chapter, gameState);

    if (!next) return false;

    saveGame(next);
    setGameState(next);

    return true;
  }

  const value = {
    gameState,
    scene,
    choices,
    hasSave,
    startNewGame,
    continueGame,
    resetGame,
    choose,
    chooseChapter,
    canEnterChapter: (chapterId: number) =>
      canEnterChapter(chapterId, gameState),
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}
