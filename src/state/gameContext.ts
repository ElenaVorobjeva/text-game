import { createContext } from "react";

import type { Choice, GameData, GameStateData, Scene } from "../types/game";

export type GameContextValue = {
  /** id активной игры (GameData.meta.id). Пока игра одна, но профиль и
   *  сохранения уже адресуются по нему — точка, которая станет динамической. */
  gameId: string;
  gameData: GameData;
  image: string; // изображение текущей сцены
  gameState: GameStateData;
  scene: Scene;
  choices: Choice[];
  hasSave: boolean;
  startNewGame: () => void;
  continueGame: () => boolean;
  resetGame: () => void;
  choose: (choice: Choice) => void;
  /** Принимает id главы; false — если в главу нельзя перейти (экран менять не нужно). */
  chooseChapter: (chapterId: number) => boolean;
  canEnterChapter: (chapterId: number) => boolean;
};

export const GameContext = createContext<GameContextValue | null>(null);
