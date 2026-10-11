import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";

/** Consistent JSON error body + status for every route handler. */
export function apiError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export function serverError(error: unknown) {
  console.error("[api]", error);
  const message = error instanceof Error ? error.message : "Terjadi kesalahan pada server.";
  return apiError(message, 500);
}

/**
 * Returns a 401 response when the request has no valid admin session, or
 * `null` when it may proceed.
 */
export async function requireAdmin(): Promise<NextResponse | null> {
  if (await isAdminAuthenticated()) return null;
  return apiError("Sesi admin tidak valid. Silakan login kembali.", 401);
}

/** Reads a JSON body, returning `null` instead of throwing on malformed input. */
export async function readJsonBody(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    return null;
  }
}
