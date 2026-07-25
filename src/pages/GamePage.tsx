import { useGame } from "../state/useGame";
import { SceneView } from "../components/game/SceneView";
import { ChoiceList } from "../components/game/ChoiceList";
import { EndingView } from "../components/game/EndingView";
import { StatsBar } from "../components/game/StatsBar";
import { getSceneImage } from "../engine/gameEngine";
import { useNavigate } from "react-router";

export function GamePage() {
  const navigate = useNavigate();
  const { scene, choices, choose, resetGame } = useGame();
  const image = getSceneImage(scene);

  const isEnding = Boolean(scene.isEnding);

  const restart = () => {
    resetGame();
    navigate("/");
  };

  if (isEnding) {
    return (
      <EndingView
        key={scene.id}
        image={image}
        title={scene.title}
        text={scene.text}
        onRestart={restart}
        onChapterSelect={() => navigate("/chapters")}
      />
    );
  }

  return (
    <div
      key={scene.id}
      className="animate-fade-up flex grow flex-col items-center justify-center gap-4 px-6 py-5"
    >
      {/* Статы видны только во время игры, над сценой. */}
      <StatsBar />

      <SceneView image={image} title={scene.title} text={scene.text} />

      <ChoiceList choices={choices} onChoose={choose} />
    </div>
  );
}
