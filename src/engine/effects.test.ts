import { describe, expect, test } from "vitest";
import type { GameStateData } from "../types/game";
import { applyEffect, applyEffects } from "./effects";

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

describe("applyEffect", () => {
  test("set_flag sets a flag without touching the others", () => {
    const state = makeState({ flags: { started_slowly: true } });

    const result = applyEffect(
      { type: "set_flag", key: "took_parcel", value: true },
      state,
    );

    expect(result.flags).toEqual({ started_slowly: true, took_parcel: true });
  });

  test("set_flag overwrites an existing flag", () => {
    const state = makeState({ flags: { took_parcel: true } });

    const result = applyEffect(
      { type: "set_flag", key: "took_parcel", value: false },
      state,
    );

    expect(result.flags.took_parcel).toBe(false);
  });

  test("change_stat applies the delta and leaves other stats alone", () => {
    const state = makeState({ stats: { care: 1, connection: 2, calm: 3 } });

    const result = applyEffect(
      { type: "change_stat", stat: "calm", delta: 2 },
      state,
    );

    expect(result.stats).toEqual({ care: 1, connection: 2, calm: 5 });
  });

  test("change_stat accepts a negative delta", () => {
    const state = makeState({ stats: { care: 1, connection: 0, calm: 0 } });

    const result = applyEffect(
      { type: "change_stat", stat: "care", delta: -1 },
      state,
    );

    expect(result.stats.care).toBe(0);
  });

  test("add_item appends the item to the inventory", () => {
    const state = makeState({ inventory: ["letter"] });

    const result = applyEffect(
      { type: "add_item", item: "small_parcel" },
      state,
    );

    expect(result.inventory).toEqual(["letter", "small_parcel"]);
  });

  test("add_item does not duplicate an item and returns the original state", () => {
    const state = makeState({ inventory: ["small_parcel"] });

    const result = applyEffect(
      { type: "add_item", item: "small_parcel" },
      state,
    );

    // Ранний возврат в applyEffect: то же самое состояние, а не копия
    expect(result).toBe(state);
  });

  test("remove_item removes the item from the inventory", () => {
    const state = makeState({ inventory: ["letter", "small_parcel"] });

    const result = applyEffect(
      { type: "remove_item", item: "small_parcel" },
      state,
    );

    expect(result.inventory).toEqual(["letter"]);
  });

  test("remove_item leaves the inventory unchanged when the item is absent", () => {
    const state = makeState({ inventory: ["letter"] });

    const result = applyEffect({ type: "remove_item", item: "unknown" }, state);

    expect(result.inventory).toEqual(["letter"]);
  });

  test("does not mutate the state it receives", () => {
    const state = makeState({
      flags: { started_slowly: true },
      stats: { care: 1, connection: 1, calm: 1 },
      inventory: ["letter"],
    });

    applyEffect({ type: "set_flag", key: "took_parcel", value: true }, state);
    applyEffect({ type: "change_stat", stat: "care", delta: 5 }, state);
    applyEffect({ type: "add_item", item: "small_parcel" }, state);
    applyEffect({ type: "remove_item", item: "letter" }, state);

    expect(state.flags).toEqual({ started_slowly: true });
    expect(state.stats).toEqual({ care: 1, connection: 1, calm: 1 });
    expect(state.inventory).toEqual(["letter"]);
  });
});

describe("applyEffects", () => {
  test("returns the original state when there are no effects", () => {
    const state = makeState();

    expect(applyEffects(undefined, state)).toBe(state);
    expect(applyEffects([], state)).toBe(state);
  });

  test("applies effects sequentially and accumulates the result", () => {
    const state = makeState();

    const result = applyEffects(
      [
        { type: "change_stat", stat: "calm", delta: 1 },
        { type: "change_stat", stat: "calm", delta: 2 },
      ],
      state,
    );

    expect(result.stats.calm).toBe(3);
  });

  test("applies effects of different types in a single call", () => {
    const state = makeState();

    const result = applyEffects(
      [
        { type: "change_stat", stat: "care", delta: 1 },
        { type: "set_flag", key: "took_parcel", value: true },
        { type: "add_item", item: "small_parcel" },
      ],
      state,
    );

    expect(result.stats.care).toBe(1);
    expect(result.flags.took_parcel).toBe(true);
    expect(result.inventory).toEqual(["small_parcel"]);
  });

  test("order matters: add_item followed by remove_item leaves the inventory empty", () => {
    const state = makeState();

    const result = applyEffects(
      [
        { type: "add_item", item: "small_parcel" },
        { type: "remove_item", item: "small_parcel" },
      ],
      state,
    );

    expect(result.inventory).toEqual([]);
  });
});
