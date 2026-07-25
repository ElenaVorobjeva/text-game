import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./app/App.tsx";
import { ErrorBoundary } from "./components/base/ErrorBoundary.tsx";
import { GameProvider } from "./state/gameProvider.tsx";
import "./main.css";
import { HashRouter } from "react-router";
import { UserProvider } from "./state/userProvider.tsx";

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
