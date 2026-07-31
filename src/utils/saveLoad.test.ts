import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import type { GameStateData } from "../types/game";
import { USER_KEY, type UserData } from "../user/userProfile";

import { clearAllSaves, clearSave, loadGame, saveGame } from "./saveLoad";

// Тесты не поднимают jsdom: localStorage подменяется минимальной заглушкой
// в памяти.
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

// Две игры: проверяем, что сохранения не перетекают между ними.
const GAME = "quiet_good_life";
const OTHER = "another_game";

function makeState(overrides: Partial<GameStateData> = {}): GameStateData {
  return {
    currentSceneId: "chapter2_scene1",
    flags: { took_parcel: true },
    stats: { care: 1, connection: 2, calm: 3 },
    inventory: ["small_parcel"],
    visitedScenes: ["chapter1_scene1", "chapter2_scene1"],
    gameStatistic: {},
    ...overrides,
  };
}

// Записывает сырой объект пользователя — так тесты готовят «испорченные» и
// старые данные, минуя публичное API.
function writeUser(data: UserData) {
  localStorage.setItem(USER_KEY, JSON.stringify(data));
}

function readUser(): UserData {
  return JSON.parse(localStorage.getItem(USER_KEY) ?? "{}");
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

    saveGame(GAME, state);

    expect(loadGame(GAME)).toEqual(state);
  });

  test("stores the progress inside the user object", () => {
    saveGame(GAME, makeState());

    expect(readUser().games[GAME].progress).not.toBeNull();
  });

  test("a later save overwrites the previous one", () => {
    saveGame(GAME, makeState({ currentSceneId: "chapter1_scene1" }));
    saveGame(GAME, makeState({ currentSceneId: "chapter3_scene1" }));

    expect(loadGame(GAME)?.currentSceneId).toBe("chapter3_scene1");
  });

  test("keeps each game's save separate", () => {
    saveGame(GAME, makeState({ currentSceneId: "chapter1_scene1" }));
    saveGame(OTHER, makeState({ currentSceneId: "chapter3_scene1" }));

    expect(loadGame(GAME)?.currentSceneId).toBe("chapter1_scene1");
    expect(loadGame(OTHER)?.currentSceneId).toBe("chapter3_scene1");
  });

  test("a save does not touch a sibling game's completed endings", () => {
    writeUser({
      games: { [GAME]: { completedEndings: ["calm"], progress: null } },
    });

    saveGame(GAME, makeState());

    expect(readUser().games[GAME].completedEndings).toEqual(["calm"]);
  });
});

describe("loadGame", () => {
  test("returns null when there is no save", () => {
    expect(loadGame(GAME)).toBeNull();
  });

  test("returns null on corrupted storage instead of throwing", () => {
    localStorage.setItem(USER_KEY, "{ это не JSON");

    expect(loadGame(GAME)).toBeNull();
  });

  test("fills in fields missing from an older save", () => {
    // Сохранение формата до появления снимков глав (нет gameStatistic).
    writeUser({
      games: {
        [GAME]: {
          completedEndings: [],
          progress: {
            currentSceneId: "chapter2_scene1",
            flags: {},
            stats: { care: 1, connection: 1, calm: 1 },
            inventory: [],
            visitedScenes: ["chapter1_scene1", "chapter2_scene1"],
          } as unknown as GameStateData,
        },
      },
    });

    const loaded = loadGame(GAME);

    expect(loaded?.gameStatistic).toBeDefined();
    expect(loaded?.stats).toEqual({ care: 1, connection: 1, calm: 1 });
  });
});

describe("loadGame: content drift", () => {
  test("refuses a save pointing at a scene that no longer exists", () => {
    // Сцену переименовали в gameData.json, а сохранение осталось старым.
    // Без этой проверки getSceneById падает прямо в рендере — белый экран.
    saveGame(GAME, makeState({ currentSceneId: "chapter1_scene_removed" }));

    expect(loadGame(GAME)).toBeNull();
  });

  test("drops such a save so the next load starts clean", () => {
    saveGame(GAME, makeState({ currentSceneId: "chapter1_scene_removed" }));

    loadGame(GAME);

    expect(readUser().games[GAME].progress).toBeNull();
  });

  test("keeps a save whose scene still exists", () => {
    saveGame(GAME, makeState({ currentSceneId: "chapter3_scene1" }));

    expect(loadGame(GAME)?.currentSceneId).toBe("chapter3_scene1");
  });
});

describe("clearSave", () => {
  test("removes a game's save", () => {
    saveGame(GAME, makeState());

    clearSave(GAME);

    expect(loadGame(GAME)).toBeNull();
  });

  test("is safe to call when there is nothing saved", () => {
    expect(() => clearSave(GAME)).not.toThrow();
  });
});

describe("clearAllSaves", () => {
  test("removes saves of every game but keeps completed endings", () => {
    writeUser({
      games: { [GAME]: { completedEndings: ["calm"], progress: null } },
    });
    saveGame(GAME, makeState());
    saveGame(OTHER, makeState());

    clearAllSaves();

    expect(loadGame(GAME)).toBeNull();
    expect(loadGame(OTHER)).toBeNull();
    expect(readUser().games[GAME].completedEndings).toEqual(["calm"]);
  });
});
