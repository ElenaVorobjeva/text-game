import { describe, expect, test } from "vitest";

import type { GameStateData } from "../types/game";

import { areConditionsMet, isConditionMet } from "./conditions";

function makeState(overrides: Partial<GameStateData> = {}): GameStateData {
  return {
    currentSceneId: "chapter1_scene1",
    flags: {},
    stats: { care: 0, connection: 0, calm: 0 },
    inventory: [],
    visitedScenes: ["chapter1_scene1"],
    gameStatistic: {},
    ...overrides,
  };
}

describe("isConditionMet", () => {
  test("flag is met when the value matches", () => {
    const state = makeState({ flags: { took_parcel: true } });

    expect(
      isConditionMet({ type: "flag", key: "took_parcel", value: true }, state),
    ).toBe(true);
  });

  test("flag is not met when the value differs", () => {
    const state = makeState({ flags: { took_parcel: true } });

    expect(
      isConditionMet({ type: "flag", key: "took_parcel", value: false }, state),
    ).toBe(false);
  });

  test("an unset flag does not satisfy a value: false condition", () => {
    const state = makeState({ flags: {} });

    // Сравнение строгое: undefined !== false, поэтому «флаг не выставлен»
    // и «флаг выставлен в false» — разные вещи. Чтобы вариант показывался
    // по отсутствию флага, флаг нужно явно выставить в false.
    expect(
      isConditionMet({ type: "flag", key: "took_parcel", value: false }, state),
    ).toBe(false);
  });

  test("stat_gte is met when the stat is above the threshold", () => {
    const state = makeState({ stats: { care: 0, connection: 0, calm: 6 } });

    expect(
      isConditionMet({ type: "stat_gte", stat: "calm", value: 5 }, state),
    ).toBe(true);
  });

  test("stat_gte is met at the boundary: the stat equals the threshold", () => {
    const state = makeState({ stats: { care: 0, connection: 0, calm: 5 } });

    expect(
      isConditionMet({ type: "stat_gte", stat: "calm", value: 5 }, state),
    ).toBe(true);
  });

  test("stat_gte is not met when the stat is below the threshold", () => {
    const state = makeState({ stats: { care: 0, connection: 0, calm: 4 } });

    expect(
      isConditionMet({ type: "stat_gte", stat: "calm", value: 5 }, state),
    ).toBe(false);
  });

  test("has_item reflects whether the item is in the inventory", () => {
    const state = makeState({ inventory: ["small_parcel"] });

    expect(
      isConditionMet({ type: "has_item", item: "small_parcel" }, state),
    ).toBe(true);
    expect(isConditionMet({ type: "has_item", item: "letter" }, state)).toBe(
      false,
    );
  });
});

describe("areConditionsMet", () => {
  test("a choice without conditions is always available", () => {
    const state = makeState();

    expect(areConditionsMet(undefined, state)).toBe(true);
    expect(areConditionsMet([], state)).toBe(true);
  });

  test("multiple conditions are combined with AND: all met means available", () => {
    const state = makeState({
      flags: { took_parcel: true },
      stats: { care: 0, connection: 0, calm: 5 },
      inventory: ["small_parcel"],
    });

    expect(
      areConditionsMet(
        [
          { type: "flag", key: "took_parcel", value: true },
          { type: "stat_gte", stat: "calm", value: 5 },
          { type: "has_item", item: "small_parcel" },
        ],
        state,
      ),
    ).toBe(true);
  });

  test("a single unmet condition makes the choice unavailable", () => {
    const state = makeState({
      flags: { took_parcel: true },
      stats: { care: 0, connection: 0, calm: 1 },
    });

    expect(
      areConditionsMet(
        [
          { type: "flag", key: "took_parcel", value: true },
          { type: "stat_gte", stat: "calm", value: 5 },
        ],
        state,
      ),
    ).toBe(false);
  });
});
