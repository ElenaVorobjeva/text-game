import { Button } from "../base/Button";
import { Description } from "../base/Description";
import { Heading } from "../base/Heading";
import { Image } from "../base/Image";
import { Row } from "../base/Row";

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
    <div className="animate-fade-up flex grow flex-col items-center justify-center gap-5.5 px-6 py-5 text-center">
      {image && <Image src={image} alt={title} />}

      <Heading as="h2">Концовка: {title}</Heading>

      <Description>{text}</Description>

      <Row>
        <Button size="lg" width="fullOnMobile" onClick={onRestart}>
          Начать заново
        </Button>

        <Button size="lg" width="fullOnMobile" onClick={onChapterSelect}>
          Выбрать главу
        </Button>
      </Row>
    </div>
  );
}
