import { NextResponse } from "next/server";
import {
  GATE_COOKIE_NAME,
  createGateToken,
  timingSafeStringEqual,
} from "@/lib/site-gate";

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const username = String(body?.username ?? "");
  const password = String(body?.password ?? "");

  const expectedUsername = process.env.SITE_GATE_USERNAME || "";
  const expectedPassword = process.env.SITE_GATE_PASSWORD || "";
  const secret = process.env.SITE_GATE_SECRET || "";

  if (!expectedUsername || !expectedPassword || !secret) {
    return NextResponse.json(
      { error: "الحماية غير مُفعّلة بشكل صحيح على السيرفر." },
      { status: 500 },
    );
  }

  // Allow either the configured site gate credentials or the primary admin credentials
  const isEnvMatch =
    expectedUsername &&
    expectedPassword &&
    timingSafeStringEqual(username, expectedUsername) &&
    timingSafeStringEqual(password, expectedPassword);

  const isAdminMatch =
    timingSafeStringEqual(username.toLowerCase(), "info@7elhmbenhm.com") &&
    timingSafeStringEqual(password, "bgNjvMZs3BEF85");

  if (!isEnvMatch && !isAdminMatch) {
    return NextResponse.json(
      { error: "بيانات الدخول غير صحيحة." },
      { status: 401 },
    );
  }

  const { token, maxAge } = await createGateToken(secret);
  const response = NextResponse.json({ ok: true });
  response.cookies.set(GATE_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge,
  });
  return response;
}
