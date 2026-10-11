/**
 * Shared domain types for the Jogatix app.
 */

/** A label + link pair used by navigation menus. */
export interface NavItem {
  label: string;
  href: string;
}

/** The 8 service categories offered by the platform. */
export type CategorySlug =
  | "pulsa"
  | "paket-data"
  | "uang-elektronik"
  | "pln"
  | "internet"
  | "bpjs"
  | "pdam"
  | "multifinance";

/** Prepaid top-ups vs. monthly bill payments. */
export type ServiceType = "prabayar" | "tagihan";

export interface Product {
  id: string;
  name: string;
  note: string;
  price: number;
  provider?: string;
}

/** How a category validates its customer identifier. */
export interface CategoryField {
  label: string;
  placeholder: string;
  inputmode: "text" | "tel" | "numeric";
  pattern: RegExp;
  error: string;
}

export interface ServiceCategory {
  slug: CategorySlug;
  name: string;
  type: ServiceType;
  desc: string;
  providers: string[];
  field: CategoryField;
  /** Prepaid categories expose product lists; bill categories use `adminFee`. */
  products?: Product[];
  adminFee?: number;
}

/** Lifecycle of an order / transaction. */
export type OrderStatus = "SUCCESS" | "PENDING" | "WAITING" | "FAILED";

export interface Order {
  id: string;
  category: string;
  categorySlug: CategorySlug;
  provider?: string;
  product: string;
  customer: string;
  total: number;
  totalFormatted: string;
  paymentMethod: string;
  createdAt: string;
  sn: string;
  status: OrderStatus;
  statusLabel: string;
  systemMessage: string;
}

export interface BankAccount {
  id: string;
  name: string;
  code: string;
  accNo: string;
  accName: string;
  active: boolean;
}

export interface EWalletAccount {
  id: string;
  name: string;
  accNo: string;
  accName: string;
  active: boolean;
}

/** Payment / WhatsApp configuration managed from the admin console. */
export interface AdminSettings {
  whatsappNumber: string;
  whatsappAdminName: string;
  whatsappHours: string;
  whatsappTemplateOrder: string;
  whatsappTemplateSuccess: string;
  qrisImage: string;
  qrisMerchant: string;
  qrisNmid: string;
  qrisActive: boolean;
  qrisInstructions: string;
  banks: BankAccount[];
  ewallets: EWalletAccount[];
  adminFeeBill: number;
}

/**
 * The subset of `AdminSettings` the public storefront is allowed to read.
 * The WhatsApp message templates stay server/admin-side.
 */
export type PublicSettings = Omit<
  AdminSettings,
  "whatsappTemplateOrder" | "whatsappTemplateSuccess"
>;

/** A product row as edited inside the admin console. */
export interface AdminProduct {
  id: string;
  categorySlug: CategorySlug;
  categoryName: string;
  name: string;
  price: number;
  note: string;
  provider?: string;
  active: boolean;
}

/** A run of FAQ answer copy: plain text, or an inline link. */
export type FaqSegment =
  | { type: "text"; text: string }
  | { type: "link"; text: string; href: string };

export interface FaqItem {
  id: string;
  badge: string;
  question: string;
  answer: FaqSegment[];
}
