import type { NavigateFunction, Location } from "react-router";

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

// Функция перезапуска игрового процесса
export function restartGame(resetGame: () => void, navigate: NavigateFunction) {
  resetGame();
  navigate("/");
}

export function startGame(
  startNewGame: () => void,
  navigate: NavigateFunction,
) {
  startNewGame();
  navigate("/game", { replace: true });
}
