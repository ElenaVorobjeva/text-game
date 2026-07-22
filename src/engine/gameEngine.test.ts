import { describe, expect, test } from "vitest";
import type { Choice, GameStateData, Scene } from "../types/game";
import {
  canEnterChapter,
  createInitialGameState,
  enterChapter,
  gameData,
  getAvailableChoices,
  getChapterById,
  getCurrentScene,
  getSceneById,
  getSceneImage,
  makeChoice,
} from "./gameEngine";

function makeState(overrides: Partial<GameStateData> = {}): GameStateData {
  return {
    currentSceneId: "chapter1_scene1",
    flags: {},
    stats: { care: 0, connection: 0, calm: 0 },
    inventory: [],
    visitedScenes: ["chapter1_scene1"],
    unlockedChapters: [1],
    unlockedEndings: [],
    gameStatistic: {},
    ...overrides,
  };
}

function makeChoiceData(overrides: Partial<Choice> = {}): Choice {
  return {
    id: "test_choice",
    text: "Тестовый вариант",
    nextSceneId: "chapter1_scene2",
    ...overrides,
  };
}

describe("getSceneById", () => {
  test("returns the scene with the requested id", () => {
    expect(getSceneById("chapter1_scene1").id).toBe("chapter1_scene1");
  });

  test("throws for an unknown scene id", () => {
    expect(() => getSceneById("no_such_scene")).toThrow(
      "Scene not found: no_such_scene",
    );
  });
});

describe("getChapterById", () => {
  test("returns the chapter with the requested id", () => {
    expect(getChapterById(1).id).toBe(1);
  });

  test("throws for an unknown chapter id", () => {
    expect(() => getChapterById(99)).toThrow("Chapter not found: 99");
  });
});

describe("getCurrentScene", () => {
  test("resolves the scene from currentSceneId", () => {
    const state = makeState({ currentSceneId: "chapter2_scene1" });

    expect(getCurrentScene(state).id).toBe("chapter2_scene1");
  });
});

describe("getAvailableChoices", () => {
  const scene = {
    id: "synthetic",
    chapter: 1,
    step: 1,
    title: "",
    text: "",
    choices: [
      makeChoiceData({ id: "always" }),
      makeChoiceData({
        id: "needs_calm",
        conditions: [{ type: "stat_gte", stat: "calm", value: 5 }],
      }),
      makeChoiceData({
        id: "needs_parcel",
        conditions: [{ type: "has_item", item: "small_parcel" }],
      }),
    ],
  } satisfies Scene;

  test("keeps only the choices whose conditions are met", () => {
    const state = makeState({ stats: { care: 0, connection: 0, calm: 5 } });

    expect(getAvailableChoices(scene, state).map((c) => c.id)).toEqual([
      "always",
      "needs_calm",
    ]);
  });

  test("keeps unconditional choices when nothing else is available", () => {
    const state = makeState();

    expect(getAvailableChoices(scene, state).map((c) => c.id)).toEqual([
      "always",
    ]);
  });
});

describe("makeChoice", () => {
  test("moves the player to the scene the choice points at", () => {
    const state = makeState();

    const result = makeChoice(
      makeChoiceData({ nextSceneId: "chapter1_scene2" }),
      state,
    );

    expect(result.currentSceneId).toBe("chapter1_scene2");
  });

  test("applies the effects of the choice", () => {
    const state = makeState();

    const result = makeChoice(
      makeChoiceData({
        effects: [{ type: "change_stat", stat: "calm", delta: 1 }],
      }),
      state,
    );

    expect(result.stats.calm).toBe(1);
  });

  test("records the new scene as visited", () => {
    const state = makeState();

    const result = makeChoice(
      makeChoiceData({ nextSceneId: "chapter1_scene2" }),
      state,
    );

    expect(result.visitedScenes).toContain("chapter1_scene2");
  });

  test("does not duplicate an already visited scene", () => {
    const state = makeState({
      visitedScenes: ["chapter1_scene1", "chapter1_scene2"],
    });

    const result = makeChoice(
      makeChoiceData({ nextSceneId: "chapter1_scene2" }),
      state,
    );

    expect(
      result.visitedScenes.filter((id) => id === "chapter1_scene2"),
    ).toHaveLength(1);
  });

  test("unlocks the chapter the new scene belongs to", () => {
    const state = makeState();

    const result = makeChoice(
      makeChoiceData({ nextSceneId: "chapter2_scene1" }),
      state,
    );

    expect(result.unlockedChapters).toEqual([1, 2]);
  });

  test("does not unlock a chapter twice", () => {
    const state = makeState({ unlockedChapters: [1, 2] });

    const result = makeChoice(
      makeChoiceData({ nextSceneId: "chapter2_scene1" }),
      state,
    );

    expect(result.unlockedChapters).toEqual([1, 2]);
  });

  test("does not add chapter 0 when moving to an ending", () => {
    const state = makeState();

    const result = makeChoice(
      makeChoiceData({ nextSceneId: "ending_calm" }),
      state,
    );

    // У концовок chapter === 0, это не настоящая глава
    expect(result.unlockedChapters).toEqual([1]);
  });

  test("unlocks the ending when moving to an ending scene", () => {
    const state = makeState();

    const result = makeChoice(
      makeChoiceData({ nextSceneId: "ending_calm" }),
      state,
    );

    expect(result.unlockedEndings).toContain("calm");
  });

  test("throws when the choice points at a scene that does not exist", () => {
    const state = makeState();

    expect(() =>
      makeChoice(makeChoiceData({ nextSceneId: "no_such_scene" }), state),
    ).toThrow("Scene not found: no_such_scene");
  });

  test("does not mutate the state it receives", () => {
    const state = makeState();

    makeChoice(
      makeChoiceData({
        nextSceneId: "chapter2_scene1",
        effects: [{ type: "change_stat", stat: "calm", delta: 1 }],
      }),
      state,
    );

    expect(state.currentSceneId).toBe("chapter1_scene1");
    expect(state.visitedScenes).toEqual(["chapter1_scene1"]);
    expect(state.unlockedChapters).toEqual([1]);
    expect(state.stats.calm).toBe(0);
  });
});

describe("makeChoice: chapter snapshots", () => {
  test("stores a snapshot when the player enters a new chapter", () => {
    const state = makeState();

    const result = makeChoice(
      makeChoiceData({ nextSceneId: "chapter2_scene1" }),
      state,
    );

    expect(result.gameStatistic[2]).toBeDefined();
  });

  test("does not store a snapshot when moving within the same chapter", () => {
    const state = makeState();

    const result = makeChoice(
      makeChoiceData({ nextSceneId: "chapter1_scene2" }),
      state,
    );

    expect(result.gameStatistic).toEqual(state.gameStatistic);
  });

  test("does not store a snapshot under chapter 0 when reaching an ending", () => {
    const state = makeState();

    const result = makeChoice(
      makeChoiceData({ nextSceneId: "ending_calm" }),
      state,
    );

    expect(result.gameStatistic[0]).toBeUndefined();
  });

  test("the snapshot already includes the effects of the transition choice", () => {
    const state = makeState();

    // Переходный выбор применяет эффекты до входа в главу — снимок должен
    // отражать состояние ПОСЛЕ них, иначе при возврате игрок их потеряет.
    const result = makeChoice(
      makeChoiceData({
        nextSceneId: "chapter2_scene1",
        effects: [
          { type: "change_stat", stat: "care", delta: 1 },
          { type: "set_flag", key: "helped_neighbor", value: true },
        ],
      }),
      state,
    );

    expect(result.gameStatistic[2]).toEqual({
      flags: { helped_neighbor: true },
      stats: { care: 1, connection: 0, calm: 0 },
      inventory: [],
    });
  });

  test("re-entering a chapter overwrites its snapshot", () => {
    const state = makeState({
      stats: { care: 5, connection: 0, calm: 0 },
      gameStatistic: {
        2: {
          flags: {},
          stats: { care: 0, connection: 0, calm: 0 },
          inventory: [],
        },
      },
    });

    const result = makeChoice(
      makeChoiceData({ nextSceneId: "chapter2_scene1" }),
      state,
    );

    expect(result.gameStatistic[2]?.stats.care).toBe(5);
  });

  test("keeps snapshots of the other chapters untouched", () => {
    const chapterOne = {
      flags: {},
      stats: { care: 0, connection: 0, calm: 0 },
      inventory: [],
    };
    const state = makeState({ gameStatistic: { 1: chapterOne } });

    const result = makeChoice(
      makeChoiceData({ nextSceneId: "chapter2_scene1" }),
      state,
    );

    expect(result.gameStatistic[1]).toEqual(chapterOne);
  });

  test("the snapshot does not share objects with the live state", () => {
    const state = makeState();

    const result = makeChoice(
      makeChoiceData({ nextSceneId: "chapter2_scene1" }),
      state,
    );

    expect(result.gameStatistic[2]?.flags).not.toBe(result.flags);
    expect(result.gameStatistic[2]?.stats).not.toBe(result.stats);
    expect(result.gameStatistic[2]?.inventory).not.toBe(result.inventory);
  });
});

describe("createInitialGameState", () => {
  test("starts at the scene declared in meta", () => {
    expect(createInitialGameState().currentSceneId).toBe(
      gameData.meta.startSceneId,
    );
  });

  test("marks the starting scene as visited", () => {
    expect(createInitialGameState().visitedScenes).toEqual([
      gameData.meta.startSceneId,
    ]);
  });

  test("opens only the first chapter and no endings", () => {
    const state = createInitialGameState();

    expect(state.unlockedChapters).toEqual([1]);
    expect(state.unlockedEndings).toEqual([]);
  });

  test("seeds a snapshot for the first chapter so it can be replayed", () => {
    const state = createInitialGameState();

    expect(state.gameStatistic[1]).toEqual({
      flags: state.flags,
      stats: state.stats,
      inventory: state.inventory,
    });
  });

  test("the first chapter snapshot does not share objects with the state", () => {
    const state = createInitialGameState();

    expect(state.gameStatistic[1]?.flags).not.toBe(state.flags);
    expect(state.gameStatistic[1]?.stats).not.toBe(state.stats);
    expect(state.gameStatistic[1]?.inventory).not.toBe(state.inventory);
  });

  test("two calls return independent states", () => {
    const first = createInitialGameState();
    const second = createInitialGameState();

    // Раньше поля возвращались ссылками на gameData.initialState,
    // и все начальные состояния делили одни и те же объекты.
    expect(first.flags).not.toBe(second.flags);
    expect(first.stats).not.toBe(second.stats);
    expect(first.inventory).not.toBe(second.inventory);
  });
});

describe("enterChapter", () => {
  const chapterTwo = getChapterById(2);

  function stateWithSnapshots(): GameStateData {
    return makeState({
      currentSceneId: "chapter3_scene2",
      flags: { rested_by_stream: true },
      stats: { care: 4, connection: 4, calm: 4 },
      inventory: ["red_apple"],
      unlockedChapters: [1, 2, 3],
      unlockedEndings: ["calm"],
      gameStatistic: {
        2: {
          flags: { helped_neighbor: true },
          stats: { care: 2, connection: 1, calm: 1 },
          inventory: ["fresh_pie"],
        },
      },
    });
  }

  test("moves the player to the first scene of the chapter", () => {
    const result = enterChapter(chapterTwo, stateWithSnapshots());

    expect(result?.currentSceneId).toBe(chapterTwo.startScene);
  });

  test("rolls the day back to the snapshot taken on entering the chapter", () => {
    const result = enterChapter(chapterTwo, stateWithSnapshots());

    expect(result?.stats).toEqual({ care: 2, connection: 1, calm: 1 });
    expect(result?.flags).toEqual({ helped_neighbor: true });
    expect(result?.inventory).toEqual(["fresh_pie"]);
  });

  test("keeps unlocked chapters and collected endings", () => {
    const result = enterChapter(chapterTwo, stateWithSnapshots());

    // Переигрывание не отбирает прогресс — иначе охота за концовками
    // превращалась бы в наказание.
    expect(result?.unlockedChapters).toEqual([1, 2, 3]);
    expect(result?.unlockedEndings).toEqual(["calm"]);
  });

  test("keeps every snapshot so the player can jump again", () => {
    const state = stateWithSnapshots();

    const result = enterChapter(chapterTwo, state);

    expect(result?.gameStatistic).toEqual(state.gameStatistic);
  });

  test("returns null for a chapter without a snapshot", () => {
    // Так выглядит сохранение, мигрированное со старого формата: глава
    // отмечена открытой, но снимка для неё нет.
    const state = makeState({
      unlockedChapters: [1, 2, 3],
      gameStatistic: {},
    });

    expect(enterChapter(chapterTwo, state)).toBeNull();
  });

  test("does not mutate the state it receives", () => {
    const state = stateWithSnapshots();

    enterChapter(chapterTwo, state);

    expect(state.currentSceneId).toBe("chapter3_scene2");
    expect(state.stats).toEqual({ care: 4, connection: 4, calm: 4 });
  });

  test("the restored state does not share objects with the snapshot", () => {
    const state = stateWithSnapshots();

    const result = enterChapter(chapterTwo, state);

    // Иначе дальнейшая игра могла бы переписать собственную точку возврата
    expect(result?.stats).not.toBe(state.gameStatistic[2]?.stats);
    expect(result?.flags).not.toBe(state.gameStatistic[2]?.flags);
    expect(result?.inventory).not.toBe(state.gameStatistic[2]?.inventory);
  });
});

describe("canEnterChapter", () => {
  test("is true when a snapshot exists", () => {
    const state = makeState({
      gameStatistic: {
        1: {
          flags: {},
          stats: { care: 0, connection: 0, calm: 0 },
          inventory: [],
        },
      },
    });

    expect(canEnterChapter(1, state)).toBe(true);
  });

  test("is false when the chapter has no snapshot, even if it is unlocked", () => {
    const state = makeState({ unlockedChapters: [1, 2], gameStatistic: {} });

    expect(canEnterChapter(2, state)).toBe(false);
  });
});

describe("getSceneImage", () => {
  test("takes the picture from the chapter for a regular scene", () => {
    const scene = getSceneById("chapter1_scene1");

    expect(getSceneImage(scene)).toBe(getChapterById(scene.chapter).image);
  });

  test("takes the picture from the scene itself for an ending", () => {
    const ending = getSceneById("ending_calm");

    expect(getSceneImage(ending)).toBe(ending.image);
  });
});
