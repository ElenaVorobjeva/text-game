import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { createGameEngine, gameData } from "../engine/gameEngine";
import type { GameData, GameStateData } from "../types/game";
import { loadUser, USER_KEY, type UserData } from "../user/userStorage";

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

// Движок вшитой игры — им валидируется загрузка в большинстве тестов.
const engine = createGameEngine(gameData);

// Вторая игра со своей сценой — для проверки, что loadGame валидирует по
// переданному движку, а не по вшитому.
const otherGame: GameData = {
  meta: {
    id: "other_game",
    title: "Другая игра",
    version: "1",
    startSceneId: "other_start",
    cover: "",
    description: "",
  },
  initialState: {
    flags: {},
    stats: { care: 0, connection: 0, calm: 0 },
    inventory: [],
    visitedScenes: [],
  },
  chapters: [{ id: 1, title: "Глава", image: "", startScene: "other_start" }],
  scenes: [
    {
      id: "other_start",
      chapter: 1,
      step: 1,
      title: "Старт другой игры",
      text: "…",
      choices: [],
    },
  ],
};

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

    expect(loadGame(engine, loadUser(), GAME)).toEqual(state);
  });

  test("stores the progress inside the user object", () => {
    saveGame(GAME, makeState());

    expect(readUser().games[GAME].progress).not.toBeNull();
  });

  test("a later save overwrites the previous one", () => {
    saveGame(GAME, makeState({ currentSceneId: "chapter1_scene1" }));
    saveGame(GAME, makeState({ currentSceneId: "chapter3_scene1" }));

    expect(loadGame(engine, loadUser(), GAME)?.currentSceneId).toBe(
      "chapter3_scene1",
    );
  });

  test("keeps each game's save separate", () => {
    saveGame(GAME, makeState({ currentSceneId: "chapter1_scene1" }));
    saveGame(OTHER, makeState({ currentSceneId: "chapter3_scene1" }));

    expect(loadGame(engine, loadUser(), GAME)?.currentSceneId).toBe(
      "chapter1_scene1",
    );
    expect(loadGame(engine, loadUser(), OTHER)?.currentSceneId).toBe(
      "chapter3_scene1",
    );
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
    expect(loadGame(engine, loadUser(), GAME)).toBeNull();
  });

  test("returns null on corrupted storage instead of throwing", () => {
    localStorage.setItem(USER_KEY, "{ это не JSON");

    expect(loadGame(engine, loadUser(), GAME)).toBeNull();
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

    const loaded = loadGame(engine, loadUser(), GAME);

    expect(loaded?.gameStatistic).toBeDefined();
    expect(loaded?.stats).toEqual({ care: 1, connection: 1, calm: 1 });
  });
});

describe("loadGame: malformed progress", () => {
  // Форма, при которой рендер или обработчик клика иначе бросили бы исключение.
  const broken: Array<[string, Partial<Record<keyof GameStateData, unknown>>]> =
    [
      ["flags is null", { flags: null }],
      ["stats is a string", { stats: "oops" }],
      [
        "a stat is not a number",
        { stats: { care: "1", connection: 2, calm: 3 } },
      ],
      ["inventory is not an array", { inventory: {} }],
      ["visitedScenes is not an array", { visitedScenes: "chapter1_scene1" }],
      ["gameStatistic is not an object", { gameStatistic: [] }],
      [
        "a chapter snapshot has no inventory",
        { gameStatistic: { 1: { flags: {}, stats: {} } } },
      ],
    ];

  test.each(broken)("discards a save where %s", (_name, patch) => {
    writeUser({
      games: {
        [GAME]: {
          completedEndings: [],
          progress: { ...makeState(), ...patch } as unknown as GameStateData,
        },
      },
    });

    expect(loadGame(engine, loadUser(), GAME)).toBeNull();
    expect(readUser().games[GAME].progress).toBeNull();
  });
});

describe("loadGame: content drift", () => {
  test("refuses a save pointing at a scene that no longer exists", () => {
    // Сцену переименовали в gameData.json, а сохранение осталось старым.
    // Без этой проверки getSceneById падает прямо в рендере — белый экран.
    saveGame(GAME, makeState({ currentSceneId: "chapter1_scene_removed" }));

    expect(loadGame(engine, loadUser(), GAME)).toBeNull();
  });

  test("drops such a save so the next load starts clean", () => {
    saveGame(GAME, makeState({ currentSceneId: "chapter1_scene_removed" }));

    loadGame(engine, loadUser(), GAME);

    expect(readUser().games[GAME].progress).toBeNull();
  });

  test("keeps a save whose scene still exists", () => {
    saveGame(GAME, makeState({ currentSceneId: "chapter3_scene1" }));

    expect(loadGame(engine, loadUser(), GAME)?.currentSceneId).toBe(
      "chapter3_scene1",
    );
  });
});

describe("loadGame: validates against the passed engine", () => {
  test("accepts a scene that exists in the given game but not the bundled one", () => {
    const other = createGameEngine(otherGame);
    saveGame(GAME, makeState({ currentSceneId: "other_start" }));

    // Вшитый движок такой сцены не знает и отбросил бы сохранение (null);
    // движок otherGame её знает — сохранение принимается.
    expect(loadGame(other, loadUser(), GAME)?.currentSceneId).toBe(
      "other_start",
    );
  });
});

describe("clearSave", () => {
  test("removes a game's save", () => {
    saveGame(GAME, makeState());

    clearSave(GAME);

    expect(loadGame(engine, loadUser(), GAME)).toBeNull();
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

    expect(loadGame(engine, loadUser(), GAME)).toBeNull();
    expect(loadGame(engine, loadUser(), OTHER)).toBeNull();
    expect(readUser().games[GAME].completedEndings).toEqual(["calm"]);
  });
});
