import { useNavigate } from "react-router";

import GitHubLogo from "../../assets/images/github-logo.svg?react";
import { useGame } from "../../state/useGame";
import { useUser } from "../../state/useUser";
import { gamePath, restartGame } from "../../utils/common";
import { Link } from "../base/Link";

// Общая шапка для всех экранов, кроме главного меню. Навигацию и сброс делает
// сама через useNavigate/useGame — снаружи её подключают без пропсов. Статы
// здесь не живут: они видны только во время игры, над сценой (см. GamePage).
export function GameHeader() {
  const navigate = useNavigate();
  const { resetGame, gameId } = useGame();
  const { hasCompletedEndings } = useUser();

  return (
    <header className="border-grey-60 flex flex-none flex-wrap justify-between gap-x-7 gap-y-2 border-b px-6 py-3.5 lg:px-10">
      <div className="flex flex-wrap justify-center gap-x-7 gap-y-2">
        <Link
          type="button"
          color="gray"
          onClick={() => navigate(gamePath(gameId))}
        >
          Меню
        </Link>
        <Link
          type="button"
          color="gray"
          onClick={() => navigate(gamePath(gameId, "chapters"))}
        >
          Выбор главы
        </Link>
        <Link
          type="button"
          color="gray"
          onClick={() => restartGame(resetGame, navigate, gameId)}
        >
          Начать заново
        </Link>
        {hasCompletedEndings(gameId) && (
          <Link
            type="button"
            color="gray"
            onClick={() => navigate(gamePath(gameId, "endings"))}
          >
            Концовки
          </Link>
        )}
      </div>
      <div className="hidden lg:block">
        <a
          href="https://github.com/ElenaVorobjeva/text-game"
          target="_blank"
          rel="noopener noreferrer"
          title="Проект на GitHub"
          aria-label="Проект на GitHub"
        >
          <GitHubLogo
            aria-hidden="true"
            className="fill-grey-blue hover:fill-light-blue"
          />
        </a>
      </div>
    </header>
  );
}
