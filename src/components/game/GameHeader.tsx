import { useMatch } from "react-router";

import GitHubLogo from "../../assets/images/github-logo.svg?react";
import { useGameActions } from "../../hooks/useGameActions";
import { useGame } from "../../state/useGame";
import { useUser } from "../../state/useUser";
import { gamePath } from "../../utils/common";
import { Link } from "../base/Link";

// Шапка игровых экранов. На меню игры (промо) сворачивается до одной ссылки
// «К играм» — остальные пункты там либо вели бы в себя, либо дублируют кнопки
// меню. Навигацию и сброс делает сама через useNavigate/useGame. Статы здесь
// не живут: они видны только во время игры, над сценой (см. GamePage).
export function GameHeader() {
  const { gameId } = useGame();
  const { restart } = useGameActions();
  const { hasCompletedEndings } = useUser();

  // useMatch, а не сравнение строк: адрес с завершающим слэшем — тот же экран меню.
  const isMenu = useMatch({ path: gamePath(gameId), end: true }) !== null;

  return (
    <header className="border-grey-60 flex flex-none flex-wrap justify-between gap-x-7 gap-y-3 border-b px-6 py-3.5 lg:px-10">
      <nav
        aria-label="Навигация по игре"
        className="flex flex-wrap justify-center gap-x-7 gap-y-3"
      >
        {isMenu ? (
          <Link color="gray" href="/">
            К играм
          </Link>
        ) : (
          <>
            <Link color="gray" href={gamePath(gameId)}>
              Меню
            </Link>
            <Link color="gray" href="/">
              К играм
            </Link>
            <Link color="gray" href={gamePath(gameId, "chapters")}>
              Выбор главы
            </Link>
            {/* Действие, а не переход, — поэтому кнопка. */}
            <Link type="button" color="gray" onClick={restart}>
              Начать заново
            </Link>
            {hasCompletedEndings(gameId) && (
              <Link color="gray" href={gamePath(gameId, "endings")}>
                Концовки
              </Link>
            )}
          </>
        )}
      </nav>
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
