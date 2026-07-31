import { useCallback, useMemo, useState, type ReactNode } from "react";

import {
  canEnterChapter,
  createInitialGameState,
  enterChapter,
  gameData,
  getAvailableChoices,
  getCurrentScene,
  makeChoice,
} from "../engine/gameEngine";
import type { Chapter, Choice, GameStateData } from "../types/game";
import { loadUser, type UserData } from "../user/userStorage";
import { loadGame, saveGame, clearSave } from "../utils/saveLoad";

import { GameContext } from "./gameContext";

// id активной игры: пока игра одна, берётся из контента. Позже здесь будет
// id выбранной игры. Модульная константа — стабильна, не нужна в зависимостях.
const gameId = gameData.meta.id;

type Props = {
  initialData: UserData;
  children: ReactNode;
};

export function GameProvider({ initialData, children }: Props) {
  const [gameState, setGameState] = useState<GameStateData>(
    () => loadGame(initialData, gameId) ?? createInitialGameState(),
  );

  const [hasSave, setHasSave] = useState(() =>
    Boolean(loadGame(initialData, gameId)),
  );

  const scene = useMemo(() => getCurrentScene(gameState), [gameState]);

  const choices = useMemo(
    () => getAvailableChoices(scene, gameState),
    [scene, gameState],
  );

  const startNewGame = useCallback(() => {
    const initialState = createInitialGameState();

    saveGame(gameId, initialState);
    setGameState(initialState);
    setHasSave(true);
  }, []);

  const continueGame = useCallback(() => {
    const saved = loadGame(loadUser(), gameId);
    if (!saved) return false;

    setGameState(saved);
    setHasSave(true);

    return true;
  }, []);

  const resetGame = useCallback(() => {
    clearSave(gameId);

    const initialState = createInitialGameState();

    setGameState(initialState);
    setHasSave(false);
  }, []);

  const choose = useCallback(
    (choice: Choice) => {
      const nextState = makeChoice(choice, gameState);

      saveGame(gameId, nextState);
      setGameState(nextState);
      setHasSave(true);
    },
    [gameState],
  );

  const chooseChapter = useCallback(
    (chapter: Chapter): boolean => {
      const next = enterChapter(chapter, gameState);

      if (!next) return false;

      saveGame(gameId, next);
      setGameState(next);

      return true;
    },
    [gameState],
  );

  // Локальное имя, чтобы не затенять одноимённую функцию движка: наружу она
  // всё равно уходит как canEnterChapter.
  const checkCanEnterChapter = useCallback(
    (chapterId: number) => canEnterChapter(chapterId, gameState),
    [gameState],
  );

  const value = useMemo(
    () => ({
      gameId,
      gameState,
      scene,
      choices,
      hasSave,
      startNewGame,
      continueGame,
      resetGame,
      choose,
      chooseChapter,
      canEnterChapter: checkCanEnterChapter,
    }),
    [
      gameState,
      scene,
      choices,
      hasSave,
      startNewGame,
      continueGame,
      resetGame,
      choose,
      chooseChapter,
      checkCanEnterChapter,
    ],
  );

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}
