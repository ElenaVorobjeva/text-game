import { useNavigate } from "react-router";
import { Button } from "../components/base/Button";
import { Main } from "../components/base/Main";
import { useGame } from "../state/useGame";
import { Heading } from "../components/base/Heading";
import { Row } from "../components/base/Row";

export function MainMenuPage() {
  const { hasSave, startNewGame, resetGame, continueGame } = useGame();
  const navigate = useNavigate();

  return (
    <Main className="gap-11">
      <div>
        <Heading className="md:text-2xl">Тихий хороший день</Heading>

        <p className="leading-free text-grey-blue mx-auto mt-5 max-w-[40rem] text-sm">
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
              startNewGame();
              navigate("/game");
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
                if (shouldNavigate) navigate("/game");
              }}
            >
              Продолжить
            </Button>

            <Button
              size="lg"
              width="fullOnMobile"
              onClick={() => {
                resetGame();
                startNewGame();
                navigate("/game");
              }}
            >
              Начать сначала
            </Button>

            <Button
              size="lg"
              width="fullOnMobile"
              onClick={() => {
                navigate("/chapters");
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
