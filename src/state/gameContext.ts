import { createContext } from "react";
import type { Chapter, Choice, GameStateData } from "../types/game";
import type { getCurrentScene } from "../engine/gameEngine";

export type GameContextValue = {
  gameState: GameStateData;
  scene: ReturnType<typeof getCurrentScene>;
  choices: Choice[];
  hasSave: boolean;
  startNewGame: () => void;
  continueGame: () => void;
  resetGame: () => void;
  choose: (choice: Choice) => void;
  chooseChapter: (chapter: Chapter) => void;
};

export const GameContext = createContext<GameContextValue | null>(null);
