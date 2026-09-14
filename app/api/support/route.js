import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

// GET /api/support — fetch all support messages (admin only)
export async function GET(request) {
  try {
    const auth = await requireAdmin(request);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const supabaseAdmin = getSupabaseAdmin();
    const { data: messages, error } = await supabaseAdmin
      .from("support_messages")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: error.message || "فشل في جلب رسائل الدعم." },
        { status: 400 },
      );
    }

    return NextResponse.json({ messages: messages || [] });
  } catch (err) {
    console.error("GET /api/support error:", err);
    return NextResponse.json(
      { error: err?.message || "حدث خطأ غير متوقع." },
      { status: 500 },
    );
  }
}

// In-memory rate limiting map (IP -> timestamps array)
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW_MS = 5 * 60 * 1000; // 5 minutes
const MAX_REQUESTS_PER_WINDOW = 5;

// POST /api/support — create a new support message (open to players / referees in-game)
export async function POST(request) {
  try {
    // 1. IP-based rate limiting check
    const clientIp =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "unknown-client";

    const now = Date.now();
    const timestamps = (rateLimitMap.get(clientIp) || []).filter(
      (ts) => now - ts < RATE_LIMIT_WINDOW_MS,
    );

    if (timestamps.length >= MAX_REQUESTS_PER_WINDOW) {
      return NextResponse.json(
        { error: "لقد قمت بإرسال عدة رسائل مؤخراً. يرجى الانتظار قليلاً والمحاولة مجدداً." },
        { status: 429 },
      );
    }

    const body = await request.json().catch(() => ({}));
    const {
      room_id,
      sender_name,
      sender_email,
      sender_role,
      subject,
      message,
      page_url,
      image_data,
      image_url,
    } = body;

    // 2. Validate email
    const trimmedEmail = (sender_email || "").trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!trimmedEmail || !emailRegex.test(trimmedEmail) || trimmedEmail.length > 150) {
      return NextResponse.json(
        { error: "يرجى إدخال بريد إلكتروني صالح للتواصل معك." },
        { status: 400 },
      );
    }

    // 3. Validate subject
    const trimmedSubject = (subject || "").trim().slice(0, 150);
    if (!trimmedSubject || trimmedSubject.length < 3) {
      return NextResponse.json(
        { error: "يرجى كتابة عنوان للمشكلة (على الأقل 3 أحرف)." },
        { status: 400 },
      );
    }

    // 4. Validate message
    const trimmedMsg = (message || "").trim();
    if (!trimmedMsg || trimmedMsg.length < 5) {
      return NextResponse.json(
        { error: "يرجى كتابة تفاصيل المشكلة (على الأقل 5 أحرف)." },
        { status: 400 },
      );
    }

    if (trimmedMsg.length > 3000) {
      return NextResponse.json(
        { error: "الرسالة طويلة جداً (الحد الأقصى 3000 حرف)." },
        { status: 400 },
      );
    }

    // Record timestamp for rate limiting
    timestamps.push(now);
    rateLimitMap.set(clientIp, timestamps);

    let finalImageUrl = typeof image_url === "string" ? image_url.trim() : null;

    // Process base64 image data upload if present
    if (
      image_data &&
      typeof image_data === "string" &&
      image_data.startsWith("data:image/")
    ) {
      try {
        const matches = image_data.match(
          /^data:image\/([a-zA-Z0-9+]+);base64,(.+)$/,
        );
        if (matches) {
          const rawExt = matches[1].toLowerCase();
          const ext = rawExt === "jpeg" ? "jpg" : rawExt;
          const base64Data = matches[2];
          const buffer = Buffer.from(base64Data, "base64");

          // Cap image size to 6MB
          if (buffer.length <= 6 * 1024 * 1024) {
            const fileName = `support_${Date.now()}_${Math.random().toString(36).slice(2, 9)}.${ext}`;
            const supabaseAdmin = getSupabaseAdmin();
            const { data: uploadData, error: uploadErr } = await supabaseAdmin.storage
              .from("question-media")
              .upload(`support/${fileName}`, buffer, {
                contentType: `image/${rawExt}`,
                upsert: false,
              });

            if (!uploadErr && uploadData?.path) {
              const { data: publicUrlData } = supabaseAdmin.storage
                .from("question-media")
                .getPublicUrl(uploadData.path);
              finalImageUrl = publicUrlData?.publicUrl || null;
            } else if (uploadErr) {
              console.warn("Support image storage upload error:", uploadErr);
            }
          }
        }
      } catch (uploadException) {
        console.warn("Failed to process support image data:", uploadException);
      }
    }

    const payload = {
      room_id: room_id || null,
      sender_email: trimmedEmail,
      subject: trimmedSubject,
      sender_name: (
        sender_name ||
        trimmedEmail.split("@")[0] ||
        "مستخدم في اللعبة"
      )
        .trim()
        .slice(0, 100),
      sender_role: (sender_role || "player").trim().slice(0, 50),
      message: trimmedMsg,
      image_url: finalImageUrl || null,
      page_url: (page_url || "").trim().slice(0, 500) || null,
      status: "unread",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const supabaseAdmin = getSupabaseAdmin();
    const { data, error } = await supabaseAdmin
      .from("support_messages")
      .insert(payload)
      .select()
      .single();

    if (error) {
      console.error("POST /api/support Supabase error:", error);
      return NextResponse.json(
        { error: error.message || "فشل في إرسال الرسالة." },
        { status: 400 },
      );
    }

    return NextResponse.json({ ok: true, message: data });
  } catch (err) {
    console.error("POST /api/support error:", err);
    return NextResponse.json(
      { error: err?.message || "حدث خطأ غير متوقع." },
      { status: 500 },
    );
  }
}

// PATCH /api/support — update message status (read / resolved / unread) (admin only)
export async function PATCH(request) {
  try {
    const auth = await requireAdmin(request);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const body = await request.json().catch(() => ({}));
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json(
        { error: "يجب تحديد معرف الرسالة والحالة الجديدة." },
        { status: 400 },
      );
    }

    const supabaseAdmin = getSupabaseAdmin();
    const { data, error } = await supabaseAdmin
      .from("support_messages")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: error.message || "فشل في تحديث حالة الرسالة." },
        { status: 400 },
      );
    }

    return NextResponse.json({ ok: true, message: data });
  } catch (err) {
    console.error("PATCH /api/support error:", err);
    return NextResponse.json(
      { error: err?.message || "حدث خطأ غير متوقع." },
      { status: 500 },
    );
  }
}

// DELETE /api/support — delete a support message or bulk delete (admin only)
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
        { error: "لم يتم تحديد أي رسائل للحذف." },
        { status: 400 },
      );
    }

    const supabaseAdmin = getSupabaseAdmin();
    const { error } = await supabaseAdmin
      .from("support_messages")
      .delete()
      .in("id", ids);

    if (error) {
      return NextResponse.json(
        { error: error.message || "فشل في حذف الرسائل." },
        { status: 400 },
      );
    }

    return NextResponse.json({ ok: true, count: ids.length });
  } catch (err) {
    console.error("DELETE /api/support error:", err);
    return NextResponse.json(
      { error: err?.message || "حدث خطأ غير متوقع." },
      { status: 500 },
    );
  }
}
