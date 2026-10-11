"use client";

import dynamic from "next/dynamic";

/**
 * The admin console is a localStorage-backed dashboard, so it is loaded
 * client-only: this avoids any server/client hydration mismatch and lets the
 * console read persisted state on its very first render.
 */
const AdminConsole = dynamic(
  () => import("@/components/admin/AdminConsole").then((mod) => mod.AdminConsole),
  {
    ssr: false,
    loading: () => (
      <div
        style={{
          padding: 48,
          fontFamily: "var(--font-sans, sans-serif)",
          color: "#64748B",
          fontSize: 14,
        }}
      >
        Memuat dashboard admin…
      </div>
    ),
  },
);

export function AdminConsoleClient() {
  return <AdminConsole />;
}
