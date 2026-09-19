// Данные пользователя — единый объект в localStorage: под ним и собранные
// концовки, и сохранённые прогрессы игр, в разрезе по gameId. Пока игра не
// вышла к людям, версий и миграций тут нет — при изменении формы старые данные
// просто отбрасываются (см. политику отказа ниже).
//
// Хранилище изолировано за этими функциями: остальной код не знает, что внутри
// localStorage. Когда появится регистрация и БД, меняется только реализация
// здесь. Прогресс лежит как непрозрачный GameStateData — эта модель намеренно
// не зависит от игрового движка; осмысленную проверку сохранения (существует ли
// сцена) делает saveLoad поверх движка.

import type { GameStateData } from "../types/game";

export const USER_KEY = "quiet-good-life-user";
// Задержка нужна только чтобы увидеть лоадер при разработке: в продакшене
// игрок не должен ждать три секунды ради чтения из localStorage.
export const SERVER_LATENCY_MS = import.meta.env.DEV ? 3000 : 0;

export type UserGameData = {
  /** endingType концовок, открытых пользователем в этой игре. */
  completedEndings: string[];
  /** Сохранённый прогресс игры; null — сохранения нет. */
  progress: GameStateData | null;
};

export type UserData = {
  /** Данные по играм: ключ — GameData.meta.id. */
  games: Record<string, UserGameData>;
};

function createEmptyUser(): UserData {
  return { games: {} };
}

function emptyGameData(): UserGameData {
  return { completedEndings: [], progress: null };
}

// Данные непригодны: отдаём пустые, но причину пишем в консоль. Потеря прогресса
// и собранных концовок не должна происходить молча, иначе такие случаи
// невозможно разбирать по жалобам.
function discardUser(reason: string): UserData {
  console.warn(`Данные пользователя отброшены: ${reason}`);

  return createEmptyUser();
}

// Защита от порчи: completedEndings обязан быть массивом строк.
function sanitizeEndings(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((entry): entry is string => typeof entry === "string")
    : [];
}

// Прогресс хранится как есть, если это объект: глубокую проверку (та ли форма,
// существует ли сцена) делает saveLoad — здесь нет доступа к игровой модели.
function sanitizeProgress(value: unknown): GameStateData | null {
  return typeof value === "object" && value !== null
    ? (value as GameStateData)
    : null;
}

function sanitizeGames(value: unknown): Record<string, UserGameData> {
  if (typeof value !== "object" || value === null) return {};

  const games: Record<string, UserGameData> = {};

  for (const [gameId, raw] of Object.entries(value)) {
    // Присваивание games["__proto__"] подменило бы прототип объекта, а не
    // добавило запись.
    if (gameId === "__proto__") continue;

    const game = (typeof raw === "object" && raw !== null ? raw : {}) as {
      completedEndings?: unknown;
      progress?: unknown;
    };

    games[gameId] = {
      completedEndings: sanitizeEndings(game.completedEndings),
      progress: sanitizeProgress(game.progress),
    };
  }

  return games;
}

export function loadUser(): UserData {
  try {
    const raw = localStorage.getItem(USER_KEY);

    if (!raw) return createEmptyUser();

    const saved = JSON.parse(raw) as { games?: unknown };

    return { games: sanitizeGames(saved.games) };
  } catch {
    // Битый JSON невосстановим, а getItem бросает при заблокированном
    // хранилище (Safari private, запрет cookies): отдаём пустые данные, но не
    // роняем страницу и не оставляем ProfileGate навсегда на загрузке.
    return discardUser("не удалось прочитать или разобрать данные");
  }
}

// Имитация запроса к серверу
// При появлении бэкенда, тут будет реальный запрос
export function fetchUserData(): Promise<UserData> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(loadUser()), SERVER_LATENCY_MS);
  });
}

export function saveUser(data: UserData): void {
  try {
    localStorage.setItem(USER_KEY, JSON.stringify(data));
  } catch (error) {
    // Квота или закрытое хранилище: исключение в обработчике клика молча
    // «съело» бы выбор игрока. Игра продолжается в памяти, прогресс не
    // переживёт перезагрузку — об этом остаётся след в консоли.
    console.warn("Не удалось сохранить данные пользователя:", error);
  }
}

function gameOf(data: UserData, gameId: string): UserGameData {
  return Object.hasOwn(data.games, gameId)
    ? data.games[gameId]
    : emptyGameData();
}

// Точечная запись одной игры: читаем свежий объект, меняем срез игры и пишем
// обратно. Свежее чтение обязательно — соседний провайдер (концовки/прогресс)
// мог обновить другой срез того же объекта, и кэш перезаписал бы его.
function writeGame(gameId: string, patch: Partial<UserGameData>): UserData {
  const data = loadUser();
  const next: UserData = {
    ...data,
    games: { ...data.games, [gameId]: { ...gameOf(data, gameId), ...patch } },
  };
  saveUser(next);

  return next;
}

/** Концовки, открытые в указанной игре. Для незнакомой игры — пустой список. */
export function getCompletedEndings(data: UserData, gameId: string): string[] {
  return gameOf(data, gameId).completedEndings;
}

/**
 * Отмечает концовку игры как открытую. Идемпотентно: повтор не создаёт дубля.
 * Возвращает обновлённые данные пользователя.
 */
export function addCompletedEnding(
  gameId: string,
  endingType: string,
): UserData {
  const data = loadUser();
  const current = getCompletedEndings(data, gameId);

  if (current.includes(endingType)) return data;

  return writeGame(gameId, { completedEndings: [...current, endingType] });
}

/** Сохранённый прогресс игры или null. */
export function readProgress(
  data: UserData,
  gameId: string,
): GameStateData | null {
  return gameOf(data, gameId).progress;
}

export function writeProgress(
  gameId: string,
  progress: GameStateData,
): UserData {
  return writeGame(gameId, { progress });
}

export function clearProgress(gameId: string): UserData {
  return writeGame(gameId, { progress: null });
}

// Стирает прогресс во всех играх, не трогая собранные концовки. Нужно
// аварийному экрану (ErrorBoundary): он не знает активной игры, а его задача —
// убрать сохранение, из-за которого рендер падает, не отбирая прочий прогресс.
export function clearAllProgress(): void {
  const data = loadUser();
  const games: Record<string, UserGameData> = {};

  for (const [gameId, game] of Object.entries(data.games)) {
    games[gameId] = { ...game, progress: null };
  }

  saveUser({ ...data, games });
}
