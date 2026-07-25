import Main from "../components/base/Main";
import Button from "../components/base/Button";
import { gameData } from "../engine/gameEngine";
import { useLocation, useNavigate } from "react-router";
import { EndingCard } from "../components/game/EndingCard";
import { loadUserProfile } from "../user/userProfile";

export const EndingsPage = () => {
  const userData = loadUserProfile();
  const navigate = useNavigate();
  const location = useLocation();

  const endings = gameData.scenes.filter(({ isEnding }) => isEnding);

  function goBack() {
    if (location.key !== "default") navigate(-1);
    else navigate("/");
  }

  return (
    <Main classes="gap-9">
      <h1 className="text-light-blue text-lg font-bold">Концовки</h1>

      <div className="flex max-w-[56.25rem] flex-wrap justify-center gap-7">
        {endings.map(({ id, title, image, endingType }) => {
          const isAvailable =
            !!endingType && userData.completedEndings.includes(endingType);

          return (
            <EndingCard
              key={id}
              id={id}
              title={title}
              image={image}
              disabled={!isAvailable}
              onClick={() => navigate(`/endings/${endingType}`)}
            />
          );
        })}
      </div>

      <Button width="fullOnMobile" onClick={goBack}>
        Назад
      </Button>
    </Main>
  );
};
