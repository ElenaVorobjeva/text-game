import { createContext } from "react";

import type { getCurrentScene } from "../engine/gameEngine";
import type { Chapter, Choice, GameData, GameStateData } from "../types/game";

export type GameContextValue = {
  /** id активной игры (GameData.meta.id). Пока игра одна, но профиль и
   *  сохранения уже адресуются по нему — точка, которая станет динамической. */
  gameId: string;
  gameData: GameData;
  image: string; // изображение текущей сцены
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
