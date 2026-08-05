import { useEffect } from "react";
import { useNavigate } from "react-router";

import { ChoiceList } from "../components/game/ChoiceList";
import { EndingView } from "../components/game/EndingView";
import { SceneView } from "../components/game/SceneView";
import { StatsBar } from "../components/game/StatsBar";
import { useGame } from "../state/useGame";
import { useUser } from "../state/useUser";
import { restartGame } from "../utils/common";

export function GamePage() {
  const navigate = useNavigate();
  const { scene, resetGame, gameId, image } = useGame();
  const { completeEnding } = useUser();

  useEffect(() => {
    if (scene.isEnding && scene.endingType)
      completeEnding(gameId, scene.endingType);
  }, [scene, completeEnding, gameId]);

  if (scene.isEnding) {
    return (
      <EndingView
        key={scene.id}
        image={image}
        title={scene.title}
        text={scene.text}
        onRestart={() => restartGame(resetGame, navigate)}
        onChapterSelect={() => navigate("/chapters")}
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
