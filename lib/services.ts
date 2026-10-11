import type { CategorySlug, NavItem } from "@/types";

/** Compact service references used by the footer and the home services grid. */
export interface ServiceLink extends NavItem {
  slug: CategorySlug;
  shortLabel: string;
}

export const serviceLinks: ServiceLink[] = [
  { slug: "pulsa", label: "Pulsa", shortLabel: "Pulsa", href: "/layanan?kategori=pulsa" },
  { slug: "paket-data", label: "Paket Data", shortLabel: "Paket Data", href: "/layanan?kategori=paket-data" },
  { slug: "uang-elektronik", label: "Uang Elektronik", shortLabel: "Uang Elektronik", href: "/layanan?kategori=uang-elektronik" },
  { slug: "pln", label: "PLN", shortLabel: "PLN", href: "/layanan?kategori=pln" },
  { slug: "internet", label: "Pembayaran Internet", shortLabel: "Internet", href: "/layanan?kategori=internet" },
  { slug: "bpjs", label: "BPJS", shortLabel: "BPJS", href: "/layanan?kategori=bpjs" },
  { slug: "pdam", label: "PDAM", shortLabel: "PDAM", href: "/layanan?kategori=pdam" },
  { slug: "multifinance", label: "Multifinance", shortLabel: "Multifinance", href: "/layanan?kategori=multifinance" },
];

/** The eight cards shown on the home page, with their marketing copy. */
export interface HomeServiceCard {
  slug: CategorySlug;
  name: string;
  desc: string;
}

export const homeServiceCards: HomeServiceCard[] = [
  {
    slug: "pulsa",
    name: "Pulsa",
    desc: "Isi pulsa untuk tetap terhubung ke semua operator seluler di Indonesia.",
  },
  {
    slug: "paket-data",
    name: "Paket Data",
    desc: "Pilihan paket internet harian hingga bulanan sesuai kebutuhan kuotamu.",
  },
  {
    slug: "uang-elektronik",
    name: "Uang Elektronik",
    desc: "Isi saldo dompet digital favorit: GoPay, OVO, DANA, ShopeePay, dan lainnya.",
  },
  {
    slug: "pln",
    name: "PLN",
    desc: "Beli token listrik prabayar atau bayar tagihan listrik bulanan dengan kode meteran.",
  },
  {
    slug: "internet",
    name: "Pembayaran Internet",
    desc: "Periksa dan lunasi tagihan Wi-Fi rumah: IndiHome, Biznet, First Media, dan provider lainnya.",
  },
  {
    slug: "bpjs",
    name: "BPJS Kesehatan",
    desc: "Cek iuran dan bayar tagihan BPJS Kesehatan keluarga dengan nomor Virtual Account.",
  },
  {
    slug: "pdam",
    name: "PDAM",
    desc: "Pemeriksaan dan pembayaran tagihan air minum untuk berbagai wilayah kabupaten & kota.",
  },
  {
    slug: "multifinance",
    name: "Multifinance",
    desc: "Bayar angsuran kredit kendaraan dan pembiayaan lainnya dengan nomor kontrak resmi.",
  },
];
