import { EndingPlaceholder } from "./EndingPlaceholder";

type Props = {
  id: string;
  title: string;
  image: string | undefined;
  disabled: boolean;
  onClick: () => void;
};

const IMAGE_CLASSES =
  "border-grey-160 aspect-square w-70 max-w-full rounded-lg border object-cover sm:w-45";

export const EndingCard = ({ title, image, disabled, onClick }: Props) => {
  return (
    <button
      className="flex flex-col items-center transition duration-150 enabled:cursor-pointer enabled:hover:-translate-y-[3px]"
      disabled={disabled}
      onClick={onClick}
    >
      {disabled || !image ? (
        <EndingPlaceholder className={IMAGE_CLASSES} />
      ) : (
        <img
          className={`${IMAGE_CLASSES} bg-stone-100`}
          src={image}
          alt={title}
        />
      )}

      <span className="text-grey-blue mt-3 max-w-70 text-[0.9375rem] leading-normal sm:max-w-45">
        {disabled ? "???" : title}
      </span>
    </button>
  );
};
