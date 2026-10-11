"use client";

import Link from "next/link";
import { useState } from "react";
import { ChevronDownIcon, InfoCircleIcon } from "@/components/icons";
import { faqItems } from "@/lib/faq";
import type { FaqSegment } from "@/types";

function AnswerText({ segments }: { segments: FaqSegment[] }) {
  return (
    <p>
      {segments.map((segment, index) =>
        segment.type === "link" ? (
          <Link
            key={index}
            href={segment.href}
            className="faq-answer-highlight"
            style={{ color: "var(--color-primary)", textDecoration: "underline" }}
          >
            {segment.text}
          </Link>
        ) : (
          <span key={index}>{segment.text}</span>
        ),
      )}
    </p>
  );
}

export function HomeFaq() {
  // First item is open by default, matching the original markup.
  const [openId, setOpenId] = useState<string | null>(faqItems[0]?.id ?? null);

  return (
    <section className="home-faq-section" id="faq" aria-labelledby="faq-section-title">
      <div className="container">
        <div className="faq-container-inner">
          <div className="home-sec-header">
            <span className="section-kicker">INFORMASI TRANSAKSI</span>
            <h2 id="faq-section-title">Hal Penting Sebelum dan Sesudah Bertransaksi</h2>
            <p>
              Pelajari alur pemesanan, metode pembayaran yang didukung, serta cara memantau status
              pesanan agar transaksi Anda berjalan lancar dan terarah.
            </p>
          </div>

          <div className="faq-accordion" id="home-faq-accordion">
            {faqItems.map((item) => {
              const isOpen = openId === item.id;
              const btnId = `faq-btn-${item.id}`;
              const panelId = `faq-ans-${item.id}`;
              return (
                <div className={`faq-item${isOpen ? " is-open" : ""}`} key={item.id}>
                  <button
                    type="button"
                    className="faq-trigger"
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    id={btnId}
                    onClick={() => setOpenId(isOpen ? null : item.id)}
                  >
                    <div className="faq-trigger-content">
                      <span className="faq-badge">{item.badge}</span>
                      <h3 className="faq-question">{item.question}</h3>
                    </div>
                    <span className="faq-chevron-wrap" aria-hidden="true">
                      <ChevronDownIcon className="faq-chevron" width={18} height={18} />
                    </span>
                  </button>
                  <div
                    id={panelId}
                    className="faq-collapse"
                    role="region"
                    aria-labelledby={btnId}
                  >
                    <div className="faq-collapse-inner">
                      <div className="faq-answer-body">
                        <AnswerText segments={item.answer} />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom support helper */}
          <div className="faq-footer-helper">
            <div className="faq-helper-info">
              <div className="faq-helper-icon">
                <InfoCircleIcon width={20} height={20} />
              </div>
              <div>
                <strong className="faq-helper-title">
                  Membutuhkan bantuan atau informasi lebih lanjut?
                </strong>
                <p className="faq-helper-desc">
                  Pelajari panduan transaksi di Pusat Bantuan atau pantau langsung status pesanan
                  Anda.
                </p>
              </div>
            </div>
            <div className="faq-helper-actions">
              <Link href="/bantuan" className="btn-faq-help">
                Pusat Bantuan
              </Link>
              <Link href="/cek-transaksi" className="btn-faq-track">
                Cek Status Pesanan
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
