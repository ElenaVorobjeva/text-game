import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./app/App.tsx";
import { ErrorBoundary } from "./components/base/ErrorBoundary.tsx";
import { GameProvider } from "./state/gameProvider.tsx";
import "./main.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    {/* Снаружи провайдера: падение при загрузке сохранения тоже должно
        показывать экран ошибки, а не пустую страницу. */}
    <ErrorBoundary>
      <GameProvider>
        <App />
      </GameProvider>
    </ErrorBoundary>
  </StrictMode>,
);
