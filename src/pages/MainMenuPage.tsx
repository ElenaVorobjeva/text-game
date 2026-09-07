import { useNavigate } from "react-router";

import { Button } from "../components/base/Button";
import { Heading } from "../components/base/Heading";
import { Main } from "../components/base/Main";
import { Row } from "../components/base/Row";
import { useGame } from "../state/useGame";
import { gamePath, startGame } from "../utils/common";

export function MainMenuPage() {
  const { hasSave, startNewGame, continueGame, gameId } = useGame();
  const navigate = useNavigate();

  return (
    <Main className="gap-11">
      <div>
        <Heading className="md:text-2xl">Тихий хороший день</Heading>

        <p className="leading-free text-grey-blue max-w-intro mx-auto mt-5 text-sm">
          Небольшая текстовая игра о мягком ритме жизни, простых решениях и
          спокойном дне.
        </p>
      </div>

      <Row>
        {!hasSave && (
          <Button
            size="lg"
            width="fullOnMobile"
            onClick={() => {
              startGame(startNewGame, navigate, gameId);
            }}
          >
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

            <Button
              size="lg"
              width="fullOnMobile"
              onClick={() => {
                startGame(startNewGame, navigate, gameId);
              }}
            >
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
