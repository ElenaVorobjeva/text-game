import type { Condition, GameStateData } from "../types/game";

export function isConditionMet(
  condition: Condition,
  state: GameStateData,
): boolean {
  switch (condition.type) {
    case "flag":
      return state.flags[condition.key] === condition.value;

    case "stat_gte":
      return state.stats[condition.stat] >= condition.value;

    case "has_item":
      return state.inventory.includes(condition.item);

    default:
      return false;
  }
}

export function areConditionsMet(
  conditions: Condition[] | undefined,
  state: GameStateData,
): boolean {
  if (!conditions || conditions.length === 0) return true;

  return conditions.every((condition) => isConditionMet(condition, state));
}
