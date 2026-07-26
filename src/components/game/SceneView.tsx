import { Image } from "../base/Image";

type Props = {
  image: string;
  title: string;
  text: string;
};

export function SceneView({ image, title, text }: Props) {
  return (
    <>
      {image && <Image src={image} alt={title} />}

      <div className="flex max-w-[43.75rem] flex-col gap-2.5 text-center">
        <h2 className="font-title text-md text-light-blue font-semibold italic">
          {title}
        </h2>

        <p className="leading-free text-light-blue text-base">{text}</p>
      </div>
    </>
  );
}
