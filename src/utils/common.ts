import type { NavigateFunction, Location } from "react-router";

// Путь внутри игры: /:gameId или /:gameId/<под-путь>. Все экраны игры адресуются
// через него, чтобы префикс gameId не размазывался по компонентам строками.
export function gamePath(gameId: string, sub = ""): string {
  return sub ? `/${gameId}/${sub}` : `/${gameId}`;
}

// Функция перехода назад по истории браузера
// Если история пустая, то переходим на заданный url
export function goBack(
  navigate: NavigateFunction,
  location: Location,
  navigateUrl: string,
) {
  if (location.key !== "default") navigate(-1);
  else navigate(navigateUrl);
}

// Перезапуск игры: сбрасывает прогресс и уводит в меню этой игры.
export function restartGame(
  resetGame: () => void,
  navigate: NavigateFunction,
  gameId: string,
) {
  resetGame();
  navigate(gamePath(gameId));
}

export function startGame(
  startNewGame: () => void,
  navigate: NavigateFunction,
  gameId: string,
) {
  startNewGame();
  navigate(gamePath(gameId, "game"), { replace: true });
}
