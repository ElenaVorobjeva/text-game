import { Navigate, Route, Routes, useLocation } from "react-router";

import { GameHeader } from "../components/game/GameHeader";
import { ChapterSelectPage } from "../pages/ChapterSelectPage";
import { EndingDetailPage } from "../pages/EndingDetailPage";
import { EndingsPage } from "../pages/EndingsPage";
import { GamePage } from "../pages/GamePage";
import { MainMenuPage } from "../pages/MainMenuPage";
import { useGame } from "../state/useGame";
import { gamePath } from "../utils/common";

// Раскладка одной игры: её экраны под /:gameId/*. Живёт внутри GameProvider
// (см. GameShell), поэтому берёт gameId/hasSave из useGame.
export function GameView() {
  const { gameId, hasSave } = useGame();
  const location = useLocation();
  const menuPath = gamePath(gameId);

  // Шапка везде, кроме меню игры.
  const showHeader = location.pathname !== menuPath;

  return (
    <>
      {showHeader && <GameHeader />}

      <Routes>
        <Route index element={<MainMenuPage />} />
        <Route
          path="game"
          element={hasSave ? <GamePage /> : <Navigate to={menuPath} replace />}
        />
        <Route path="chapters" element={<ChapterSelectPage />} />
        <Route path="endings" element={<EndingsPage />} />
        <Route path="endings/:endingType" element={<EndingDetailPage />} />
        <Route path="*" element={<Navigate to={menuPath} replace />} />
      </Routes>
    </>
  );
}
