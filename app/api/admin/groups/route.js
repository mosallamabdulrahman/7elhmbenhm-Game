import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { loadAllCategoryGroups } from "@/lib/admin-content";

// GET /api/admin/groups — all category groups (التصنيفات).
export async function GET(request) {
  try {
    const auth = await requireAdmin(request);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { rows, error } = await loadAllCategoryGroups(getSupabaseAdmin());

    if (error) {
      return NextResponse.json(
        { error: error.message || "ما قدرنا نجيب التصنيفات." },
        { status: 400 },
      );
    }

    return NextResponse.json({ groups: rows || [] });
  } catch (err) {
    console.error("GET /api/admin/groups failed:", err);
    return NextResponse.json(
      { error: err?.message || "صار خطأ غير متوقع في السيرفر." },
      { status: 500 },
    );
  }
}

// DELETE /api/admin/groups — bulk delete groups
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
        { error: "لم يتم تحديد أي تصنيفات للحذف." },
        { status: 400 },
      );
    }

    const supabaseAdmin = getSupabaseAdmin();

    // 1. Unlink categories that belong to these groups
    await supabaseAdmin
      .from("question_categories")
      .update({ group_id: null })
      .in("group_id", ids);

    // 2. Delete groups
    const { error } = await supabaseAdmin
      .from("category_groups")
      .delete()
      .in("id", ids);

    if (error) throw error;

    return NextResponse.json({ ok: true, count: ids.length });
  } catch (err) {
    console.error("DELETE /api/admin/groups failed:", err);
    return NextResponse.json(
      { error: err?.message || "فشل الحذف." },
      { status: 500 },
    );
  }
}
