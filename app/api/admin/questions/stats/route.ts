import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export async function GET(request: Request) {
  try {
    const auth = await requireAdmin(request);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const supabaseAdmin = getSupabaseAdmin();
    const { data, error } = await supabaseAdmin.rpc("get_all_question_stats");

    if (error) {
      console.error("RPC get_all_question_stats failed, attempting fallback query:", error);
      // Fallback query if RPC isn't found
      const { data: fallbackData, error: fallbackError } = await supabaseAdmin
        .from("room_questions")
        .select("question_bank_id, is_used, answered_correctly")
        .eq("is_used", true);

      if (fallbackError) {
        return NextResponse.json(
          { error: fallbackError.message || "فشل تحميل إحصائيات الأسئلة." },
          { status: 500 }
        );
      }

      const stats: Record<string, { used: number; correct: number; incorrect: number }> = {};
      (fallbackData || []).forEach((row: any) => {
        if (!row.question_bank_id) return;
        const key = String(row.question_bank_id);
        const s = stats[key] || { used: 0, correct: 0, incorrect: 0 };
        s.used += 1;
        if (row.answered_correctly === true) s.correct += 1;
        else if (row.answered_correctly === false) s.incorrect += 1;
        stats[key] = s;
      });

      return NextResponse.json({ stats });
    }

    const stats: Record<string, { used: number; correct: number; incorrect: number }> = {};
    (data || []).forEach((row: any) => {
      if (!row.question_id) return;
      stats[String(row.question_id)] = {
        used: Number(row.used) || 0,
        correct: Number(row.correct) || 0,
        incorrect: Number(row.incorrect) || 0,
      };
    });

    return NextResponse.json({ stats });
  } catch (err: any) {
    console.error("GET /api/admin/questions/stats error:", err);
    return NextResponse.json(
      { error: err?.message || "صار خطأ غير متوقع في جلب الإحصائيات." },
      { status: 500 }
    );
  }
}
