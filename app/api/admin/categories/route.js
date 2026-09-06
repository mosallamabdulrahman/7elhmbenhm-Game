import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { loadAllCategories } from "@/lib/admin-content";

// GET /api/admin/categories — all categories, active AND inactive.
export async function GET(request) {
  try {
    const auth = await requireAdmin(request);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { rows, error } = await loadAllCategories(getSupabaseAdmin());

    if (error) {
      return NextResponse.json(
        { error: error.message || "ما قدرنا نجيب التصنيفات." },
        { status: 400 },
      );
    }

    return NextResponse.json({ categories: rows });
  } catch (err) {
    console.error("GET /api/admin/categories failed:", err);
    return NextResponse.json(
      { error: err?.message || "صار خطأ غير متوقع في السيرفر." },
      { status: 500 },
    );
  }
}

// PATCH /api/admin/categories — bulk update (activate, deactivate, assign group)
export async function PATCH(request) {
  try {
    const auth = await requireAdmin(request);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const body = await request.json().catch(() => ({}));
    const { ids, action, group_id } = body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: "لم يتم تحديد أي فئات." },
        { status: 400 },
      );
    }

    const supabaseAdmin = getSupabaseAdmin();

    if (action === "activate") {
      const { error } = await supabaseAdmin
        .from("question_categories")
        .update({ is_active: true })
        .in("id", ids);
      if (error) throw error;
      return NextResponse.json({ ok: true, count: ids.length });
    }

    if (action === "deactivate") {
      const { error } = await supabaseAdmin
        .from("question_categories")
        .update({ is_active: false })
        .in("id", ids);
      if (error) throw error;
      return NextResponse.json({ ok: true, count: ids.length });
    }

    if (action === "assign_group") {
      const targetGroupId = group_id && group_id !== "none" ? group_id : null;
      const { error } = await supabaseAdmin
        .from("question_categories")
        .update({ group_id: targetGroupId })
        .in("id", ids);
      if (error) throw error;
      return NextResponse.json({ ok: true, count: ids.length });
    }

    return NextResponse.json({ error: "إجراء غير صالح." }, { status: 400 });
  } catch (err) {
    console.error("PATCH /api/admin/categories failed:", err);
    return NextResponse.json(
      { error: err?.message || "فشلت العملية." },
      { status: 500 },
    );
  }
}

// DELETE /api/admin/categories — bulk delete categories and their questions
export async function DELETE(request) {
  try {
    const auth = await requireAdmin(request);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const body = await request.json().catch(() => ({}));
    const { ids } = body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: "لم يتم تحديد أي فئات للحذف." },
        { status: 400 },
      );
    }

    const supabaseAdmin = getSupabaseAdmin();

    // 1. Find all questions under these categories
    const { data: questions } = await supabaseAdmin
      .from("question_bank")
      .select("id")
      .in("category_id", ids);

    if (questions && questions.length > 0) {
      const qIds = questions.map((q) => q.id);
      await supabaseAdmin
        .from("room_questions")
        .update({ question_bank_id: null })
        .in("question_bank_id", qIds);

      await supabaseAdmin
        .from("question_bank")
        .delete()
        .in("id", qIds);
    }

    // 2. Delete the categories
    const { error } = await supabaseAdmin
      .from("question_categories")
      .delete()
      .in("id", ids);

    if (error) throw error;

    return NextResponse.json({ ok: true, count: ids.length });
  } catch (err) {
    console.error("DELETE /api/admin/categories failed:", err);
    return NextResponse.json(
      { error: err?.message || "فشل الحذف." },
      { status: 500 },
    );
  }
}
