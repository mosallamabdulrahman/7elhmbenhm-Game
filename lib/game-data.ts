import type { SupabaseClient } from "@supabase/supabase-js";
import type { QuestionCategory, QuestionCategoryGroup } from "@/types/game";

export const FIXED_TACTICAL_TOOLS = ["radar_scan", "shield", "extra_strike"];
export const LIFELINE_TOOLS = [];

export const UNIT_IMAGES: Record<string, string> = {
  infantry: "/images/gear/infantry.png",
  armored: "/images/gear/armored.png",
  tank: "/images/gear/tank.png",
  aircraft: "/images/gear/aircraft.png",
  submarine: "/images/gear/submarine.png",
  mine: "/images/gear/mine.png",
};

export const UNIT_NAMES: Record<string, string> = {
  infantry: "جندي",
  armored: "مدرعة",
  tank: "دبابة",
  aircraft: "طائرة",
  submarine: "غواصة",
  mine: "لغم",
};

export const TACTICAL_TOOL_DETAILS: Record<
  string,
  { name: string; description: string }
> = {
  radar_scan: {
    name: "الرادار",
    description:
      "يبين لك المربع اللي اخترته وكل المربعات اللي يمه (3x3). طق على مربع بخريطة الخصم.",
  },
  shield: {
    name: "الدرع",
    description: "يصد أول طقة تصيب جنودك. لازم تشغله قبل لا تبطل السؤال.",
  },
  extra_strike: {
    name: "طقّة زيادة",
    description: "يزيد رصيدك طقة وحدة. لازم تشغله قبل لا تبطل السؤال.",
  },
  lifeline_call: {
    name: "اتصال بصديق",
    description: "يعطيك 60 ثانية زيادة للتفكير — راح يبين عندك العداد.",
  },
  double_chance: {
    name: "فرصتين",
    description: "تقدر تجاوب مرتين على نفس السؤال.",
  },
  the_hole: {
    name: "الحفرة",
    description:
      "شغلها قبل لا تبطل السؤال — إذا جاوبت صح تاخذ طقة زيادة، وإذا غلط تروح عليك الفزعة.",
  },
  the_detector: {
    name: "الكاشف",
    description:
      "يكشف المربع اللي اخترته والمربعات اللي يمه — يطلع عقب نص الأسئلة.",
  },
};

export const FALLBACK_CATEGORIES: QuestionCategory[] = [];

// Content hierarchy: group (التصنيف) ➜ question category (فئة الأسئلة) ➜
// question. Splits the flat category list into collapsible sections without
// touching the incoming order (Supabase already sorts by sort_order).
export const groupCategories = (
  categories: QuestionCategory[] = [],
  groups: QuestionCategoryGroup[] = []
): {
  groups: { id: string; title: string; items: QuestionCategory[] }[];
  ungrouped: QuestionCategory[];
} => {
  const nameByGroupId = new Map(
    (groups || []).map((group) => [
      String(group.id),
      group.name || group.title || "",
    ])
  );

  const grouped: { id: string; title: string; items: QuestionCategory[] }[] =
    [];
  const indexByGroupId = new Map<string, number>();
  const ungrouped: QuestionCategory[] = [];

  (categories || []).forEach((category) => {
    const groupId = category.group_id ? String(category.group_id) : "";
    const title = nameByGroupId.get(groupId);

    if (!title) {
      ungrouped.push(category);
      return;
    }

    if (!indexByGroupId.has(groupId)) {
      indexByGroupId.set(groupId, grouped.length);
      grouped.push({ id: groupId, title, items: [] });
    }

    const targetGroup = grouped[indexByGroupId.get(groupId)!];
    if (targetGroup) {
      targetGroup.items.push(category);
    }
  });

  return { groups: grouped, ungrouped };
};

// Difficulty tiers, in the order they should appear top-to-bottom on the
// question board (easy row, then medium row, then hard row).
export const DIFFICULTY_TIERS = ["easy", "medium", "hard"];

const normalizeQuestionRow = (
  question: any,
  category: QuestionCategory
) => ({
  question_bank_id: question.id,
  category_id: category.id,
  category_name: category.name,
  category_image_url: category.image_url || "",
  group_id: category.group_id || null,
  group_name: category.group_name || null,
  question_text: question.question_text,
  answer_text: question.answer_text,
  position: question.position,
  difficulty: question.difficulty,
  strikes: question.strikes,
  media_url: question.media_url || null,
  media_type: question.media_type || null,
  image_duration: question.image_duration || null,
  media_play_count: question.media_play_count || null,
  show_question_first: Boolean(question.show_question_first),
  answer_image_url: question.answer_image_url || null,
  timer_seconds:
    Number(question.timer_seconds) > 0 ? Number(question.timer_seconds) : 60,
});

const shuffle = <T>(rows: T[]): T[] => {
  const copy = [...rows];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = copy[i];
    copy[i] = copy[j];
    copy[j] = temp;
  }
  return copy;
};

export const buildRoomQuestions = (
  categories: QuestionCategory[],
  questionRows: any[] = []
) =>
  categories.flatMap((category) => {
    const categoryRows = questionRows.filter(
      (question) => question.category_id === category.id
    );

    let position = 0;
    return DIFFICULTY_TIERS.flatMap((difficulty) => {
      const tierRows = shuffle(
        categoryRows.filter((question) => question.difficulty === difficulty)
      ).slice(0, 2);

      return tierRows.map((question) => {
        position += 1;
        return normalizeQuestionRow({ ...question, position }, category);
      });
    });
  });

const CATEGORY_COLUMNS = "id,name,description,image_url,sort_order,is_active";

const isMissingSchema = (error: any, name: string): boolean =>
  error?.code === "42703" ||
  error?.code === "PGRST205" ||
  new RegExp(name, "i").test(error?.message || "");

const fetchActiveCategories = async (supabase: SupabaseClient) => {
  const query = (columns: string) =>
    supabase
      .from("question_categories")
      .select(columns)
      .eq("is_active", true)
      .order("sort_order", { ascending: true });

  const withGroup = await query(`${CATEGORY_COLUMNS},group_id`);
  if (!withGroup.error) return withGroup;
  if (!isMissingSchema(withGroup.error, "group_id")) return withGroup;

  return query(CATEGORY_COLUMNS);
};

const fetchCategoryGroups = async (supabase: SupabaseClient) => {
  const result = await supabase
    .from("category_groups")
    .select("id,name")
    .order("created_at", { ascending: true });

  if (result.error && isMissingSchema(result.error, "category_groups")) {
    return { data: [], error: null };
  }

  return result;
};

const QUESTION_BANK_COLUMNS =
  "id,category_id,question_text,answer_text,difficulty,strikes,position,is_active,media_url,media_type,image_duration,media_play_count,answer_image_url,timer_seconds";

const fetchActiveQuestions = async (supabase: SupabaseClient) => {
  const fetchPage = async (columns: string, from: number, to: number) => {
    return supabase
      .from("question_bank")
      .select(columns)
      .eq("is_active", true)
      .order("category_id", { ascending: true })
      .order("position", { ascending: true })
      .range(from, to);
  };

  const testFirst = await fetchPage(
    `${QUESTION_BANK_COLUMNS},show_question_first`,
    0,
    0
  );
  const useOption =
    !testFirst.error ||
    !isMissingSchema(testFirst.error, "show_question_first");
  const cols = useOption
    ? `${QUESTION_BANK_COLUMNS},show_question_first`
    : QUESTION_BANK_COLUMNS;

  const allRows: any[] = [];
  let from = 0;
  const pageSize = 1000;

  while (true) {
    const { data, error } = await fetchPage(cols, from, from + pageSize - 1);
    if (error) {
      if (allRows.length > 0) return { data: allRows, error: null };
      return { data: null, error };
    }
    if (!data || data.length === 0) break;
    allRows.push(...data);
    if (data.length < pageSize) break;
    from += pageSize;
  }

  return { data: allRows, error: null };
};

export const loadQuestionSetupData = async (
  supabase: SupabaseClient
): Promise<{
  categories: QuestionCategory[];
  groups: QuestionCategoryGroup[];
  questions: any[];
  fromSupabase: boolean;
  error: any | null;
}> => {
  const [categoriesResult, groupsResult, questionsResult] = await Promise.all([
    fetchActiveCategories(supabase),
    fetchCategoryGroups(supabase),
    fetchActiveQuestions(supabase),
  ]);

  if (categoriesResult.error || questionsResult.error) {
    return {
      categories: FALLBACK_CATEGORIES,
      groups: [],
      questions: [],
      fromSupabase: false,
      error: categoriesResult.error || questionsResult.error,
    };
  }

  const groupMap = new Map<string, string>(
    (groupsResult.data || []).map((g: any) => [g.id, g.name])
  );
  const categories: QuestionCategory[] = (categoriesResult.data || []).map(
    (category: any) => ({
      id: category.id,
      name: category.name,
      desc: category.description,
      image_url: category.image_url || "",
      group_id: category.group_id || null,
      group_name: category.group_id ? groupMap.get(category.group_id) || "" : "",
    })
  );

  if (!categories.length) {
    return {
      categories: FALLBACK_CATEGORIES,
      groups: [],
      questions: [],
      fromSupabase: false,
      error: null,
    };
  }

  return {
    categories,
    groups: groupsResult.data || [],
    questions: questionsResult.data || [],
    fromSupabase: true,
    error: null,
  };
};
