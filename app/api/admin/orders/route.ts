import { NextResponse } from "next/server";
import { requireAdmin, serverError } from "@/lib/api";
import { readOrders } from "@/lib/supabase/store";

export const dynamic = "force-dynamic";

/** Every order, oldest first — the admin console renders them newest first. */
export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    return NextResponse.json({ orders: await readOrders() });
  } catch (error) {
    return serverError(error);
  }
}
