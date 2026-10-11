"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ArrowRightIcon, ClockCheckIcon, SearchIcon } from "@/components/icons";
import { useSearchParam } from "@/hooks/use-search-param";
import { getCategory, categories, isCategorySlug } from "@/lib/catalog";
import { rupiah, toWhatsAppLink } from "@/lib/format";
import { getSettings } from "@/lib/admin-defaults";
import { getOrders, saveOrders } from "@/lib/transactions";
import type { AdminSettings, CategorySlug, Order, Product } from "@/types";

const PREPAID = "prabayar";
const STEPPER = ["Data Pelanggan", "Pilih Produk", "Ringkasan", "Pembayaran", "Hasil"];
const BILL_AMOUNT = 145000; // demo bill total shown in the inquiry flow

type PaymentMethod = "qris" | "va" | "ewallet";
type LineItem = Product & { isBill?: boolean; adminFee?: number };

function generateOrderId(): string {
  let code = "";
  for (let i = 0; i < 7; i += 1) code += Math.floor(Math.random() * 10);
  return `JGX-${code}`;
}

function generateSN(provider?: string): string {
  const stamp = Date.now().toString().slice(-7);
  if (provider) {
    const clean = provider.toUpperCase().replace(/[^A-Z0-9]/g, "");
    return `TRX-${clean}-${stamp}`;
  }
  return `SN${Date.now().toString().slice(-8)}0928`;
}

export function CheckoutFlow() {
  const urlKategori = useSearchParam("kategori");
  const urlCust = useSearchParam("cust");
  const urlProduk = useSearchParam("produk");
  const urlProvider = useSearchParam("provider");

  // Query params seed the flow; explicit user choices override them.
  const [slugOverride, setSlugOverride] = useState<CategorySlug | null>(null);
  const [customerOverride, setCustomerOverride] = useState<string | null>(null);
  const [providerOverride, setProviderOverride] = useState<string | null>(null);
  const [productOverride, setProductOverride] = useState<LineItem | null | undefined>(undefined);
  const [stageOverride, setStageOverride] = useState<number | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("qris");
  const [order, setOrder] = useState<Order | null>(null);
  const [fulfilled, setFulfilled] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [custError, setCustError] = useState("");
  const [providerError, setProviderError] = useState("");
  const [stage2Error, setStage2Error] = useState("");
  const [settings] = useState<AdminSettings>(() => getSettings());

  const slug: CategorySlug = slugOverride ?? (isCategorySlug(urlKategori) ? urlKategori : "pulsa");
  const category = getCategory(slug) ?? categories[0];
  const isPrepaid = category.type === PREPAID;
  const customer = customerOverride ?? (urlCust || "");
  const provider =
    providerOverride ??
    (urlProvider && category.providers.includes(urlProvider) ? urlProvider : "");
  const activeProvider = provider || category.providers[0] || "";

  /** Stage 2 product list — prepaid uses catalog products, bills use a demo inquiry. */
  const lineItems: LineItem[] = isPrepaid
    ? (category.products ?? []).map((p) => ({ ...p }))
    : [
        {
          id: `bill-${category.slug}`,
          name: `Tagihan ${category.name}`,
          note: "",
          price: BILL_AMOUNT,
          isBill: true,
          adminFee: category.adminFee ?? 2500,
        },
      ];
  // A ?produk= param pre-selects the matching product without an effect.
  const requestedItem = urlProduk ? lineItems.find((i) => i.id === urlProduk) ?? null : null;
  const product = productOverride !== undefined ? productOverride : requestedItem;
  const activeItem = product ?? lineItems[0] ?? null;
  const admin = activeItem?.isBill ? (category.adminFee ?? 2500) : 0;
  const total = activeItem ? activeItem.price + admin : 0;

  // A valid ?cust= skips straight to product selection.
  const initialStage = urlCust && category.field.pattern.test(urlCust) ? 2 : 1;
  const stage = stageOverride ?? initialStage;
  const stage5 = fulfilled ? "success" : "processing";

  // Stage 5: confirm provider fulfillment after a short delay.
  useEffect(() => {
    if (stage !== 5 || !order) return;
    const timer = setTimeout(() => setFulfilled(true), 1400);
    return () => clearTimeout(timer);
  }, [stage, order]);

  const goToStage = useCallback((next: number) => {
    setStageOverride(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  function handleStage1Next() {
    const clean = customer.trim().replace(/[\s-]/g, "");
    if (!clean) {
      setCustError(`Silakan masukkan ${category.field.label.toLowerCase()}.`);
      return;
    }
    if (category.field.pattern && !category.field.pattern.test(clean)) {
      setCustError(category.field.error);
      return;
    }
    if (category.providers.length > 0 && !activeProvider) {
      setProviderError("Silakan pilih provider terlebih dahulu.");
      return;
    }
    setCustError("");
    setProviderError("");
    setCustomerOverride(clean);
    goToStage(2);
  }

  function handleStage2Next() {
    if (!activeItem) {
      setStage2Error("Pilih salah satu produk atau nominal terlebih dahulu.");
      return;
    }
    setStage2Error("");
    goToStage(3);
  }

  function selectCategory(nextSlug: CategorySlug) {
    setSlugOverride(nextSlug);
    setProductOverride(undefined);
    setProviderOverride(null);
    setCustError("");
    setProviderError("");
    setStage2Error("");
  }

  function createOrder() {
    const orderId = generateOrderId();
    const fullProduct = `${activeProvider ? `${activeProvider} — ` : ""}${activeItem?.name ?? ""}`;
    const created: Order = {
      id: orderId,
      category: category.name,
      categorySlug: category.slug,
      provider: activeProvider,
      product: fullProduct,
      customer,
      total,
      totalFormatted: rupiah(total),
      paymentMethod: paymentMethod.toUpperCase(),
      createdAt: new Date().toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" }),
      sn: generateSN(activeProvider),
      status: "SUCCESS",
      statusLabel: "Berhasil Dikonfirmasi",
      systemMessage: "Transaksi telah berhasil diproses oleh provider dan diteruskan ke pelanggan.",
    };
    setOrder(created);

    const orders = getOrders();
    orders[orderId] = created;
    saveOrders(orders);
  }

  function handleConfirmPayment() {
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      goToStage(5);
    }, 1200);
  }

  const waText = order
    ? `Halo Admin Jogatix, saya ingin konfirmasi pembayaran untuk pesanan ID: ${order.id} (${order.product}) sebesar ${order.totalFormatted}. Nomor tujuan: ${order.customer}.`
    : "";

  return (
    <div className="container checkout-container">
      {/* Stepper */}
      <div className="checkout-stepper">
        {STEPPER.map((label, index) => {
          const stepNo = index + 1;
          const cls = stepNo === stage ? " active" : stepNo < stage ? " done" : "";
          return (
            <div className={`step-indicator-item${cls}`} id={`stepper-${stepNo}`} key={label}>
              <span className="step-num-badge">{stepNo}</span>
              <span>{label}</span>
            </div>
          );
        })}
      </div>

      <div className="checkout-card" id="checkout-flow-card">
        {/* Stage 1 */}
        <div className={`checkout-stage-pane${stage === 1 ? " active" : ""}`} id="stage-1-pane">
          <div className="section-kicker">TAHAP 01</div>
          <h1 className="stage-title">Masukkan data pelanggan.</h1>
          <p className="stage-desc">Pastikan nomor atau ID yang kamu masukkan sudah benar.</p>

          <label className="form-label">Kategori Layanan</label>
          <div className="category-select-grid">
            {categories.map((c) => (
              <button
                key={c.slug}
                type="button"
                className={`cat-select-btn${c.slug === slug ? " active" : ""}`}
                data-cat={c.slug}
                onClick={() => selectCategory(c.slug)}
              >
                {c.name}
              </button>
            ))}
          </div>

          <div
            id="checkout-provider-section"
            style={{ marginBottom: 24, display: category.providers.length > 0 ? "block" : "none" }}
          >
            <label className="form-label" id="checkout-provider-label">
              {category.slug === "uang-elektronik"
                ? "Pilih Dompet Digital / E-Wallet"
                : "Pilih Operator / Penyedia Resmi"}
            </label>
            <div id="checkout-provider-chips" className="provider-chips-wrap">
              {category.providers.map((p) => (
                <button
                  key={p}
                  type="button"
                  className={`provider-chip-btn${p === activeProvider ? " active" : ""}`}
                  data-provider={p}
                  onClick={() => {
                    setProviderOverride(p);
                    setProviderError("");
                  }}
                >
                  {p}
                </button>
              ))}
            </div>
            <div id="checkout-provider-error" style={{ color: "#DC2626", fontSize: 13, marginTop: 6 }}>
              {providerError}
            </div>
          </div>

          <div style={{ marginBottom: 28 }}>
            <label className="form-label" id="customer-id-label" htmlFor="customer-id-input">
              {category.field.label}
            </label>
            <input
              type="text"
              id="customer-id-input"
              className="form-control-input"
              placeholder={category.field.placeholder}
              inputMode={category.field.inputmode}
              autoComplete="tel"
              value={customer}
              onChange={(event) => {
                setCustomerOverride(event.target.value);
                setCustError("");
              }}
            />
            <div
              id="detected-provider-badge"
              style={{ display: "none", marginTop: 10, fontSize: 12.5, fontWeight: 700, color: "#4338CA" }}
            />
            <div id="customer-id-error" style={{ color: "#DC2626", fontSize: 13, marginTop: 6 }}>
              {custError}
            </div>
          </div>

          <button
            type="button"
            className="btn-primary"
            id="btn-stage1-next"
            style={{ width: "100%" }}
            onClick={handleStage1Next}
          >
            Pilih Produk
            <ArrowRightIcon width={16} height={16} strokeWidth={2.2} />
          </button>
        </div>

        {/* Stage 2 */}
        <div className={`checkout-stage-pane${stage === 2 ? " active" : ""}`} id="stage-2-pane">
          <div className="section-kicker">TAHAP 02</div>
          <h2 className="stage-title">Pilih produk yang sesuai.</h2>
          <p className="stage-desc">Periksa nominal dan harga sebelum melanjutkan.</p>

          <div
            id="stage-2-provider-bar"
            style={{
              marginBottom: 18,
              padding: "12px 18px",
              background: "#EEF2FF",
              borderRadius: 10,
              border: "1.5px solid #C7D2FE",
              display: activeProvider ? "flex" : "none",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div style={{ fontSize: 14, color: "#1E1B4B" }}>
              Provider / Dompet Digital:{" "}
              <strong id="stage2-provider-name" style={{ color: "#4338CA", fontSize: 15 }}>
                {activeProvider || "-"}
              </strong>
            </div>
            <button
              type="button"
              id="btn-change-provider"
              className="btn-secondary"
              style={{ padding: "4px 12px", fontSize: 12, cursor: "pointer" }}
              onClick={() => goToStage(1)}
            >
              Ganti Provider
            </button>
          </div>

          <div className="checkout-products-list" id="checkout-products-list">
            {isPrepaid ? (
              lineItems.map((item) => {
                const selected = activeItem?.id === item.id;
                const displayName =
                  activeProvider && category.slug === "uang-elektronik"
                    ? `${activeProvider} ${item.name}`
                    : item.name;
                return (
                  <div
                    key={item.id}
                    className={`product-card-item${selected ? " selected" : ""}`}
                    data-id={item.id}
                    onClick={() => {
                      setProductOverride(item);
                      setStage2Error("");
                    }}
                  >
                    {activeProvider && (
                      <div className="product-provider-badge">{activeProvider}</div>
                    )}
                    <div className="product-name-txt">{displayName}</div>
                    <div className="product-note-txt">{item.note}</div>
                    <div className="product-price-txt">{rupiah(item.price)}</div>
                  </div>
                );
              })
            ) : (
              <div
                style={{
                  gridColumn: "1 / -1",
                  background: "#EEF2FF",
                  border: "1.5px solid #C7D2FE",
                  borderRadius: 12,
                  padding: 22,
                  color: "#1E1B4B",
                }}
              >
                <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 6 }}>
                  Tagihan Ditemukan
                </div>
                <div style={{ fontSize: 14, color: "#4338CA", marginBottom: 14 }}>
                  Nomor Pelanggan: <b>{customer}</b> ({category.name})
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "8px 0",
                    borderTop: "1px solid #C7D2FE",
                    fontSize: 14,
                  }}
                >
                  <span>Jumlah Tagihan:</span>
                  <b>{rupiah(BILL_AMOUNT)}</b>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "8px 0",
                    borderTop: "1px solid #C7D2FE",
                    fontSize: 14,
                  }}
                >
                  <span>Biaya Administrasi:</span>
                  <b>{rupiah(category.adminFee ?? 2500)}</b>
                </div>
              </div>
            )}
          </div>

          <div id="stage-2-error" style={{ color: "#DC2626", fontSize: 13, marginBottom: 18 }}>
            {stage2Error}
          </div>

          <div style={{ display: "flex", gap: 14, justifyContent: "space-between" }}>
            <button type="button" className="btn-secondary" id="btn-stage2-back" onClick={() => goToStage(1)}>
              &larr; Kembali
            </button>
            <button type="button" className="btn-primary" id="btn-stage2-next" onClick={handleStage2Next}>
              Lanjut ke Ringkasan &rarr;
            </button>
          </div>
        </div>

        {/* Stage 3 */}
        <div className={`checkout-stage-pane${stage === 3 ? " active" : ""}`} id="stage-3-pane">
          <div className="section-kicker">TAHAP 03</div>
          <h2 className="stage-title">Periksa pesananmu.</h2>
          <p className="stage-desc">
            Pastikan produk, data pelanggan, dan total pembayaran sudah sesuai.
          </p>

          <div className="summary-box">
            <div className="summary-row">
              <span className="label">Kategori Layanan</span>
              <span className="val" id="summary-category-val">
                {category.name}
              </span>
            </div>
            <div
              className="summary-row"
              id="summary-provider-row"
              style={activeProvider ? undefined : { display: "none" }}
            >
              <span className="label" id="summary-provider-label">
                {category.slug === "uang-elektronik"
                  ? "Penyedia / Dompet Digital"
                  : "Penyedia / Operator"}
              </span>
              <span className="val" id="summary-provider-val" style={{ fontWeight: 700, color: "#4338CA" }}>
                {activeProvider || "-"}
              </span>
            </div>
            <div className="summary-row">
              <span className="label">Nomor / ID Pelanggan</span>
              <span className="val" id="summary-cust-id-val" style={{ fontFamily: "var(--font-mono)" }}>
                {customer}
              </span>
            </div>
            <div className="summary-row">
              <span className="label">Produk Terpilih</span>
              <span className="val" id="summary-product-val">
                {(activeProvider ? `${activeProvider} — ` : "") + (activeItem?.name ?? "-")}
              </span>
            </div>
            <div className="summary-row">
              <span className="label">Harga Produk</span>
              <span className="val" id="summary-price-val">
                {rupiah(activeItem?.price ?? 0)}
              </span>
            </div>
            <div className="summary-row">
              <span className="label">Biaya Administrasi</span>
              <span className="val" id="summary-admin-val">
                {admin ? rupiah(admin) : "Rp 0 (Termasuk)"}
              </span>
            </div>
            <div className="summary-row total">
              <span className="label">Total Pembayaran</span>
              <span className="val" id="summary-total-val">
                {rupiah(total)}
              </span>
            </div>
          </div>

          <div style={{ display: "flex", gap: 14, justifyContent: "space-between" }}>
            <button type="button" className="btn-secondary" id="btn-stage3-back" onClick={() => goToStage(2)}>
              Ubah Pesanan
            </button>
            <button
              type="button"
              className="btn-primary"
              id="btn-stage3-next"
              onClick={() => {
                createOrder();
                goToStage(4);
              }}
            >
              Lanjut ke Pembayaran &rarr;
            </button>
          </div>
        </div>

        {/* Stage 4 */}
        <div className={`checkout-stage-pane${stage === 4 ? " active" : ""}`} id="stage-4-pane">
          <div className="section-kicker">TAHAP 04</div>
          <h2 className="stage-title">Selesaikan pembayaran.</h2>
          <p className="stage-desc">
            Ikuti petunjuk yang tersedia dan pastikan jumlah pembayaran sesuai.
          </p>

          <div
            style={{
              marginBottom: 24,
              padding: "18px 22px",
              background: "#EEF2FF",
              borderRadius: 12,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              border: "1px solid #C7D2FE",
            }}
          >
            <span style={{ fontSize: 14.5, color: "#4338CA", fontWeight: 600 }}>
              Total yang harus dibayar:
            </span>
            <span
              id="payment-total-val"
              style={{ fontFamily: "var(--font-mono)", fontSize: 22, fontWeight: 700, color: "#171A35" }}
            >
              {order?.totalFormatted ?? rupiah(total)}
            </span>
          </div>

          <label className="form-label">Pilih Metode Pembayaran</label>
          <div className="payment-methods-grid">
            {(
              [
                { id: "qris", icon: "QRIS", note: "Semua e-wallet & m-banking" },
                { id: "va", icon: "Virtual Account", note: "BCA, Mandiri, BNI, BRI" },
                { id: "ewallet", icon: "Dompet Digital", note: "Notifikasi instan" },
              ] as const
            ).map((method) => (
              <div
                key={method.id}
                className={`payment-method-card${paymentMethod === method.id ? " selected" : ""}`}
                data-method={method.id}
                onClick={() => setPaymentMethod(method.id)}
              >
                <div className="pay-card-icon">{method.icon}</div>
                <div className="pay-card-note">{method.note}</div>
              </div>
            ))}
          </div>

          <div className="payment-instructions-box" id="payment-instructions-wrap">
            <PaymentInstructions
              method={paymentMethod}
              order={order}
              settings={settings}
              waText={waText}
            />
          </div>

          <div style={{ marginBottom: 24, fontSize: 13, color: "#646982", lineHeight: 1.55 }}>
            Status akan diperbarui setelah sistem menerima dan memverifikasi konfirmasi pembayaran.
          </div>

          <button
            type="button"
            className="btn-primary"
            id="btn-stage4-check-payment"
            style={{ width: "100%" }}
            onClick={handleConfirmPayment}
            disabled={submitting}
          >
            {submitting ? (
              <>
                <span
                  style={{
                    display: "inline-block",
                    width: 14,
                    height: 14,
                    border: "2px solid #FFFFFF",
                    borderRightColor: "transparent",
                    borderRadius: "50%",
                    animation: "spin 0.7s linear infinite",
                  }}
                />
                Memverifikasi Pembayaran...
              </>
            ) : (
              <>
                Periksa Status Pembayaran
                <ClockCheckIcon width={16} height={16} />
              </>
            )}
          </button>
        </div>

        {/* Stage 5 */}
        <div className={`checkout-stage-pane${stage === 5 ? " active" : ""}`} id="stage-5-pane">
          <div
            id="stage5-processing-state"
            className="stage-status-box"
            style={stage5 === "processing" ? undefined : { display: "none" }}
          >
            <div className="stage-status-icon-wrap pending">
              <ClockCheckIcon width={34} height={34} />
            </div>
            <h2 className="stage-title">Pembayaran terkonfirmasi.</h2>
            <p className="stage-desc">
              Pesananmu sedang diteruskan untuk diproses. Kamu bisa memeriksa statusnya di halaman
              ini.
            </p>
            <div
              style={{
                display: "inline-block",
                padding: "10px 18px",
                background: "#F1F4FD",
                borderRadius: 8,
                fontSize: 13,
                color: "#4338CA",
                fontWeight: 700,
              }}
            >
              Menghubungi penyedia layanan...
            </div>
          </div>

          <div
            id="stage5-success-state"
            className="stage-status-box"
            style={stage5 === "success" ? undefined : { display: "none" }}
          >
            <div className="stage-status-icon-wrap success">
              <svg
                width={34}
                height={34}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.5}
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h2 className="stage-title">Transaksi berhasil.</h2>
            <p className="stage-desc">Pesanan sudah selesai diproses.</p>

            <div className="summary-box" style={{ textAlign: "left", marginTop: 26 }}>
              <div className="summary-row">
                <span className="label">ID Transaksi</span>
                <span
                  className="val"
                  id="final-tx-id"
                  style={{ fontFamily: "var(--font-mono)", color: "#4338CA", fontSize: 17 }}
                >
                  {order?.id ?? "-"}
                </span>
              </div>
              <div
                className="summary-row"
                id="final-provider-row"
                style={order?.provider ? undefined : { display: "none" }}
              >
                <span className="label" id="final-provider-label">
                  {category.slug === "uang-elektronik"
                    ? "Penyedia / Dompet Digital"
                    : "Penyedia / Operator"}
                </span>
                <span className="val" id="final-provider-val" style={{ fontWeight: 700, color: "#4338CA" }}>
                  {order?.provider || "-"}
                </span>
              </div>
              <div className="summary-row">
                <span className="label">Produk</span>
                <span className="val" id="final-product-name">
                  {order ? `${order.category} — ${order.product}` : "-"}
                </span>
              </div>
              <div className="summary-row">
                <span className="label">Nomor / ID Pelanggan</span>
                <span className="val" id="final-cust-id" style={{ fontFamily: "var(--font-mono)" }}>
                  {order?.customer ?? "-"}
                </span>
              </div>
              <div className="summary-row">
                <span className="label">Status</span>
                <span className="val" style={{ color: "#059669", fontWeight: 700 }}>
                  Berhasil Dikonfirmasi
                </span>
              </div>
            </div>

            <div className="token-sn-box" id="final-sn-box">
              <div className="token-sn-title">Nomor Seri / SN Provider</div>
              <div className="token-sn-val" id="final-sn-val">
                {order?.sn ?? "-"}
              </div>
            </div>

            <div
              style={{
                display: "flex",
                gap: 14,
                marginTop: 30,
                justifyContent: "center",
                flexWrap: "wrap",
              }}
            >
              <Link
                href={order ? `/cek-transaksi?id=${encodeURIComponent(order.id)}` : "/cek-transaksi"}
                id="btn-view-in-tracker"
                className="btn-primary"
              >
                Pantau di Cek Transaksi
              </Link>
              <Link href="/layanan" className="btn-secondary">
                Transaksi Layanan Lain
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Payment instructions vary by method; mirrors the legacy checkout.js output. */
function PaymentInstructions({
  method,
  order,
  settings,
  waText,
}: {
  method: PaymentMethod;
  order: Order | null;
  settings: AdminSettings | null;
  waText: string;
}) {
  if (!order || !settings) return null;
  const waLink = toWhatsAppLink(settings.whatsappNumber, waText);

  const waButton = (
    <a
      href={waLink}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        background: "#ECFDF5",
        border: "1px solid #A7F3D0",
        color: "#047857",
        padding: "8px 14px",
        borderRadius: 8,
        fontSize: 13,
        fontWeight: 600,
        textDecoration: "none",
      }}
    >
      <svg
        width={15}
        height={15}
        viewBox="0 0 24 24"
        fill="none"
        stroke="#10B981"
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
      </svg>
      Konfirmasi via WhatsApp
    </a>
  );

  if (method === "qris") {
    return (
      <div style={{ textAlign: "center", padding: "12px 0" }}>
        <div style={{ fontWeight: 700, color: "#0E1126", marginBottom: 4 }}>
          {settings.qrisMerchant || "QRIS Standar Pembayaran Nasional"}
        </div>
        <div style={{ fontSize: 12, color: "#64748B", fontFamily: "var(--font-mono)", marginBottom: 12 }}>
          NMID: {settings.qrisNmid || "ID1020039102910"}
        </div>
        <div style={{ fontSize: 13.5, color: "#64748B", marginBottom: 16 }}>
          {settings.qrisInstructions ||
            "Buka aplikasi GoPay, OVO, DANA, BCA Mobile, atau aplikasi bank kamu, lalu pindai kode di bawah."}
        </div>
        <div
          style={{
            display: "inline-block",
            padding: 14,
            background: "#FFFFFF",
            border: "2px solid #E2E8F0",
            borderRadius: 12,
            boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
          }}
        >
          {settings.qrisImage ? (
            <Image
              src={settings.qrisImage}
              alt="Barcode QRIS merchant Jogatix"
              width={180}
              height={180}
              unoptimized
              style={{ objectFit: "contain" }}
            />
          ) : (
            <svg width={160} height={160} viewBox="0 0 100 100" fill="#0E1126" aria-hidden="true">
              <rect width="100" height="100" fill="#FFFFFF" />
              <rect x="10" y="10" width="25" height="25" fill="#0E1126" />
              <rect x="15" y="15" width="15" height="15" fill="#FFFFFF" />
              <rect x="65" y="10" width="25" height="25" fill="#0E1126" />
              <rect x="70" y="15" width="15" height="15" fill="#FFFFFF" />
              <rect x="10" y="65" width="25" height="25" fill="#0E1126" />
              <rect x="15" y="70" width="15" height="15" fill="#FFFFFF" />
              <rect x="45" y="15" width="10" height="10" fill="#0E1126" />
              <rect x="40" y="40" width="20" height="20" fill="#0E1126" />
              <rect x="65" y="55" width="15" height="10" fill="#0E1126" />
              <rect x="45" y="75" width="20" height="15" fill="#0E1126" />
              <rect x="75" y="75" width="15" height="15" fill="#0E1126" />
            </svg>
          )}
        </div>
        <div style={{ fontSize: 13, color: "#4338CA", fontWeight: 700, marginTop: 12 }}>
          ID Transaksi: {order.id}
        </div>
        <div style={{ marginTop: 16 }}>{waButton}</div>
      </div>
    );
  }

  if (method === "va") {
    const activeBanks = (settings.banks || []).filter((b) => b.active !== false);
    return (
      <div style={{ padding: "10px 0" }}>
        <div style={{ fontWeight: 700, color: "#0E1126", marginBottom: 8 }}>
          Pilihan Rekening Transfer Bank &amp; Virtual Account
        </div>
        <div style={{ marginBottom: 14 }}>
          {activeBanks.length > 0 ? (
            activeBanks.map((b) => (
              <div
                key={b.id}
                style={{
                  background: "#FFFFFF",
                  border: "1px solid #E2E8F0",
                  borderRadius: 8,
                  padding: "10px 14px",
                  marginBottom: 8,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <b style={{ color: "#0E1126", fontSize: 13.5 }}>Bank {b.name}</b>
                  <div style={{ fontSize: 12, color: "#64748B" }}>a.n. {b.accName}</div>
                </div>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 15, fontWeight: 700, color: "#4338CA" }}>
                  {b.accNo}
                </span>
              </div>
            ))
          ) : (
            <div style={{ color: "#4338CA", fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: 18, marginBottom: 12 }}>
              8901 2891 0492 8841 (BCA)
            </div>
          )}
        </div>
        <p style={{ fontSize: 13, color: "#64748B" }}>
          Transfer tepat sesuai nominal: <b>{order.totalFormatted}</b> melalui menu Transfer pada
          m-banking atau ATM kamu.
        </p>
        <div style={{ marginTop: 14 }}>{waButton}</div>
      </div>
    );
  }

  return (
    <div style={{ padding: "10px 0" }}>
      <div style={{ fontWeight: 700, color: "#0E1126", marginBottom: 8 }}>
        Pembayaran E-Wallet Instan
      </div>
      <p style={{ fontSize: 13, color: "#64748B" }}>
        Pemberitahuan konfirmasi top up <b>{order.provider || "dompet digital"}</b> akan dikirimkan
        ke nomor <b>{order.customer}</b>. Buka aplikasi {order.provider || "dompet digitalmu"} untuk
        menyelesaikan pembayaran sebesar <b>{order.totalFormatted}</b>.
      </p>
      <div style={{ marginTop: 14 }}>{waButton}</div>
    </div>
  );
}
