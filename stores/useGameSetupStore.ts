import { create } from "zustand";
import type { QuestionCategory, QuestionCategoryGroup } from "@/types/game";
import {
  FALLBACK_CATEGORIES,
  buildRoomQuestions,
  loadQuestionSetupData,
} from "@/lib/game-data";
import { supabase } from "@/lib/supabase";

export interface SetupToast {
  message: string;
  type: "success" | "error" | "warning" | "auth-error";
}

export interface GameSetupState {
  // Auth state
  user: any | null;

  // Data Sources
  categoriesList: QuestionCategory[];
  groupsList: QuestionCategoryGroup[];
  questionRows: any[];
  questionSourceReady: boolean;
  questionSourceFromSupabase: boolean;

  // Form State
  selectedCategories: string[];
  gameName: string;
  team1Name: string;
  team2Name: string;

  // Submission & Room Result
  isSubmitting: boolean;
  createdRoom: any | null;
  teamTokens: { team_1_token?: string; team_2_token?: string } | null;
  toast: SetupToast | null;

  // Actions
  setUser: (user: any | null) => void;
  setCategoriesList: (categories: QuestionCategory[]) => void;
  setGroupsList: (groups: QuestionCategoryGroup[]) => void;
  setQuestionRows: (rows: any[]) => void;
  setSetupData: (data: {
    categories: QuestionCategory[];
    groups: QuestionCategoryGroup[];
    questions: any[];
    fromSupabase: boolean;
  }) => void;
  loadSetup: () => Promise<void>;
  setSelectedCategories: (ids: string[]) => void;
  toggleCategory: (categoryId: string) => void;
  setGameName: (name: string) => void;
  setTeam1Name: (name: string) => void;
  setTeam2Name: (name: string) => void;
  setIsSubmitting: (submitting: boolean) => void;
  setCreatedRoom: (room: any | null) => void;
  setTeamTokens: (
    tokens: { team_1_token?: string; team_2_token?: string } | null
  ) => void;
  triggerToast: (
    message: string,
    type?: "success" | "error" | "warning" | "auth-error"
  ) => void;
  clearToast: () => void;
  resetSetup: () => void;
  handleStartGame: () => Promise<boolean>;
  handleExitCreatedRoom: () => Promise<void>;
}

const initialSetupState = {
  user: null,
  categoriesList: FALLBACK_CATEGORIES as QuestionCategory[],
  groupsList: [] as QuestionCategoryGroup[],
  questionRows: [] as any[],
  questionSourceReady: false,
  questionSourceFromSupabase: false,

  selectedCategories: [] as string[],
  gameName: "",
  team1Name: "كتائب الفرسان",
  team2Name: "صقور النخبة",

  isSubmitting: false,
  createdRoom: null,
  teamTokens: null,
  toast: null,
};

let toastTimeout: NodeJS.Timeout | null = null;

export const useGameSetupStore = create<GameSetupState>((set, get) => ({
  ...initialSetupState,

  setUser: (user) => set({ user }),
  setCategoriesList: (categoriesList) => set({ categoriesList }),
  setGroupsList: (groupsList) => set({ groupsList }),
  setQuestionRows: (questionRows) => set({ questionRows }),

  setSetupData: ({ categories, groups, questions, fromSupabase }) =>
    set({
      categoriesList: categories,
      groupsList: groups,
      questionRows: questions,
      questionSourceReady: true,
      questionSourceFromSupabase: fromSupabase,
    }),

  loadSetup: async () => {
    try {
      const result = await loadQuestionSetupData(supabase);
      set({
        categoriesList: result.categories,
        groupsList: result.groups,
        questionRows: result.questions,
        questionSourceFromSupabase: result.fromSupabase,
        questionSourceReady: true,
      });
      if (!result.fromSupabase) {
        get().triggerToast(
          "ما لقينا بنك الأسئلة في Supabase. تأكد من إعدادات الاتصال وحدث الصفحة.",
          "warning"
        );
      }
    } catch (err) {
      console.error("Failed to load setup data:", err);
      set({ questionSourceReady: true });
    }
  },

  setSelectedCategories: (selectedCategories) => set({ selectedCategories }),

  toggleCategory: (categoryId: string) => {
    const { selectedCategories, triggerToast } = get();
    const isSelected = selectedCategories.includes(categoryId);
    if (isSelected) {
      set({
        selectedCategories: selectedCategories.filter((id) => id !== categoryId),
      });
    } else {
      if (selectedCategories.length >= 6) {
        triggerToast("ما تقدر تختار أكثر من 6 فئات حق اللعبة.", "warning");
        return;
      }
      set({
        selectedCategories: [...selectedCategories, categoryId],
      });
    }
  },

  setGameName: (gameName) => set({ gameName }),
  setTeam1Name: (team1Name) => set({ team1Name }),
  setTeam2Name: (team2Name) => set({ team2Name }),

  setIsSubmitting: (isSubmitting) => set({ isSubmitting }),
  setCreatedRoom: (createdRoom) => set({ createdRoom }),
  setTeamTokens: (teamTokens) => set({ teamTokens }),

  triggerToast: (message, type = "warning") => {
    if (toastTimeout) clearTimeout(toastTimeout);
    set({ toast: { message, type } });
    toastTimeout = setTimeout(() => {
      set({ toast: null });
    }, 4500);
  },

  clearToast: () => {
    if (toastTimeout) clearTimeout(toastTimeout);
    set({ toast: null });
  },

  resetSetup: () =>
    set({
      selectedCategories: [],
      gameName: "",
      team1Name: "كتائب الفرسان",
      team2Name: "صقور النخبة",
      isSubmitting: false,
      createdRoom: null,
      teamTokens: null,
      toast: null,
    }),

  handleStartGame: async () => {
    const {
      user,
      selectedCategories,
      questionSourceReady,
      gameName,
      team1Name,
      team2Name,
      categoriesList,
      questionRows,
      triggerToast,
    } = get();

    // 1. Auth Validation
    if (!user) {
      triggerToast(
        "لازم تسوي حساب أو تسجل دخولك أول قبل لا تبدأ اللعب.",
        "auth-error"
      );
      return false;
    }

    // 2. Setup Step Validations
    if (selectedCategories.length !== 6) {
      triggerToast(
        "لازم تختار فئات الأسئلة أول شي قبل لا تكمل الباقي.",
        "error"
      );
      return false;
    }

    if (!questionSourceReady) {
      triggerToast("قاعدين نحمل الأسئلة، انطر شوي ورد جرب.", "warning");
      return false;
    }

    if (!gameName.trim()) {
      triggerToast("لو سمحت اكتب اسم اللعبة.", "error");
      return false;
    }

    if (!team1Name.trim() || !team2Name.trim()) {
      triggerToast(
        "لو سمحت اكتب اسم الفريق الأول واسم الفريق الثاني.",
        "error"
      );
      return false;
    }

    if (team1Name.trim().toLowerCase() === team2Name.trim().toLowerCase()) {
      triggerToast(
        "لازم اسم الفريق الأول يختلف عن اسم الفريق الثاني.",
        "error"
      );
      return false;
    }

    set({ isSubmitting: true });
    try {
      const selectedCategoryRecords = categoriesList.filter((category) =>
        selectedCategories.includes(category.id)
      );

      let poolQuestions = questionRows;
      const missingAny = selectedCategories.some(
        (catId) => !questionRows.some((q) => q.category_id === catId)
      );
      if (missingAny) {
        const { data: directQuestions } = await supabase
          .from("question_bank")
          .select(
            "id,category_id,question_text,answer_text,difficulty,strikes,position,is_active,media_url,media_type,image_duration,media_play_count,answer_image_url,timer_seconds"
          )
          .in("category_id", selectedCategories)
          .eq("is_active", true);
        if (directQuestions && directQuestions.length > 0) {
          const combinedMap = new Map();
          poolQuestions.forEach((q) => combinedMap.set(q.id, q));
          directQuestions.forEach((q) => combinedMap.set(q.id, q));
          poolQuestions = Array.from(combinedMap.values());
        }
      }

      const questions = buildRoomQuestions(
        selectedCategoryRecords,
        poolQuestions
      );

      if (questions.length === 0) {
        throw new Error("التصنيفات المختارة مفيهاش أي أسئلة فعّالة ببنك الأسئلة.");
      }

      const { data: createResult, error: createError } = await supabase.rpc(
        "create_game_room",
        {
          p_game_name: gameName.trim(),
          p_team_1_name: team1Name.trim(),
          p_team_2_name: team2Name.trim(),
          p_selected_categories: selectedCategories,
          p_questions: questions,
        }
      );

      if (createError) throw createError;

      const { data: room, error: roomError } = await supabase
        .from("game_rooms")
        .select("*")
        .eq("id", createResult.room_id)
        .single();

      if (roomError) throw roomError;

      const tokens = {
        team_1_token: createResult.team_1_token,
        team_2_token: createResult.team_2_token,
      };

      set({
        createdRoom: room,
        teamTokens: tokens,
      });

      if (typeof window !== "undefined") {
        window.localStorage.setItem(
          "sovereignty_active_room",
          JSON.stringify({ id: room.id, ...tokens })
        );
      }

      triggerToast("جهزنا الغرفة وطلعنا روابط الانضمام بنجاح!", "success");
      return true;
    } catch (err: any) {
      console.error(err);
      triggerToast(
        `صار خطأ وإحنا نجهز الغرفة: ${
          err.message || "يرجى مراجعة الصلاحيات RLS."
        }`,
        "error"
      );
      return false;
    } finally {
      set({ isSubmitting: false });
    }
  },

  handleExitCreatedRoom: async () => {
    const { createdRoom, triggerToast } = get();
    if (!createdRoom) return;

    try {
      const { error } = await supabase.rpc("abandon_game", {
        p_room_id: createdRoom.id,
        p_actor_role: "judge",
        p_team_index: null,
      });

      if (error) {
        triggerToast(`ما قدرنا نطلع من الغرفة: ${error.message}`, "error");
        return;
      }

      if (typeof window !== "undefined") {
        window.localStorage.removeItem("sovereignty_active_room");
      }
      set({
        createdRoom: null,
        teamTokens: null,
      });
      triggerToast("تسكرت الغرفة وطلعنا من اللعبة.", "success");
    } catch (err: any) {
      triggerToast(`حدث خطأ أثناء الخروج: ${err.message}`, "error");
    }
  },
}));
