import { Navigate, useLocation, useNavigate, useParams } from "react-router";
import { Main } from "../components/base/Main";
import { Button } from "../components/base/Button";
import { gameData } from "../engine/gameEngine";
import { goBack } from "../utils/common";
import { useUser } from "../state/useUser";
import { Heading } from "../components/base/Heading";
import { Description } from "../components/base/Description";
import { Image } from "../components/base/Image";

export function EndingDetailPage() {
  const { isEndingCompleted } = useUser();
  const { endingType } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const ending = gameData.scenes.find(
    (scene) => scene.isEnding && scene.endingType === endingType,
  );

  // Нет такой концовки или она ещё не открыта — не показываем: защита от
  // спойлера и от прямого захода по ссылке. Уводим на список.
  if (!ending || !endingType || !isEndingCompleted(endingType)) {
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
