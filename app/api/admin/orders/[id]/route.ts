import { NextResponse } from "next/server";
import { apiError, readJsonBody, requireAdmin, serverError } from "@/lib/api";
import { deleteOrder, readOrder, upsertOrder } from "@/lib/supabase/store";
import { parseOrderInput } from "@/lib/transactions";

/**
 * Creates or updates a single order from the admin console. Also covers
 * "Transaksi Manual", where the admin adds a record that never went through
 * checkout. The id in the URL is authoritative.
 */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const { id } = await params;
    const existing = await readOrder(id);
    const order = parseOrderInput(await readJsonBody(request), existing);
    if (!order) return apiError("Data transaksi tidak valid.");

    return NextResponse.json({ order: await upsertOrder({ ...order, id }) });
  } catch (error) {
    return serverError(error);
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const { id } = await params;
    await deleteOrder(id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return serverError(error);
  }
}
