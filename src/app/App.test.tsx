// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, test } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import App from "./App";
import { GameProvider } from "../state/gameProvider";
import { createInitialGameState, getCurrentScene } from "../engine/gameEngine";
import { saveGame } from "../utils/saveLoad";

// Тесты навигации: проверяют маршруты и переходы через реальный react-router
// (MemoryRouter). Роутинг иначе покрыт только ручной проверкой.

// Маркер экрана — уникальный текст, по которому тест узнаёт, что показан именно
// он. Один экран — одно значение, все проверки ссылаются сюда.
const SCREEN = {
  menu: "Тихий хороший день", // заголовок меню — есть при любом состоянии
  chapters: "Выбор главы", // заголовок экрана выбора глав
  // Маркер игры берётся из данных, а не хардкодится: title стартовой сцены
  // живёт в gameData.json, и это его единственный источник правды.
  game: getCurrentScene(createInitialGameState()).title,
} as const;

// Тексты кнопок, по которым тест кликает (действия, а не маркеры экранов).
const BUTTON = {
  start: "Старт",
  chooseChapter: "Выбрать главу",
  back: "Назад",
} as const;

function renderAt(path: string, history: string[] = [path]) {
  return render(
    <MemoryRouter initialEntries={history} initialIndex={history.length - 1}>
      <GameProvider>
        <App />
      </GameProvider>
    </MemoryRouter>,
  );
}

beforeEach(() => {
  localStorage.clear();
});

// cleanup обязателен: при globals: false Testing Library не размонтирует
// дерево между тестами сама. localStorage чистит beforeEach.
afterEach(cleanup);

describe("routing: direct entry", () => {
  test("/ shows the main menu", () => {
    renderAt("/");

    expect(screen.getByRole("heading", { name: SCREEN.menu })).toBeTruthy();
  });

  test("/chapters shows the chapter select screen", () => {
    renderAt("/chapters");

    expect(screen.getByRole("heading", { name: SCREEN.chapters })).toBeTruthy();
  });

  test("an unknown route redirects to the main menu", () => {
    renderAt("/nonexistent");

    expect(screen.getByRole("heading", { name: SCREEN.menu })).toBeTruthy();
  });
});

describe("routing: /game guard", () => {
  test("/game without a save redirects to the main menu", () => {
    renderAt("/game");

    // Прямой заход по ссылке не должен втихую начинать игру.
    expect(screen.getByRole("heading", { name: SCREEN.menu })).toBeTruthy();
    expect(screen.queryByText(SCREEN.game)).toBeNull();
  });

  test("/game with a save shows the game", () => {
    saveGame(createInitialGameState());

    renderAt("/game");

    expect(screen.getByText(SCREEN.game)).toBeTruthy();
  });
});

describe("routing: navigation from the menu", () => {
  test("Старт begins the game and moves to /game", async () => {
    const user = userEvent.setup();
    renderAt("/");

    await user.click(screen.getByRole("button", { name: BUTTON.start }));

    expect(await screen.findByText(SCREEN.game)).toBeTruthy();
  });

  test("Выбрать главу opens the chapter select screen", async () => {
    saveGame(createInitialGameState());
    const user = userEvent.setup();
    renderAt("/");

    await user.click(
      screen.getByRole("button", { name: BUTTON.chooseChapter }),
    );

    expect(
      await screen.findByRole("heading", { name: SCREEN.chapters }),
    ).toBeTruthy();
  });
});

describe("routing: back button on the chapter screen", () => {
  test("goes back through history when there is somewhere to return to", async () => {
    saveGame(createInitialGameState());
    const user = userEvent.setup();
    // Пришли на экран глав из игры — в истории есть предыдущая запись.
    renderAt("/chapters", ["/game", "/chapters"]);

    await user.click(screen.getByRole("button", { name: BUTTON.back }));

    // navigate(-1) возвращает в игру, а не в меню.
    expect(await screen.findByText(SCREEN.game)).toBeTruthy();
  });

  test("falls back to the menu on a direct visit with no history", async () => {
    const user = userEvent.setup();
    // Прямой заход: единственная запись истории, location.key === "default".
    renderAt("/chapters");

    await user.click(screen.getByRole("button", { name: BUTTON.back }));

    expect(
      await screen.findByRole("heading", { name: SCREEN.menu }),
    ).toBeTruthy();
  });
});
