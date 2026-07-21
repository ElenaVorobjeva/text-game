import { describe, expect, test } from "vitest";
import type { Choice, GameStateData, Scene } from "../types/game";
import {
  createInitialGameState,
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
