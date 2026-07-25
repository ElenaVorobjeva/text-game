import { useGame } from "../state/useGame";
import { SceneView } from "../components/game/SceneView";
import { ChoiceList } from "../components/game/ChoiceList";
import { EndingView } from "../components/game/EndingView";
import { StatsBar } from "../components/game/StatsBar";
import { getSceneImage } from "../engine/gameEngine";
import { useNavigate } from "react-router";
import { restartGame } from "../utils/common";
import { useEffect } from "react";
import { useUser } from "../state/useUser";

export function GamePage() {
  const navigate = useNavigate();
  const { scene, choices, choose, resetGame } = useGame();
  const { completeEnding } = useUser();
  const image = getSceneImage(scene);

  useEffect(() => {
    if (scene.isEnding && scene.endingType) completeEnding(scene.endingType);
  }, [scene, completeEnding]);

  const isEnding = Boolean(scene.isEnding);

  if (isEnding) {
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

      <ChoiceList choices={choices} onChoose={choose} />
    </div>
  );
}
