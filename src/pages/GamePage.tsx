import { useGame } from "../state/useGame";
import { GameHeader } from "../components/game/GameHeader";
import { SceneView } from "../components/game/SceneView";
import { ChoiceList } from "../components/game/ChoiceList";
import { EndingView } from "../components/game/EndingView";
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

  return (
    <div className="flex grow flex-col">
      <GameHeader
        onMainMenu={() => navigate("/")}
        onChapterSelect={() => navigate("/chapters")}
        onRestart={restart}
      />

      {isEnding ? (
        <EndingView
          key={scene.id}
          image={image}
          title={scene.title}
          text={scene.text}
          onRestart={restart}
          onChapterSelect={() => navigate("/chapters")}
        />
      ) : (
        <div
          key={scene.id}
          className="animate-fade-up flex grow flex-col items-center justify-center gap-4 px-6 py-5"
        >
          <SceneView image={image} title={scene.title} text={scene.text} />

          <ChoiceList choices={choices} onChoose={choose} />
        </div>
      )}
    </div>
  );
}
