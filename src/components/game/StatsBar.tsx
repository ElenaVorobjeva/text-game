import { useGame } from "../../state/useGame";

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
      className={`flex flex-wrap justify-center lg:justify-between ${gapMap[gap]} text-grey-blue text-base`}
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
