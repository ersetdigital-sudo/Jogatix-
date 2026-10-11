import { Reveal } from "@/components/motion/Reveal";
import { QuickTrackerForm } from "@/components/home/QuickTrackerForm";
import { timelineSteps } from "@/lib/home-content";

export function HomeTimeline() {
  return (
    <section
      className="home-timeline-section"
      id="alur-transaksi"
      aria-label="Alur Transaksi Jogatix"
    >
      <div className="container">
        <div className="home-sec-header">
          <span className="section-kicker">ALUR TRANSAKSI</span>
          <h2>Cara Mudah Bertransaksi di Jogatix</h2>
          <p>
            Penuhi kebutuhan digital dalam tiga langkah praktis, mulai dari memilih layanan hingga
            memantau status pesanan.
          </p>
        </div>

        <Reveal className="home-steps-grid">
          {timelineSteps.map((step) => (
            <div className="home-step-item" key={step.badge}>
              <div className="home-step-badge">{step.badge}</div>
              <h3>{step.title}</h3>
              <p>{step.desc}</p>
            </div>
          ))}
        </Reveal>

        <div className="home-tracking-strip">
          <div className="home-tracking-info">
            <h3>Sudah Memiliki ID Transaksi?</h3>
            <p>Periksa status pembayaran dan pengiriman produk secara langsung di sini.</p>
          </div>
          <QuickTrackerForm />
        </div>
      </div>
    </section>
  );
}
