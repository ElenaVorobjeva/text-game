import type { Effect, GameStateData } from "../types/game";
import { assertNever } from "../utils/assertNever";

export function applyEffect(
  effect: Effect,
  state: GameStateData,
): GameStateData {
  switch (effect.type) {
    case "set_flag":
      return {
        ...state,
        flags: {
          ...state.flags,
          [effect.key]: effect.value,
        },
      };

    case "change_stat":
      return {
        ...state,
        stats: {
          ...state.stats,
          [effect.stat]: state.stats[effect.stat] + effect.delta,
        },
      };

    case "add_item":
      if (state.inventory.includes(effect.item)) return state;

      return {
        ...state,
        inventory: [...state.inventory, effect.item],
      };

    case "remove_item":
      return {
        ...state,
        inventory: state.inventory.filter((item) => item !== effect.item),
      };

    default:
      return assertNever(effect);
  }
}

export function applyEffects(
  effects: Effect[] | undefined,
  state: GameStateData,
): GameStateData {
  if (!effects || effects.length === 0) return state;

  return effects.reduce(
    (nextState, effect) => applyEffect(effect, nextState),
    state,
  );
}
