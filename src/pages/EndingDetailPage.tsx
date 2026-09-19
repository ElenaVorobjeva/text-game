import { Navigate, useParams } from "react-router";

import { Button } from "../components/base/Button";
import { Description } from "../components/base/Description";
import { Heading } from "../components/base/Heading";
import { Image } from "../components/base/Image";
import { Main } from "../components/base/Main";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { useGoBack } from "../hooks/useGoBack";
import { useGame } from "../state/useGame";
import { useUser } from "../state/useUser";
import { gamePath } from "../utils/common";

export function EndingDetailPage() {
  const { gameId, gameData } = useGame();
  const { isEndingCompleted } = useUser();
  const { endingType } = useParams();
  const goBack = useGoBack(gamePath(gameId, "endings"));

  const ending = gameData.scenes.find(
    (scene) => scene.isEnding && scene.endingType === endingType,
  );

  // Хук стоит до раннего return: порядок хуков не должен зависеть от ветки.
  useDocumentTitle(
    ending ? `${ending.title} — ${gameData.meta.title}` : gameData.meta.title,
  );

  // Нет такой концовки или она ещё не открыта — не показываем: защита от
  // спойлера и от прямого захода по ссылке. Уводим на список.
  if (!ending || !endingType || !isEndingCompleted(gameId, endingType)) {
    return <Navigate to={gamePath(gameId, "endings")} replace />;
  }

  return (
    <Main className="gap-5.5">
      {/* alt пустой: заголовок ниже уже называет концовку. */}
      {ending.image && <Image src={ending.image} alt="" />}

      <Heading>Концовка: {ending.title}</Heading>

      <Description>{ending.text}</Description>

      {/* 
        onClick:
        «Назад» идёт по истории — так стек не засоряется (иначе navigate по пути
        делает push, а «Назад» на списке — pop, и получается зацикливание между
        списком и деталью). Запасной путь — список, если истории нет (прямой заход).
      */}
      <Button width="fullOnMobile" onClick={goBack}>
        Назад
      </Button>
    </Main>
  );
}
