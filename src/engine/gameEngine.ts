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

const defaultEngine = createGameEngine(gameData);
export const {
  getSceneById,
  getCurrentScene,
  sceneExists,
  getChapterById,
  getSceneImage,
  makeChoice,
  createInitialGameState,
} = defaultEngine;

// С какой главы начинается игра: она открыта и имеет снимок с самого старта.
export const FIRST_CHAPTER = 1;

export type GameEngine = ReturnType<typeof createGameEngine>;

export function createGameEngine(data: GameData) {
  function getSceneById(sceneId: string): Scene {
    const scene = data.scenes.find((scene) => scene.id === sceneId);

    if (!scene) {
      throw new Error(`Scene not found: ${sceneId}`);
    }

    return scene;
  }

  function sceneExists(sceneId: string): boolean {
    return data.scenes.some((scene) => scene.id === sceneId);
  }

  function getChapterById(id: number): Chapter {
    const chapter = data.chapters.find((chapter) => chapter.id === id);

    if (!chapter) {
      throw new Error(`Chapter not found: ${id}`);
    }

    return chapter;
  }

  function getSceneImage(scene: Scene): string {
    if (scene.isEnding) {
      // Концовка: изображение хранится в сцене
      return scene.image || "";
    }

    // Сцена игры: изображение хранится в данных о соответствующей главе
    const chapter = getChapterById(scene.chapter);
    return chapter && chapter.image ? chapter.image : "";
  }

  function getCurrentScene(state: GameStateData): Scene {
    return getSceneById(state.currentSceneId);
  }

  function makeChoice(choice: Choice, state: GameStateData): GameStateData {
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

  function createInitialGameState(): GameStateData {
    return {
      currentSceneId: data.meta.startSceneId,
      ...snapshotOf(data.initialState),
      visitedScenes: [data.meta.startSceneId],
      // Второй вызов snapshotOf намеренный: снимок первой главы должен быть
      // независимой копией, а не теми же объектами, что в живом состоянии.
      gameStatistic: { [FIRST_CHAPTER]: snapshotOf(data.initialState) },
    };
  }

  return {
    data,
    getSceneById,
    sceneExists,
    getChapterById,
    getSceneImage,
    getCurrentScene,
    makeChoice,
    createInitialGameState,
  };
}

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

export function getAvailableChoices(
  scene: Scene,
  state: GameStateData,
): Choice[] {
  return scene.choices.filter((choice) =>
    areConditionsMet(choice.conditions, state),
  );
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
