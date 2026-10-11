import type { NavItem } from "@/types";

/**
 * Global site configuration.
 *
 * NOTE: values marked "manual" were not present in the original static HTML
 * (it shipped placeholder/demo data) and must be filled in before going live.
 */
export const siteConfig = {
  name: "Jogatix",
  legalName: "Jogatix Digital Commerce",
  /** Manual: set NEXT_PUBLIC_SITE_URL to the production domain. */
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.jogatix.id",
  locale: "id_ID",
  description:
    "Platform transaksi digital untuk pulsa, paket data, uang elektronik, PLN, dan pembayaran berbagai tagihan dengan alur transparan.",
  /** Manual: replace with the real customer-care number. */
  whatsapp: process.env.NEXT_PUBLIC_WHATSAPP ?? "081234567890",
  contactEmail: process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "halo@jogatix.id",
} as const;

/** Primary navigation, shared by the header drawer and footer. */
export const primaryNav: NavItem[] = [
  { label: "Beranda", href: "/" },
  { label: "Layanan", href: "/layanan" },
  { label: "Cek Transaksi", href: "/cek-transaksi" },
  { label: "Bantuan", href: "/bantuan" },
  { label: "Tentang Jogatix", href: "/tentang" },
];

/** Informational links shown in the footer. */
export const footerInfoLinks: NavItem[] = [
  { label: "Tentang Jogatix", href: "/tentang" },
  { label: "Cek Transaksi", href: "/cek-transaksi" },
  { label: "Bantuan", href: "/bantuan" },
  { label: "Kebijakan Privasi", href: "/bantuan#kebijakan" },
  { label: "Syarat dan Ketentuan", href: "/bantuan#ketentuan" },
];

export const footerDisclaimer =
  "Harga, ketersediaan produk, dan waktu pemrosesan mengikuti informasi yang ditampilkan saat transaksi serta ketentuan penyedia layanan.";
