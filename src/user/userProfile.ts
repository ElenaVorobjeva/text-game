// Данные пользователя — слой, живущий отдельно от состояния игры. Сейчас это
// собранные концовки; сюда же позже лягут имя, настройки, достижения.
//
// Хранилище изолировано за этими функциями: остальной код не знает, что внутри
// localStorage. Когда появится регистрация и БД, меняется только реализация
// здесь — сигнатуры остаются синхронными (данные локальны и мгновенны).
//
// Профиль намеренно не зависит от игрового движка: это данные пользователя,
// а не игры, и переезд в БД не должен тянуть за собой игровую логику.

export const USER_KEY = "quiet-good-life-user";

// Версия формата профиля. Повышать при изменении формы или смысла полей —
// тогда старые профили можно распознать и преобразовать.
export const USER_VERSION = 1;

export type UserProfile = {
  version: number;
  /** endingType концовок, которые пользователь открыл за всё время. */
  completedEndings: string[];
};

function createEmptyProfile(): UserProfile {
  return { version: USER_VERSION, completedEndings: [] };
}

export function loadUserProfile(): UserProfile {
  const raw = localStorage.getItem(USER_KEY);

  if (!raw) return createEmptyProfile();

  try {
    const saved = JSON.parse(raw) as Partial<UserProfile>;

    // Профиль из более новой сборки: формат нам неизвестен, не рискуем его
    // читать — начинаем с чистого (перезапишем только при явной записи).
    if (typeof saved.version === "number" && saved.version > USER_VERSION) {
      return createEmptyProfile();
    }

    return {
      ...createEmptyProfile(),
      ...saved,
      version: USER_VERSION,
      // Защита от порчи: completedEndings обязан быть массивом строк.
      completedEndings: Array.isArray(saved.completedEndings)
        ? saved.completedEndings.filter(
            (e): e is string => typeof e === "string",
          )
        : [],
    };
  } catch {
    // Битый JSON невосстановим — отдаём пустой профиль, но не роняем страницу.
    return createEmptyProfile();
  }
}

export function saveUserProfile(profile: UserProfile): void {
  const payload: UserProfile = { ...profile, version: USER_VERSION };

  localStorage.setItem(USER_KEY, JSON.stringify(payload));
}

/**
 * Отмечает концовку как открытую. Идемпотентно: повтор не создаёт дубля.
 * Возвращает обновлённый профиль.
 */
export function addCompletedEnding(endingType: string): UserProfile {
  const profile = loadUserProfile();

  if (profile.completedEndings.includes(endingType)) return profile;

  const next: UserProfile = {
    ...profile,
    completedEndings: [...profile.completedEndings, endingType],
  };
  saveUserProfile(next);

  return next;
}

export function isEndingCompleted(endingType: string): boolean {
  return loadUserProfile().completedEndings.includes(endingType);
}

export function hasCompletedEndings(): boolean {
  return loadUserProfile().completedEndings.length > 0;
}
