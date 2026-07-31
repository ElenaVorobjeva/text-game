import { Navigate, useLocation, useNavigate, useParams } from "react-router";

import { Button } from "../components/base/Button";
import { Description } from "../components/base/Description";
import { Heading } from "../components/base/Heading";
import { Image } from "../components/base/Image";
import { Main } from "../components/base/Main";
import { gameData } from "../engine/gameEngine";
import { useGame } from "../state/useGame";
import { useUser } from "../state/useUser";
import { goBack } from "../utils/common";

export function EndingDetailPage() {
  const { gameId } = useGame();
  const { isEndingCompleted } = useUser();
  const { endingType } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const ending = gameData.scenes.find(
    (scene) => scene.isEnding && scene.endingType === endingType,
  );

  // Нет такой концовки или она ещё не открыта — не показываем: защита от
  // спойлера и от прямого захода по ссылке. Уводим на список.
  if (!ending || !endingType || !isEndingCompleted(gameId, endingType)) {
    return <Navigate to="/endings" replace />;
  }

  return (
    <Main className="gap-5.5">
      {ending.image && <Image src={ending.image} alt={ending.title} />}

      <Heading>Концовка: {ending.title}</Heading>

      <Description>{ending.text}</Description>

      {/* 
        onClick:
        «Назад» идёт по истории — так стек не засоряется (иначе navigate по пути
        делает push, а «Назад» на списке — pop, и получается зацикливание между
        списком и деталью). Запасной путь — список, если истории нет (прямой заход).
      */}
      <Button
        width="fullOnMobile"
        onClick={() => goBack(navigate, location, "/endings")}
      >
        Назад
      </Button>
    </Main>
  );
}
