import { Navigate, useLocation, useNavigate, useParams } from "react-router";
import Main from "../components/base/Main";
import Button from "../components/base/Button";
import { gameData } from "../engine/gameEngine";
import { isEndingCompleted } from "../user/userProfile";

export const EndingDetailPage = () => {
  const { endingType } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // «Назад» идёт по истории — так стек не засоряется (иначе navigate по пути
  // делает push, а «Назад» на списке — pop, и получается зацикливание между
  // списком и деталью). Запасной путь — список, если истории нет (прямой заход).
  function goBack() {
    if (location.key !== "default") navigate(-1);
    else navigate("/endings");
  }

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

      <Button width="fullOnMobile" onClick={goBack}>
        Назад
      </Button>
    </Main>
  );
};
