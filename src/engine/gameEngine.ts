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

// У концовок в gameData.json стоит chapter: 0 — это не настоящая глава,
// поэтому их не открывают в списке глав и не снимают для них снимок.
export const ENDINGS_CHAPTER = 0;

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

  const isRealChapter = nextScene.chapter !== ENDINGS_CHAPTER;

  // Игрок входит в новую главу — запоминаем, с чем он в неё вошёл.
  const isEnteredNewChapter =
    isRealChapter && nextScene.chapter !== currentScene.chapter;

  const stateAfterEffects = applyEffects(choice.effects, state);

  return {
    ...stateAfterEffects,
    currentSceneId: nextScene.id,
    visitedScenes: Array.from(
      new Set([...stateAfterEffects.visitedScenes, nextScene.id]),
    ),
    unlockedChapters: isRealChapter
      ? Array.from(
          new Set([...stateAfterEffects.unlockedChapters, nextScene.chapter]),
        )
      : stateAfterEffects.unlockedChapters,
    unlockedEndings:
      nextScene.isEnding && nextScene.endingType
        ? Array.from(
            new Set([
              ...stateAfterEffects.unlockedEndings,
              nextScene.endingType,
            ]),
          )
        : stateAfterEffects.unlockedEndings,
    gameStatistic: isEnteredNewChapter
      ? {
          ...stateAfterEffects.gameStatistic,
          [nextScene.chapter]: {
            flags: { ...stateAfterEffects.flags },
            stats: { ...stateAfterEffects.stats },
            inventory: [...stateAfterEffects.inventory],
          },
        }
      : stateAfterEffects.gameStatistic,
  };
}

export function createInitialGameState(): GameStateData {
  return {
    currentSceneId: gameData.meta.startSceneId,
    ...snapshotOf(gameData.initialState),
    visitedScenes: [gameData.meta.startSceneId],
    unlockedChapters: [FIRST_CHAPTER],
    unlockedEndings: [],
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
  if (scene.chapter === ENDINGS_CHAPTER) {
    // Концовка: изображение хранится в сцене
    return scene.image || "";
  } else {
    // Сцена игры: изображение хранится в данных о соотвествующей главе
    const chapter = getChapterById(scene.chapter);
    return chapter && chapter.image ? chapter.image : "";
  }
}

export function getChapterById(id: number): Chapter {
  const chapter = gameData.chapters.find((chapter) => chapter.id === id);

  if (!chapter) {
    throw new Error(`Chapter not found: ${id}`);
  }

  return chapter;
}
