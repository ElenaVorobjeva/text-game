import { createContext } from "react";

// API разрезан по gameId: единственный источник правды — весь профиль, а экраны
// спрашивают срез по активной игре. gameId экраны берут из useGame().
export type UserContextValue = {
  getCompletedEndings: (gameId: string) => string[];
  hasCompletedEndings: (gameId: string) => boolean;
  isEndingCompleted: (gameId: string, endingType: string) => boolean;
  completeEnding: (gameId: string, endingType: string) => void;
};

export const UserContext = createContext<UserContextValue | null>(null);
