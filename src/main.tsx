import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { HashRouter } from "react-router";

import { App } from "./app/App.tsx";
import { BootGate } from "./app/BootGate.tsx";
import { ErrorBoundary } from "./components/base/ErrorBoundary.tsx";
import { DEFAULT_GAME_ID, getGameData } from "./data/games.ts";
import { GameProvider } from "./state/gameProvider.tsx";
import { UserProvider } from "./state/userProvider.tsx";

// Стили импортируются последними: это единственный импорт ради побочного
// эффекта, и порядок групп на него не распространяется.
import "./main.css";

// Пока нет выбора игры — стартуем с игры по умолчанию. В 4b активную игру
// задаст gameId из URL.
const activeGame = getGameData(DEFAULT_GAME_ID)!;

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ErrorBoundary>
      <HashRouter>
        <BootGate>
          {(data) => (
            <UserProvider initialData={data}>
              <GameProvider initialData={data} gameData={activeGame}>
                <App />
              </GameProvider>
            </UserProvider>
          )}
        </BootGate>
      </HashRouter>
    </ErrorBoundary>
  </StrictMode>,
);
