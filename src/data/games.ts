import type { GameData } from "../types/game";

import rawQuietGoodLife from "./quietGoodLife.json";
import rawShortWalk from "./shortWalk.json";

const quietGoodLife = rawQuietGoodLife as GameData;
const shortWalk = rawShortWalk as GameData;

// Все игры проекта. Единственное место, знающее, какие игры существуют, —
// под каталог и будущую ленивую загрузку.
export const games: Record<string, GameData> = {
  [quietGoodLife.meta.id]: quietGoodLife,
  [shortWalk.meta.id]: shortWalk,
};

// Единственная точка доступа к контенту игры. Когда дойдёт до ленивой загрузки,
// async-версия появится ровно здесь, а не размажется по коду.
export function getGameData(gameId: string): GameData | undefined {
  // gameId приходит из URL: без hasOwn «constructor» или «__proto__» нашли бы
  // свойство Object.prototype и выдали его за игру.
  return Object.hasOwn(games, gameId) ? games[gameId] : undefined;
}

export const gameList = Object.values(games);
