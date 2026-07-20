import Link from "../base/Link";
import { StatsBar } from "./StatsBar";

type Props = {
  onMainMenu: () => void;
  onChapterSelect: () => void;
  onRestart: () => void;
};

export function GameHeader({ onMainMenu, onChapterSelect, onRestart }: Props) {
  return (
    <header className="flex flex-none flex-col gap-3 border-b border-grey-60 px-6 py-3.5 lg:flex-row lg:items-center lg:justify-between lg:gap-4 lg:px-10">
      <nav className="flex justify-center lg:justify-between flex-wrap gap-x-7 gap-y-2">
        <Link type="button" color="gray" onClick={onMainMenu}>
          Меню
        </Link>
        <Link type="button" color="gray" onClick={onChapterSelect}>
          Выбор главы
        </Link>
        <Link type="button" color="gray" onClick={onRestart}>
          Начать заново
        </Link>
      </nav>

      <StatsBar />
    </header>
  );
}
