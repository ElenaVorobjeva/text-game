import { useLocation, useNavigate } from "react-router";

import { Button } from "../components/base/Button";
import { Card } from "../components/base/Card";
import { CardGrid } from "../components/base/CardGrid";
import { Main } from "../components/base/Main";
import { Title } from "../components/base/Title";
import { gameData } from "../engine/gameEngine";
import { useUser } from "../state/useUser";
import { goBack } from "../utils/common";

export function EndingsPage() {
  const { completedEndings } = useUser();
  const navigate = useNavigate();
  const location = useLocation();

  const endings = gameData.scenes.filter(({ isEnding }) => isEnding);

  return (
    <Main className="gap-9">
      <Title>Концовки</Title>

      <CardGrid>
        {endings.map((endingData, index) => {
          const { id, title, image, endingType } = endingData;

          const isAvailable = Boolean(
            endingType && completedEndings.includes(endingType),
          );

          return (
            <Card
              key={id}
              type="ending"
              index={index}
              title={title}
              image={image}
              disabled={!isAvailable}
              onClick={() => navigate(`/endings/${endingType}`)}
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
