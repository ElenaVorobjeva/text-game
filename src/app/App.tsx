import { Navigate, Route, Routes } from "react-router";

import { DEFAULT_GAME_ID } from "../data/games";
import { gamePath } from "../utils/common";

import { GameShell } from "./GameShell";

export function App() {
  const layoutStyles =
    "flex min-h-screen flex-col bg-black font-text text-light-blue";

  return (
    <div className={layoutStyles}>
      <Routes>
        {/* Пока нет каталога — корень ведёт на игру по умолчанию. В 4c это
            заменит экран выбора игры. */}
        <Route
          path="/"
          element={<Navigate to={gamePath(DEFAULT_GAME_ID)} replace />}
        />
        <Route path="/:gameId/*" element={<GameShell />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}
