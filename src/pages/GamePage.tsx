import { useNavigate } from "react-router";

import { ChoiceList } from "../components/game/ChoiceList";
import { EndingView } from "../components/game/EndingView";
import { SceneView } from "../components/game/SceneView";
import { StatsBar } from "../components/game/StatsBar";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { useGame } from "../state/useGame";
import { gamePath, restartGame } from "../utils/common";

export function GamePage() {
  const navigate = useNavigate();
  const { scene, resetGame, gameId, gameData, image } = useGame();

  useDocumentTitle(`${scene.title} — ${gameData.meta.title}`);

  if (scene.isEnding) {
    return (
      <EndingView
        key={scene.id}
        image={image}
        title={scene.title}
        text={scene.text}
        onRestart={() => restartGame(resetGame, navigate, gameId)}
        onChapterSelect={() => navigate(gamePath(gameId, "chapters"))}
      />
    );
  }

  return (
    <div
      key={scene.id}
      className="animate-fade-up flex grow flex-col items-center justify-center gap-6 px-6 py-5"
    >
      {/* Статы видны только во время игры, над сценой. */}
      <StatsBar />

      <SceneView image={image} title={scene.title} text={scene.text} />

      <ChoiceList />
    </div>
  );
}
