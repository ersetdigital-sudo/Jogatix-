/** Formatting helpers shared across pages. */

/** `51500` -> `"Rp51.500"` (matches the original rupiah() helper). */
export function rupiah(value: number): string {
  return "Rp" + Number(value).toLocaleString("id-ID");
}

/** `51500` -> `"Rp 51.500"` (spaced variant used in checkout summaries). */
export function rupiahSpaced(value: number): string {
  return "Rp " + Number(value).toLocaleString("id-ID");
}

/** Strips spaces and dashes from a customer identifier before validation. */
export function normalizeCustomerId(raw: string): string {
  return raw.trim().replace(/[\s-]/g, "");
}

/** Builds a wa.me link, converting a leading local `0` to the `62` country code. */
export function toWhatsAppLink(phone: string, text: string): string {
  let digits = (phone || "").replace(/[^0-9]/g, "");
  if (digits.startsWith("0")) digits = "62" + digits.slice(1);
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
}
