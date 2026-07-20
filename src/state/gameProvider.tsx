import { useMemo, useState } from "react";
import type { Chapter, Choice, GameStateData } from "../types/game";
import {
  createInitialGameState,
  getAvailableChoices,
  getCurrentScene,
  makeChoice,
} from "../engine/gameEngine";
import { loadGame, saveGame, clearSave } from "../utils/saveLoad";
import { GameContext } from "./gameContext";

export function GameProvider({ children }: { children: React.ReactNode }) {
  const savedState = loadGame();

  const [gameState, setGameState] = useState<GameStateData>(
    savedState ?? createInitialGameState(),
  );

  const [hasSave, setHasSave] = useState(Boolean(savedState));

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

    if (!saved) return;

    setGameState(saved);
    setHasSave(true);
  }

  function resetGame() {
    clearSave();

    const initialState = createInitialGameState();

    setGameState(initialState);
    setHasSave(false);
  }

  function choose(choice: Choice) {
    const nextState = makeChoice(choice, gameState);

    saveGame(nextState);
    setGameState(nextState);
    setHasSave(true);
  }

  // TODO: механика перехода к выбранной главе — переключить currentSceneId
  // на chapter.startScene и увести игрока на игровой экран.
  function chooseChapter(_chapter: Chapter) {}

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
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}
