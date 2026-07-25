import { Navigate, useLocation, useNavigate, useParams } from "react-router";
import Main from "../components/base/Main";
import Button from "../components/base/Button";
import { gameData } from "../engine/gameEngine";
import { goBack } from "../utils/common";
import { useUser } from "../state/useUser";

export const EndingDetailPage = () => {
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
    <Main classes="gap-5.5">
      {ending.image && (
        <img
          className="block h-[min(22vh,11.25rem)] w-full max-w-[51.25rem] rounded-sm object-cover"
          src={ending.image}
          alt={ending.title}
        />
      )}

      <h1 className="font-heading text-light-blue text-xl leading-tight">
        {ending.title}
      </h1>

      <p className="leading-free text-grey-blue max-w-[37.5rem] text-[0.9375rem]">
        {ending.text}
      </p>

      <Button
        width="fullOnMobile"
        onClick={() => goBack(navigate, location, "/endings")}
      >
        Назад
      </Button>
    </Main>
  );
};
