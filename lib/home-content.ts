/** Static marketing copy for the home page sections. */

export const heroTrustPoints = [
  "8 Kategori Layanan",
  "Pelacakan SN Resmi",
  "QRIS & Bank Transfer",
];

export interface HeroFlowStep {
  n: number;
  title: string;
  tag: string;
  desc: string;
  /** Renders the tag with the green "success" treatment. */
  success?: boolean;
}

export const heroFlowSteps: HeroFlowStep[] = [
  {
    n: 1,
    title: "Pilih Layanan dan Tujuan",
    tag: "PILIH PRODUK",
    desc: "Pilih produk yang dibutuhkan dan masukkan nomor atau ID pelanggan sesuai layanan.",
  },
  {
    n: 2,
    title: "Periksa Total Pembayaran",
    tag: "HARGA TRANSPARAN",
    desc: "Lihat nominal produk dan biaya admin sebelum melanjutkan pembayaran.",
  },
  {
    n: 3,
    title: "Selesaikan Pembayaran",
    tag: "PEMBAYARAN",
    desc: "Ikuti instruksi pembayaran menggunakan metode yang tersedia pada checkout.",
  },
  {
    n: 4,
    title: "Pantau Status Transaksi",
    tag: "CEK STATUS",
    desc: "Periksa status pesanan dan informasi hasil transaksi melalui halaman cek transaksi.",
    success: true,
  },
];

export interface TimelineStep {
  badge: string;
  title: string;
  desc: string;
}

export const timelineSteps: TimelineStep[] = [
  {
    badge: "01",
    title: "Pilih Layanan yang Dibutuhkan",
    desc: "Pilih produk, lalu masukkan nomor tujuan atau ID pelanggan sesuai layanan yang dipilih.",
  },
  {
    badge: "02",
    title: "Periksa Harga dan Bayar",
    desc: "Periksa nominal produk dan biaya admin sebelum membayar melalui metode yang tersedia.",
  },
  {
    badge: "03",
    title: "Selesaikan dan Pantau Transaksi",
    desc: "Ikuti status pesanan melalui halaman Cek Transaksi. Informasi hasil transaksi tersedia sesuai jenis produk dan status pemrosesan.",
  },
];
