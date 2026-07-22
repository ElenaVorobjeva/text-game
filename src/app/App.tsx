import { useState } from "react";
import { MainMenuPage } from "../pages/MainMenuPage";
import { GamePage } from "../pages/GamePage";
import { ChapterSelectPage } from "../pages/ChapterSelectPage";

type Screen = "mainMenu" | "game" | "chapterSelect";

export default function App() {
  const [screen, setScreen] = useState<Screen>("mainMenu");

  const layoutStyles =
    "flex min-h-screen flex-col bg-black font-text text-light-blue";

  return (
    <div className={layoutStyles}>
      {screen === "chapterSelect" && (
        <ChapterSelectPage
          onBack={() => setScreen("mainMenu")}
          onChapterChosen={() => setScreen("game")}
        />
      )}

      {screen === "game" && (
        <GamePage
          onMainMenu={() => setScreen("mainMenu")}
          onChapterSelect={() => setScreen("chapterSelect")}
        />
      )}

      {screen === "mainMenu" && (
        <MainMenuPage
          onStart={() => setScreen("game")}
          onContinue={() => setScreen("game")}
          onChapterSelect={() => setScreen("chapterSelect")}
        />
      )}
    </div>
  );
}
