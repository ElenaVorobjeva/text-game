// @vitest-environment jsdom
import { act, cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { afterEach, beforeEach, describe, expect, test } from "vitest";

import { App } from "../app/App";
import { createInitialGameState, gameData } from "../engine/gameEngine";
import { addCompletedEnding, USER_KEY } from "../user/userProfile";
import { saveGame } from "../utils/saveLoad";

import { GameProvider } from "./gameProvider";
import { UserProvider } from "./userProvider";

// Профиль пользователя (собранные концовки) кэшируется в состоянии провайдера,
// а не перечитывается с диска на каждый рендер. Эти тесты сторожат именно те
// места, где кэш может разойтись с реальностью: концовка, открытая в текущей
// сессии, и запись из соседней вкладки.

function isEndingId(id: string) {
  return gameData.scenes.some((scene) => scene.id === id && scene.isEnding);
}

// Финальная развилка и её безусловный вариант: единственный путь к концовке,
// доступный при любых характеристиках. Всё берётся из данных — id сцен и тексты
// вариантов живут только в gameData.json, дублировать их в тесте нельзя.
const finalScene = gameData.scenes.find((scene) =>
  scene.choices.some(
    (choice) => !choice.conditions && isEndingId(choice.nextSceneId),
  ),
)!;

const finalChoice = finalScene.choices.find(
  (choice) => !choice.conditions && isEndingId(choice.nextSceneId),
)!;

const ending = gameData.scenes.find(
  (scene) => scene.id === finalChoice.nextSceneId,
)!;

const endingType = ending.endingType!;

// Заголовок страницы концовки: «Концовка:» — это подпись из UI, в данных её нет.
const ENDING_HEADING = `Концовка: ${ending.title}`;
// Заголовок списка концовок. Совпадает с текстом пункта меню, но это heading,
// а пункт меню — button, поэтому по роли они не путаются.
const ENDINGS_LIST_HEADING = "Концовки";
const ENDINGS_MENU_ITEM = "Концовки";

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <UserProvider>
        <GameProvider>
          <App />
        </GameProvider>
      </UserProvider>
    </MemoryRouter>,
  );
}

// Сохранение на шаг до концовки: дальше один клик по безусловному варианту.
function saveBeforeEnding() {
  saveGame({ ...createInitialGameState(), currentSceneId: finalScene.id });
}

beforeEach(() => {
  localStorage.clear();
});

afterEach(cleanup);

describe("endings completed during the session", () => {
  test("the endings menu item appears without a reload", async () => {
    const user = userEvent.setup();
    saveBeforeEnding();
    renderAt("/game");

    expect(
      screen.queryByRole("button", { name: ENDINGS_MENU_ITEM }),
    ).toBeNull();

    await user.click(screen.getByRole("button", { name: finalChoice.text }));

    expect(
      await screen.findByRole("button", { name: ENDINGS_MENU_ITEM }),
    ).toBeTruthy();
  });

  test("the ending opens from the list instead of redirecting back", async () => {
    const user = userEvent.setup();
    saveBeforeEnding();
    renderAt("/game");

    await user.click(screen.getByRole("button", { name: finalChoice.text }));
    await user.click(
      await screen.findByRole("button", { name: ENDINGS_MENU_ITEM }),
    );

    // Карточка открытой концовки: доступное имя собирается из alt картинки и
    // подписи, поэтому ищем по вхождению названия.
    await user.click(
      screen.getByRole("button", { name: new RegExp(ending.title) }),
    );

    // Guard страницы концовки спрашивает профиль. Если он отвечает по данным
    // первого рендера, страница отбросит обратно на список.
    expect(
      await screen.findByRole("heading", { name: ENDING_HEADING }),
    ).toBeTruthy();
    expect(
      screen.queryByRole("heading", { name: ENDINGS_LIST_HEADING }),
    ).toBeNull();
  });
});

describe("endings from previous sessions", () => {
  test("an ending saved earlier is available right after mount", async () => {
    addCompletedEnding(endingType);

    renderAt(`/endings/${endingType}`);

    expect(
      await screen.findByRole("heading", { name: ENDING_HEADING }),
    ).toBeTruthy();
  });

  test("an ending that was never completed redirects to the list", async () => {
    renderAt(`/endings/${endingType}`);

    expect(
      await screen.findByRole("heading", { name: ENDINGS_LIST_HEADING }),
    ).toBeTruthy();
  });
});

describe("profile written by another tab", () => {
  test("the storage event brings the change into this tab", async () => {
    renderAt("/chapters");

    expect(
      screen.queryByRole("button", { name: ENDINGS_MENU_ITEM }),
    ).toBeNull();

    // Соседняя вкладка дописала концовку. Событие storage шлём руками: браузер
    // рассылает его только в другие вкладки, а jsdom — вообще не рассылает.
    addCompletedEnding(endingType);
    act(() => {
      window.dispatchEvent(new StorageEvent("storage", { key: USER_KEY }));
    });

    expect(
      await screen.findByRole("button", { name: ENDINGS_MENU_ITEM }),
    ).toBeTruthy();
  });

  test("an unrelated storage key is ignored", async () => {
    renderAt("/chapters");

    addCompletedEnding(endingType);
    act(() => {
      window.dispatchEvent(
        new StorageEvent("storage", { key: "unrelated-key" }),
      );
    });

    // Чужой ключ не повод перечитывать профиль: пункт меню не появился.
    expect(
      screen.queryByRole("button", { name: ENDINGS_MENU_ITEM }),
    ).toBeNull();
  });
});
