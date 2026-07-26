import { useLocation, useNavigate } from "react-router";

import { Button } from "../components/base/Button";
import { Card } from "../components/base/Card";
import { CardGrid } from "../components/base/CardGrid";
import { Main } from "../components/base/Main";
import { Title } from "../components/base/Title";
import { gameData } from "../engine/gameEngine";
import { useGame } from "../state/useGame";
import { goBack } from "../utils/common";

export function ChapterSelectPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const { chooseChapter, canEnterChapter } = useGame();

  const chapters = gameData.chapters;

  return (
    <Main className="gap-9">
      <Title>Выбор главы</Title>

      <CardGrid>
        {chapters.map((chapterData, index) => {
          const { id, title, image } = chapterData;

          // Доступность считается по наличию снимка, а не по unlockedChapters:
          // у сохранений, мигрированных со старого формата, главы отмечены
          // открытыми, но снимков для них нет — перейти туда всё равно нельзя.
          const isAvailable = canEnterChapter(id);

          return (
            <Card
              key={id}
              index={index}
              type="chapter"
              id={id}
              title={title}
              image={image}
              disabled={!isAvailable}
              onClick={() => {
                if (chooseChapter(chapterData)) navigate("/game");
              }}
            />
          );
        })}
      </CardGrid>

      <Button
        width="fullOnMobile"
        onClick={() => goBack(navigate, location, "/")}
      >
        Назад
      </Button>
    </Main>
  );
}
