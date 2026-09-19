import { createContext } from "react";

import type { GameStateData } from "../types/game";
import type { UserData } from "../user/userStorage";

// API разрезан по gameId: единственный источник правды — весь профиль, а экраны
// спрашивают срез по активной игре. gameId экраны берут из useGame().
export type UserContextValue = {
  /** Актуальный профиль: единственный источник правды для сохранений. */
  data: UserData;
  saveProgress: (gameId: string, state: GameStateData) => void;
  clearProgress: (gameId: string) => void;
  getCompletedEndings: (gameId: string) => string[];
  hasCompletedEndings: (gameId: string) => boolean;
  isEndingCompleted: (gameId: string, endingType: string) => boolean;
  completeEnding: (gameId: string, endingType: string) => void;
};

export const UserContext = createContext<UserContextValue | null>(null);
