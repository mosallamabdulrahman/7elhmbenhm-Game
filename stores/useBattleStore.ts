import { create } from "zustand";
import type {
  GameRoom,
  Team,
  Question,
  CombatEvent,
  QuestionAnswer,
  UnitType,
} from "@/types/game";

export interface AlertMessage {
  type: "success" | "error" | "info" | "warning";
  text?: string;
  message?: string;
}

export type SetterArg<T> = T | ((prev: T) => T);

function resolveArg<T>(arg: SetterArg<T>, prev: T): T {
  return typeof arg === "function" ? (arg as (p: T) => T)(prev) : arg;
}

export interface BattleState {
  // Routing / Session
  roomId: string | null;
  teamIndex: number | null;
  role: string | null;
  teamToken: string | null;
  teamLinkTokens: { team_1_token?: string; team_2_token?: string } | null;
  user: any | null;
  authLoading: boolean;

  // Supabase Database State
  room: GameRoom | null;
  teams: Team[];
  questions: Question[];
  categoryInfoMap: Map<string, any>;
  combatEvents: CombatEvent[];
  dbLoading: boolean;
  dbError: string | null;

  // Active Question & Answer
  activeAnswer: QuestionAnswer;
  isActionBusy: boolean;
  isAutoFilling: boolean;
  latestCombatEvent: CombatEvent | null;

  // Radar Reveals (accumulated for the whole game per team)
  radarRevealsByTeam: any;

  // Timers & Combat
  questionSeconds: number;
  timerPaused: boolean;
  timerOverrideStart: number | null;
  lastPlacedCell: number | null;
  selectedUnit: UnitType;
  alertMsg: AlertMessage | null;

  // Setters & Actions
  setRoomId: (id: SetterArg<string | null>) => void;
  setTeamIndex: (idx: SetterArg<number | null>) => void;
  setRole: (role: SetterArg<string | null>) => void;
  setTeamToken: (token: SetterArg<string | null>) => void;
  setTeamLinkTokens: (tokens: SetterArg<{ team_1_token?: string; team_2_token?: string } | null>) => void;
  setUser: (user: SetterArg<any | null>) => void;
  setAuthLoading: (loading: SetterArg<boolean>) => void;

  setRoom: (room: SetterArg<GameRoom | null>) => void;
  setTeams: (teams: SetterArg<Team[]>) => void;
  setQuestions: (questions: SetterArg<Question[]>) => void;
  setCategoryInfoMap: (map: SetterArg<Map<string, any>>) => void;
  setCombatEvents: (events: SetterArg<CombatEvent[]>) => void;
  addCombatEvent: (event: CombatEvent) => void;
  setDbLoading: (loading: boolean) => void;
  setDbError: (error: string | null) => void;

  setActiveAnswer: (answer: SetterArg<QuestionAnswer>) => void;
  setIsActionBusy: (busy: boolean) => void;
  setIsAutoFilling: (filling: boolean) => void;
  setLatestCombatEvent: (event: CombatEvent | null) => void;

  setRadarRevealsByTeam: (
    reveals: SetterArg<any>
  ) => void;
  recordRadarReveal: (
    targetTeamIndex: number,
    cellIndex: number,
    unit: string | null
  ) => void;

  setQuestionSeconds: (seconds: SetterArg<number>) => void;
  setTimerPaused: (paused: boolean) => void;
  setTimerOverrideStart: (time: number | null) => void;
  setLastPlacedCell: (cell: number | null) => void;
  setSelectedUnit: (unit: UnitType) => void;
  setAlertMsg: (msg: AlertMessage | null) => void;

  resetBattleState: () => void;
}

const initialState = {
  roomId: null,
  teamIndex: null,
  role: null,
  teamToken: null,
  teamLinkTokens: null,
  user: null,
  authLoading: true,

  room: null,
  teams: [] as Team[],
  questions: [] as Question[],
  categoryInfoMap: new Map<string, any>(),
  combatEvents: [] as CombatEvent[],
  dbLoading: false,
  dbError: null,

  activeAnswer: { text: "", imageUrl: "" },
  isActionBusy: false,
  isAutoFilling: false,
  latestCombatEvent: null,

  radarRevealsByTeam: {} as Record<number, Record<number, string | null>>,

  questionSeconds: 60,
  timerPaused: false,
  timerOverrideStart: null,
  lastPlacedCell: null,
  selectedUnit: "infantry" as UnitType,
  alertMsg: null,
};

export const useBattleStore = create<BattleState>((set) => ({
  ...initialState,

  setRoomId: (arg) => set((s) => ({ roomId: resolveArg(arg, s.roomId) })),
  setTeamIndex: (arg) => set((s) => ({ teamIndex: resolveArg(arg, s.teamIndex) })),
  setRole: (arg) => set((s) => ({ role: resolveArg(arg, s.role) })),
  setTeamToken: (arg) => set((s) => ({ teamToken: resolveArg(arg, s.teamToken) })),
  setTeamLinkTokens: (arg) =>
    set((s) => ({ teamLinkTokens: resolveArg(arg, s.teamLinkTokens) })),
  setUser: (arg) => set((s) => ({ user: resolveArg(arg, s.user) })),
  setAuthLoading: (arg) =>
    set((s) => ({ authLoading: resolveArg(arg, s.authLoading) })),

  setRoom: (arg) => set((s) => ({ room: resolveArg(arg, s.room) })),
  setTeams: (arg) => set((s) => ({ teams: resolveArg(arg, s.teams) })),
  setQuestions: (arg) => set((s) => ({ questions: resolveArg(arg, s.questions) })),
  setCategoryInfoMap: (arg) =>
    set((s) => ({ categoryInfoMap: resolveArg(arg, s.categoryInfoMap) })),
  setCombatEvents: (arg) =>
    set((s) => ({ combatEvents: resolveArg(arg, s.combatEvents) })),
  addCombatEvent: (event) =>
    set((s) => ({ combatEvents: [event, ...s.combatEvents] })),
  setDbLoading: (dbLoading) => set({ dbLoading }),
  setDbError: (dbError) => set({ dbError }),

  setActiveAnswer: (arg) =>
    set((s) => ({ activeAnswer: resolveArg(arg, s.activeAnswer) })),
  setIsActionBusy: (isActionBusy) => set({ isActionBusy }),
  setIsAutoFilling: (isAutoFilling) => set({ isAutoFilling }),
  setLatestCombatEvent: (latestCombatEvent) => set({ latestCombatEvent }),

  setRadarRevealsByTeam: (arg) =>
    set((s) => ({
      radarRevealsByTeam: resolveArg(arg, s.radarRevealsByTeam),
    })),
  recordRadarReveal: (targetTeamIndex, cellIndex, unit) =>
    set((s) => ({
      radarRevealsByTeam: {
        ...s.radarRevealsByTeam,
        [targetTeamIndex]: {
          ...(s.radarRevealsByTeam[targetTeamIndex] || {}),
          [cellIndex]: unit,
        },
      },
    })),

  setQuestionSeconds: (arg) =>
    set((s) => ({ questionSeconds: resolveArg(arg, s.questionSeconds) })),
  setTimerPaused: (timerPaused) => set({ timerPaused }),
  setTimerOverrideStart: (timerOverrideStart) => set({ timerOverrideStart }),
  setLastPlacedCell: (lastPlacedCell) => set({ lastPlacedCell }),
  setSelectedUnit: (selectedUnit) => set({ selectedUnit }),
  setAlertMsg: (alertMsg) => set({ alertMsg }),

  resetBattleState: () => set(initialState),
}));
