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
          className="block h-[min(22vh,11.25rem)] w-full max-w-[51.25rem] animate-scale-in rounded-sm object-cover"
          src={image}
          alt={title}
        />
      )}

      <div className="flex max-w-[43.75rem] flex-col gap-2.5 text-center">
        <h2 className="font-title text-md font-semibold italic text-light-blue">
          {title}
        </h2>

        <p className="text-[0.9375rem] leading-free text-grey-blue">{text}</p>
      </div>
    </>
  );
}
