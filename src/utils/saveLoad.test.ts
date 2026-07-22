import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import type { GameStateData } from "../types/game";
import {
  SAVE_KEY,
  SAVE_VERSION,
  clearSave,
  loadGame,
  saveGame,
} from "./saveLoad";

// Тесты не поднимают jsdom: localStorage подменяется минимальной заглушкой
// в памяти. Как только появятся тесты компонентов, вместо неё будет environment.
function createLocalStorageStub() {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string): string | null => store[key] ?? null,
    setItem: (key: string, value: string): void => {
      store[key] = value;
    },
    removeItem: (key: string): void => {
      delete store[key];
    },
    clear: (): void => {
      store = {};
    },
  };
}

function makeState(overrides: Partial<GameStateData> = {}): GameStateData {
  return {
    currentSceneId: "chapter2_scene1",
    flags: { took_parcel: true },
    stats: { care: 1, connection: 2, calm: 3 },
    inventory: ["small_parcel"],
    visitedScenes: ["chapter1_scene1", "chapter2_scene1"],
    unlockedChapters: [1, 2],
    unlockedEndings: [],
    gameStatistic: {},
    ...overrides,
  };
}

beforeEach(() => {
  vi.stubGlobal("localStorage", createLocalStorageStub());
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("saveGame / loadGame", () => {
  test("a saved state is read back unchanged", () => {
    const state = makeState();

    saveGame(state);

    expect(loadGame()).toEqual(state);
  });

  test("saves under the documented key", () => {
    saveGame(makeState());

    expect(localStorage.getItem(SAVE_KEY)).not.toBeNull();
  });

  test("a later save overwrites the previous one", () => {
    saveGame(makeState({ currentSceneId: "chapter1_scene1" }));
    saveGame(makeState({ currentSceneId: "chapter3_scene1" }));

    expect(loadGame()?.currentSceneId).toBe("chapter3_scene1");
  });
});

describe("loadGame", () => {
  test("returns null when there is no save", () => {
    expect(loadGame()).toBeNull();
  });

  test("returns null on a corrupted save instead of throwing", () => {
    localStorage.setItem(SAVE_KEY, "{ это не JSON");

    expect(loadGame()).toBeNull();
  });

  test("drops a corrupted save so it cannot break the next load", () => {
    localStorage.setItem(SAVE_KEY, "{ это не JSON");

    loadGame();

    expect(localStorage.getItem(SAVE_KEY)).toBeNull();
  });
});

describe("loadGame: format migration", () => {
  test("stamps saves with the current format version", () => {
    saveGame(makeState());

    const raw = localStorage.getItem(SAVE_KEY) ?? "";

    expect(JSON.parse(raw).version).toBe(SAVE_VERSION);
  });

  test("does not leak the version field into the game state", () => {
    saveGame(makeState());

    expect(loadGame()).not.toHaveProperty("version");
  });

  test("fills in fields missing from an older save", () => {
    // Сохранение формата до появления снимков глав
    localStorage.setItem(
      SAVE_KEY,
      JSON.stringify({
        currentSceneId: "chapter2_scene1",
        flags: {},
        stats: { care: 1, connection: 1, calm: 1 },
        inventory: [],
        visitedScenes: ["chapter1_scene1", "chapter2_scene1"],
        unlockedChapters: [1, 2],
        unlockedEndings: [],
      }),
    );

    const loaded = loadGame();

    expect(loaded?.gameStatistic).toBeDefined();
    expect(loaded?.stats).toEqual({ care: 1, connection: 1, calm: 1 });
    expect(loaded?.unlockedChapters).toEqual([1, 2]);
  });

  test("refuses a save written by a newer build", () => {
    saveGame(makeState());
    const raw = JSON.parse(localStorage.getItem(SAVE_KEY) ?? "");
    localStorage.setItem(
      SAVE_KEY,
      JSON.stringify({ ...raw, version: SAVE_VERSION + 1 }),
    );

    expect(loadGame()).toBeNull();
    expect(localStorage.getItem(SAVE_KEY)).toBeNull();
  });
});

describe("loadGame: content drift", () => {
  test("refuses a save pointing at a scene that no longer exists", () => {
    // Сцену переименовали в gameData.json, а сохранение осталось старым.
    // Без этой проверки getSceneById падает прямо в рендере — белый экран.
    saveGame(makeState({ currentSceneId: "chapter1_scene_removed" }));

    expect(loadGame()).toBeNull();
  });

  test("drops such a save so the next load starts clean", () => {
    saveGame(makeState({ currentSceneId: "chapter1_scene_removed" }));

    loadGame();

    expect(localStorage.getItem(SAVE_KEY)).toBeNull();
  });

  test("keeps a save whose scene still exists", () => {
    saveGame(makeState({ currentSceneId: "chapter3_scene1" }));

    expect(loadGame()?.currentSceneId).toBe("chapter3_scene1");
  });
});

describe("clearSave", () => {
  test("removes a saved state", () => {
    saveGame(makeState());

    clearSave();

    expect(loadGame()).toBeNull();
  });

  test("is safe to call when there is nothing saved", () => {
    expect(() => clearSave()).not.toThrow();
  });
});
