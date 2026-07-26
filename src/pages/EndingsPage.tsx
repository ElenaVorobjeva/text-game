import { Main } from "../components/base/Main";
import { Button } from "../components/base/Button";
import { gameData } from "../engine/gameEngine";
import { useLocation, useNavigate } from "react-router";
import { Card } from "../components/base/Card";
import { goBack } from "../utils/common";
import { useUser } from "../state/useUser";
import { CardGrid } from "../components/base/CardGrid";
import { Title } from "../components/base/Title";

export function EndingsPage() {
  const { completedEndings } = useUser();
  const navigate = useNavigate();
  const location = useLocation();

  const endings = gameData.scenes.filter(({ isEnding }) => isEnding);

  return (
    <Main classes="gap-9">
      <Title>Концовки</Title>

      <CardGrid>
        {endings.map((endingData, index) => {
          const { id, title, image, endingType } = endingData;

          const isAvailable =
            !!endingType && completedEndings.includes(endingType);

          return (
            <Card
              key={id}
              type="ending"
              index={index}
              id={id}
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
