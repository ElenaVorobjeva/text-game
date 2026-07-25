import { useNavigate } from "react-router";
import { Button } from "../components/base/Button";
import { Main } from "../components/base/Main";
import { useGame } from "../state/useGame";

export function MainMenuPage() {
  const { hasSave, startNewGame, resetGame, continueGame } = useGame();
  const navigate = useNavigate();

  return (
    <Main classes="gap-11">
      <div>
        <h1 className="font-heading text-light-blue text-xl leading-tight md:text-2xl">
          Тихий хороший день
        </h1>

        <p className="leading-free text-grey-blue mx-auto mt-5 max-w-[40rem] text-sm">
          Небольшая текстовая игра о мягком ритме жизни, простых решениях и
          спокойном дне.
        </p>
      </div>

      <div className="flex w-full flex-col gap-4 sm:w-auto sm:flex-row sm:flex-wrap sm:justify-center">
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
      </div>
    </Main>
  );
}
