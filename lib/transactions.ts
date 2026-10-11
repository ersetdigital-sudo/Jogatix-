import type { Order, OrderStatus } from "@/types";
import { STORAGE_KEYS, readJson, writeJson } from "@/lib/storage";


/** Human labels for each order status (used across tracker + admin). */
export const STATUS_LABELS: Record<OrderStatus, string> = {
  SUCCESS: "Berhasil Dikonfirmasi",
  PENDING: "Sedang Diproses",
  WAITING: "Menunggu Pembayaran",
  FAILED: "Transaksi Gagal",
};

/**
 * Demo records shipped with the original site. They let the tracker (and the
 * admin console) show realistic data before any real order exists.
 */
export const sampleOrders: Record<string, Order> = {
  "JGX-7749210": {
    id: "JGX-7749210",
    category: "Pulsa",
    categorySlug: "pulsa",
    provider: "Telkomsel",
    product: "Telkomsel — Rp50.000",
    customer: "081283921049",
    createdAt: "09 Okt 2026, 08:42 WIB",
    paymentMethod: "QRIS",
    total: 51500,
    totalFormatted: "Rp51.500",
    sn: "SN2026100908420199",
    status: "SUCCESS",
    statusLabel: "Berhasil Dikonfirmasi",
    systemMessage:
      "Transaksi telah berhasil diproses oleh provider dan pulsa telah diteruskan ke nomor pelanggan.",
  },
  "JGX-8829104": {
    id: "JGX-8829104",
    category: "PLN",
    categorySlug: "pln",
    provider: "PLN Prabayar (Token Listrik)",
    product: "Token Listrik Rp100.000",
    customer: "142894109281",
    createdAt: "09 Okt 2026, 07:15 WIB",
    paymentMethod: "VIRTUAL ACCOUNT",
    total: 102500,
    totalFormatted: "Rp102.500",
    sn: "2981-4920-1940-2819",
    status: "SUCCESS",
    statusLabel: "Berhasil Dikonfirmasi",
    systemMessage:
      "Token listrik 20 digit telah diterbitkan oleh sistem PLN dan siap diinput pada meteran.",
  },
  "JGX-9014521": {
    id: "JGX-9014521",
    category: "Uang Elektronik",
    categorySlug: "uang-elektronik",
    provider: "GoPay",
    product: "GoPay — Saldo Rp50.000",
    customer: "085718293019",
    createdAt: "09 Okt 2026, 09:05 WIB",
    paymentMethod: "DOMPET DIGITAL",
    total: 51000,
    totalFormatted: "Rp51.000",
    sn: "TRX-GOPAY-9014521",
    status: "PENDING",
    statusLabel: "Sedang Diproses",
    systemMessage:
      "Pembayaran terverifikasi. Provider dompet digital sedang menyelesaikan sinkronisasi saldo akhir.",
  },
  "JGX-6102934": {
    id: "JGX-6102934",
    category: "Pembayaran Internet",
    categorySlug: "internet",
    provider: "IndiHome (Telkom)",
    product: "Tagihan IndiHome Internet & TV",
    customer: "0218940192",
    createdAt: "09 Okt 2026, 09:12 WIB",
    paymentMethod: "QRIS",
    total: 385000,
    totalFormatted: "Rp385.000",
    sn: "",
    status: "WAITING",
    statusLabel: "Menunggu Pembayaran",
    systemMessage:
      "Tagihan siap dibayar. Menunggu konfirmasi pembayaran dari sistem perbankan sebelum tanggal jatuh tempo.",
  },
  "JGX-4198273": {
    id: "JGX-4198273",
    category: "Pulsa",
    categorySlug: "pulsa",
    provider: "Indosat Ooredoo",
    product: "Indosat — Rp25.000",
    customer: "085819284910",
    createdAt: "08 Okt 2026, 21:30 WIB",
    paymentMethod: "VIRTUAL ACCOUNT",
    total: 26500,
    totalFormatted: "Rp26.500",
    sn: "",
    status: "FAILED",
    statusLabel: "Transaksi Gagal",
    systemMessage:
      "Gangguan sementara pada jaringan provider Indosat. Hubungi customer care untuk bantuan.",
  },
};

/**
 * Orders created at checkout plus the bundled sample records.
 * Passing `includeSamples = false` returns only real, persisted orders.
 */
export function getOrders(includeSamples = true): Record<string, Order> {
  const stored = readJson<Record<string, Order>>(STORAGE_KEYS.orders, {});
  if (!includeSamples) return stored;
  // Pure merge: sample records are layered under any real, persisted orders.
  return { ...sampleOrders, ...stored };
}

export function saveOrders(orders: Record<string, Order>): boolean {
  return writeJson(STORAGE_KEYS.orders, orders);
}

/** Case-insensitive lookup of a single order id. */
export function lookupOrder(id: string): Order | undefined {
  const clean = id.trim().toUpperCase();
  if (!clean) return undefined;
  return getOrders()[clean];
}

/** Status → short pill label used in admin tables. */
export const STATUS_PILL: Record<OrderStatus, string> = {
  SUCCESS: "Berhasil",
  PENDING: "Diproses",
  WAITING: "Menunggu",
  FAILED: "Gagal",
};

/** Status → CSS modifier class used by `.status-pill-admin`. */
export const STATUS_PILL_CLASS: Record<OrderStatus, string> = {
  SUCCESS: "success",
  PENDING: "pending",
  WAITING: "waiting",
  FAILED: "failed",
};
