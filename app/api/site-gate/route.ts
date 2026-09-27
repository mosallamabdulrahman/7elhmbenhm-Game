import { NextResponse } from "next/server";
import {
  GATE_COOKIE_NAME,
  createGateToken,
  timingSafeStringEqual,
} from "@/lib/site-gate";

export async function POST(request: Request) {
  let body: any;
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
      { status: 500 }
    );
  }

  const cleanUsername = username.trim().toLowerCase();
  const cleanPassword = password.trim();

  const expectedUsername1 = (process.env.SITE_GATE_USERNAME || "info@7elhmbenhm.com").trim().toLowerCase();
  const expectedPassword1 = (process.env.SITE_GATE_PASSWORD || "bgNjvMZs3BEF85").trim();

  const expectedUsername2 = (process.env.SITE_GATE_USERNAME_2 || "abdo@7elhmbenhm.com").trim().toLowerCase();
  const expectedPassword2 = (process.env.SITE_GATE_PASSWORD_2 || "QUdb4@6TqUrDS2").trim();

  const isMatch1 =
    timingSafeStringEqual(cleanUsername, expectedUsername1) &&
    timingSafeStringEqual(cleanPassword, expectedPassword1);

  const isMatch2 =
    timingSafeStringEqual(cleanUsername, expectedUsername2) &&
    timingSafeStringEqual(cleanPassword, expectedPassword2);

  if (!isMatch1 && !isMatch2) {
    return NextResponse.json(
      { error: "البريد الإلكتروني أو كلمة المرور غير صحيحة." },
      { status: 401 }
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
