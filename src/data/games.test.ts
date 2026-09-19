import { describe, expect, test } from "vitest";

import { gameList, games, getGameData } from "./games";

describe("games registry", () => {
  test("every registered game is found by its own id", () => {
    for (const game of gameList) {
      expect(getGameData(game.meta.id)).toBe(game);
    }
  });

  test("returns undefined for an unknown game", () => {
    expect(getGameData("no_such_game")).toBeUndefined();
  });

  test.each(["constructor", "__proto__", "toString", "hasOwnProperty"])(
    "does not treat the inherited property %s as a game",
    (id) => {
      expect(getGameData(id)).toBeUndefined();
    },
  );

  // Страховка от опечатки при добавлении игры: ключ в реестре обязан совпадать
  // с meta.id — иначе поиск по gameId из URL промахнётся.
  test("every game is keyed by its own meta.id", () => {
    for (const [id, data] of Object.entries(games)) {
      expect(data.meta.id).toBe(id);
    }
  });
});
