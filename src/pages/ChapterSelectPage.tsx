import Button from "../components/base/Button";
import Main from "../components/base/Main";
import { ChapterCard } from "../components/chapters/ChapterCard";
import gameData from "../data/gameData.json";
import { useGame } from "../state/useGame";

export function ChapterSelectPage({ onBack }: { onBack: () => void }) {
  const { gameState, chooseChapter } = useGame();
  const { unlockedChapters } = gameState;

  const chapters = gameData.chapters;

  return (
    <Main classes="gap-9">
      <h1 className="text-lg font-bold text-light-blue">Выбор главы</h1>

      <div className="flex max-w-[56.25rem] flex-wrap justify-center gap-7">
        {chapters.map((chapterData, index) => {
          const { id, title, image } = chapterData;
          const isUnlocked = unlockedChapters.includes(id);

          return (
            <div
              key={id}
              className="animate-fade-up"
              style={{ animationDelay: `${0.05 + index * 0.07}s` }}
            >
              <ChapterCard
                id={id}
                title={title}
                image={image}
                disabled={!isUnlocked}
                onClick={() => {
                  chooseChapter(chapterData);
                }}
              />
            </div>
          );
        })}
      </div>

      <Button width="fullOnMobile" onClick={onBack}>
        Назад
      </Button>
    </Main>
  );
}
