// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, test } from "vitest";

import { quietGoodLife } from "../test/fixtures";
import type { GameData } from "../types/game";
import type { UserData } from "../user/userStorage";

import { GameProvider } from "./gameProvider";
import { useGame } from "./useGame";
import { UserProvider } from "./userProvider";
import { useUser } from "./useUser";

// Пустой пользователь: сохранения нет, поэтому провайдер стартует с начального
// состояния переданной игры.
const emptyUser: UserData = { games: {} };

// Вторая игра, не совпадающая со вшитой. Нужна, чтобы поймать баг «провайдер
// взял синглтон вместо пропа»: на такой ошибке gameId и стартовая сцена были бы
// от базовой игры, а не от этой. Движку важна структура, а не содержание.
const otherGame: GameData = {
  meta: {
    id: "other_game",
    title: "Другая игра",
    version: "1",
    startSceneId: "other_start",
    cover: "",
    description: "",
  },
  initialState: {
    flags: {},
    stats: { care: 0, connection: 0, calm: 0 },
    inventory: [],
    visitedScenes: [],
  },
  chapters: [{ id: 1, title: "Глава", image: "", startScene: "other_start" }],
  scenes: [
    {
      id: "other_start",
      chapter: 1,
      step: 1,
      title: "Старт другой игры",
      text: "…",
      choices: [],
    },
  ],
};

// Проба читает контекст и выводит то, что должно прийти именно от пропа.
function Probe() {
  const { gameId, scene } = useGame();

  return (
    <div>
      <span data-testid="id">{gameId}</span>
      <span data-testid="scene">{scene.title}</span>
    </div>
  );
}

afterEach(cleanup);

describe("GameProvider", () => {
  test("drives the game from the gameData prop, not a bundled singleton", () => {
    render(
      <UserProvider initialData={emptyUser}>
        <GameProvider gameData={otherGame}>
          <Probe />
        </GameProvider>
      </UserProvider>,
    );

    expect(screen.getByTestId("id").textContent).toBe("other_game");
    expect(screen.getByTestId("scene").textContent).toBe("Старт другой игры");
  });
});

describe("GameProvider: progress ownership", () => {
  test("a saved game shows up in the profile held by UserProvider", async () => {
    function Panel() {
      const { startNewGame, gameState, gameId } = useGame();
      const { data } = useUser();
      const saved = data.games[gameId]?.progress;

      return (
        <>
          <button type="button" onClick={startNewGame}>
            new
          </button>
          <span data-testid="same">
            {String(JSON.stringify(saved) === JSON.stringify(gameState))}
          </span>
          <span data-testid="has">{String(saved !== undefined)}</span>
        </>
      );
    }

    render(
      <UserProvider initialData={emptyUser}>
        <GameProvider gameData={quietGoodLife}>
          <Panel />
        </GameProvider>
      </UserProvider>,
    );

    expect(screen.getByTestId("has").textContent).toBe("false");

    await userEvent.setup().click(screen.getByRole("button", { name: "new" }));

    // Без прохода через провайдера снимок остался бы пустым до перезагрузки.
    expect(screen.getByTestId("has").textContent).toBe("true");
    expect(screen.getByTestId("same").textContent).toBe("true");
  });
});
