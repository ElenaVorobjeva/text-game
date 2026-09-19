import { useCallback, useMemo, useState, type ReactNode } from "react";

import {
  canEnterChapter,
  createGameEngine,
  enterChapter,
  getAvailableChoices,
} from "../engine/gameEngine";
import type { Choice, GameData, GameStateData } from "../types/game";
import { loadGame } from "../utils/saveLoad";

import { GameContext } from "./gameContext";
import { useUser } from "./useUser";

type Props = {
  gameData: GameData;
  children: ReactNode;
};

export function GameProvider({ gameData, children }: Props) {
  // Профиль и запись сохранений — у UserProvider: GameProvider не читает
  // localStorage сам.
  const { data, saveProgress, clearProgress, completeEnding } = useUser();
  const engine = useMemo(() => createGameEngine(gameData), [gameData]);
  const gameId = gameData.meta.id;

  // Одна загрузка на оба значения: loadGame с побочным эффектом (сброс
  // негодного сохранения) не должен вызываться дважды, а hasSave не должен
  // жить отдельно от того, что реально загрузили.
  const [initial] = useState(() => {
    const saved = loadGame(engine, data, gameId);

    return {
      gameState: saved ?? engine.createInitialGameState(),
      hasSave: saved !== null,
    };
  });

  const [gameState, setGameState] = useState<GameStateData>(initial.gameState);
  const [hasSave, setHasSave] = useState(initial.hasSave);

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

    saveProgress(gameId, initialState);
    setGameState(initialState);
    setHasSave(true);
  }, [engine, gameId, saveProgress]);

  const continueGame = useCallback(() => {
    const saved = loadGame(engine, data, gameId);
    if (!saved) return false;

    setGameState(saved);
    setHasSave(true);

    return true;
  }, [engine, gameId, data]);

  const resetGame = useCallback(() => {
    clearProgress(gameId);

    const initialState = engine.createInitialGameState();

    setGameState(initialState);
    setHasSave(false);
  }, [engine, gameId, clearProgress]);

  const choose = useCallback(
    (choice: Choice) => {
      const nextState = engine.makeChoice(choice, gameState);

      saveProgress(gameId, nextState);
      setGameState(nextState);
      setHasSave(true);

      // Правило домена: дошли до концовки — она открыта. Живёт здесь, а не в
      // эффекте страницы, чтобы не зависеть от того, какой экран смонтирован.
      const reached = engine.getCurrentScene(nextState);
      if (reached.isEnding && reached.endingType) {
        completeEnding(gameId, reached.endingType);
      }
    },
    [engine, gameId, gameState, saveProgress, completeEnding],
  );

  const chooseChapter = useCallback(
    (chapterId: number): boolean => {
      const next = enterChapter(engine.getChapterById(chapterId), gameState);

      if (!next) return false;

      saveProgress(gameId, next);
      setGameState(next);

      return true;
    },
    [engine, gameId, gameState, saveProgress],
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
