import { cn } from "../../utils/cn";

import { ImagePlaceholder } from "./ImagePlaceholder";

type BaseProps = {
  index: number;
  title: string;
  image: string | undefined;
  disabled: boolean;
  onClick: () => void;
};

// id нужен только карточке главы — он попадает в подпись «Глава 2: …».
// У концовки подпись это само название, номер ей не нужен, поэтому раньше
// в id прилетал строковый id сцены и тип расширялся до string | number.
type Props = BaseProps &
  (
    | { type: "chapter"; id: number }
    | { type: "ending"; id?: never }
    | { type: "game"; id?: never }
  );

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
  // Закрытая карточка не раскрывает ни номер главы, ни название концовки.
  const label = disabled
    ? "???"
    : type === "chapter"
      ? `Глава ${id}: ${title}`
      : title;

  return (
    <div
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
          {label}
        </span>
      </button>
    </div>
  );
}
