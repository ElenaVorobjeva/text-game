import { describe, expect, test } from "vitest";

import { DEFAULT_GAME_ID, games, getGameData } from "./games";

describe("games registry", () => {
  test("the default game is registered under its own id", () => {
    expect(getGameData(DEFAULT_GAME_ID)?.meta.id).toBe(DEFAULT_GAME_ID);
  });

  test("returns undefined for an unknown game", () => {
    expect(getGameData("no_such_game")).toBeUndefined();
  });

  // Страховка от опечатки при добавлении игры: ключ в реестре обязан совпадать
  // с meta.id — иначе поиск по gameId из URL промахнётся.
  test("every game is keyed by its own meta.id", () => {
    for (const [id, data] of Object.entries(games)) {
      expect(data.meta.id).toBe(id);
    }
  });
});
