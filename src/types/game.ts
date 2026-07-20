export type StatKey = "care" | "connection" | "calm";

export type GameStats = Record<StatKey, number>;

export type GameFlags = Record<string, boolean>;

export type GameStateData = {
  currentSceneId: string;
  flags: GameFlags;
  stats: GameStats;
  inventory: string[];
  visitedScenes: string[];
  unlockedChapters: number[];
  unlockedEndings: string[];
};

export type GameData = {
  meta: {
    id: string;
    title: string;
    version: string;
    startSceneId: string;
  };
  initialState: {
    flags: GameFlags;
    stats: GameStats;
    inventory: string[];
    visitedScenes: string[];
  };
  chapters: Chapter[];
  scenes: Scene[];
};

export type Chapter = {
  id: number;
  title: string;
  image: string;
  startScene: string;
};

export type Scene = {
  id: string;
  chapter: number;
  step: number;
  title: string;
  text: string;
  image?: string;
  choices: Choice[];
  isEnding?: boolean;
  endingType?: string;
};

export type Choice = {
  id: string;
  text: string;
  nextSceneId: string;
  conditions?: Condition[];
  effects?: Effect[];
};

export type Condition =
  | { type: "flag"; key: string; value: boolean }
  | { type: "stat_gte"; stat: StatKey; value: number }
  | { type: "has_item"; item: string };

export type Effect =
  | { type: "set_flag"; key: string; value: boolean }
  | { type: "change_stat"; stat: StatKey; delta: number }
  | { type: "add_item"; item: string }
  | { type: "remove_item"; item: string };
