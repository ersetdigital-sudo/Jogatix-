import Link from "next/link";
import { Fragment } from "react";
import { ArrowRightIcon, CheckIcon, SearchIcon, ShieldIcon } from "@/components/icons";
import { Reveal } from "@/components/motion/Reveal";
import { heroFlowSteps, heroTrustPoints } from "@/lib/home-content";

export function HomeHero() {
  return (
    <section className="home-hero-wrap" aria-label="Hero Jogatix">
      <div className="container home-hero-grid">
        {/* Left: headline + CTAs */}
        <div className="home-hero-content">
          <div className="hero-eyebrow">
            <span className="hero-eyebrow-dot" aria-hidden="true" />
            <span>SOLUSI TRANSAKSI DIGITAL</span>
          </div>

          <h1 className="home-hero-title">
            <span className="hero-title-base">Semua Kebutuhan Digital, Satu Tempat.</span>
            <span className="hero-title-highlight">Praktis, Transparan, dan Mudah.</span>
          </h1>

          <p className="home-hero-sub">
            Isi pulsa, beli paket data, top up uang elektronik, token listrik, hingga bayar tagihan
            bulanan dalam satu platform. Cek harga sebelum membayar dan pantau status transaksi
            dengan mudah.
          </p>

          <div className="home-hero-cta">
            <Link href="/layanan" className="btn-primary hero-btn-primary">
              <span>Jelajahi Layanan</span>
              <ArrowRightIcon width={17} height={17} strokeWidth={2.2} />
            </Link>
            <Link href="/cek-transaksi" className="btn-secondary hero-btn-secondary">
              <SearchIcon width={16} height={16} strokeWidth={2.2} />
              <span>Cek Transaksi</span>
            </Link>
          </div>

          <div className="home-hero-trust" aria-label="Keunggulan Layanan">
            {heroTrustPoints.map((point, index) => (
              <Fragment key={point}>
                {index > 0 && (
                  <span className="trust-divider" aria-hidden="true">
                    ·
                  </span>
                )}
                <div className="trust-item">
                  <CheckIcon width={15} height={15} />
                  <span>{point}</span>
                </div>
              </Fragment>
            ))}
          </div>
        </div>

        {/* Right: transaction flow panel */}
        <Reveal className="home-hero-panel" delay={0.1}>
          <div className="hero-flow-card">
            <div className="hero-flow-header">
              <div className="hero-flow-header-left">
                <span className="hero-flow-kicker">ALUR TRANSAKSI JOGATIX</span>
                <h2 className="hero-flow-title">Transaksi Jelas di Setiap Langkah</h2>
              </div>
              <div className="hero-flow-badge" title="Status proses transaksi dapat dipantau">
                <span className="hero-flow-pulse" aria-hidden="true" />
                <span>PROSES TERPANTAU</span>
              </div>
            </div>

            <ol className="hero-flow-steps">
              {heroFlowSteps.map((step, index) => (
                <li className="hero-flow-step" key={step.n}>
                  <div className="flow-step-num-wrap">
                    <span className="flow-step-num">{step.n}</span>
                    {index < heroFlowSteps.length - 1 && (
                      <span className="flow-step-line" aria-hidden="true" />
                    )}
                  </div>
                  <div className="flow-step-content">
                    <div className="flow-step-head">
                      <span className="flow-step-title">{step.title}</span>
                      <span
                        className={`flow-step-tag${step.success ? " flow-step-tag-success" : ""}`}
                      >
                        {step.tag}
                      </span>
                    </div>
                    <p className="flow-step-desc">{step.desc}</p>
                  </div>
                </li>
              ))}
            </ol>

            <div className="hero-flow-footer">
              <ShieldIcon width={15} height={15} />
              <div className="hero-flow-footer-content">
                <strong className="hero-flow-footer-title">
                  Informasi Transaksi dalam Satu Tempat
                </strong>
                <p className="hero-flow-footer-desc">
                  Gunakan nomor pesanan atau informasi yang diminta sistem untuk memeriksa
                  perkembangan transaksi.
                </p>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
