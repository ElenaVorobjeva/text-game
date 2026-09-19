import { Navigate, Route, Routes } from "react-router";

import { GameHeader } from "../components/game/GameHeader";
import { ChapterSelectPage } from "../pages/ChapterSelectPage";
import { EndingDetailPage } from "../pages/EndingDetailPage";
import { EndingsPage } from "../pages/EndingsPage";
import { GamePage } from "../pages/GamePage";
import { MainMenuPage } from "../pages/MainMenuPage";
import { useGame } from "../state/useGame";
import { gamePath } from "../utils/common";

// Раскладка одной игры: её экраны под /:gameId/*. Живёт внутри GameProvider
// (см. GameRoute), поэтому берёт gameId/hasSave из useGame.
export function GameView() {
  const { gameId, hasSave } = useGame();
  const menuPath = gamePath(gameId);

  // Шапка на всех экранах игры; на меню она свёрнута до «К играм» (см. GameHeader).
  return (
    <>
      <GameHeader />

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
