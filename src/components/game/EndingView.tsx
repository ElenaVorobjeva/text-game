import Button from "../base/Button";
import { StatsBar } from "./StatsBar";

type Props = {
  image: string;
  title: string;
  text: string;
  onRestart: () => void;
  onChapterSelect: () => void;
};

export function EndingView({
  image,
  title,
  text,
  onRestart,
  onChapterSelect,
}: Props) {
  return (
    <div className="flex grow animate-fade-up flex-col items-center justify-center gap-5.5 px-6 py-5 text-center">
      {image && (
        <img
          className="block h-[min(22vh,11.25rem)] w-full max-w-[51.25rem] animate-scale-in rounded-sm object-cover"
          src={image}
          alt={title}
        />
      )}

      <h2 className="font-heading text-xl leading-tight text-light-blue">
        {title}
      </h2>

      <p className="max-w-[37.5rem] text-[0.9375rem] leading-free text-grey-blue">
        {text}
      </p>

      <StatsBar gap="lg" />

      <div className="flex w-full flex-col gap-4 sm:w-auto sm:flex-row sm:flex-wrap sm:justify-center">
        <Button size="lg" width="fullOnMobile" onClick={onRestart}>
          Начать заново
        </Button>

        <Button size="lg" width="fullOnMobile" onClick={onChapterSelect}>
          Выбрать главу
        </Button>
      </div>
    </div>
  );
}
