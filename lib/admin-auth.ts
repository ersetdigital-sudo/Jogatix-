import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

/**
 * Minimal admin gate: one password (`ADMIN_PASSWORD`) exchanged for an
 * httpOnly cookie holding `<expiry>.<hmac>`. The HMAC is signed with
 * `ADMIN_SESSION_SECRET`, so the raw password never travels in the cookie and
 * rotating the secret invalidates every session.
 *
 * Server-only: imports `node:crypto`, so do not import this from a client
 * component.
 */
export const ADMIN_COOKIE = "jogatix_admin";

const SESSION_TTL_SECONDS = 12 * 60 * 60; // 12 hours
export const ADMIN_SESSION_MAX_AGE = SESSION_TTL_SECONDS;

function sessionSecret(): string {
  const secret = process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_PASSWORD;
  if (!secret) {
    throw new Error("ADMIN_SESSION_SECRET is not configured (see .env.example).");
  }
  return secret;
}

function sign(value: string): string {
  return createHmac("sha256", sessionSecret()).update(value).digest("hex");
}

/** Constant-time string compare that tolerates differing lengths. */
function safeEqual(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}

export function createSessionToken(): string {
  const expiresAt = String(Date.now() + SESSION_TTL_SECONDS * 1000);
  return `${expiresAt}.${sign(expiresAt)}`;
}

export function verifySessionToken(token: string | undefined | null): boolean {
  if (!token) return false;
  const [expiresAt, signature] = token.split(".");
  if (!expiresAt || !signature) return false;

  const expires = Number(expiresAt);
  if (!Number.isFinite(expires) || expires <= Date.now()) return false;

  return safeEqual(sign(expiresAt), signature);
}

export function verifyAdminPassword(password: unknown): boolean {
  const expected = process.env.ADMIN_PASSWORD;
  return Boolean(expected) && typeof password === "string" && safeEqual(password, expected as string);
}

/** True when the current request carries a valid admin session cookie. */
export async function isAdminAuthenticated(): Promise<boolean> {
  const store = await cookies();
  return verifySessionToken(store.get(ADMIN_COOKIE)?.value);
}
