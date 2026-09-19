import { Navigate, useParams } from "react-router";

import { getGameData } from "../data/games";
import { GameProvider } from "../state/gameProvider";
import { loadUser } from "../user/userStorage";

import { GameView } from "./GameView";

// Оболочка активной игры: берёт gameId из URL, находит игру в реестре и
// монтирует её провайдер. Неизвестная игра — уводим на корень (пока это игра
// по умолчанию, в 4c — каталог).
export function GameShell() {
  const { gameId } = useParams();
  const gameData = gameId ? getGameData(gameId) : undefined;

  if (!gameId || !gameData) return <Navigate to="/" replace />;

  // key={gameId}: смена игры пересоздаёт провайдер с состоянием новой игры.
  // Данные игрока читаем на входе в игру — это её точка загрузки (в будущем
  // здесь будет fetch на игру, а не общий бут-снимок).
  return (
    <GameProvider key={gameId} initialData={loadUser()} gameData={gameData}>
      <GameView />
    </GameProvider>
  );
}
