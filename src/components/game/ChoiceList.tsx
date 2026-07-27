import { useNavigate } from "react-router";

import { getChapterById } from "../../engine/gameEngine";
import { useGame } from "../../state/useGame";
import type { Choice } from "../../types/game";
import { Button } from "../base/Button";
import { Row } from "../base/Row";

type Props = {
  choices: Choice[];
  onChoose: (choice: Choice) => void;
};

export function ChoiceList({ choices, onChoose }: Props) {
  const navigate = useNavigate();
  const { chooseChapter, startNewGame, resetGame, scene } = useGame();

  if (choices.length === 0) {
    return (
      <div className="border-grey-blue flex flex-col gap-5 rounded-lg border border-solid p-7">
        <p className="text-grey-blue text-base">
          Доступных действий сейчас нет. Попробуйте пройти какие-то главы или
          всю игру заново
        </p>
        <Row>
          <Button
            size="xs"
            width="fullOnMobile"
            onClick={() => {
              const currentChapter = getChapterById(scene.chapter);
              if (chooseChapter(currentChapter)) navigate("/game");
            }}
          >
            Начать главу сначала
          </Button>

          <Button
            size="sm"
            width="fullOnMobile"
            onClick={() => {
              resetGame();
              startNewGame();
              navigate("/game");
            }}
          >
            Начать игру сначала
          </Button>

          <Button
            size="sm"
            width="fullOnMobile"
            onClick={() => {
              navigate("/chapters");
            }}
          >
            Выбрать другую главу
          </Button>
        </Row>
      </div>
    );
  }

  return (
    <div className="max-w-scene flex w-full flex-col gap-2.5">
      {choices.map((choice, index) => (
        <div
          key={choice.id}
          className="animate-fade-up"
          style={{ animationDelay: `${(index + 1) * 0.08}s` }}
        >
          <Button
            variant="bordered"
            size="sm"
            width="full"
            onClick={() => onChoose(choice)}
          >
            {choice.text}
          </Button>
        </div>
      ))}
    </div>
  );
}
