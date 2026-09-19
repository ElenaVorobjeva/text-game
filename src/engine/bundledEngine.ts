import rawGameData from "../data/quietGoodLife.json";
import type { GameData } from "../types/game";

import { createGameEngine } from "./gameEngine";

// Движок вшитой флагманской игры. Приложение им не пользуется: GameProvider
// строит движок из GameData выбранной игры. Модуль нужен тестам, которым
// достаточно одной готовой игры.
export const gameData = rawGameData as GameData;

export const {
  getSceneById,
  getCurrentScene,
  sceneExists,
  getChapterById,
  getSceneImage,
  makeChoice,
  createInitialGameState,
} = createGameEngine(gameData);
