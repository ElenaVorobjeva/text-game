// Тестовые фикстуры. Код приложения отсюда ничего не импортирует (это следит
// линтер, см. eslint.config.js): приложение строит движок из GameData той игры,
// которую выбрал игрок, а тестам достаточно одной готовой.
import rawGameData from "../data/quietGoodLife.json";
import { createGameEngine } from "../engine/gameEngine";
import type { GameData } from "../types/game";

// Флагманская игра — данные и движок, построенный из них.
export const quietGoodLife = rawGameData as GameData;

export const engine = createGameEngine(quietGoodLife);
