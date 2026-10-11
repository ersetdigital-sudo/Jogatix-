"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { CloseCircleIcon, SearchIcon } from "@/components/icons";
import { useSearchParam } from "@/hooks/use-search-param";
import { STATUS_PILL_CLASS, lookupOrder } from "@/lib/transactions";
import type { Order } from "@/types";

/** Demo order ids shown as one-click shortcuts. */
const SAMPLE_IDS: { id: string; title: string }[] = [
  { id: "JGX-7749210", title: "Pulsa Telkomsel - Berhasil" },
  { id: "JGX-8829104", title: "Token PLN - Berhasil" },
  { id: "JGX-9014521", title: "GoPay - Sedang diproses" },
  { id: "JGX-6102934", title: "IndiHome - Menunggu pembayaran" },
  { id: "JGX-4198273", title: "Indosat - Belum berhasil" },
];

/** Short pill label for the result badge. */
const BADGE_LABEL: Record<Order["status"], string> = {
  SUCCESS: "Berhasil Dikonfirmasi",
  PENDING: "Sedang Diproses",
  WAITING: "Menunggu Pembayaran",
  FAILED: "Transaksi Gagal",
};

export function TransactionTracker() {
  const urlId = useSearchParam("id");
  const [query, setQuery] = useState("");
  const [touched, setTouched] = useState(false);
  const [lookupId, setLookupId] = useState<string | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  const notFoundRef = useRef<HTMLDivElement>(null);

  // An explicit search wins; otherwise fall back to the ?id= param until the user edits.
  const activeId = (lookupId ?? (!touched && urlId ? urlId.toUpperCase() : "")).trim();
  const order = useMemo<Order | null>(() => (activeId ? lookupOrder(activeId) ?? null : null), [activeId]);
  const notFoundId = activeId && !order ? activeId : null;
  const inputValue = touched ? query : urlId;

  function search(rawId: string) {
    setTouched(true);
    setQuery(rawId);
    setLookupId(rawId.trim().toUpperCase());
  }

  // Bring the freshly-rendered result into view.
  useEffect(() => {
    if (order) resultRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    else if (notFoundId) notFoundRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [order, notFoundId]);

  const showResult = !notFoundId;

  const notFoundCardStyle: CSSProperties = {
    background: "#FFFFFF",
    border: "1px solid var(--color-border)",
    borderRadius: "var(--radius-xl)",
    padding: 40,
    textAlign: "center",
    boxShadow: "var(--shadow-subtle)",
    ...(notFoundId ? {} : { display: "none" }),
  };

  return (
    <>
      <div className="tx-search-card">
        <div className="section-kicker">PELACAKAN PESANAN</div>
        <h1 style={{ fontSize: 27, color: "#0E1126", marginBottom: 8 }}>
          Cari tahu status pesananmu.
        </h1>
        <p style={{ color: "#646982", fontSize: 15 }}>
          Masukkan ID transaksi untuk melihat perkembangan pesanan.
        </p>

        <div className="form-group-tx">
          <input
            type="text"
            id="tx-search-input"
            className="tx-input-field"
            placeholder="Contoh: JGX-XXXXXXXX"
            aria-label="ID Transaksi"
            value={inputValue}
            onChange={(event) => {
              setTouched(true);
              setQuery(event.target.value);
              setLookupId(null);
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                search(inputValue);
              }
            }}
          />
          <button type="button" className="btn-primary" id="tx-search-btn" onClick={() => search(inputValue)}>
            Periksa Transaksi
            <SearchIcon width={16} height={16} strokeWidth={2.2} />
          </button>
        </div>

        <div className="sample-ids-row">
          <span>Contoh ID terdaftar:</span>
          {SAMPLE_IDS.map((sample) => (
            <button
              key={sample.id}
              type="button"
              className="sample-id-btn"
              title={sample.title}
              onClick={() => search(sample.id)}
            >
              {sample.id}
            </button>
          ))}
        </div>
      </div>

      {/* Result card (found / idle) */}
      <div className="tx-result-card" id="tx-result-card" ref={resultRef} style={showResult ? undefined : { display: "none" }}>
        <div className="tx-result-header">
          <div>
            <div
              style={{
                fontSize: 12,
                fontWeight: 700,
                textTransform: "uppercase",
                color: "#646982",
                letterSpacing: "0.06em",
                marginBottom: 4,
              }}
            >
              ID Transaksi
            </div>
            <div
              id="res-tx-id"
              style={{ fontFamily: "var(--font-mono)", fontSize: 24, fontWeight: 700, color: "#0E1126" }}
            >
              {order?.id ?? "-"}
            </div>
          </div>
          <div
            id="res-status-badge"
            className={`tx-badge ${order ? STATUS_PILL_CLASS[order.status] : "success"}`}
          >
            {order ? BADGE_LABEL[order.status] : "-"}
          </div>
        </div>

        <div className="tx-details-list">
          <div className="tx-detail-row">
            <span className="tx-detail-label">Kategori Layanan</span>
            <span className="tx-detail-val" id="res-category">
              {order?.category ?? "-"}
            </span>
          </div>
          <div
            className="tx-detail-row"
            id="res-provider-row"
            style={order?.provider ? undefined : { display: "none" }}
          >
            <span className="tx-detail-label">Penyedia / Dompet Digital</span>
            <span
              className="tx-detail-val"
              id="res-provider"
              style={{ fontWeight: 700, color: "#4338CA" }}
            >
              {order?.provider ?? "-"}
            </span>
          </div>
          <div className="tx-detail-row">
            <span className="tx-detail-label">Produk</span>
            <span className="tx-detail-val" id="res-product">
              {order?.product ?? "-"}
            </span>
          </div>
          <div className="tx-detail-row">
            <span className="tx-detail-label">Nomor / ID Pelanggan</span>
            <span
              className="tx-detail-val"
              id="res-customer-id"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {order?.customer ?? "-"}
            </span>
          </div>
          <div className="tx-detail-row">
            <span className="tx-detail-label">Waktu Transaksi</span>
            <span className="tx-detail-val" id="res-date">
              {order?.createdAt ?? "-"}
            </span>
          </div>
          <div className="tx-detail-row">
            <span className="tx-detail-label">Metode Pembayaran</span>
            <span className="tx-detail-val" id="res-payment-method">
              {order?.paymentMethod ?? "-"}
            </span>
          </div>
          <div className="tx-detail-row">
            <span className="tx-detail-label">Total Pembayaran</span>
            <span
              className="tx-detail-val"
              id="res-total"
              style={{ fontFamily: "var(--font-mono)", fontSize: 17, color: "#4338CA" }}
            >
              {order?.totalFormatted ?? "-"}
            </span>
          </div>
        </div>

        <div
          className="token-sn-box"
          id="res-sn-box"
          style={order?.sn ? undefined : { display: "none" }}
        >
          <div className="token-sn-title" id="res-sn-label">
            Nomor Seri / SN Provider
          </div>
          <div className="token-sn-val" id="res-sn-val">
            {order?.sn || "-"}
          </div>
        </div>

        <div
          style={{
            marginTop: 24,
            padding: "16px 18px",
            background: "#F8FAFC",
            borderRadius: 10,
            border: "1px solid #E4E7F0",
            fontSize: 13.5,
            color: "#646982",
            lineHeight: 1.55,
          }}
        >
          <strong>Catatan Sistem:</strong>{" "}
          <span id="res-system-message">
            {order?.systemMessage ?? "-"}
          </span>
        </div>
      </div>

      {/* Not found card */}
      <div id="tx-not-found-card" ref={notFoundRef} style={notFoundCardStyle}>
        <div
          style={{
            width: 58,
            height: 58,
            background: "#FEF2F2",
            color: "#DC2626",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 16px",
          }}
        >
          <CloseCircleIcon width={28} height={28} />
        </div>
        <h2 style={{ fontSize: 21, color: "#0E1126", marginBottom: 8 }}>Transaksi Tidak Ditemukan</h2>
        <p style={{ color: "#646982", fontSize: 14.5, maxWidth: 500, margin: "0 auto 22px", lineHeight: 1.6 }}>
          ID pesanan{" "}
          <strong
            id="not-found-id-label"
            style={{ color: "#0E1126", fontFamily: "var(--font-mono)" }}
          >
            {notFoundId ?? ""}
          </strong>{" "}
          tidak terdaftar dalam catatan sistem Jogatix. Pastikan kamu memasukkan ID yang tepat
          (contoh: JGX-7749210) atau periksa kembali bukti pesananmu.
        </p>
        <Link href="/bantuan" className="btn-secondary" style={{ fontSize: 13.5 }}>
          Buka Halaman Bantuan
        </Link>
      </div>
    </>
  );
}
