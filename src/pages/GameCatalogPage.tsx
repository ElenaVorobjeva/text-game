import { useNavigate } from "react-router";

import { Card } from "../components/base/Card";
import { CardGrid } from "../components/base/CardGrid";
import { Main } from "../components/base/Main";
import { Title } from "../components/base/Title";
import { gameList } from "../data/games";
import { gamePath } from "../utils/common";

export function GameCatalogPage() {
  const navigate = useNavigate();

  return (
    <Main className="gap-9">
      <Title>Выбор игры</Title>

      <CardGrid>
        {gameList.map((game, index) => (
          <Card
            key={game.meta.id}
            type="game"
            index={index}
            title={game.meta.title}
            image={game.meta.cover}
            disabled={false}
            onClick={() => navigate(gamePath(game.meta.id))}
          />
        ))}
      </CardGrid>
    </Main>
  );
}
