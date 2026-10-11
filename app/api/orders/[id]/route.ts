import { NextResponse } from "next/server";
import { apiError, serverError } from "@/lib/api";
import { readOrder } from "@/lib/supabase/store";

/**
 * Public order lookup for the "Cek Transaksi" page. IDs are treated as
 * case-insensitive so customers can paste what they copied from WhatsApp.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const order = await readOrder(decodeURIComponent(id).trim().toUpperCase());
    if (!order) return apiError("Transaksi tidak ditemukan.", 404);
    return NextResponse.json({ order });
  } catch (error) {
    return serverError(error);
  }
}
