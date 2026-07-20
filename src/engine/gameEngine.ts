import rawGameData from "../data/gameData.json";
import type {
  Chapter,
  Choice,
  GameData,
  GameStateData,
  Scene,
} from "../types/game";
import { areConditionsMet } from "./conditions";
import { applyEffects } from "./effects";

export const gameData = rawGameData as GameData;

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
  const nextScene = getSceneById(choice.nextSceneId);

  const stateAfterEffects = applyEffects(choice.effects, state);

  return {
    ...stateAfterEffects,
    currentSceneId: nextScene.id,
    visitedScenes: Array.from(
      new Set([...stateAfterEffects.visitedScenes, nextScene.id]),
    ),
    unlockedChapters:
      nextScene.chapter > 0
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
  };
}

export function createInitialGameState(): GameStateData {
  return {
    currentSceneId: gameData.meta.startSceneId,
    flags: gameData.initialState.flags,
    stats: gameData.initialState.stats,
    inventory: gameData.initialState.inventory,
    visitedScenes: [gameData.meta.startSceneId],
    unlockedChapters: [1],
    unlockedEndings: [],
  };
}

export function getSceneImage(scene: Scene): string {
  if (scene.chapter === 0) {
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
