import { NextResponse } from "next/server";
import { apiError, requireAdmin, serverError } from "@/lib/api";
import {
  ASSET_FOLDER,
  CLOUDINARY_DESTROY_URL,
  CLOUDINARY_UPLOAD_URL,
  cloudinaryConfigured,
  destroySignature,
  uploadSignature,
} from "@/lib/cloudinary";

export const dynamic = "force-dynamic";

/**
 * The API secret never leaves this server. The browser only ever receives a
 * short-lived signature scoped to a single action, so a leaked token cannot
 * be reused to upload or delete anything else.
 */

/** Hands out a signature for one signed upload. */
export async function POST() {
  const denied = await requireAdmin();
  if (denied) return denied;

  if (!cloudinaryConfigured()) {
    return apiError("Cloudinary belum dikonfigurasi di environment variables.", 503);
  }

  try {
    return NextResponse.json({ uploadUrl: CLOUDINARY_UPLOAD_URL, ...uploadSignature() });
  } catch (error) {
    return serverError(error);
  }
}

/**
 * Hands out a signature for removing one asset. The public id is confined to
 * our own folder, so a compromised admin session still cannot wipe assets
 * belonging to another project.
 */
export async function DELETE(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  if (!cloudinaryConfigured()) {
    return apiError("Cloudinary belum dikonfigurasi di environment variables.", 503);
  }

  const publicId = new URL(request.url).searchParams.get("public_id")?.trim();
  if (!publicId) return apiError("public_id wajib diisi.");
  if (!publicId.startsWith(`${ASSET_FOLDER}/`)) {
    return apiError("Asset di luar folder Jogatix tidak boleh dihapus.", 403);
  }

  try {
    return NextResponse.json({ destroyUrl: CLOUDINARY_DESTROY_URL, ...destroySignature(publicId) });
  } catch (error) {
    return serverError(error);
  }
}
