import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import {
  USER_KEY,
  USER_VERSION,
  addCompletedEnding,
  loadUserProfile,
  saveUserProfile,
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

beforeEach(() => {
  vi.stubGlobal("localStorage", createLocalStorageStub());
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("loadUserProfile", () => {
  test("returns an empty profile when nothing is stored", () => {
    expect(loadUserProfile()).toEqual({
      version: USER_VERSION,
      completedEndings: [],
    });
  });

  test("reads a stored profile back", () => {
    saveUserProfile({ version: USER_VERSION, completedEndings: ["calm"] });

    expect(loadUserProfile().completedEndings).toEqual(["calm"]);
  });

  test("returns an empty profile on corrupted JSON instead of throwing", () => {
    localStorage.setItem(USER_KEY, "{ не JSON");

    expect(loadUserProfile().completedEndings).toEqual([]);
  });

  test("fills in fields missing from an older profile", () => {
    // Профиль формата, где ещё не было completedEndings.
    localStorage.setItem(USER_KEY, JSON.stringify({ version: 1 }));

    expect(loadUserProfile().completedEndings).toEqual([]);
  });

  test("ignores a profile written by a newer build", () => {
    localStorage.setItem(
      USER_KEY,
      JSON.stringify({ version: USER_VERSION + 1, completedEndings: ["calm"] }),
    );

    expect(loadUserProfile().completedEndings).toEqual([]);
  });

  test("drops non-string entries from a tampered completedEndings", () => {
    localStorage.setItem(
      USER_KEY,
      JSON.stringify({
        version: USER_VERSION,
        completedEndings: ["calm", 42, null, "care"],
      }),
    );

    expect(loadUserProfile().completedEndings).toEqual(["calm", "care"]);
  });

  test("recovers when completedEndings is not an array", () => {
    localStorage.setItem(
      USER_KEY,
      JSON.stringify({ version: USER_VERSION, completedEndings: "calm" }),
    );

    expect(loadUserProfile().completedEndings).toEqual([]);
  });
});

describe("addCompletedEnding", () => {
  test("records a newly completed ending", () => {
    addCompletedEnding("calm");

    expect(loadUserProfile().completedEndings).toEqual(["calm"]);
  });

  test("accumulates several endings in order", () => {
    addCompletedEnding("calm");
    addCompletedEnding("care");

    expect(loadUserProfile().completedEndings).toEqual(["calm", "care"]);
  });

  test("is idempotent: repeating an ending does not duplicate it", () => {
    addCompletedEnding("calm");
    addCompletedEnding("calm");

    expect(loadUserProfile().completedEndings).toEqual(["calm"]);
  });

  test("persists across a fresh load", () => {
    addCompletedEnding("connection");

    // Профиль читается заново — данные сохранились в хранилище.
    expect(loadUserProfile().completedEndings).toContain("connection");
  });
});

describe("saveUserProfile", () => {
  test("always stamps the current version", () => {
    saveUserProfile({ version: 999, completedEndings: [] });

    const raw = localStorage.getItem(USER_KEY) ?? "";

    expect(JSON.parse(raw).version).toBe(USER_VERSION);
  });
});
