import type { Choice } from "../../types/game";
import { Button } from "../base/Button";

type Props = {
  choices: Choice[];
  onChoose: (choice: Choice) => void;
};

export function ChoiceList({ choices, onChoose }: Props) {
  if (choices.length === 0) {
    return <p className="text-grey-blue text-base">Доступных действий нет.</p>;
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
