type Props = {
  id: number;
  title: string;
  image: string;
  disabled: boolean;
  onClick: () => void;
};

export function ChapterCard({ id, title, image, disabled, onClick }: Props) {
  return (
    <button
      className="flex flex-col items-center transition duration-150 enabled:cursor-pointer enabled:hover:-translate-y-[3px] disabled:opacity-40"
      disabled={disabled}
      onClick={onClick}
    >
      <img
        className="border-grey-160 aspect-square w-70 max-w-full rounded-lg border bg-stone-100 object-cover sm:w-45"
        src={image}
        alt={title}
      />

      <span className="text-grey-blue mt-3 max-w-70 text-[0.9375rem] leading-normal sm:max-w-45">
        {`Глава ${id}: ${title}${disabled ? " — закрыта" : ""}`}
      </span>
    </button>
  );
}
