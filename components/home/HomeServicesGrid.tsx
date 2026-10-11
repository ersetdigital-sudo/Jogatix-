import Link from "next/link";
import { ArrowRightIcon, CategoryIcon } from "@/components/icons";
import { Reveal } from "@/components/motion/Reveal";
import { homeServiceCards } from "@/lib/services";

export function HomeServicesGrid() {
  return (
    <section className="home-services-section" id="daftar-layanan">
      <div className="container">
        <div className="home-sec-header">
          <span className="section-kicker">PILIHAN LAYANAN</span>
          <h2>Mau beresin apa hari ini?</h2>
          <p>
            Pilih layanan yang kamu perlukan. Klik salah satu untuk langsung membuka formulir
            transaksi dan memeriksa produk yang tersedia.
          </p>
        </div>

        {/* Reveal *is* the grid element, so its direct children stay unchanged. */}
        <Reveal className="home-services-grid">
          {homeServiceCards.map((card) => (
            <Link
              key={card.slug}
              href={`/layanan?kategori=${card.slug}`}
              className="home-service-card"
              aria-label={`Buka layanan ${card.name}`}
            >
              <div className="home-service-icon">
                <CategoryIcon slug={card.slug} width={24} height={24} />
              </div>
              <h3>{card.name}</h3>
              <p>{card.desc}</p>
              <span className="home-service-action">
                Pilih Layanan
                <ArrowRightIcon width={15} height={15} strokeWidth={2.5} />
              </span>
            </Link>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
