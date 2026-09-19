import type { GameEngine } from "../engine/gameEngine";
import type { GameStateData } from "../types/game";
import {
  clearAllProgress,
  clearProgress,
  readProgress,
  type UserData,
} from "../user/userStorage";

// Сохранения игры живут внутри единого объекта пользователя (см. userStorage).
// Здесь — игровая надстройка над ним: валидация загруженного прогресса против
// текущего контента. Само хранилище игровой модели не знает.

// Сохранение непригодно: выбрасываем его и сообщаем загрузчику, что играть
// придётся с начала. Причина уходит в консоль — потеря прогресса не должна
// происходить молча, иначе такие случаи невозможно разбирать по жалобам.
function discardSave(gameId: string, reason: string): null {
  console.warn(`Сохранение отброшено: ${reason}`);
  clearProgress(gameId);

  return null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isSnapshot(value: unknown): boolean {
  return (
    isRecord(value) &&
    isRecord(value.flags) &&
    isRecord(value.stats) &&
    Object.values(value.stats).every((stat) => typeof stat === "number") &&
    Array.isArray(value.inventory)
  );
}

// Форма состояния: localStorage — недоверенный ввод, его правит кто угодно
// (руками, расширения, старые сборки). Неверная форма иначе падает уже в
// рендере или в обработчике клика, а перезагрузка не лечит: сохранение то же.
function isValidState(state: GameStateData): boolean {
  return (
    typeof state.currentSceneId === "string" &&
    isSnapshot(state) &&
    Array.isArray(state.visitedScenes) &&
    isRecord(state.gameStatistic) &&
    Object.values(state.gameStatistic).every(isSnapshot)
  );
}

export function loadGame(
  engine: GameEngine,
  data: UserData,
  gameId: string,
): GameStateData | null {
  const saved = readProgress(data, gameId);
  if (!saved) return null;

  // Недостающие поля берутся из начального состояния — так сохранения прошлых
  // сборок продолжают работать после добавления новых полей.
  const state: GameStateData = { ...engine.createInitialGameState(), ...saved };

  if (!isValidState(state)) {
    return discardSave(gameId, "неверная форма сохранённого состояния");
  }

  // Сцена могла исчезнуть из quietGoodLife.json, пока писался контент. Без этой
  // проверки getSceneById бросит исключение прямо в рендере — белый экран.
  if (!engine.sceneExists(state.currentSceneId)) {
    return discardSave(
      gameId,
      `сцена ${state.currentSceneId} больше не существует`,
    );
  }

  return state;
}

// Стирает сохранения всех игр (аварийное восстановление, см. clearAllProgress).
export function clearAllSaves(): void {
  clearAllProgress();
}
