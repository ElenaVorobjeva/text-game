import { useNavigate } from "react-router";

import { ChoiceList } from "../components/game/ChoiceList";
import { EndingView } from "../components/game/EndingView";
import { SceneView } from "../components/game/SceneView";
import { StatsBar } from "../components/game/StatsBar";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { useGameActions } from "../hooks/useGameActions";
import { useGame } from "../state/useGame";
import { gamePath } from "../utils/common";

export function GamePage() {
  const navigate = useNavigate();
  const { scene, gameId, gameData, image } = useGame();
  const { restart } = useGameActions();

  useDocumentTitle(`${scene.title} — ${gameData.meta.title}`);

  const chapter = gameData.chapters.find(({ id }) => id === scene.chapter);
  const chapterLabel = chapter ? `Глава ${chapter.id}: ${chapter.title}` : "";

  if (scene.isEnding) {
    return (
      <EndingView
        key={scene.id}
        image={image}
        title={scene.title}
        text={scene.text}
        onRestart={restart}
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

      <SceneView
        image={image}
        imageAlt={chapterLabel}
        title={scene.title}
        text={scene.text}
      />

      <ChoiceList />
    </div>
  );
}
