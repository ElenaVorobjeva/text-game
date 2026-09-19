// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { afterEach, beforeEach, describe, expect, test } from "vitest";

import {
  createInitialGameState,
  gameData,
  getCurrentScene,
} from "../engine/bundledEngine";
import { UserProvider } from "../state/userProvider";
import { loadUser } from "../user/userStorage";
import { saveGame } from "../utils/saveLoad";

import { App } from "./App";

// Тесты навигации: проверяют маршруты и переходы через реальный react-router
// (MemoryRouter). GameProvider монтирует сам App (через GameShell), поэтому
// разворачиваем только UserProvider.

const GAME_ID = gameData.meta.id;

// Маркер экрана — уникальный текст, по которому тест узнаёт, что показан именно
// он. Один экран — одно значение, все проверки ссылаются сюда.
const SCREEN = {
  menu: "Тихий хороший день", // заголовок меню — есть при любом состоянии
  catalog: "Выбор игры", // заголовок каталога игр
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
      <UserProvider initialData={loadUser()}>
        <App />
      </UserProvider>
    </MemoryRouter>,
  );
}

beforeEach(() => {
  localStorage.clear();
});

// cleanup обязателен: при globals: false Testing Library не размонтирует
// дерево между тестами сама. localStorage чистит beforeEach.
afterEach(cleanup);

describe("routing: game catalog", () => {
  test("/ shows the game catalog", () => {
    renderAt("/");

    expect(screen.getByRole("heading", { name: SCREEN.catalog })).toBeTruthy();
  });

  test("choosing a game opens its menu", async () => {
    const user = userEvent.setup();
    renderAt("/");

    await user.click(
      screen.getByRole("button", { name: new RegExp(gameData.meta.title) }),
    );

    expect(
      await screen.findByRole("heading", { name: SCREEN.menu }),
    ).toBeTruthy();
  });

  test("an unknown game id redirects to the catalog", () => {
    renderAt("/nonexistent");

    expect(screen.getByRole("heading", { name: SCREEN.catalog })).toBeTruthy();
  });

  test("the game menu links back to the catalog", async () => {
    const user = userEvent.setup();
    renderAt(`/${GAME_ID}`);

    await user.click(screen.getByRole("link", { name: "К играм" }));

    expect(
      await screen.findByRole("heading", { name: SCREEN.catalog }),
    ).toBeTruthy();
  });
});

describe("routing: direct entry", () => {
  test("/:gameId/chapters shows the chapter select screen", () => {
    renderAt(`/${GAME_ID}/chapters`);

    expect(screen.getByRole("heading", { name: SCREEN.chapters })).toBeTruthy();
  });
});

describe("routing: header on the menu", () => {
  test("the header stays collapsed when the menu URL has a trailing slash", () => {
    renderAt(`/${GAME_ID}/`);

    expect(screen.getByRole("link", { name: "К играм" })).toBeTruthy();
    expect(screen.queryByRole("link", { name: "Выбор главы" })).toBeNull();
  });
});

describe("routing: game screen guard", () => {
  test("the game screen without a save redirects to the menu", () => {
    renderAt(`/${GAME_ID}/game`);

    // Прямой заход по ссылке не должен втихую начинать игру.
    expect(screen.getByRole("heading", { name: SCREEN.menu })).toBeTruthy();
    expect(screen.queryByText(SCREEN.game)).toBeNull();
  });

  test("the game screen with a save shows the game", () => {
    saveGame(GAME_ID, createInitialGameState());

    renderAt(`/${GAME_ID}/game`);

    expect(screen.getByText(SCREEN.game)).toBeTruthy();
  });
});

describe("screen changes are announced", () => {
  test("starting the game focuses the scene title and updates the tab title", async () => {
    const user = userEvent.setup();
    renderAt(`/${GAME_ID}`);

    await user.click(screen.getByRole("button", { name: BUTTON.start }));

    // Заголовок сцены — единственный h1 экрана: на игровом экране его иначе нет.
    const title = await screen.findByRole("heading", {
      level: 1,
      name: SCREEN.game,
    });
    expect(document.activeElement).toBe(title);
    expect(document.title).toContain(SCREEN.game);
  });
});

describe("routing: navigation from the menu", () => {
  test("Старт begins the game and moves to the game screen", async () => {
    const user = userEvent.setup();
    renderAt(`/${GAME_ID}`);

    await user.click(screen.getByRole("button", { name: BUTTON.start }));

    expect(await screen.findByText(SCREEN.game)).toBeTruthy();
  });

  test("Выбрать главу opens the chapter select screen", async () => {
    saveGame(GAME_ID, createInitialGameState());
    const user = userEvent.setup();
    renderAt(`/${GAME_ID}`);

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
    saveGame(GAME_ID, createInitialGameState());
    const user = userEvent.setup();
    // Пришли на экран глав из игры — в истории есть предыдущая запись.
    renderAt(`/${GAME_ID}/chapters`, [
      `/${GAME_ID}/game`,
      `/${GAME_ID}/chapters`,
    ]);

    await user.click(screen.getByRole("button", { name: BUTTON.back }));

    // navigate(-1) возвращает в игру, а не в меню.
    expect(await screen.findByText(SCREEN.game)).toBeTruthy();
  });

  test("falls back to the menu on a direct visit with no history", async () => {
    const user = userEvent.setup();
    // Прямой заход: единственная запись истории, location.key === "default".
    renderAt(`/${GAME_ID}/chapters`);

    await user.click(screen.getByRole("button", { name: BUTTON.back }));

    expect(
      await screen.findByRole("heading", { name: SCREEN.menu }),
    ).toBeTruthy();
  });
});
