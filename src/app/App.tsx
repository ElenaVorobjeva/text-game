import { Navigate, Route, Routes } from "react-router";

import { GameCatalogPage } from "../pages/GameCatalogPage";

import { GameRoute } from "./GameRoute";

export function App() {
  const layoutStyles =
    "flex min-h-screen flex-col bg-black font-text text-light-blue";

  return (
    <div className={layoutStyles}>
      <Routes>
        <Route path="/" element={<GameCatalogPage />} />
        <Route path="/:gameId/*" element={<GameRoute />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}
