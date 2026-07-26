import { cn } from "../../utils/cn";
import { ImagePlaceholder } from "./ImagePlaceholder";

type Props = {
  type: "chapter" | "ending";
  id: string | number;
  index: number;
  title: string;
  image: string | undefined;
  disabled: boolean;
  onClick: () => void;
};

const IMAGE_CLASSES =
  "border-grey-160 aspect-square w-70 max-w-full rounded-lg border object-cover sm:w-45";

export function Card({
  type,
  id,
  index,
  title,
  image,
  disabled,
  onClick,
}: Props) {
  const text =
    type === "chapter"
      ? `${disabled ? "???" : `Глава ${id}: ${title}`}`
      : disabled
        ? "???"
        : title;
  return (
    <div
      key={id}
      className="animate-fade-up"
      style={{ animationDelay: `${0.05 + index * 0.07}s` }}
    >
      <button
        type="button"
        className="flex flex-col items-center transition duration-150 enabled:cursor-pointer enabled:hover:-translate-y-[3px]"
        disabled={disabled}
        onClick={onClick}
      >
        {disabled || !image ? (
          <ImagePlaceholder
            className={IMAGE_CLASSES}
            label={
              type === "chapter" ? "Глава закрыта" : "Концовка ещё не открыта"
            }
          />
        ) : (
          <img
            className={cn(IMAGE_CLASSES, "bg-stone-100")}
            src={image}
            alt={title}
          />
        )}

        <span className="text-grey-blue mt-3 max-w-70 text-base leading-normal sm:max-w-45">
          {text}
        </span>
      </button>
    </div>
  );
}
