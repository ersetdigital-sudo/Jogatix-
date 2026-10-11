import type { CategorySlug, Order, OrderStatus } from "@/types";
import { isCategorySlug } from "@/lib/catalog";
import { rupiah } from "@/lib/format";

/**
 * Order domain helpers shared by the API routes and the UI.
 *
 * Orders used to live in localStorage; they now live in Supabase (see
 * lib/supabase/store.ts). This module stays pure so it is safe to import from
 * both the server and the browser.
 */

/** Human labels for each order status (used across tracker + admin). */
export const STATUS_LABELS: Record<OrderStatus, string> = {
  SUCCESS: "Berhasil Dikonfirmasi",
  PENDING: "Sedang Diproses",
  WAITING: "Menunggu Pembayaran",
  FAILED: "Transaksi Gagal",
};

/** Status → short pill label used in admin tables. */
export const STATUS_PILL: Record<OrderStatus, string> = {
  SUCCESS: "Berhasil",
  PENDING: "Diproses",
  WAITING: "Menunggu",
  FAILED: "Gagal",
};

/** Status → CSS modifier class used by `.status-pill-admin` / `.tx-badge`. */
export const STATUS_PILL_CLASS: Record<OrderStatus, string> = {
  SUCCESS: "success",
  PENDING: "pending",
  WAITING: "waiting",
  FAILED: "failed",
};

const ORDER_STATUSES: OrderStatus[] = ["SUCCESS", "PENDING", "WAITING", "FAILED"];

/** `11 Okt 2026, 18:23 WIB` — formatted on the server in Jakarta time. */
export function formatOrderTimestamp(date: Date = new Date()): string {
  const parts = new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Jakarta",
    hour12: false,
  }).formatToParts(date);
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? "";
  return `${get("day")} ${get("month")} ${get("year")}, ${get("hour")}:${get("minute")} WIB`;
}

function asString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

/**
 * Normalises an untrusted order payload (from checkout or the admin console)
 * into a complete `Order`. Returns `null` when required fields are missing, so
 * route handlers can answer with a 400.
 *
 * New orders get their `createdAt` from the server clock so every order shares
 * one timezone. Pass `current` when updating an existing order to keep its
 * original timestamp.
 */
export function parseOrderInput(input: unknown, current?: Order | null): Order | null {
  if (!input || typeof input !== "object") return null;
  const raw = input as Record<string, unknown>;

  const id = asString(raw.id);
  const product = asString(raw.product);
  const customer = asString(raw.customer);
  const total = Math.round(Number(raw.total));

  if (!id || !product || !customer || !Number.isFinite(total) || total <= 0) return null;

  const status = ORDER_STATUSES.includes(raw.status as OrderStatus)
    ? (raw.status as OrderStatus)
    : "WAITING";
  const slug = asString(raw.categorySlug) as CategorySlug;

  return {
    id,
    category: asString(raw.category) || "Transaksi",
    categorySlug: isCategorySlug(slug) ? slug : "pulsa",
    provider: asString(raw.provider) || undefined,
    product,
    customer,
    total,
    totalFormatted: asString(raw.totalFormatted) || rupiah(total),
    paymentMethod: asString(raw.paymentMethod) || "QRIS",
    createdAt: current?.createdAt || formatOrderTimestamp(),
    sn: asString(raw.sn),
    status,
    statusLabel: asString(raw.statusLabel) || STATUS_LABELS[status],
    systemMessage:
      asString(raw.systemMessage) || "Pesanan diterima dan sedang diproses oleh sistem Jogatix.",
  };
}
