import { createContext } from "react";

export type UserContextValue = {
  completedEndings: string[];
  hasCompletedEndings: boolean;
  isEndingCompleted: (type: string) => boolean;
  completeEnding: (type: string) => void;
};

export const UserContext = createContext<UserContextValue | null>(null);
