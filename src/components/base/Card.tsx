import { cn } from "../../utils/cn";

import { ImagePlaceholder } from "./ImagePlaceholder";

type Props = {
  index: number;
  /** Видимая подпись под картинкой. */
  label: string;
  image: string | undefined;
  /**
   * Карточка закрыта, если задано: это и подпись заглушки, и доступное имя
   * кнопки. Настоящую подпись прячем — она спойлерила бы главу или концовку.
   * Что именно закрыто, знает страница, а не Card: раньше Card ветвился по
   * виду карточки (глава, концовка, игра), и каждый новый вид правил его.
   */
  closedLabel?: string;
  onClick: () => void;
};

const IMAGE_CLASSES =
  "border-grey-160 aspect-square w-70 max-w-full rounded-lg border object-cover sm:w-45";

export function Card({ index, label, image, closedLabel, onClick }: Props) {
  const isClosed = closedLabel !== undefined;

  return (
    <li
      className="animate-fade-up"
      style={{ animationDelay: `${0.05 + index * 0.07}s` }}
    >
      <button
        type="button"
        className="flex flex-col items-center transition duration-150 enabled:cursor-pointer enabled:hover:-translate-y-[3px]"
        disabled={isClosed}
        // «???» на слух — набор знаков вопроса, поэтому имя задаём явно, а
        // видимую подпись прячем от скринридера.
        aria-label={closedLabel}
        onClick={onClick}
      >
        {isClosed || !image ? (
          <ImagePlaceholder
            className={IMAGE_CLASSES}
            label={closedLabel ?? label}
          />
        ) : (
          <img
            className={cn(IMAGE_CLASSES, "bg-stone-100")}
            src={image}
            // Название уже есть в подписи ниже — повторять его в alt значит
            // заставить скринридер прочитать его дважды.
            alt=""
            loading="lazy"
            decoding="async"
          />
        )}

        <span
          aria-hidden={isClosed}
          className="text-grey-blue mt-3 max-w-70 text-base leading-normal sm:max-w-45"
        >
          {isClosed ? "???" : label}
        </span>
      </button>
    </li>
  );
}
