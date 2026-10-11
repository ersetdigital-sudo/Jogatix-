"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

/** Password gate for /admin — posts to /api/admin/session and stores the session cookie. */
export function AdminLoginForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!password || submitting) return;

    setSubmitting(true);
    setError("");
    try {
      const response = await fetch("/api/admin/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as { error?: string } | null;
        setError(data?.error ?? "Gagal login. Silakan coba lagi.");
        setSubmitting(false);
        return;
      }

      router.replace("/admin");
      router.refresh();
    } catch {
      setError("Tidak dapat menghubungi server. Periksa koneksi lalu coba lagi.");
      setSubmitting(false);
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        background: "#0E1126",
      }}
    >
      <form
        onSubmit={submit}
        style={{
          width: "100%",
          maxWidth: 400,
          background: "#FFFFFF",
          borderRadius: 16,
          padding: 32,
          boxShadow: "0 24px 60px rgba(2, 6, 23, 0.45)",
        }}
      >
        <div
          style={{
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "#64748B",
            marginBottom: 6,
          }}
        >
          Jogatix Admin Console
        </div>
        <h1 style={{ fontSize: 24, color: "#0E1126", marginBottom: 6 }}>Masuk sebagai admin</h1>
        <p style={{ fontSize: 13.5, color: "#64748B", marginBottom: 24, lineHeight: 1.6 }}>
          Dashboard ini mengelola katalog, pembayaran, dan transaksi pelanggan. Masukkan password
          admin untuk melanjutkan.
        </p>

        <label
          htmlFor="admin-password"
          style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#334155", marginBottom: 6 }}
        >
          Password Admin
        </label>
        <input
          id="admin-password"
          type="password"
          autoComplete="current-password"
          autoFocus
          value={password}
          onChange={(event) => {
            setPassword(event.target.value);
            setError("");
          }}
          placeholder="••••••••"
          style={{
            width: "100%",
            padding: "11px 14px",
            borderRadius: 10,
            border: `1.5px solid ${error ? "#FCA5A5" : "#CBD5E1"}`,
            fontSize: 14,
            color: "#0F172A",
            outline: "none",
          }}
        />

        {error && (
          <div style={{ color: "#DC2626", fontSize: 13, marginTop: 10 }} role="alert">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={submitting || !password}
          style={{
            width: "100%",
            marginTop: 22,
            padding: "12px 16px",
            borderRadius: 10,
            border: "none",
            background: submitting || !password ? "#A5B4FC" : "#4F46E5",
            color: "#FFFFFF",
            fontSize: 14.5,
            fontWeight: 700,
            cursor: submitting || !password ? "not-allowed" : "pointer",
          }}
        >
          {submitting ? "Memverifikasi…" : "Masuk ke Dashboard"}
        </button>

        <Link
          href="/"
          style={{
            display: "block",
            textAlign: "center",
            marginTop: 18,
            fontSize: 13,
            color: "#64748B",
            textDecoration: "none",
          }}
        >
          ← Kembali ke situs Jogatix
        </Link>
      </form>
    </div>
  );
}
