// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, useLocation } from "react-router";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { gameData } from "../../engine/bundledEngine";
import type { GameContextValue } from "../../state/gameContext";

import { ChoiceList } from "./ChoiceList";

// «Доступных действий нет» в реальных данных недостижимо: ни у одной сцены главы
// не бывает пустого списка вариантов (см. gameData.test — тупиков нет). Поэтому
// здесь единственный в проекте мок хука — иначе эту ветку нельзя ни увидеть, ни
// проверить. Остальные тесты компонентов ходят через настоящий GameProvider.
const { useGameMock } = vi.hoisted(() => ({ useGameMock: vi.fn() }));
vi.mock("../../state/useGame", () => ({ useGame: useGameMock }));

// Настоящая сцена главы: её chapter — валидный id, который компонент передаёт
// в chooseChapter.
const chapterScene = gameData.scenes.find((scene) => !scene.isEnding)!;

// Полный контекст с пустым списком вариантов; действия — шпионы, доступность
// главы задаётся тестом. Разворачивать реальный провайдер не нужно: проверяем
// именно ветку choices.length === 0.
function makeGame(overrides: Partial<GameContextValue> = {}): GameContextValue {
  return {
    gameId: gameData.meta.id,
    gameData: gameData,
    image: "",
    gameState: {} as GameContextValue["gameState"],
    scene: chapterScene,
    choices: [],
    hasSave: true,
    startNewGame: vi.fn(),
    continueGame: vi.fn(),
    resetGame: vi.fn(),
    choose: vi.fn(),
    chooseChapter: vi.fn(),
    canEnterChapter: vi.fn(() => true),
    ...overrides,
  };
}

// Проба текущего адреса: router настоящий, так что переход кнопки виден как
// смена pathname, без мока useNavigate.
function LocationProbe() {
  return <div data-testid="path">{useLocation().pathname}</div>;
}

function renderList(game: GameContextValue) {
  useGameMock.mockReturnValue(game);

  return render(
    <MemoryRouter initialEntries={["/game"]}>
      <ChoiceList />
      <LocationProbe />
    </MemoryRouter>,
  );
}

beforeEach(() => {
  useGameMock.mockReset();
});

afterEach(cleanup);

describe("ChoiceList with no available actions", () => {
  test("offers three ways out when the current chapter can be replayed", () => {
    renderList(makeGame({ canEnterChapter: vi.fn(() => true) }));

    expect(screen.getByText(/Доступных действий сейчас нет/)).toBeTruthy();
    expect(
      screen.getByRole("button", { name: "Начать главу сначала" }),
    ).toBeTruthy();
    expect(
      screen.getByRole("button", { name: "Начать игру сначала" }),
    ).toBeTruthy();
    expect(
      screen.getByRole("button", { name: "Выбрать другую главу" }),
    ).toBeTruthy();
  });

  // Регрессия на исправление: без снимка chooseChapter вернул бы false и кнопка
  // молча ничего бы не делала — поэтому её не показываем вовсе.
  test("hides the chapter replay when the chapter has no snapshot", () => {
    renderList(makeGame({ canEnterChapter: vi.fn(() => false) }));

    expect(
      screen.queryByRole("button", { name: "Начать главу сначала" }),
    ).toBeNull();
    // Выход из тупика всё равно остаётся.
    expect(
      screen.getByRole("button", { name: "Начать игру сначала" }),
    ).toBeTruthy();
    expect(
      screen.getByRole("button", { name: "Выбрать другую главу" }),
    ).toBeTruthy();
  });

  test("replaying the chapter calls chooseChapter with the current chapter", async () => {
    const chooseChapter = vi.fn();
    renderList(makeGame({ chooseChapter }));

    await userEvent.click(
      screen.getByRole("button", { name: "Начать главу сначала" }),
    );

    expect(chooseChapter).toHaveBeenCalledWith(chapterScene.chapter);
  });

  test("starting a new game calls startNewGame", async () => {
    const startNewGame = vi.fn();
    renderList(makeGame({ startNewGame }));

    await userEvent.click(
      screen.getByRole("button", { name: "Начать игру сначала" }),
    );

    expect(startNewGame).toHaveBeenCalled();
  });

  test("the chapter-select button navigates to /chapters", async () => {
    renderList(makeGame());

    await userEvent.click(
      screen.getByRole("button", { name: "Выбрать другую главу" }),
    );

    expect(screen.getByTestId("path").textContent).toBe(
      `/${gameData.meta.id}/chapters`,
    );
  });
});
