import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { apiError, readJsonBody, serverError } from "@/lib/api";
import {
  ADMIN_COOKIE,
  ADMIN_SESSION_MAX_AGE,
  createSessionToken,
  verifyAdminPassword,
} from "@/lib/admin-auth";

/** Exchanges the admin password for a signed, httpOnly session cookie. */
export async function POST(request: Request) {
  try {
    const body = (await readJsonBody(request)) as { password?: unknown } | null;
    if (!verifyAdminPassword(body?.password)) {
      return apiError("Password admin salah.", 401);
    }

    const store = await cookies();
    store.set(ADMIN_COOKIE, createSessionToken(), {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: ADMIN_SESSION_MAX_AGE,
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return serverError(error);
  }
}

/** Clears the admin session cookie. */
export async function DELETE() {
  const store = await cookies();
  store.delete(ADMIN_COOKIE);
  return NextResponse.json({ ok: true });
}
