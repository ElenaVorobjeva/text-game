import { useFocusOnMount } from "../../hooks/useFocusOnMount";
import { Image } from "../base/Image";

type Props = {
  image: string;
  /** Описание баннера: название главы нарисовано на самой картинке. */
  imageAlt: string;
  title: string;
  text: string;
};

export function SceneView({ image, imageAlt, title, text }: Props) {
  const titleRef = useFocusOnMount<HTMLHeadingElement>();

  return (
    <>
      {image && <Image src={image} alt={imageAlt} />}

      <div className="max-w-scene flex flex-col gap-2.5 text-center">
        <h1
          ref={titleRef}
          tabIndex={-1}
          className="font-title text-md text-light-blue font-semibold italic focus:outline-none"
        >
          {title}
        </h1>

        <p className="leading-free text-light-blue text-base">{text}</p>
      </div>
    </>
  );
}
