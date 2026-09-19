import { Navigate, useParams } from "react-router";

import { getGameData } from "../data/games";
import { GameProvider } from "../state/gameProvider";

import { GameView } from "./GameView";

// Оболочка активной игры: берёт gameId из URL, находит игру в реестре и
// монтирует её провайдер. Неизвестная игра — уводим на каталог.
export function GameRoute() {
  const { gameId } = useParams();
  const gameData = gameId ? getGameData(gameId) : undefined;

  if (!gameId || !gameData) return <Navigate to="/" replace />;

  // key={gameId}: смена игры пересоздаёт провайдер с состоянием новой игры.
  return (
    <GameProvider key={gameId} gameData={gameData}>
      <GameView />
    </GameProvider>
  );
}
