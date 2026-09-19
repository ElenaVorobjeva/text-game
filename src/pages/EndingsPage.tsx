import { useLocation, useNavigate } from "react-router";

import { Button } from "../components/base/Button";
import { Card } from "../components/base/Card";
import { CardGrid } from "../components/base/CardGrid";
import { Main } from "../components/base/Main";
import { Title } from "../components/base/Title";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { useGame } from "../state/useGame";
import { useUser } from "../state/useUser";
import { gamePath, goBack } from "../utils/common";

export function EndingsPage() {
  const { gameId, gameData } = useGame();
  const { isEndingCompleted } = useUser();
  const navigate = useNavigate();
  const location = useLocation();

  useDocumentTitle(`Концовки — ${gameData.meta.title}`);

  const endings = gameData.scenes.filter(({ isEnding }) => isEnding);

  return (
    <Main className="gap-9">
      <Title>Концовки</Title>

      <CardGrid>
        {endings.map((endingData, index) => {
          const { id, title, image, endingType } = endingData;

          const isAvailable = Boolean(
            endingType && isEndingCompleted(gameId, endingType),
          );

          return (
            <Card
              key={id}
              index={index}
              label={title}
              image={image}
              closedLabel={isAvailable ? undefined : "Концовка ещё не открыта"}
              onClick={() =>
                navigate(gamePath(gameId, `endings/${endingType}`))
              }
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
