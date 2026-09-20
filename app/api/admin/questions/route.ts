import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { loadAllQuestions } from "@/lib/admin-content";

// GET /api/admin/questions — all bank questions, active AND inactive.
export async function GET(request: Request) {
  try {
    const auth = await requireAdmin(request);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { rows, error } = await loadAllQuestions(getSupabaseAdmin());

    if (error) {
      return NextResponse.json(
        { error: error.message || "ما قدرنا نجيب الأسئلة." },
        { status: 400 }
      );
    }

    return NextResponse.json({ questions: rows });
  } catch (err: any) {
    console.error("GET /api/admin/questions failed:", err);
    return NextResponse.json(
      { error: err?.message || "صار خطأ غير متوقع في السيرفر." },
      { status: 500 }
    );
  }
}

// POST /api/admin/questions — save or update a single question safely
export async function POST(request: Request) {
  try {
    const auth = await requireAdmin(request);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const body = await request.json().catch(() => ({}));
    const {
      id,
      category_id,
      question_text,
      answer_text,
      difficulty,
      strikes,
      position,
      is_active,
      media_url,
      media_type,
      image_duration,
      media_play_count,
      answer_image_url,
      timer_seconds,
      show_question_first,
    } = body;

    if (!category_id) {
      return NextResponse.json(
        { error: "يجب اختيار الفئة المستهدفة للسؤال." },
        { status: 400 }
      );
    }

    const diff = (difficulty || "easy").toLowerCase();
    const points = diff === "hard" ? 600 : diff === "medium" ? 400 : 200;

    const payload: any = {
      category_id: String(category_id),
      question_text: (question_text || "").trim(),
      answer_text: (answer_text || "").trim(),
      difficulty: diff,
      strikes: strikes || (diff === "hard" ? 3 : diff === "medium" ? 2 : 1),
      points,
      position: position ? Number(position) : 1,
      is_active: is_active !== false,
      media_url: media_url ? media_url.trim() : null,
      media_type: media_url ? media_type || "image" : null,
      image_duration: image_duration ? Number(image_duration) : null,
      media_play_count: media_play_count ? Number(media_play_count) : null,
      answer_image_url: answer_image_url ? answer_image_url.trim() : null,
      show_question_first: Boolean(show_question_first),
      timer_seconds:
        timer_seconds !== undefined &&
        timer_seconds !== null &&
        timer_seconds !== ""
          ? Math.max(1, Number(timer_seconds))
          : 60,
      updated_at: new Date().toISOString(),
    };

    const supabaseAdmin = getSupabaseAdmin();

    const isSchemaColumnError = (err: any) =>
      err &&
      (err.code === "42703" ||
        err.code === "PGRST204" ||
        err.message?.includes("show_question_first"));

    if (!id) {
      let { data, error } = await supabaseAdmin
        .from("question_bank")
        .insert(payload)
        .select()
        .single();

      if (isSchemaColumnError(error)) {
        console.warn("question_bank missing show_question_first column, retrying without it");
        const fallbackPayload = { ...payload };
        delete fallbackPayload.show_question_first;
        const retry = await supabaseAdmin
          .from("question_bank")
          .insert(fallbackPayload)
          .select()
          .single();
        data = retry.data;
        error = retry.error;
      }

      if (error) throw error;
      return NextResponse.json({ ok: true, question: data });
    } else {
      let { data, error } = await supabaseAdmin
        .from("question_bank")
        .update(payload)
        .eq("id", id)
        .select()
        .single();

      if (isSchemaColumnError(error)) {
        console.warn("question_bank missing show_question_first column, retrying without it");
        const fallbackPayload = { ...payload };
        delete fallbackPayload.show_question_first;
        const retry = await supabaseAdmin
          .from("question_bank")
          .update(fallbackPayload)
          .eq("id", id)
          .select()
          .single();
        data = retry.data;
        error = retry.error;
      }

      if (error) throw error;
      return NextResponse.json({ ok: true, question: data });
    }
  } catch (err: any) {
    console.error("POST /api/admin/questions failed:", err);
    return NextResponse.json(
      { error: err?.message || "فشل حفظ السؤال." },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/questions — bulk update (activate, deactivate, move to category)
export async function PATCH(request: Request) {
  try {
    const auth = await requireAdmin(request);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const body = await request.json().catch(() => ({}));
    const { ids, action, category_id } = body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: "لم يتم تحديد أي أسئلة." },
        { status: 400 }
      );
    }

    const supabaseAdmin = getSupabaseAdmin();

    if (action === "activate") {
      const { error } = await supabaseAdmin
        .from("question_bank")
        .update({ is_active: true })
        .in("id", ids);
      if (error) throw error;
      return NextResponse.json({ ok: true, count: ids.length });
    }

    if (action === "deactivate") {
      const { error } = await supabaseAdmin
        .from("question_bank")
        .update({ is_active: false })
        .in("id", ids);
      if (error) throw error;
      return NextResponse.json({ ok: true, count: ids.length });
    }

    if (action === "change_category") {
      if (!category_id) {
        return NextResponse.json(
          { error: "يجب اختيار الفئة المستهدفة." },
          { status: 400 }
        );
      }
      const { error } = await supabaseAdmin
        .from("question_bank")
        .update({ category_id })
        .in("id", ids);
      if (error) throw error;
      return NextResponse.json({ ok: true, count: ids.length });
    }

    return NextResponse.json({ error: "إجراء غير صالح." }, { status: 400 });
  } catch (err: any) {
    console.error("PATCH /api/admin/questions failed:", err);
    return NextResponse.json(
      { error: err?.message || "فشلت العملية." },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/questions — bulk delete questions
export async function DELETE(request: Request) {
  try {
    const auth = await requireAdmin(request);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const body = await request.json().catch(() => ({}));
    const { ids } = body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: "لم يتم تحديد أي أسئلة للحذف." },
        { status: 400 }
      );
    }

    const supabaseAdmin = getSupabaseAdmin();

    // Detach room_questions if any reference these questions
    await supabaseAdmin
      .from("room_questions")
      .update({ question_bank_id: null })
      .in("question_bank_id", ids);

    const { error } = await supabaseAdmin
      .from("question_bank")
      .delete()
      .in("id", ids);

    if (error) throw error;

    return NextResponse.json({ ok: true, count: ids.length });
  } catch (err: any) {
    console.error("DELETE /api/admin/questions failed:", err);
    return NextResponse.json(
      { error: err?.message || "فشل الحذف." },
      { status: 500 }
    );
  }
}
