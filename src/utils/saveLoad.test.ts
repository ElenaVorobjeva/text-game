import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import type { GameStateData } from "../types/game";
import { clearSave, loadGame, saveGame } from "./saveLoad";

const SAVE_KEY = "quiet-good-life-save";

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
