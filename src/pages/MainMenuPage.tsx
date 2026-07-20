import Button from "../components/base/Button";
import Main from "../components/base/Main";
import { useGame } from "../state/useGame";

type Props = {
  onStart: () => void;
  onContinue: () => void;
  onChapterSelect: () => void;
};

export function MainMenuPage({ onStart, onContinue, onChapterSelect }: Props) {
  const { hasSave, startNewGame, resetGame, continueGame } = useGame();

  return (
    <Main classes="gap-11">
      <div>
        <h1 className="font-heading text-xl md:text-2xl leading-tight text-light-blue">
          Тихий хороший день
        </h1>

        <p className="mx-auto mt-5 max-w-[40rem] text-sm leading-free text-grey-blue">
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
              onStart();
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
                continueGame();
                onContinue();
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
                onStart();
              }}
            >
              Начать сначала
            </Button>

            <Button size="lg" width="fullOnMobile" onClick={onChapterSelect}>
              Выбрать главу
            </Button>
          </>
        )}
      </div>
    </Main>
  );
}
