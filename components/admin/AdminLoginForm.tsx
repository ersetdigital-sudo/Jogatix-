"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

/**
 * Password gate for /admin — posts to /api/admin/session and stores the
 * session cookie. The two-column shell lives in admin.css (.admin-auth), so
 * this component only carries markup and behaviour.
 */
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
    <div className="admin-auth">
      <aside className="admin-auth-rail">
        <div className="admin-auth-brand">
          <span className="admin-auth-brand-mark" aria-hidden="true">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
              <rect x="4" y="10.5" width="16" height="10.5" rx="2" />
              <path d="M8 10.5V7.2a4 4 0 0 1 8 0v3.3" />
            </svg>
          </span>
          <span className="admin-auth-brand-name">Jogatix</span>
        </div>

        <div className="admin-auth-facts">
          <div className="admin-auth-fact">
            <span className="admin-auth-fact-dot" aria-hidden="true" />
            <span>Kelola katalog produk, harga, dan status penjualan.</span>
          </div>
          <div className="admin-auth-fact">
            <span className="admin-auth-fact-dot" aria-hidden="true" />
            <span>Pantau transaksi pelanggan dan status pembayarannya.</span>
          </div>
          <div className="admin-auth-fact">
            <span className="admin-auth-fact-dot" aria-hidden="true" />
            <span>Atur QRIS, rekening bank, dan e-wallet toko.</span>
          </div>
        </div>

        <div className="admin-auth-stamp">jogatix.vercel.app · sesi 12 jam</div>
      </aside>

      <main className="admin-auth-stage">
        <div className="admin-auth-panel">
          <h1 className="admin-auth-title">Masuk ke console</h1>
          <p className="admin-auth-lede">
            Area ini khusus staf Jogatix. Masukkan password admin untuk membuka katalog,
            pembayaran, dan transaksi.
          </p>

          <form onSubmit={submit} noValidate>
            <label className="admin-auth-label" htmlFor="admin-password">
              Password Admin
            </label>
            <input
              id="admin-password"
              className="admin-auth-input"
              type="password"
              autoComplete="current-password"
              autoFocus
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? "admin-auth-error" : undefined}
              value={password}
              onChange={(event) => {
                setPassword(event.target.value);
                setError("");
              }}
              placeholder="••••••••"
            />

            {error && (
              <div className="admin-auth-error" id="admin-auth-error" role="alert">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="admin-auth-submit"
              disabled={submitting || !password}
            >
              {submitting ? "Memverifikasi…" : "Masuk ke Dashboard"}
            </button>
          </form>

          <Link href="/" className="admin-auth-back">
            ← Kembali ke situs Jogatix
          </Link>
        </div>
      </main>
    </div>
  );
}
