import { createInitialGameState, sceneExists } from "../engine/gameEngine";
import type { GameStateData } from "../types/game";

export const SAVE_KEY = "quiet-good-life-save";

// Версия формата сохранения. Живёт только в localStorage, а не в GameStateData:
// это забота хранилища, а не игровой модели. Повышать при изменении формы или
// смысла полей — тогда старые сохранения можно будет распознать и преобразовать.
export const SAVE_VERSION = 1;

type SavedGame = GameStateData & { version: number };

export function saveGame(state: GameStateData): void {
  const payload: SavedGame = { ...state, version: SAVE_VERSION };

  localStorage.setItem(SAVE_KEY, JSON.stringify(payload));
}

// Сохранение непригодно: выбрасываем его и сообщаем загрузчику, что играть
// придётся с начала. Причина уходит в консоль — потеря прогресса не должна
// происходить молча, иначе такие случаи невозможно разбирать по жалобам.
function discardSave(reason: string): null {
  console.warn(`Сохранение отброшено: ${reason}`);
  clearSave();

  return null;
}

export function loadGame(): GameStateData | null {
  const item = localStorage.getItem(SAVE_KEY);

  if (!item) return null;

  try {
    const { version, ...saved } = JSON.parse(item) as Partial<SavedGame>;

    // Сохранение из более новой сборки: его формат нам неизвестен,
    // дополнять дефолтами такое нельзя — молча испортим данные.
    if (typeof version === "number" && version > SAVE_VERSION) {
      return discardSave(`формат версии ${version} новее текущего`);
    }

    // Недостающие поля берутся из начального состояния — так сохранения
    // прошлых версий продолжают работать после добавления новых полей.
    const state: GameStateData = { ...createInitialGameState(), ...saved };

    // Сцена могла исчезнуть из gameData.json, пока писался контент.
    // Без этой проверки getSceneById бросит исключение прямо в рендере
    // и приложение покажет пустой экран.
    if (!sceneExists(state.currentSceneId)) {
      return discardSave(`сцена ${state.currentSceneId} больше не существует`);
    }

    return state;
  } catch {
    return discardSave("не удалось разобрать JSON");
  }
}

export function clearSave(): void {
  localStorage.removeItem(SAVE_KEY);
}
