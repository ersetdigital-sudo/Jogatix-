"use client";

import { usePathname } from "next/navigation";
import { DemoNoticeBar } from "@/components/layout/DemoNoticeBar";

/** Pages that show the amber "MODE DEMO" strip, and their copy. */
const DEMO_MESSAGES: Record<string, string> = {
  "/tentang": "Informasi dan prinsip layanan platform digital commerce Jogatix.",
  "/bantuan": "Simulasi pusat bantuan Jogatix. Kanal bantuan mengikuti konfigurasi resmi sistem.",
  "/cek-transaksi":
    "Mode demo. Informasi transaksi merupakan data contoh untuk verifikasi alur status pesanan.",
};

/**
 * Renders the demo strip above the header on the pages that had it in the
 * original static site. Kept route-aware so the strip sits in the exact same
 * position relative to the header.
 */
export function DemoBarGate() {
  const pathname = usePathname();
  const message = DEMO_MESSAGES[pathname];
  if (!message) return null;
  return <DemoNoticeBar message={message} />;
}
