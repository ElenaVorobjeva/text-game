import { useCallback, useMemo, useState, type ReactNode } from "react";

import {
  canEnterChapter,
  createGameEngine,
  enterChapter,
  getAvailableChoices,
} from "../engine/gameEngine";
import type { Choice, GameData, GameStateData } from "../types/game";
import { loadUser, type UserData } from "../user/userStorage";
import { loadGame, saveGame, clearSave } from "../utils/saveLoad";

import { GameContext } from "./gameContext";

type Props = {
  initialData: UserData;
  gameData: GameData;
  children: ReactNode;
};

export function GameProvider({ initialData, gameData, children }: Props) {
  const engine = useMemo(() => createGameEngine(gameData), [gameData]);
  const gameId = gameData.meta.id;

  const [gameState, setGameState] = useState<GameStateData>(
    () =>
      loadGame(engine, initialData, gameId) ?? engine.createInitialGameState(),
  );

  const [hasSave, setHasSave] = useState(() =>
    Boolean(loadGame(engine, initialData, gameId)),
  );

  const scene = useMemo(
    () => engine.getCurrentScene(gameState),
    [engine, gameState],
  );
  const image = useMemo(() => engine.getSceneImage(scene), [engine, scene]);

  const choices = useMemo(
    () => getAvailableChoices(scene, gameState),
    [scene, gameState],
  );

  const startNewGame = useCallback(() => {
    const initialState = engine.createInitialGameState();

    saveGame(gameId, initialState);
    setGameState(initialState);
    setHasSave(true);
  }, [engine, gameId]);

  const continueGame = useCallback(() => {
    const saved = loadGame(engine, loadUser(), gameId);
    if (!saved) return false;

    setGameState(saved);
    setHasSave(true);

    return true;
  }, [engine, gameId]);

  const resetGame = useCallback(() => {
    clearSave(gameId);

    const initialState = engine.createInitialGameState();

    setGameState(initialState);
    setHasSave(false);
  }, [engine, gameId]);

  const choose = useCallback(
    (choice: Choice) => {
      const nextState = engine.makeChoice(choice, gameState);

      saveGame(gameId, nextState);
      setGameState(nextState);
      setHasSave(true);
    },
    [engine, gameId, gameState],
  );

  const chooseChapter = useCallback(
    (chapterId: number): boolean => {
      const next = enterChapter(engine.getChapterById(chapterId), gameState);

      if (!next) return false;

      saveGame(gameId, next);
      setGameState(next);

      return true;
    },
    [engine, gameId, gameState],
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
      gameData,
      image,
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
      gameData,
      gameId,
      image,
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
