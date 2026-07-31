import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import type { GameStateData } from "../types/game";

import {
  SERVER_LATENCY_MS,
  USER_KEY,
  addCompletedEnding,
  clearAllProgress,
  clearProgress,
  fetchUserData,
  getCompletedEndings,
  loadUser,
  readProgress,
  saveUser,
  writeProgress,
} from "./userProfile";

// Как и saveLoad, тесты не поднимают jsdom: localStorage подменяется заглушкой
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

const GAME = "quiet_good_life";
const OTHER = "another_game";

// Минимальный прогресс: содержимое движку здесь неважно — хранилище держит его
// как непрозрачный объект.
const progress = { currentSceneId: "chapter2_scene1" } as GameStateData;

beforeEach(() => {
  vi.stubGlobal("localStorage", createLocalStorageStub());
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("loadUser", () => {
  test("returns empty data when nothing is stored", () => {
    expect(loadUser()).toEqual({ games: {} });
  });

  test("reads stored data back", () => {
    saveUser({
      games: { [GAME]: { completedEndings: ["calm"], progress } },
    });

    const data = loadUser();

    expect(getCompletedEndings(data, GAME)).toEqual(["calm"]);
    expect(readProgress(data, GAME)).toEqual(progress);
  });

  test("returns empty data on corrupted JSON instead of throwing", () => {
    localStorage.setItem(USER_KEY, "{ не JSON");

    expect(loadUser()).toEqual({ games: {} });
  });

  test("drops non-string entries from a tampered completedEndings", () => {
    localStorage.setItem(
      USER_KEY,
      JSON.stringify({
        games: { [GAME]: { completedEndings: ["calm", 42, null, "care"] } },
      }),
    );

    expect(getCompletedEndings(loadUser(), GAME)).toEqual(["calm", "care"]);
  });

  test("recovers when a game's completedEndings is not an array", () => {
    localStorage.setItem(
      USER_KEY,
      JSON.stringify({ games: { [GAME]: { completedEndings: "calm" } } }),
    );

    expect(getCompletedEndings(loadUser(), GAME)).toEqual([]);
  });

  test("treats a non-object progress as no save", () => {
    localStorage.setItem(
      USER_KEY,
      JSON.stringify({ games: { [GAME]: { progress: "broken" } } }),
    );

    expect(readProgress(loadUser(), GAME)).toBeNull();
  });
});

describe("getCompletedEndings / readProgress", () => {
  test("return empty defaults for an unknown game", () => {
    expect(getCompletedEndings(loadUser(), OTHER)).toEqual([]);
    expect(readProgress(loadUser(), OTHER)).toBeNull();
  });
});

describe("addCompletedEnding", () => {
  test("records a newly completed ending", () => {
    addCompletedEnding(GAME, "calm");

    expect(getCompletedEndings(loadUser(), GAME)).toEqual(["calm"]);
  });

  test("accumulates several endings in order", () => {
    addCompletedEnding(GAME, "calm");
    addCompletedEnding(GAME, "care");

    expect(getCompletedEndings(loadUser(), GAME)).toEqual(["calm", "care"]);
  });

  test("is idempotent: repeating an ending does not duplicate it", () => {
    addCompletedEnding(GAME, "calm");
    addCompletedEnding(GAME, "calm");

    expect(getCompletedEndings(loadUser(), GAME)).toEqual(["calm"]);
  });

  test("keeps each game's endings separate", () => {
    addCompletedEnding(GAME, "calm");
    addCompletedEnding(OTHER, "care");

    const data = loadUser();

    expect(getCompletedEndings(data, GAME)).toEqual(["calm"]);
    expect(getCompletedEndings(data, OTHER)).toEqual(["care"]);
  });

  test("does not disturb a saved progress in the same game", () => {
    writeProgress(GAME, progress);

    addCompletedEnding(GAME, "calm");

    expect(readProgress(loadUser(), GAME)).toEqual(progress);
  });
});

describe("writeProgress / clearProgress", () => {
  test("stores and reads a game's progress", () => {
    writeProgress(GAME, progress);

    expect(readProgress(loadUser(), GAME)).toEqual(progress);
  });

  test("clearing a game's progress leaves its endings intact", () => {
    addCompletedEnding(GAME, "calm");
    writeProgress(GAME, progress);

    clearProgress(GAME);

    const data = loadUser();

    expect(readProgress(data, GAME)).toBeNull();
    expect(getCompletedEndings(data, GAME)).toEqual(["calm"]);
  });
});

describe("clearAllProgress", () => {
  test("wipes progress of every game but keeps endings", () => {
    addCompletedEnding(GAME, "calm");
    writeProgress(GAME, progress);
    writeProgress(OTHER, progress);

    clearAllProgress();

    const data = loadUser();

    expect(readProgress(data, GAME)).toBeNull();
    expect(readProgress(data, OTHER)).toBeNull();
    expect(getCompletedEndings(data, GAME)).toEqual(["calm"]);
  });
});

describe("fetchUserData", () => {
  // «Сервер» подделан таймаутом — здесь фейковое время, чтобы не ждать вживую.
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test("resolves with the stored data after the server latency", async () => {
    addCompletedEnding(GAME, "calm");

    const request = fetchUserData();
    await vi.advanceTimersByTimeAsync(SERVER_LATENCY_MS);

    expect(getCompletedEndings(await request, GAME)).toEqual(["calm"]);
  });

  test("resolves with empty data when nothing is stored", async () => {
    const request = fetchUserData();
    await vi.advanceTimersByTimeAsync(SERVER_LATENCY_MS);

    expect(await request).toEqual({ games: {} });
  });
});
