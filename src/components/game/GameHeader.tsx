import { useNavigate } from "react-router";
import Link from "../base/Link";
import { useGame } from "../../state/useGame";
import { hasCompletedEndings } from "../../user/userProfile";
import GitHubLogo from "../../assets/images/github-logo.svg?react";

// Общая шапка для всех экранов, кроме главного меню. Навигацию и сброс делает
// сама через useNavigate/useGame — снаружи её подключают без пропсов. Статы
// здесь не живут: они видны только во время игры, над сценой (см. GamePage).
export function GameHeader() {
  const navigate = useNavigate();
  const { resetGame } = useGame();

  const restart = () => {
    resetGame();
    navigate("/");
  };

  return (
    <header className="border-grey-60 flex flex-none flex-wrap justify-between gap-x-7 gap-y-2 border-b px-6 py-3.5 lg:px-10">
      <div className="flex flex-wrap justify-center gap-x-7 gap-y-2">
        <Link type="button" color="gray" onClick={() => navigate("/")}>
          Меню
        </Link>
        <Link type="button" color="gray" onClick={() => navigate("/chapters")}>
          Выбор главы
        </Link>
        <Link type="button" color="gray" onClick={restart}>
          Начать заново
        </Link>
        {hasCompletedEndings() && (
          <Link type="button" color="gray" onClick={() => navigate("/endings")}>
            Концовки
          </Link>
        )}
      </div>
      <div className="hidden lg:block">
        <a href="https://github.com/ElenaVorobjeva/text-game" target="_blank">
          <GitHubLogo className="fill-grey-blue hover:fill-light-blue" />
        </a>
      </div>
    </header>
  );
}
