import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const friendlyCreateError = (message?: string) => {
  if (!message) return "ما قدرنا ننشئ المستخدم.";
  if (message.includes("already been registered")) {
    return "الإيميل ده مسجل عندنا بالفعل.";
  }
  if (message.includes("display_name") || message.includes("duplicate key")) {
    return "اسم المستخدم ده متاخد، اختار واحد تاني.";
  }
  return message;
};

export async function POST(request: Request) {
  try {
    const auth = await requireAdmin(request);
    if (auth.error || !auth.user) {
      return NextResponse.json(
        { error: auth.error || "Unauthorized" },
        { status: auth.status || 401 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const username = (body.username || "").trim();
    const email = (body.email || "").trim().toLowerCase();
    const password = (body.password || "").trim();

    if (username.length < 2 || username.length > 40) {
      return NextResponse.json(
        { error: "اسم المستخدم لازم يكون بين 2 و40 حرف." },
        { status: 400 }
      );
    }
    if (!EMAIL_RE.test(email)) {
      return NextResponse.json({ error: "اكتب إيميل صح." }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json(
        { error: "الباسورد لازم يكون 6 أحرف على الأقل." },
        { status: 400 }
      );
    }

    const supabaseAdmin = getSupabaseAdmin();

    const { data: existingAdmin } = await supabaseAdmin
      .from("admin_users")
      .select("user_id")
      .eq("login_email", email)
      .maybeSingle();

    if (existingAdmin) {
      return NextResponse.json(
        { error: "الإيميل ده مسجل عندنا بالفعل كأدمن." },
        { status: 400 }
      );
    }

    const syntheticAuthEmail = `admin-${randomUUID()}@internal.7elhmbenhm.com`;

    const { data: created, error: createError } =
      await supabaseAdmin.auth.admin.createUser({
        email: syntheticAuthEmail,
        password,
        email_confirm: true,
        user_metadata: { display_name: username },
      });

    if (createError) {
      return NextResponse.json(
        { error: friendlyCreateError(createError.message) },
        { status: 400 }
      );
    }

    const { error: adminInsertError } = await supabaseAdmin
      .from("admin_users")
      .insert({ user_id: created.user.id, login_email: email });

    if (adminInsertError) {
      await supabaseAdmin.auth.admin.deleteUser(created.user.id);
      return NextResponse.json(
        { error: adminInsertError.message || "ما قدرنا نضيفه كأدمن." },
        { status: 400 }
      );
    }

    return NextResponse.json({ ok: true, user_id: created.user.id });
  } catch (err: any) {
    console.error("POST /api/admin/users failed:", err);
    return NextResponse.json(
      { error: err?.message || "صار خطأ غير متوقع في السيرفر." },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/users — bulk delete users
export async function DELETE(request: Request) {
  try {
    const auth = await requireAdmin(request);
    if (auth.error || !auth.user) {
      return NextResponse.json(
        { error: auth.error || "Unauthorized" },
        { status: auth.status || 401 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const { ids } = body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: "لم يتم تحديد أي مستخدمين للحذف." },
        { status: 400 }
      );
    }

    // Exclude current logged in admin
    const toDelete = ids.filter((id) => id !== auth.user.id);
    if (toDelete.length === 0) {
      return NextResponse.json(
        { error: "لا يمكنك حذف حسابك الحالي." },
        { status: 400 }
      );
    }

    const supabaseAdmin = getSupabaseAdmin();

    const { count } = await supabaseAdmin
      .from("admin_users")
      .select("*", { count: "exact", head: true });

    if ((count || 0) - toDelete.length < 1) {
      return NextResponse.json(
        { error: "لازم يبقى فيه أدمن واحد على الأقل في النظام." },
        { status: 400 }
      );
    }

    for (const id of toDelete) {
      await supabaseAdmin.auth.admin.deleteUser(id);
    }

    return NextResponse.json({ ok: true, count: toDelete.length });
  } catch (err: any) {
    console.error("DELETE /api/admin/users failed:", err);
    return NextResponse.json(
      { error: err?.message || "فشل الحذف." },
      { status: 500 }
    );
  }
}
