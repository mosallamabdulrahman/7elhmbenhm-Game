import { create } from "zustand";
import { supabasePanel as supabase } from "@/lib/supabase-panel";
import { callAdminApi } from "@/lib/admin-api";
import { DIFFICULTY_STRIKES } from "@/lib/admin-constants";
import { getUserDisplayName } from "@/lib/auth";
import type {
  AdminQuestion,
  AdminTab,
  AdminToast,
  CategoryGroup,
  QuestionCategory,
  QuestionStats,
} from "@/types/admin";

export const VALID_ADMIN_TABS: AdminTab[] = [
  "dashboard",
  "groups",
  "categories",
  "questions",
  "support",
  "users",
  "stats",
];

const getInitialTab = (): AdminTab => {
  if (typeof window !== "undefined") {
    const params = new URLSearchParams(window.location.search);
    const urlTab = params.get("tab") as AdminTab | null;
    if (urlTab && VALID_ADMIN_TABS.includes(urlTab)) {
      return urlTab;
    }
    const savedTab = window.localStorage.getItem("admin_active_tab") as AdminTab | null;
    if (savedTab && VALID_ADMIN_TABS.includes(savedTab)) {
      return savedTab;
    }
  }
  return "questions";
};

const normalizePositiveInt = (value: any, max: number): number | null => {
  const number = Number(value);
  if (!Number.isFinite(number) || number <= 0) return null;
  return Math.min(Math.floor(number), max);
};

export interface AdminStoreState {
  // Navigation & Filtering
  tab: AdminTab;
  searchQuery: string;
  filterCategory: string;
  filterDifficulty: string;

  // Data
  groups: CategoryGroup[];
  categories: QuestionCategory[];
  questions: AdminQuestion[];
  questionStats: Record<string, QuestionStats>;
  categoryUsage: Record<string, number>;
  unreadSupportCount: number;
  supportMessages: any[];
  supportLoading: boolean;
  supportBusy: boolean;

  // UI & Loading
  loading: boolean;
  busy: boolean;
  toast: AdminToast;

  // Modals & Inline Editors
  groupModal: any | null;
  catModal: any | null;
  qModal: any | null;
  helpOpen: boolean;
  difficultyEditFor: string | null;
  statusEditFor: string | null;
  categoryStatusEditFor: string | null;

  // Actions: Navigation & Filters
  setTab: (newTab: AdminTab) => void;
  setSearchQuery: (query: string) => void;
  setFilterCategory: (cat: string) => void;
  setFilterDifficulty: (diff: string) => void;

  // Actions: UI & Modals
  setBusy: (busy: boolean) => void;
  notify: (msg: string, type?: "success" | "error" | "info") => void;
  closeToast: () => void;
  setGroupModal: (group: any | null) => void;
  setCatModal: (cat: any | null) => void;
  setQModal: (q: any | null) => void;
  setHelpOpen: (open: boolean) => void;
  setDifficultyEditFor: (
    idOrFn: string | null | ((prev: string | null) => string | null)
  ) => void;
  setStatusEditFor: (
    idOrFn: string | null | ((prev: string | null) => string | null)
  ) => void;
  setCategoryStatusEditFor: (
    idOrFn: string | null | ((prev: string | null) => string | null)
  ) => void;

  // Actions: Loaders
  loadAllData: () => Promise<void>;
  loadGroups: () => Promise<void>;
  loadCategories: () => Promise<void>;
  loadQuestions: () => Promise<void>;
  loadQuestionStats: () => Promise<void>;
  loadCategoryUsage: () => Promise<void>;
  loadUnreadSupportCount: () => Promise<void>;
  loadSupportMessages: (manual?: boolean) => Promise<void>;
  updateSupportStatus: (id: string, status: string) => Promise<void>;
  deleteSupportMessages: (ids: string[]) => Promise<void>;

  // Actions: CRUD Groups
  saveGroup: (form: any) => Promise<void>;
  deleteGroup: (id: string, name: string) => Promise<void>;
  handleBulkGroups: (payload: { action: string; ids: string[] }) => Promise<void>;

  // Actions: CRUD Categories
  saveCategory: (form: any) => Promise<void>;
  deleteCategory: (id: string, name?: string) => Promise<void>;
  handleInlineCategoryStatusChange: (category: any, newStatus: boolean) => Promise<void>;
  handleBulkCategories: (payload: {
    action: string;
    ids: string[];
    group_id?: string;
  }) => Promise<void>;

  // Actions: CRUD Questions
  saveQuestion: (form: any) => Promise<void>;
  deleteQuestion: (id: string) => Promise<void>;
  handleInlineDifficultyChange: (question: any, newDifficulty: string) => Promise<void>;
  handleInlineStatusChange: (question: any, newStatus: boolean) => Promise<void>;
  handleBulkQuestions: (payload: {
    action: string;
    ids: string[];
    category_id?: string;
  }) => Promise<void>;

  // Computed Getters
  getFilteredQuestions: () => AdminQuestion[];
  getFilteredCategories: () => QuestionCategory[];
  getCategoryMap: () => Record<string, QuestionCategory>;

  // Admin Auth / Gate
  adminState: "loading" | "allowed" | "denied";
  adminDisplayName: string;
  checkAdminAccess: () => Promise<void>;
  adminSignOut: () => Promise<void>;
}

export const useAdminStore = create<AdminStoreState>((set, get) => ({
  tab: getInitialTab(),
  searchQuery: "",
  filterCategory: "",
  filterDifficulty: "",

  adminState: "loading",
  adminDisplayName: "",

  groups: [],
  categories: [],
  questions: [],
  questionStats: {},
  categoryUsage: {},
  unreadSupportCount: 0,
  supportMessages: [],
  supportLoading: true,
  supportBusy: false,

  loading: true,
  busy: false,
  toast: { msg: "", type: "success" },

  groupModal: null,
  catModal: null,
  qModal: null,
  helpOpen: false,
  difficultyEditFor: null,
  statusEditFor: null,
  categoryStatusEditFor: null,

  checkAdminAccess: async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) {
        set({ adminState: "denied", adminDisplayName: "" });
        return;
      }

      const { data: isAdmin, error } = await supabase.rpc("is_admin");
      if (!error && isAdmin) {
        const name = getUserDisplayName(session.user);
        set({ adminState: "allowed", adminDisplayName: name });
      } else {
        set({ adminState: "denied", adminDisplayName: "" });
      }
    } catch {
      set({ adminState: "denied", adminDisplayName: "" });
    }
  },

  adminSignOut: async () => {
    try {
      await supabase.auth.signOut();
    } finally {
      set({ adminState: "denied", adminDisplayName: "" });
    }
  },

  setTab: (newTab) => {
    set({ tab: newTab, searchQuery: "" });
    if (typeof window !== "undefined") {
      window.localStorage.setItem("admin_active_tab", newTab);
      const url = new URL(window.location.href);
      url.searchParams.set("tab", newTab);
      window.history.replaceState(null, "", url.toString());
    }
  },

  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setFilterCategory: (filterCategory) => set({ filterCategory }),
  setFilterDifficulty: (filterDifficulty) => set({ filterDifficulty }),

  setBusy: (busy) => set({ busy }),
  notify: (msg, type = "success") => set({ toast: { msg, type } }),
  closeToast: () => set({ toast: { msg: "", type: "success" } }),
  setGroupModal: (groupModal) => set({ groupModal }),
  setCatModal: (catModal) => set({ catModal }),
  setQModal: (qModal) => set({ qModal }),
  setHelpOpen: (helpOpen) => set({ helpOpen }),
  setDifficultyEditFor: (val) =>
    set((state) => ({
      difficultyEditFor:
        typeof val === "function" ? val(state.difficultyEditFor) : val,
    })),
  setStatusEditFor: (val) =>
    set((state) => ({
      statusEditFor: typeof val === "function" ? val(state.statusEditFor) : val,
    })),
  setCategoryStatusEditFor: (val) =>
    set((state) => ({
      categoryStatusEditFor:
        typeof val === "function" ? val(state.categoryStatusEditFor) : val,
    })),

  // ── Loaders ──
  loadGroups: async () => {
    try {
      const { groups: rows } = await callAdminApi("/api/admin/groups");
      set({ groups: rows || [] });
    } catch (err: any) {
      get().notify(err.message || "فشل تحميل التصنيفات", "error");
    }
  },

  loadCategories: async () => {
    try {
      const { categories: rows } = await callAdminApi("/api/admin/categories");
      set({ categories: rows || [] });
    } catch (err: any) {
      get().notify(err.message || "فشل تحميل الفئات", "error");
    }
  },

  loadQuestions: async () => {
    try {
      const { questions: rows } = await callAdminApi("/api/admin/questions");
      set({ questions: rows || [] });
    } catch (err: any) {
      get().notify(err.message || "فشل تحميل الأسئلة", "error");
    }
  },

  loadQuestionStats: async () => {
    try {
      const { data, error } = await supabase
        .from("room_questions")
        .select("question_bank_id, is_used, answered_correctly")
        .not("question_bank_id", "is", null);
      if (error) {
        console.error("Error loading question statistics:", error);
        return;
      }
      const stats: Record<string, QuestionStats> = {};
      (data || []).forEach((row: any) => {
        if (!row.is_used) return;
        const key = row.question_bank_id;
        const s = stats[key] || { used: 0, correct: 0, incorrect: 0 };
        s.used += 1;
        if (row.answered_correctly === true) s.correct += 1;
        else if (row.answered_correctly === false) s.incorrect += 1;
        stats[key] = s;
      });
      set({ questionStats: stats });
    } catch (err) {
      console.error("Error loading question statistics:", err);
    }
  },

  loadCategoryUsage: async () => {
    try {
      const { data, error } = await supabase
        .from("game_rooms")
        .select("selected_categories");
      if (!error && data) {
        const counts: Record<string, number> = {};
        data.forEach((room: any) => {
          if (Array.isArray(room.selected_categories)) {
            room.selected_categories.forEach((catIdentifier: string) => {
              counts[catIdentifier] = (counts[catIdentifier] || 0) + 1;
            });
          }
        });
        set({ categoryUsage: counts });
      }
    } catch (err) {
      console.error("Error loading category usage statistics:", err);
    }
  },

  loadUnreadSupportCount: async () => {
    try {
      const data = await callAdminApi("/api/support");
      const msgs = data.messages || [];
      const unread = msgs.filter((m: any) => m.status === "unread").length;
      set({ supportMessages: msgs, unreadSupportCount: unread });
    } catch {
      // ignore
    }
  },

  loadSupportMessages: async (manual?: boolean) => {
    set({ supportBusy: true });
    try {
      const data = await callAdminApi("/api/support");
      const msgs = data.messages || [];
      const unread = msgs.filter((m: any) => m.status === "unread").length;
      set({
        supportMessages: msgs,
        unreadSupportCount: unread,
        supportLoading: false,
      });
      if (manual) {
        get().notify("تم تحديث رسائل الدعم بنجاح.", "success");
      }
    } catch (err: any) {
      console.error("loadSupportMessages error:", err);
      set({ supportLoading: false });
      if (manual) {
        get().notify(err?.message || "فشل تحميل رسائل الدعم.", "error");
      }
    } finally {
      set({ supportBusy: false });
    }
  },

  updateSupportStatus: async (id: string, status: string) => {
    set({ supportBusy: true });
    try {
      await callAdminApi("/api/support", "PATCH", { id, status });
      const updated = get().supportMessages.map((m) =>
        m.id === id ? { ...m, status } : m
      );
      const unread = updated.filter((m: any) => m.status === "unread").length;
      set({ supportMessages: updated, unreadSupportCount: unread });
      get().notify("تم تحديث حالة الرسالة بنجاح.", "success");
    } catch (err: any) {
      console.error(err);
      get().notify(err?.message || "حدث خطأ أثناء التحديث.", "error");
    } finally {
      set({ supportBusy: false });
    }
  },

  deleteSupportMessages: async (ids: string[]) => {
    set({ supportBusy: true });
    try {
      await callAdminApi("/api/support", "DELETE", { ids });
      const updated = get().supportMessages.filter((m) => !ids.includes(m.id));
      const unread = updated.filter((m: any) => m.status === "unread").length;
      set({ supportMessages: updated, unreadSupportCount: unread });
      get().notify("تم الحذف بنجاح.", "success");
    } catch (err: any) {
      console.error(err);
      get().notify(err?.message || "حدث خطأ أثناء الحذف.", "error");
    } finally {
      set({ supportBusy: false });
    }
  },

  loadAllData: async () => {
    set({ loading: true });
    try {
      await Promise.all([
        get().loadGroups(),
        get().loadCategories(),
        get().loadQuestions(),
        get().loadCategoryUsage(),
        get().loadQuestionStats(),
        get().loadUnreadSupportCount(),
      ]);
    } finally {
      set({ loading: false });
    }
  },

  // ── Groups CRUD ──
  saveGroup: async (form: any) => {
    set({ busy: true });
    try {
      const { error } = await supabase.rpc("admin_save_group", {
        p_id: form.id || null,
        p_name: form.name.trim(),
      });
      if (error) throw error;
      get().notify(form.id ? "تم تحديث التصنيف." : "تم إضافة التصنيف.");
      await get().loadGroups();
      set({ groupModal: null });
    } catch (err: any) {
      get().notify(err.message, "error");
    } finally {
      set({ busy: false });
    }
  },

  deleteGroup: async (id: string, name: string) => {
    if (
      !window.confirm(
        `حذف التصنيف "${name}"؟ ستصبح فئات الأسئلة التابعة له بدون تصنيف رئيسي.`
      )
    )
      return;
    set({ busy: true });
    try {
      const { error } = await supabase.rpc("admin_delete_group", {
        p_id: id,
      });
      if (error) throw error;
      get().notify("تم حذف التصنيف.");
      await Promise.all([get().loadGroups(), get().loadCategories()]);
    } catch (err: any) {
      get().notify(err.message, "error");
    } finally {
      set({ busy: false });
    }
  },

  handleBulkGroups: async ({ action, ids }) => {
    if (!ids || ids.length === 0) return;
    set({ busy: true });
    try {
      if (action === "delete") {
        await callAdminApi("/api/admin/groups", "DELETE", { ids });
        get().notify(`تم حذف ${ids.length} تصنيف بنجاح.`);
        await Promise.all([get().loadGroups(), get().loadCategories()]);
      }
    } catch (err: any) {
      get().notify(err.message, "error");
    } finally {
      set({ busy: false });
    }
  },

  // ── Categories CRUD ──
  saveCategory: async (form: any) => {
    set({ busy: true });
    try {
      const { error } = await supabase.rpc("admin_save_category", {
        p_id: form.id || null,
        p_name: form.name.trim(),
        p_description: form.description?.trim() || null,
        p_image_url: form.image_url?.trim() || null,
        p_sort_order: form.sort_order || 0,
        p_is_active: form.is_active,
        p_group_id: form.group_id || null,
      });
      if (error) throw error;
      get().notify(form.id ? "تم تحديث فئة الأسئلة." : "تم إضافة فئة الأسئلة.");
      await get().loadCategories();
      set({ catModal: null });
    } catch (err: any) {
      get().notify(err.message, "error");
    } finally {
      set({ busy: false });
    }
  },

  deleteCategory: async (id: string) => {
    if (!window.confirm("حذف فئة الأسئلة هذه وكل أسئلتها؟")) return;
    set({ busy: true });
    try {
      const { error } = await supabase.rpc("admin_delete_category", {
        p_id: id,
      });
      if (error) throw error;
      get().notify("تم الحذف.");
      await Promise.all([get().loadCategories(), get().loadQuestions()]);
    } catch (err: any) {
      get().notify(err.message, "error");
    } finally {
      set({ busy: false });
    }
  },

  handleInlineCategoryStatusChange: async (category: any, newStatus: boolean) => {
    set({ categoryStatusEditFor: null });
    if (newStatus === category.is_active) return;
    await get().saveCategory({ ...category, is_active: newStatus });
  },

  handleBulkCategories: async ({ action, ids, group_id }) => {
    if (!ids || ids.length === 0) return;
    set({ busy: true });
    try {
      if (action === "delete") {
        await callAdminApi("/api/admin/categories", "DELETE", { ids });
        get().notify(`تم حذف ${ids.length} فئة أسئلة بنجاح.`);
        await Promise.all([get().loadCategories(), get().loadQuestions()]);
      } else if (action === "activate") {
        await callAdminApi("/api/admin/categories", "PATCH", {
          ids,
          action: "activate",
        });
        get().notify(`تم تفعيل ${ids.length} فئة بنجاح.`);
        await get().loadCategories();
      } else if (action === "deactivate") {
        await callAdminApi("/api/admin/categories", "PATCH", {
          ids,
          action: "deactivate",
        });
        get().notify(`تم تعطيل ${ids.length} فئة بنجاح.`);
        await get().loadCategories();
      } else if (action === "assign_group") {
        await callAdminApi("/api/admin/categories", "PATCH", {
          ids,
          action: "assign_group",
          group_id,
        });
        get().notify(`تم تعيين التصنيف لـ ${ids.length} فئة بنجاح.`);
        await get().loadCategories();
      }
    } catch (err: any) {
      get().notify(err.message, "error");
    } finally {
      set({ busy: false });
    }
  },

  // ── Questions CRUD ──
  saveQuestion: async (form: any) => {
    const { categories, groups, questions } = get();
    const targetCat = categories.find(
      (c) => String(c.id) === String(form.category_id)
    );
    const targetGroup = groups.find(
      (g) => String(g.id) === String(targetCat?.group_id)
    );
    const isWlaKelma =
      targetCat?.name === "ولا كلمة" ||
      targetCat?.name?.includes("ولا كلمة") ||
      targetGroup?.name === "ولا كلمة" ||
      targetCat?.group_id === "d6a55dbb-85dd-4245-985e-e3d7e5d1e000" ||
      String(form.category_id) === "wla_kelma";

    const qText =
      form.question_text?.trim() ||
      (isWlaKelma ? form.answer_text?.trim() || "ولا كلمة" : "");
    const aText = form.answer_text?.trim() || "";

    const isDup = questions.some((q) => {
      if (q.category_id !== form.category_id || q.id === form.id) return false;
      const sameAnswer =
        (q.answer_text?.trim().toLowerCase() || "") === aText.toLowerCase();
      const sameAnswerImage =
        (q.answer_image_url?.trim() || "") ===
        (form.answer_image_url?.trim() || "");
      if (isWlaKelma) {
        if (!aText) return false;
        return sameAnswer && sameAnswerImage;
      }
      const sameText =
        q.question_text?.trim().toLowerCase() === qText.toLowerCase();
      return (
        sameText &&
        (sameAnswer || (!aText && !q.answer_text?.trim())) &&
        sameAnswerImage
      );
    });

    if (isDup) {
      get().notify(
        isWlaKelma
          ? "هذا العمل موجود مسبقاً في نفس الفئة!"
          : "هالسؤال موجود من قبل بنفس التصنيف، ما تقدر تضيفه مرة ثانية!",
        "error"
      );
      return;
    }

    set({ busy: true });
    try {
      const mediaUrl = form.media_url?.trim() || null;
      const mediaType = mediaUrl ? form.media_type || "image" : null;
      const showQuestionFirst = mediaUrl
        ? Boolean(form.show_question_first)
        : false;

      const questionPayload = {
        id: form.id || null,
        category_id: form.category_id,
        question_text: qText,
        answer_text: aText,
        difficulty: form.difficulty,
        strikes: DIFFICULTY_STRIKES[form.difficulty as keyof typeof DIFFICULTY_STRIKES] || 1,
        position: form.position || 1,
        is_active: form.is_active,
        media_url: mediaUrl,
        media_type: mediaType,
        image_duration:
          mediaType === "image" || showQuestionFirst
            ? normalizePositiveInt(form.image_duration, 600)
            : null,
        media_play_count:
          mediaType === "audio" || mediaType === "video"
            ? normalizePositiveInt(form.media_play_count, 20)
            : null,
        answer_image_url: form.answer_image_url?.trim() || null,
        show_question_first: showQuestionFirst,
        timer_seconds: form.timer_seconds ? Number(form.timer_seconds) : 60,
      };

      try {
        await callAdminApi("/api/admin/questions", "POST", questionPayload);
      } catch (apiErr) {
        // Fallback to RPC if API route fails
        const rpcParams: any = {
          p_id: form.id || null,
          p_category_id: form.category_id,
          p_question_text: qText,
          p_answer_text: aText,
          p_difficulty: form.difficulty,
          p_strikes:
            DIFFICULTY_STRIKES[form.difficulty as keyof typeof DIFFICULTY_STRIKES] || 1,
          p_position: form.position || 1,
          p_is_active: form.is_active,
          p_media_url: mediaUrl,
          p_media_type: mediaType,
          p_image_duration: questionPayload.image_duration,
          p_media_play_count: questionPayload.media_play_count,
          p_answer_image_url: questionPayload.answer_image_url,
          p_show_question_first: showQuestionFirst,
        };

        let { error } = await supabase.rpc("admin_save_question", rpcParams);
        if (error && error.message?.includes("p_show_question_first")) {
          delete rpcParams.p_show_question_first;
          const retry = await supabase.rpc("admin_save_question", rpcParams);
          error = retry.error;
        }
        if (error) throw error;
      }

      get().notify(form.id ? "تم تحديث السؤال." : "تم إضافة السؤال.");
      await get().loadQuestions();
      set({ qModal: null });
    } catch (err: any) {
      get().notify(err.message, "error");
    } finally {
      set({ busy: false });
    }
  },

  deleteQuestion: async (id: string) => {
    if (!window.confirm("حذف هذا السؤال؟")) return;
    set({ busy: true });
    try {
      const { error } = await supabase.rpc("admin_delete_question", {
        p_id: id,
      });
      if (error) throw error;
      get().notify("تم حذف السؤال.");
      await get().loadQuestions();
    } catch (err: any) {
      get().notify(err.message, "error");
    } finally {
      set({ busy: false });
    }
  },

  handleInlineDifficultyChange: async (question: any, newDifficulty: string) => {
    set({ difficultyEditFor: null });
    if (newDifficulty === question.difficulty) return;
    await get().saveQuestion({ ...question, difficulty: newDifficulty });
  },

  handleInlineStatusChange: async (question: any, newStatus: boolean) => {
    set({ statusEditFor: null });
    if (newStatus === question.is_active) return;
    await get().saveQuestion({ ...question, is_active: newStatus });
  },

  handleBulkQuestions: async ({ action, ids, category_id }) => {
    if (!ids || ids.length === 0) return;
    set({ busy: true });
    try {
      if (action === "delete") {
        await callAdminApi("/api/admin/questions", "DELETE", { ids });
        get().notify(`تم حذف ${ids.length} سؤال بنجاح.`);
      } else if (action === "activate") {
        await callAdminApi("/api/admin/questions", "PATCH", {
          ids,
          action: "activate",
        });
        get().notify(`تم تفعيل ${ids.length} سؤال بنجاح.`);
      } else if (action === "deactivate") {
        await callAdminApi("/api/admin/questions", "PATCH", {
          ids,
          action: "deactivate",
        });
        get().notify(`تم تعطيل ${ids.length} سؤال بنجاح.`);
      } else if (action === "change_category") {
        await callAdminApi("/api/admin/questions", "PATCH", {
          ids,
          action: "change_category",
          category_id,
        });
        get().notify(`تم نقل ${ids.length} سؤال إلى الفئة بنجاح.`);
      }
      await get().loadQuestions();
    } catch (err: any) {
      get().notify(err.message, "error");
    } finally {
      set({ busy: false });
    }
  },

  // ── Computed Getters ──
  getFilteredQuestions: () => {
    const { questions, filterCategory, filterDifficulty, searchQuery } = get();
    const query = searchQuery.trim().toLowerCase();
    return questions.filter((q) => {
      const matchesCategory = filterCategory
        ? String(q.category_id) === String(filterCategory)
        : true;
      const matchesDifficulty = filterDifficulty
        ? String(q.difficulty) === String(filterDifficulty)
        : true;
      const matchesSearch = query
        ? q.question_text?.toLowerCase().includes(query) ||
          q.answer_text?.toLowerCase().includes(query)
        : true;
      return matchesCategory && matchesDifficulty && matchesSearch;
    });
  },

  getFilteredCategories: () => {
    const { categories, searchQuery } = get();
    const query = searchQuery.trim().toLowerCase();
    return categories.filter((c) => {
      return query
        ? c.name?.toLowerCase().includes(query) ||
            c.description?.toLowerCase().includes(query)
        : true;
    });
  },

  getCategoryMap: () => {
    const { categories } = get();
    const map: Record<string, QuestionCategory> = {};
    categories.forEach((c) => {
      map[String(c.id)] = c;
      if (c.name) {
        map[c.name.trim()] = c;
      }
    });
    return map;
  },
}));
