import { useGame } from "../../state/useGame";
import { cn } from "../../utils/cn";

type Props = {
  gap?: "sm" | "lg";
};

export function StatsBar({ gap = "sm" }: Props) {
  const { gameState } = useGame();
  const { stats } = gameState;

  const gapMap = {
    sm: "gap-x-6 gap-y-1",
    lg: "gap-x-8 gap-y-1",
  };

  return (
    <div
      className={cn(
        "text-grey-blue flex flex-wrap justify-center text-base lg:justify-between",
        gapMap[gap],
      )}
    >
      <span className="whitespace-nowrap">
        Забота: <b>{stats.care}</b>
      </span>
      <span className="whitespace-nowrap">
        Связь: <b>{stats.connection}</b>
      </span>
      <span className="whitespace-nowrap">
        Покой: <b>{stats.calm}</b>
      </span>
    </div>
  );
}
