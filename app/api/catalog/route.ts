import { NextResponse } from "next/server";
import { serverError } from "@/lib/api";
import {
  readActiveProductsByCategory,
  readSettings,
  toPublicSettings,
} from "@/lib/supabase/store";

/**
 * Public storefront data: the customer-facing settings and every active product
 * grouped by category. Read-only and safe to cache per request; the admin
 * console changes both at runtime, so nothing is cached at build time.
 */
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [settings, products] = await Promise.all([
      readSettings(),
      readActiveProductsByCategory(),
    ]);
    return NextResponse.json({ settings: toPublicSettings(settings), products });
  } catch (error) {
    return serverError(error);
  }
}
