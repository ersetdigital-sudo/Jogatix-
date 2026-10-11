import { NextResponse } from "next/server";
import { apiError, readJsonBody, requireAdmin, serverError } from "@/lib/api";
import { readSettings, writeSettings } from "@/lib/supabase/store";
import { parseSettingsInput } from "@/lib/validation";

export const dynamic = "force-dynamic";

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    return NextResponse.json({ settings: await readSettings() });
  } catch (error) {
    return serverError(error);
  }
}

export async function PUT(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const current = await readSettings();
    const settings = parseSettingsInput(await readJsonBody(request), current);
    if (!settings) return apiError("Pengaturan tidak valid.");
    return NextResponse.json({ settings: await writeSettings(settings) });
  } catch (error) {
    return serverError(error);
  }
}
