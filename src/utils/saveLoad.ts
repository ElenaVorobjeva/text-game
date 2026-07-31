import { createInitialGameState, sceneExists } from "../engine/gameEngine";
import type { GameStateData } from "../types/game";
import {
  clearAllProgress,
  clearProgress,
  loadUser,
  readProgress,
  writeProgress,
} from "../user/userProfile";

// Сохранения игры живут внутри единого объекта пользователя (см. userProfile).
// Здесь — игровая надстройка над ним: валидация загруженного прогресса против
// текущего контента. Само хранилище игровой модели не знает.

export function saveGame(gameId: string, state: GameStateData): void {
  writeProgress(gameId, state);
}

// Сохранение непригодно: выбрасываем его и сообщаем загрузчику, что играть
// придётся с начала. Причина уходит в консоль — потеря прогресса не должна
// происходить молча, иначе такие случаи невозможно разбирать по жалобам.
function discardSave(gameId: string, reason: string): null {
  console.warn(`Сохранение отброшено: ${reason}`);
  clearProgress(gameId);

  return null;
}

export function loadGame(gameId: string): GameStateData | null {
  const saved = readProgress(loadUser(), gameId);

  if (!saved) return null;

  // Недостающие поля берутся из начального состояния — так сохранения прошлых
  // сборок продолжают работать после добавления новых полей.
  const state: GameStateData = { ...createInitialGameState(), ...saved };

  // Сцена могла исчезнуть из gameData.json, пока писался контент. Без этой
  // проверки getSceneById бросит исключение прямо в рендере — белый экран.
  if (!sceneExists(state.currentSceneId)) {
    return discardSave(
      gameId,
      `сцена ${state.currentSceneId} больше не существует`,
    );
  }

  return state;
}

export function clearSave(gameId: string): void {
  clearProgress(gameId);
}

// Стирает сохранения всех игр (аварийное восстановление, см. clearAllProgress).
export function clearAllSaves(): void {
  clearAllProgress();
}
