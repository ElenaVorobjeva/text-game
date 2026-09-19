import { useNavigate } from "react-router";

import { useGameActions } from "../../hooks/useGameActions";
import { useGame } from "../../state/useGame";
import { gamePath } from "../../utils/common";
import { Button } from "../base/Button";
import { Row } from "../base/Row";

export function ChoiceList() {
  const navigate = useNavigate();
  const { start } = useGameActions();
  const { canEnterChapter, chooseChapter, choose, scene, choices, gameId } =
    useGame();

  if (choices.length === 0) {
    const currentChapterId = scene.chapter;
    const currentChapterIsAvailable = canEnterChapter(currentChapterId);

    return (
      <div className="border-grey-blue flex flex-col gap-5 rounded-lg border p-7">
        <p className="text-grey-blue text-base">
          Доступных действий сейчас нет. Попробуйте пройти другие главы или всю
          игру заново.
        </p>
        <Row>
          {currentChapterIsAvailable && (
            <Button
              size="sm"
              width="fullOnMobile"
              onClick={() => {
                chooseChapter(currentChapterId);
              }}
            >
              Начать главу сначала
            </Button>
          )}
          <Button size="sm" width="fullOnMobile" onClick={start}>
            Начать игру сначала
          </Button>

          <Button
            size="sm"
            width="fullOnMobile"
            onClick={() => {
              navigate(gamePath(gameId, "chapters"));
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
            onClick={() => choose(choice)}
          >
            {choice.text}
          </Button>
        </div>
      ))}
    </div>
  );
}
