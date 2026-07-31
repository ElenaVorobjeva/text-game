import rawGameData from "../data/gameData.json";
import type {
  Chapter,
  ChapterSnapshot,
  Choice,
  GameData,
  GameStateData,
  Scene,
} from "../types/game";

import { areConditionsMet } from "./conditions";
import { applyEffects } from "./effects";

export const gameData = rawGameData as GameData;

// С какой главы начинается игра: она открыта и имеет снимок с самого старта.
export const FIRST_CHAPTER = 1;

// Снимок — независимая копия: снимки хранят историю, и общая ссылка с живым
// состоянием означала бы, что мутация где угодно молча перепишет прошлое.
// Параметр — минимальная форма ChapterSnapshot: под неё структурно подходят
// и GameStateData, и initialState из gameData, и уже готовый снимок.
export function snapshotOf(state: ChapterSnapshot): ChapterSnapshot {
  return {
    flags: { ...state.flags },
    stats: { ...state.stats },
    inventory: [...state.inventory],
  };
}

// Добавляет элемент в список, не создавая дубля; порядок сохраняется.
// Списки прогресса (посещённые сцены, открытые главы и концовки) пополняются
// одинаково, и раньше каждый из них разворачивал Set вручную прямо в литерале.
function withUnique<T>(list: T[], item: T): T[] {
  return Array.from(new Set([...list, item]));
}

export function getSceneById(sceneId: string): Scene {
  const scene = gameData.scenes.find((scene) => scene.id === sceneId);

  if (!scene) {
    throw new Error(`Scene not found: ${sceneId}`);
  }

  return scene;
}

export function getCurrentScene(state: GameStateData): Scene {
  return getSceneById(state.currentSceneId);
}

export function sceneExists(sceneId: string): boolean {
  return gameData.scenes.some((scene) => scene.id === sceneId);
}

export function getAvailableChoices(
  scene: Scene,
  state: GameStateData,
): Choice[] {
  return scene.choices.filter((choice) =>
    areConditionsMet(choice.conditions, state),
  );
}

export function makeChoice(
  choice: Choice,
  state: GameStateData,
): GameStateData {
  const currentScene = getSceneById(state.currentSceneId);
  const nextScene = getSceneById(choice.nextSceneId);

  const isRealChapter = !nextScene.isEnding;

  // Игрок входит в новую главу — запоминаем, с чем он в неё вошёл.
  const isEnteredNewChapter =
    isRealChapter && nextScene.chapter !== currentScene.chapter;

  const stateAfterEffects = applyEffects(choice.effects, state);

  return {
    ...stateAfterEffects,
    currentSceneId: nextScene.id,
    visitedScenes: withUnique(stateAfterEffects.visitedScenes, nextScene.id),
    gameStatistic: isEnteredNewChapter
      ? {
          ...stateAfterEffects.gameStatistic,
          [nextScene.chapter]: snapshotOf(stateAfterEffects),
        }
      : stateAfterEffects.gameStatistic,
  };
}

export function createInitialGameState(): GameStateData {
  return {
    currentSceneId: gameData.meta.startSceneId,
    ...snapshotOf(gameData.initialState),
    visitedScenes: [gameData.meta.startSceneId],
    // Второй вызов snapshotOf намеренный: снимок первой главы должен быть
    // независимой копией, а не теми же объектами, что в живом состоянии.
    gameStatistic: { [FIRST_CHAPTER]: snapshotOf(gameData.initialState) },
  };
}

// Возврат к ранее пройденной главе. Откатывает только «состояние дня» —
// флаги, характеристики и инвентарь на момент входа в главу. Открытые главы,
// собранные концовки и снимки остаются: переигрывание не отбирает прогресс.
// Возвращает null, если снимка нет, — значит, перейти в эту главу нельзя.
export function enterChapter(
  chapter: Chapter,
  state: GameStateData,
): GameStateData | null {
  const snapshot = state.gameStatistic[chapter.id];

  if (!snapshot) return null;

  return {
    ...state,
    ...snapshotOf(snapshot),
    currentSceneId: chapter.startScene,
  };
}

export function canEnterChapter(
  chapterId: number,
  state: GameStateData,
): boolean {
  return Boolean(state.gameStatistic[chapterId]);
}

export function getSceneImage(scene: Scene): string {
  if (scene.isEnding) {
    // Концовка: изображение хранится в сцене
    return scene.image || "";
  }

  // Сцена игры: изображение хранится в данных о соответствующей главе
  const chapter = getChapterById(scene.chapter);
  return chapter && chapter.image ? chapter.image : "";
}

export function getChapterById(id: number): Chapter {
  const chapter = gameData.chapters.find((chapter) => chapter.id === id);

  if (!chapter) {
    throw new Error(`Chapter not found: ${id}`);
  }

  return chapter;
}
