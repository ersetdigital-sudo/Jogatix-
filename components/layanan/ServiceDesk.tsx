"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { ArrowRightIcon, CategoryIcon, SearchIcon } from "@/components/icons";
import { useSearchParam } from "@/hooks/use-search-param";
import { categories, getCategory, isCategorySlug } from "@/lib/catalog";
import { normalizeCustomerId, rupiah } from "@/lib/format";
import type { CategorySlug, Product } from "@/types";

const PREPAID = "prabayar";
const DEFAULT_SLUG: CategorySlug = "pulsa";

export function ServiceDesk() {
  const router = useRouter();
  const urlKategori = useSearchParam("kategori");
  const urlProvider = useSearchParam("provider");

  // URL params are the initial values; explicit user choices override them.
  const [slugOverride, setSlugOverride] = useState<CategorySlug | null>(null);
  const [search, setSearch] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [error, setError] = useState("");

  const slug: CategorySlug = slugOverride ?? (isCategorySlug(urlKategori) ? urlKategori : DEFAULT_SLUG);
  const category = getCategory(slug) ?? categories[0];
  const isPrepaid = category.type === PREPAID;
  const provider =
    selectedProvider ??
    (urlProvider && category.providers.includes(urlProvider)
      ? urlProvider
      : category.providers[0] ?? "");

  const visibleCategories = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return categories;
    return categories.filter(
      (c) =>
        c.name.toLowerCase().includes(q) || c.desc.toLowerCase().includes(q) || c.slug.includes(q),
    );
  }, [search]);

  function selectCategory(next: CategorySlug) {
    setSlugOverride(next);
    setSelectedProduct(null);
    setSelectedProvider(null);
    setCustomerId("");
    setError("");

    // Keep the URL shareable without a navigation (mirrors the legacy behavior).
    try {
      const url = new URL(window.location.href);
      url.searchParams.set("kategori", next);
      window.history.replaceState({}, "", url);
    } catch {
      /* ignore */
    }
  }

  function handleProceed() {
    const clean = normalizeCustomerId(customerId);
    if (!clean) {
      setError(`Silakan masukkan ${category.field.label.toLowerCase()}.`);
      return;
    }
    if (!category.field.pattern.test(clean)) {
      setError(category.field.error);
      return;
    }
    if (isPrepaid && !selectedProduct) {
      setError("Pilih salah satu nominal atau produk terlebih dahulu.");
      return;
    }

    const params = new URLSearchParams({ kategori: category.slug, cust: clean });
    if (selectedProduct?.id) params.set("produk", selectedProduct.id);
    if (provider) params.set("provider", provider);
    router.push(`/transaksi?${params.toString()}`);
  }

  const summaryProduct = isPrepaid
    ? selectedProduct
      ? `${provider ? `${provider} - ` : ""}${selectedProduct.name}`
      : "Pilih salah satu nominal produk"
    : `${provider ? `${provider} - ` : ""}Tagihan ${category.name}`;
  const summaryTotal = isPrepaid
    ? selectedProduct
      ? rupiah(selectedProduct.price)
      : "Rp 0"
    : `Sesuai Tagihan + ${rupiah(category.adminFee ?? 2500)}`;

  return (
    <div className="services-desk-grid" id="services-interactive-desk">
      <aside className="services-nav-card" aria-label="Daftar Kategori Layanan">
        <div className="services-nav-header">
          <span className="services-nav-title">Daftar Layanan</span>
          <span className="services-count-badge">8 Kategori</span>
        </div>

        <div className="services-filter-mini">
          <SearchIcon width={15} height={15} strokeWidth={2.2} />
          <input
            type="text"
            id="desk-search-filter"
            placeholder="Cari nama layanan..."
            aria-label="Cari nama layanan"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        <nav className="services-nav-list" id="desk-nav-list">
          {visibleCategories.map((c) => (
            <button
              key={c.slug}
              type="button"
              className={`nav-category-item${c.slug === slug ? " active" : ""}`}
              data-slug={c.slug}
              onClick={() => selectCategory(c.slug)}
            >
              <div className="nav-category-left">
                <span className="nav-category-icon">
                  <CategoryIcon slug={c.slug} width={20} height={20} />
                </span>
                <span>{c.name}</span>
              </div>
              <span className="nav-category-type">
                {c.type === PREPAID ? "Prabayar" : "Tagihan"}
              </span>
            </button>
          ))}
          {visibleCategories.length === 0 && (
            <div
              id="desk-search-empty-msg"
              style={{
                padding: "20px 14px",
                textAlign: "center",
                fontSize: 13,
                color: "#64748B",
                background: "#F8FAFC",
                borderRadius: 8,
                border: "1px dashed #CBD5E1",
                marginTop: 8,
              }}
            >
              Layanan &ldquo;{search}&rdquo; tidak ditemukan.
            </div>
          )}
        </nav>
      </aside>

      <div className="services-workspace-pane">
        <section className="workspace-detail-card" aria-label="Detail Singkat Layanan">
          <div className="detail-card-top">
            <h2 className="detail-service-title" id="desk-detail-title">
              {category.name}
            </h2>
            <span className="detail-type-badge" id="desk-detail-badge">
              {isPrepaid ? "Prabayar" : "Tagihan Bulanan"}
            </span>
          </div>

          <p className="detail-service-desc" id="desk-detail-desc">
            {category.desc}
          </p>

          <div className="detail-meta-row">
            <div className="detail-meta-item">
              <span>Pilihan Provider / Operator:</span>
              <div id="desk-detail-providers" style={{ marginTop: 4 }}>
                <div className="provider-chips-wrap">
                  {category.providers.map((provName) => (
                    <button
                      key={provName}
                      type="button"
                      className={`provider-chip-btn${provName === provider ? " active" : ""}`}
                      onClick={() => setSelectedProvider(provName)}
                    >
                      {provName}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="detail-meta-item">
              <span>Alur Proses:</span>
              <strong id="desk-detail-process-note">
                {isPrepaid
                  ? "Otomatis instan setelah pembayaran terkonfirmasi"
                  : "Pemeriksaan tagihan otomatis, nomor seri (SN) resmi diterbitkan"}
              </strong>
            </div>
          </div>
        </section>

        <section className="workspace-form-card" aria-label="Form Transaksi">
          <div className="form-step-block">
            <div className="form-step-header">
              <span className="form-step-label">Masukkan Data Pelanggan</span>
              <span
                id="desk-detected-provider"
                style={{ display: "none", fontSize: 12, fontWeight: 700, color: "#4338CA" }}
              />
            </div>

            <label className="form-label" id="desk-input-label" htmlFor="desk-customer-id">
              {category.field.label}
            </label>
            <input
              type="text"
              id="desk-customer-id"
              className="form-control-input"
              placeholder={category.field.placeholder}
              inputMode={category.field.inputmode}
              autoComplete="tel"
              value={customerId}
              onChange={(event) => {
                setCustomerId(event.target.value);
                setError("");
              }}
            />
          </div>

          <div className="form-step-block">
            <div className="form-step-header">
              <span className="form-step-label">Pilih Produk &amp; Nominal</span>
              <span style={{ fontSize: 12, color: "#646982" }}>Harga ditampilkan di awal</span>
            </div>

            <div className="products-selection-grid" id="desk-products-grid">
              {isPrepaid && category.products ? (
                category.products.map((p) => (
                  <div
                    key={p.id}
                    className={`product-card-item${selectedProduct?.id === p.id ? " selected" : ""}`}
                    data-id={p.id}
                    onClick={() => {
                      setSelectedProduct(p);
                      setError("");
                    }}
                  >
                    <div className="product-name-txt">
                      {category.slug === "uang-elektronik" && provider ? `${provider} ` : ""}
                      {p.name}
                    </div>
                    <div className="product-note-txt">{p.note}</div>
                    <div className="product-price-txt">{rupiah(p.price)}</div>
                  </div>
                ))
              ) : (
                <div
                  style={{
                    gridColumn: "1 / -1",
                    padding: 20,
                    background: "#F8FAFC",
                    border: "1.5px dashed #CBD5E1",
                    borderRadius: 12,
                    fontSize: 14,
                    color: "#475569",
                    lineHeight: 1.6,
                  }}
                >
                  <strong
                    style={{ color: "#0E1126", display: "block", marginBottom: 4, fontSize: 15 }}
                  >
                    Pemeriksaan Tagihan Otomatis
                  </strong>
                  Masukkan nomor atau ID pelanggan di atas. Jumlah tagihan terbaru dan rincian biaya
                  admin sebesar <b>{rupiah(category.adminFee ?? 2500)}</b> akan ditampilkan seketika
                  sebelum tahap pembayaran.
                </div>
              )}
            </div>

            <div id="desk-form-error" style={{ color: "#DC2626", fontSize: 13, marginTop: 14 }}>
              {error}
            </div>
          </div>

          <div className="workspace-checkout-bar">
            <div className="summary-meta-col">
              <span className="summary-meta-label">Pesanan Terpilih</span>
              <span className="summary-meta-product" id="desk-summary-product">
                {summaryProduct}
              </span>
              <span
                style={{ fontSize: 11.5, color: "#646982", fontFamily: "var(--font-mono)" }}
                id="desk-summary-id"
              >
                {customerId.trim() ? `ID / Nomor: ${customerId.trim()}` : "-"}
              </span>
            </div>

            <div className="summary-total-col">
              <div className="summary-total-label">Total Pembayaran</div>
              <div className="summary-total-price" id="desk-summary-total">
                {summaryTotal}
              </div>
            </div>

            <button
              type="button"
              className="btn-primary"
              id="desk-btn-proceed"
              onClick={handleProceed}
            >
              Lanjut ke Pembayaran
              <ArrowRightIcon width={16} height={16} strokeWidth={2.2} />
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
