import { useNavigate } from "react-router";

import { Button } from "../components/base/Button";
import { Heading } from "../components/base/Heading";
import { Main } from "../components/base/Main";
import { Row } from "../components/base/Row";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { useGameActions } from "../hooks/useGameActions";
import { useGame } from "../state/useGame";
import { gamePath } from "../utils/common";

export function MainMenuPage() {
  const { hasSave, continueGame, gameId, gameData } = useGame();
  const { start } = useGameActions();
  const navigate = useNavigate();

  useDocumentTitle(gameData.meta.title);

  return (
    <Main className="gap-11">
      <div>
        <Heading className="md:text-2xl">{gameData.meta.title}</Heading>

        <p className="leading-free text-grey-blue max-w-intro mx-auto mt-5 text-sm">
          {gameData.meta.description}
        </p>
      </div>

      <Row>
        {!hasSave && (
          <Button size="lg" width="fullOnMobile" onClick={start}>
            Старт
          </Button>
        )}

        {hasSave && (
          <>
            <Button
              size="lg"
              width="fullOnMobile"
              onClick={() => {
                const shouldNavigate = continueGame();
                if (shouldNavigate) navigate(gamePath(gameId, "game"));
              }}
            >
              Продолжить
            </Button>

            <Button size="lg" width="fullOnMobile" onClick={start}>
              Начать сначала
            </Button>

            <Button
              size="lg"
              width="fullOnMobile"
              onClick={() => {
                navigate(gamePath(gameId, "chapters"));
              }}
            >
              Выбрать главу
            </Button>
          </>
        )}
      </Row>
    </Main>
  );
}
