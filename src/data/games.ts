import type { GameData } from "../types/game";

import rawQuietGoodLife from "./gameData.json";

const quietGoodLife = rawQuietGoodLife as GameData;

// Все игры проекта. Сейчас одна; сюда же лягут новые. Единственное место,
// знающее, какие игры существуют, — под будущий каталог и ленивую загрузку.
export const games: Record<string, GameData> = {
  [quietGoodLife.meta.id]: quietGoodLife,
};

// Игра по умолчанию: пока нет выбора игры, стартуем с неё (в 4b её задаст URL).
export const DEFAULT_GAME_ID = quietGoodLife.meta.id;

// Единственная точка доступа к контенту игры. Когда дойдёт до ленивой загрузки,
// async-версия появится ровно здесь, а не размажется по коду.
export function getGameData(gameId: string): GameData | undefined {
  return games[gameId];
}
