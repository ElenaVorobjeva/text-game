import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { HashRouter } from "react-router";

import { App } from "./app/App.tsx";
import { ErrorBoundary } from "./components/base/ErrorBoundary.tsx";
import { GameProvider } from "./state/gameProvider.tsx";
import { UserProvider } from "./state/userProvider.tsx";

// Стили импортируются последними: это единственный импорт ради побочного
// эффекта, и порядок групп на него не распространяется.
import "./main.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ErrorBoundary>
      <HashRouter>
        <UserProvider>
          <GameProvider>
            <App />
          </GameProvider>
        </UserProvider>
      </HashRouter>
    </ErrorBoundary>
  </StrictMode>,
);
