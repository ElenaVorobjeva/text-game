type Props = {
  image: string;
  title: string;
  text: string;
};

export function SceneView({ image, title, text }: Props) {
  return (
    <>
      {image && (
        <img
          className="animate-scale-in block h-[min(22vh,11.25rem)] w-full max-w-[51.25rem] rounded-sm object-cover"
          src={image}
          alt={title}
        />
      )}

      <div className="flex max-w-[43.75rem] flex-col gap-2.5 text-center">
        <h2 className="font-title text-md text-light-blue font-semibold italic">
          {title}
        </h2>

        <p className="leading-free text-grey-blue text-[0.9375rem]">{text}</p>
      </div>
    </>
  );
}
