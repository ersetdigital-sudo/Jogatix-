import type {
  AdminProduct,
  AdminSettings,
  BankAccount,
  CategorySlug,
  EWalletAccount,
  Order,
  Product,
  PublicSettings,
} from "@/types";
import { buildDefaultProducts, defaultSettings } from "@/lib/admin-defaults";
import { getSupabaseAdmin } from "@/lib/supabase/server";

/**
 * Data access layer for every Supabase-backed entity (orders, products,
 * settings). Route handlers are the only callers, so all of this runs on the
 * server with the service_role key.
 *
 * Rows use `snake_case`; the app uses `camelCase`. The `to*` / `from*` mappers
 * below are the only place those two shapes meet.
 */

/* -------------------------------------------------------------------------- */
/* Row shapes                                                                  */
/* -------------------------------------------------------------------------- */

interface OrderRow {
  id: string;
  category: string;
  // Constrained by parseOrderInput on write; defaulted to "pulsa" when unknown.
  category_slug: CategorySlug;
  provider: string;
  product: string;
  customer: string;
  total: number;
  total_formatted: string;
  payment_method: string;
  created_at: string;
  sn: string;
  status: Order["status"];
  status_label: string;
  system_message: string;
  created_ts?: string;
}

interface ProductRow {
  id: string;
  category_slug: CategorySlug;
  category_name: string;
  name: string;
  price: number;
  note: string;
  provider: string;
  active: boolean;
  sort_order: number;
}

interface SettingsRow {
  id: number;
  whatsapp_number: string;
  whatsapp_admin_name: string;
  whatsapp_hours: string;
  whatsapp_template_order: string;
  whatsapp_template_success: string;
  qris_image: string;
  qris_merchant: string;
  qris_nmid: string;
  qris_active: boolean;
  qris_instructions: string;
  banks: BankAccount[];
  ewallets: EWalletAccount[];
  admin_fee_bill: number;
}

/* -------------------------------------------------------------------------- */
/* Mappers                                                                     */
/* -------------------------------------------------------------------------- */

function toOrder(row: OrderRow): Order {
  return {
    id: row.id,
    category: row.category,
    categorySlug: row.category_slug,
    provider: row.provider || undefined,
    product: row.product,
    customer: row.customer,
    total: row.total,
    totalFormatted: row.total_formatted,
    paymentMethod: row.payment_method,
    createdAt: row.created_at,
    sn: row.sn,
    status: row.status,
    statusLabel: row.status_label,
    systemMessage: row.system_message,
  };
}

function fromOrder(order: Order): OrderRow {
  return {
    id: order.id,
    category: order.category,
    category_slug: order.categorySlug,
    provider: order.provider ?? "",
    product: order.product,
    customer: order.customer,
    total: order.total,
    total_formatted: order.totalFormatted,
    payment_method: order.paymentMethod,
    created_at: order.createdAt,
    sn: order.sn,
    status: order.status,
    status_label: order.statusLabel,
    system_message: order.systemMessage,
  };
}

function toProduct(row: ProductRow): AdminProduct {
  return {
    id: row.id,
    categorySlug: row.category_slug,
    categoryName: row.category_name,
    name: row.name,
    price: row.price,
    note: row.note,
    provider: row.provider || undefined,
    active: row.active,
  };
}

function fromProduct(product: AdminProduct, sortOrder: number): ProductRow {
  return {
    id: product.id,
    category_slug: product.categorySlug,
    category_name: product.categoryName,
    name: product.name,
    price: product.price,
    note: product.note,
    provider: product.provider ?? "",
    active: product.active !== false,
    sort_order: sortOrder,
  };
}

function toSettings(row: SettingsRow): AdminSettings {
  return {
    whatsappNumber: row.whatsapp_number,
    whatsappAdminName: row.whatsapp_admin_name,
    whatsappHours: row.whatsapp_hours,
    whatsappTemplateOrder: row.whatsapp_template_order,
    whatsappTemplateSuccess: row.whatsapp_template_success,
    qrisImage: row.qris_image,
    qrisMerchant: row.qris_merchant,
    qrisNmid: row.qris_nmid,
    qrisActive: row.qris_active,
    qrisInstructions: row.qris_instructions,
    banks: Array.isArray(row.banks) ? row.banks : [],
    ewallets: Array.isArray(row.ewallets) ? row.ewallets : [],
    adminFeeBill: row.admin_fee_bill,
  };
}

function fromSettings(settings: AdminSettings): Omit<SettingsRow, "id"> & { id: number } {
  return {
    id: 1,
    whatsapp_number: settings.whatsappNumber,
    whatsapp_admin_name: settings.whatsappAdminName,
    whatsapp_hours: settings.whatsappHours,
    whatsapp_template_order: settings.whatsappTemplateOrder,
    whatsapp_template_success: settings.whatsappTemplateSuccess,
    qris_image: settings.qrisImage,
    qris_merchant: settings.qrisMerchant,
    qris_nmid: settings.qrisNmid,
    qris_active: settings.qrisActive,
    qris_instructions: settings.qrisInstructions,
    banks: settings.banks,
    ewallets: settings.ewallets,
    admin_fee_bill: settings.adminFeeBill,
  };
}

/** Strips the admin-only WhatsApp templates before sending settings publicly. */
export function toPublicSettings(settings: AdminSettings): PublicSettings {
  return {
    whatsappNumber: settings.whatsappNumber,
    whatsappAdminName: settings.whatsappAdminName,
    whatsappHours: settings.whatsappHours,
    qrisImage: settings.qrisImage,
    qrisMerchant: settings.qrisMerchant,
    qrisNmid: settings.qrisNmid,
    qrisActive: settings.qrisActive,
    qrisInstructions: settings.qrisInstructions,
    banks: settings.banks,
    ewallets: settings.ewallets,
    adminFeeBill: settings.adminFeeBill,
  };
}

/* -------------------------------------------------------------------------- */
/* Seeding                                                                     */
/* -------------------------------------------------------------------------- */

/**
 * First-run seed: inserts the default settings row and the catalog products
 * derived from `lib/admin-defaults.ts`. Runs once per server process — the
 * settings row is the marker, and both writes are conflict-safe.
 */
let seedPromise: Promise<void> | null = null;

export function ensureSeeded(): Promise<void> {
  if (!seedPromise) {
    seedPromise = runSeed().catch((error) => {
      // Allow a later request to retry after a transient failure.
      seedPromise = null;
      throw error;
    });
  }
  return seedPromise;
}

async function runSeed(): Promise<void> {
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from("settings")
    .select("id")
    .eq("id", 1)
    .maybeSingle();
  if (error) throw error;
  if (data) return;

  const { error: settingsError } = await supabase
    .from("settings")
    .upsert(fromSettings(defaultSettings), { onConflict: "id", ignoreDuplicates: true });
  if (settingsError) throw settingsError;

  const defaults = buildDefaultProducts().map((product, index) => fromProduct(product, index));
  const { error: productsError } = await supabase
    .from("products")
    .upsert(defaults, { onConflict: "id", ignoreDuplicates: true });
  if (productsError) throw productsError;
}

/* -------------------------------------------------------------------------- */
/* Settings                                                                    */
/* -------------------------------------------------------------------------- */

export async function readSettings(): Promise<AdminSettings> {
  await ensureSeeded();
  const { data, error } = await getSupabaseAdmin()
    .from("settings")
    .select("*")
    .eq("id", 1)
    .maybeSingle();
  if (error) throw error;
  return data ? toSettings(data as SettingsRow) : defaultSettings;
}

export async function writeSettings(settings: AdminSettings): Promise<AdminSettings> {
  await ensureSeeded();
  const { data, error } = await getSupabaseAdmin()
    .from("settings")
    .upsert({ ...fromSettings(settings), updated_at: new Date().toISOString() }, { onConflict: "id" })
    .select("*")
    .single();
  if (error) throw error;
  return toSettings(data as SettingsRow);
}

/* -------------------------------------------------------------------------- */
/* Products                                                                    */
/* -------------------------------------------------------------------------- */

export async function readProducts(): Promise<AdminProduct[]> {
  await ensureSeeded();
  const { data, error } = await getSupabaseAdmin()
    .from("products")
    .select("*")
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return (data as ProductRow[]).map(toProduct);
}

/**
 * Replaces the whole catalog. The admin console edits products as one array, so
 * a full replace keeps both sides in sync without a diffing protocol. The
 * original ordering of `products` is preserved via `sort_order`.
 */
export async function writeProducts(products: AdminProduct[]): Promise<AdminProduct[]> {
  await ensureSeeded();
  const supabase = getSupabaseAdmin();
  const rows = products.map((product, index) => fromProduct(product, index));

  // Upsert first, then remove the deleted ids. This ordering means a failed
  // write can never leave the catalog empty.
  if (rows.length > 0) {
    const { error } = await supabase.from("products").upsert(rows, { onConflict: "id" });
    if (error) throw error;
  }

  const { data: existing, error: existingError } = await supabase.from("products").select("id");
  if (existingError) throw existingError;
  const keep = new Set(rows.map((row) => row.id));
  const stale = (existing as { id: string }[]).map((row) => row.id).filter((id) => !keep.has(id));
  if (stale.length > 0) {
    const { error } = await supabase.from("products").delete().in("id", stale);
    if (error) throw error;
  }

  return readProducts();
}

/** Active products for the public storefront, grouped by category. */
export async function readActiveProductsByCategory(): Promise<Partial<Record<CategorySlug, Product[]>>> {
  await ensureSeeded();
  const { data, error } = await getSupabaseAdmin()
    .from("products")
    .select("id, category_slug, name, note, price")
    .eq("active", true)
    .order("sort_order", { ascending: true });
  if (error) throw error;

  const grouped: Partial<Record<CategorySlug, Product[]>> = {};
  for (const row of data as Pick<ProductRow, "id" | "category_slug" | "name" | "note" | "price">[]) {
    const list = grouped[row.category_slug] ?? [];
    list.push({ id: row.id, name: row.name, note: row.note, price: row.price });
    grouped[row.category_slug] = list;
  }
  return grouped;
}

/* -------------------------------------------------------------------------- */
/* Orders                                                                      */
/* -------------------------------------------------------------------------- */

export async function readOrders(): Promise<Record<string, Order>> {
  await ensureSeeded();
  const { data, error } = await getSupabaseAdmin()
    .from("orders")
    .select("*")
    .order("created_ts", { ascending: true });
  if (error) throw error;

  const orders: Record<string, Order> = {};
  for (const row of data as OrderRow[]) orders[row.id] = toOrder(row);
  return orders;
}

export async function readOrder(id: string): Promise<Order | null> {
  const { data, error } = await getSupabaseAdmin()
    .from("orders")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data ? toOrder(data as OrderRow) : null;
}

export async function insertOrder(order: Order): Promise<Order> {
  const { data, error } = await getSupabaseAdmin()
    .from("orders")
    .insert(fromOrder(order))
    .select("*")
    .single();
  if (error) throw error;
  return toOrder(data as OrderRow);
}

export async function upsertOrder(order: Order): Promise<Order> {
  const { data, error } = await getSupabaseAdmin()
    .from("orders")
    .upsert(fromOrder(order), { onConflict: "id" })
    .select("*")
    .single();
  if (error) throw error;
  return toOrder(data as OrderRow);
}

export async function deleteOrder(id: string): Promise<void> {
  const { error } = await getSupabaseAdmin().from("orders").delete().eq("id", id);
  if (error) throw error;
}
