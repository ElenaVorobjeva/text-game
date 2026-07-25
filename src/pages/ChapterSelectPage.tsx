import { useLocation, useNavigate } from "react-router";
import Button from "../components/base/Button";
import Main from "../components/base/Main";
import { gameData } from "../engine/gameEngine";
import { useGame } from "../state/useGame";
import { Card } from "../components/base/Card";

export function ChapterSelectPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const { chooseChapter, canEnterChapter } = useGame();

  const chapters = gameData.chapters;

  function goBack() {
    if (location.key !== "default") navigate(-1);
    else navigate("/");
  }

  return (
    <Main classes="gap-9">
      <h1 className="text-light-blue text-lg font-bold">Выбор главы</h1>

      <div className="flex max-w-[56.25rem] flex-wrap justify-center gap-7">
        {chapters.map((chapterData, index) => {
          const { id, title, image } = chapterData;

          // Доступность считается по наличию снимка, а не по unlockedChapters:
          // у сохранений, мигрированных со старого формата, главы отмечены
          // открытыми, но снимков для них нет — перейти туда всё равно нельзя.
          const isAvailable = canEnterChapter(id);

          return (
            <div
              key={id}
              className="animate-fade-up"
              style={{ animationDelay: `${0.05 + index * 0.07}s` }}
            >
              <Card
                key={id}
                type="chapter"
                id={id}
                title={title}
                image={image}
                disabled={!isAvailable}
                onClick={() => {
                  if (chooseChapter(chapterData)) navigate("/game");
                }}
              />
            </div>
          );
        })}
      </div>

      <Button width="fullOnMobile" onClick={goBack}>
        Назад
      </Button>
    </Main>
  );
}
