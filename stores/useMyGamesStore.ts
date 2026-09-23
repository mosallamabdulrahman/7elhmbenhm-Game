import { create } from "zustand";
import { supabase } from "@/lib/supabase";

export interface MyGamesState {
  rooms: any[];
  categoryMap: Record<string, any>;
  loading: boolean;
  busy: boolean;
  searchQuery: string;
  alertMsg: string | null;
  choiceGroup: any | null;
  restartGroup: any | null;
  restartError: string | null;

  setSearchQuery: (query: string) => void;
  setAlertMsg: (msg: string | null) => void;
  setBusy: (busy: boolean) => void;
  setChoiceGroup: (group: any | null) => void;
  setRestartGroup: (group: any | null) => void;
  setRestartError: (err: string | null) => void;

  fetchUserGames: (userId: string) => Promise<void>;
  deleteGameRoom: (roomId: string) => Promise<void>;
  resumeGameRoom: (roomId: string) => Promise<void>;
  restartGameRoom: (
    sourceRoomId: string,
    team1Name: string,
    team2Name: string,
  ) => Promise<{ success: boolean; data?: any; error?: string }>;
}

export const useMyGamesStore = create<MyGamesState>((set, get) => ({
  rooms: [],
  categoryMap: {},
  loading: true,
  busy: false,
  searchQuery: "",
  alertMsg: null,
  choiceGroup: null,
  restartGroup: null,
  restartError: null,

  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setAlertMsg: (alertMsg) => set({ alertMsg }),
  setBusy: (busy) => set({ busy }),
  setChoiceGroup: (choiceGroup) => set({ choiceGroup }),
  setRestartGroup: (restartGroup) => set({ restartGroup, restartError: null }),
  setRestartError: (restartError) => set({ restartError }),

  fetchUserGames: async (userId: string) => {
    set({ loading: true });
    try {
      const [roomsResult, categoriesResult] = await Promise.all([
        supabase
          .from("game_rooms")
          .select("*")
          .eq("judge_id", userId)
          .order("created_at", { ascending: false }),
        supabase.from("question_categories").select("id,name,image_url"),
      ]);

      if (!roomsResult.error) {
        set({ rooms: roomsResult.data || [] });
      }

      if (!categoriesResult.error) {
        const map: Record<string, any> = {};
        (categoriesResult.data || []).forEach((cat: any) => {
          map[cat.id] = cat;
        });
        set({ categoryMap: map });
      }
    } catch (err: any) {
      console.error("fetchUserGames error:", err);
      set({ alertMsg: "ما قدرنا نحمل ألعابك، جرب مرة ثانية." });
    } finally {
      set({ loading: false });
    }
  },

  deleteGameRoom: async (roomId: string) => {
    set({ busy: true });
    try {
      const { error } = await supabase
        .from("game_rooms")
        .delete()
        .eq("id", roomId);

      if (error) throw error;

      set((state) => ({
        rooms: state.rooms.filter((r) => r.id !== roomId),
        choiceGroup: null,
        alertMsg: "حذفنا اللعبة بنجاح!",
      }));
    } catch (err: any) {
      console.error("deleteGameRoom error:", err);
      set({ alertMsg: err?.message || "ما قدرنا نحذف اللعبة." });
    } finally {
      set({ busy: false });
    }
  },

  resumeGameRoom: async (roomId: string) => {
    const { error } = await supabase.rpc("resume_game_room", {
      p_room_id: roomId,
    });
    if (error) throw error;
  },

  restartGameRoom: async (
    sourceRoomId: string,
    team1Name: string,
    team2Name: string,
  ) => {
    set({ busy: true, restartError: null });
    try {
      const { data, error } = await supabase.rpc("restart_game_room", {
        p_source_room_id: sourceRoomId,
        p_team_1_name: team1Name,
        p_team_2_name: team2Name,
      });

      if (error) throw error;

      set((state) => ({
        rooms: state.rooms.map((r) =>
          r.id === sourceRoomId
            ? { ...r, status: "setup", team_1_name: team1Name, team_2_name: team2Name }
            : r,
        ),
        restartGroup: null,
        choiceGroup: null,
      }));

      return { success: true, data };
    } catch (err: any) {
      console.error("restartGameRoom error:", err);
      const msg = err?.message || "ما قدرنا نبدأ اللعبة من جديد.";
      set({ restartError: msg });
      return { success: false, error: msg };
    } finally {
      set({ busy: false });
    }
  },
}));
