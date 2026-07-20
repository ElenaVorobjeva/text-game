import type { GameStateData } from "../types/game";

const SAVE_KEY = "quiet-good-life-save";

export function saveGame(state: GameStateData): void {
  localStorage.setItem(SAVE_KEY, JSON.stringify(state));
}

export function loadGame(): GameStateData | null {
  const raw = localStorage.getItem(SAVE_KEY);

  if (!raw) return null;

  try {
    return JSON.parse(raw) as GameStateData;
  } catch {
    localStorage.removeItem(SAVE_KEY);
    return null;
  }
}

export function clearSave(): void {
  localStorage.removeItem(SAVE_KEY);
}
