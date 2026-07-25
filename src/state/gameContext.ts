import { createContext } from "react";
import type { Chapter, Choice, GameStateData } from "../types/game";
import type { getCurrentScene } from "../engine/gameEngine";

export type GameContextValue = {
  gameState: GameStateData;
  scene: ReturnType<typeof getCurrentScene>;
  choices: Choice[];
  hasSave: boolean;
  startNewGame: () => void;
  continueGame: () => boolean;
  resetGame: () => void;
  choose: (choice: Choice) => void;
  /** Возвращает false, если в главу нельзя перейти — тогда экран менять не нужно. */
  chooseChapter: (chapter: Chapter) => boolean;
  canEnterChapter: (chapterId: number) => boolean;
};

export const GameContext = createContext<GameContextValue | null>(null);
