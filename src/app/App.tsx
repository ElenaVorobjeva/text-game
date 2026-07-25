import { MainMenuPage } from "../pages/MainMenuPage";
import { GamePage } from "../pages/GamePage";
import { ChapterSelectPage } from "../pages/ChapterSelectPage";
import { Navigate, Route, Routes, useLocation } from "react-router";
import { useGame } from "../state/useGame";
import { EndingsPage } from "../pages/EndingsPage";
import { EndingDetailPage } from "../pages/EndingDetailPage";
import { GameHeader } from "../components/game/GameHeader";

export function App() {
  const { hasSave } = useGame();
  const location = useLocation();
  const layoutStyles =
    "flex min-h-screen flex-col bg-black font-text text-light-blue";

  // Шапка везде, кроме главного меню.
  const showHeader = location.pathname !== "/";

  return (
    <div className={layoutStyles}>
      {showHeader && <GameHeader />}

      <Routes>
        <Route path="/" element={<MainMenuPage />} />
        <Route
          path="/game"
          element={hasSave ? <GamePage /> : <Navigate to="/" replace />}
        />
        <Route path="/chapters" element={<ChapterSelectPage />} />
        <Route path="/endings" element={<EndingsPage />} />
        <Route path="/endings/:endingType" element={<EndingDetailPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}
