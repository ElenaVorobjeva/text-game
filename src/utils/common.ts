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
export const restartGame = (
  resetGame: () => void,
  navigate: NavigateFunction,
) => {
  resetGame();
  navigate("/");
};
