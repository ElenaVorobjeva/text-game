import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { HashRouter } from "react-router";

import { App } from "./app/App.tsx";
import { BootGate } from "./app/BootGate.tsx";
import { ErrorBoundary } from "./components/base/ErrorBoundary.tsx";
import { UserProvider } from "./state/userProvider.tsx";

// Стили импортируются последними: это единственный импорт ради побочного
// эффекта, и порядок групп на него не распространяется.
import "./main.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ErrorBoundary>
      <HashRouter>
        <BootGate>
          {(data) => (
            <UserProvider initialData={data}>
              <App />
            </UserProvider>
          )}
        </BootGate>
      </HashRouter>
    </ErrorBoundary>
  </StrictMode>,
);
