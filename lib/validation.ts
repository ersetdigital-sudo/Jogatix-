import type {
  AdminProduct,
  AdminSettings,
  BankAccount,
  CategorySlug,
  EWalletAccount,
} from "@/types";
import { CATEGORY_NAMES } from "@/lib/admin-defaults";
import { isCategorySlug } from "@/lib/catalog";

/**
 * Parsers for untrusted payloads sent by the admin console. Each parser returns
 * `null` on malformed input so the route can answer 400, otherwise a fully
 * typed object. Scalar fields fall back to the previously stored value, which
 * keeps older clients and partial payloads working.
 */

function strOr(value: unknown, fallback: string): string {
  return typeof value === "string" ? value.trim() : fallback;
}

function boolOr(value: unknown, fallback: boolean): boolean {
  return typeof value === "boolean" ? value : fallback;
}

function intOr(value: unknown, fallback: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.round(parsed) : fallback;
}

function parseBanks(input: unknown): BankAccount[] | null {
  if (!Array.isArray(input)) return null;
  const banks: BankAccount[] = [];
  for (const item of input) {
    if (!item || typeof item !== "object") return null;
    const raw = item as Record<string, unknown>;
    const id = strOr(raw.id, "");
    const name = strOr(raw.name, "");
    if (!id || !name) return null;
    banks.push({
      id,
      name,
      code: strOr(raw.code, name.toLowerCase().replace(/[^a-z0-9]/g, "")),
      accNo: strOr(raw.accNo, ""),
      accName: strOr(raw.accName, ""),
      active: boolOr(raw.active, true),
    });
  }
  return banks;
}

function parseEwallets(input: unknown): EWalletAccount[] | null {
  if (!Array.isArray(input)) return null;
  const ewallets: EWalletAccount[] = [];
  for (const item of input) {
    if (!item || typeof item !== "object") return null;
    const raw = item as Record<string, unknown>;
    const id = strOr(raw.id, "");
    const name = strOr(raw.name, "");
    if (!id || !name) return null;
    ewallets.push({
      id,
      name,
      accNo: strOr(raw.accNo, ""),
      accName: strOr(raw.accName, ""),
      active: boolOr(raw.active, true),
    });
  }
  return ewallets;
}

/** Validates the full product list the admin console saves in one go. */
export function parseProductsInput(input: unknown): AdminProduct[] | null {
  if (!Array.isArray(input)) return null;

  const products: AdminProduct[] = [];
  const seen = new Set<string>();

  for (const item of input) {
    if (!item || typeof item !== "object") return null;
    const raw = item as Record<string, unknown>;
    const id = strOr(raw.id, "");
    const name = strOr(raw.name, "");
    const slug = strOr(raw.categorySlug, "");

    if (!id || !name || seen.has(id) || !isCategorySlug(slug)) return null;
    seen.add(id);

    products.push({
      id,
      categorySlug: slug as CategorySlug,
      categoryName: strOr(raw.categoryName, CATEGORY_NAMES[slug as CategorySlug]),
      name,
      price: Math.max(0, intOr(raw.price, 0)),
      note: strOr(raw.note, ""),
      provider: strOr(raw.provider, "") || undefined,
      active: boolOr(raw.active, true),
    });
  }

  return products;
}

/** Validates a complete `AdminSettings` payload, merging over `current`. */
export function parseSettingsInput(input: unknown, current: AdminSettings): AdminSettings | null {
  if (!input || typeof input !== "object") return null;
  const raw = input as Record<string, unknown>;

  const banks = parseBanks(raw.banks);
  const ewallets = parseEwallets(raw.ewallets);
  if (!banks || !ewallets) return null;

  return {
    whatsappNumber: strOr(raw.whatsappNumber, current.whatsappNumber),
    whatsappAdminName: strOr(raw.whatsappAdminName, current.whatsappAdminName),
    whatsappHours: strOr(raw.whatsappHours, current.whatsappHours),
    whatsappTemplateOrder: strOr(raw.whatsappTemplateOrder, current.whatsappTemplateOrder),
    whatsappTemplateSuccess: strOr(raw.whatsappTemplateSuccess, current.whatsappTemplateSuccess),
    qrisImage: strOr(raw.qrisImage, current.qrisImage),
    qrisMerchant: strOr(raw.qrisMerchant, current.qrisMerchant),
    qrisNmid: strOr(raw.qrisNmid, current.qrisNmid),
    qrisActive: boolOr(raw.qrisActive, current.qrisActive),
    qrisInstructions: strOr(raw.qrisInstructions, current.qrisInstructions),
    banks,
    ewallets,
    adminFeeBill: Math.max(0, intOr(raw.adminFeeBill, current.adminFeeBill)),
  };
}
