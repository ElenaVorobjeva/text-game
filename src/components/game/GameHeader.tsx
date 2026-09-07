import { useLocation, useNavigate } from "react-router";

import GitHubLogo from "../../assets/images/github-logo.svg?react";
import { useGame } from "../../state/useGame";
import { useUser } from "../../state/useUser";
import { gamePath, restartGame } from "../../utils/common";
import { Link } from "../base/Link";

// Шапка игровых экранов. На меню игры (промо) сворачивается до одной ссылки
// «К играм» — остальные пункты там либо вели бы в себя, либо дублируют кнопки
// меню. Навигацию и сброс делает сама через useNavigate/useGame. Статы здесь
// не живут: они видны только во время игры, над сценой (см. GamePage).
export function GameHeader() {
  const navigate = useNavigate();
  const location = useLocation();
  const { resetGame, gameId } = useGame();
  const { hasCompletedEndings } = useUser();

  const isMenu = location.pathname === gamePath(gameId);

  return (
    <header className="border-grey-60 flex flex-none flex-wrap justify-between gap-x-7 gap-y-2 border-b px-6 py-3.5 lg:px-10">
      <div className="flex flex-wrap justify-center gap-x-7 gap-y-2">
        {isMenu ? (
          <Link type="button" color="gray" onClick={() => navigate("/")}>
            К играм
          </Link>
        ) : (
          <>
            <Link
              type="button"
              color="gray"
              onClick={() => navigate(gamePath(gameId))}
            >
              Меню
            </Link>
            <Link type="button" color="gray" onClick={() => navigate("/")}>
              К играм
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
          </>
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
