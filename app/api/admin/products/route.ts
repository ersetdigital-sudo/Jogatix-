import { NextResponse } from "next/server";
import { apiError, readJsonBody, requireAdmin, serverError } from "@/lib/api";
import { readProducts, writeProducts } from "@/lib/supabase/store";
import { parseProductsInput } from "@/lib/validation";

export const dynamic = "force-dynamic";

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    return NextResponse.json({ products: await readProducts() });
  } catch (error) {
    return serverError(error);
  }
}

/**
 * Replaces the whole catalog. The admin console edits products as one array, so
 * sending the full list keeps ordering and deletions unambiguous.
 */
export async function PUT(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const products = parseProductsInput(await readJsonBody(request));
    if (!products) return apiError("Daftar produk tidak valid.");
    return NextResponse.json({ products: await writeProducts(products) });
  } catch (error) {
    return serverError(error);
  }
}
