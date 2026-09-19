import { useLocation, useNavigate } from "react-router";

import { Button } from "../components/base/Button";
import { Card } from "../components/base/Card";
import { CardGrid } from "../components/base/CardGrid";
import { Main } from "../components/base/Main";
import { Title } from "../components/base/Title";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { useGame } from "../state/useGame";
import { gamePath, goBack } from "../utils/common";

export function ChapterSelectPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const { chooseChapter, canEnterChapter, gameData, gameId } = useGame();

  const chapters = gameData.chapters;

  useDocumentTitle(`Выбор главы — ${gameData.meta.title}`);

  return (
    <Main className="gap-9">
      <Title>Выбор главы</Title>

      <CardGrid>
        {chapters.map((chapterData, index) => {
          const { id, title, image } = chapterData;

          // Доступность считается по наличию снимка главы (gameStatistic):
          // нет снимка — в главу ещё не входили, перейти туда нельзя.
          const isAvailable = canEnterChapter(id);

          return (
            <Card
              key={id}
              index={index}
              label={`Глава ${id}: ${title}`}
              image={image}
              closedLabel={isAvailable ? undefined : "Глава закрыта"}
              onClick={() => {
                if (chooseChapter(id)) navigate(gamePath(gameId, "game"));
              }}
            />
          );
        })}
      </CardGrid>

      <Button
        width="fullOnMobile"
        onClick={() => goBack(navigate, location, gamePath(gameId))}
      >
        Назад
      </Button>
    </Main>
  );
}
