/**
 * Cloudinary signing. Server-only: this module reads the API secret and
 * imports node:crypto, so it must never be imported from a client component.
 * The delivery-URL helpers live in lib/cloudinary-url.ts instead.
 */
import { createHash } from "node:crypto";

const CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME ?? "";
const API_KEY = process.env.CLOUDINARY_API_KEY ?? "";
const API_SECRET = process.env.CLOUDINARY_API_SECRET ?? "";
const UPLOAD_PRESET = process.env.CLOUDINARY_UPLOAD_PRESET ?? "ml_default";

export const CLOUDINARY_UPLOAD_URL = CLOUD_NAME
  ? `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`
  : "";

export const CLOUDINARY_DESTROY_URL = CLOUD_NAME
  ? `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/destroy`
  : "";

/** All console assets land here, so cleanup can target one folder. */
export const ASSET_FOLDER = "jogatix";

export function cloudinaryConfigured(): boolean {
  return Boolean(CLOUD_NAME && API_KEY && API_SECRET);
}

/**
 * Cloudinary's signature: `key=value` pairs sorted by key, joined with `&`,
 * the API secret appended, then SHA-1. Signatures are short-lived, so the
 * caller must always include a fresh `timestamp`.
 */
export function signParams(params: Record<string, string | number>): string {
  const toSign = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join("&");
  return createHash("sha1").update(toSign + API_SECRET).digest("hex");
}

/** Params for one signed upload, ready to be posted next to the file. */
export function uploadSignature(): {
  timestamp: number;
  signature: string;
  apiKey: string;
  uploadPreset: string;
  folder: string;
} {
  const timestamp = Math.round(Date.now() / 1000);
  const params: Record<string, string | number> = {
    folder: ASSET_FOLDER,
    timestamp,
    upload_preset: UPLOAD_PRESET,
  };
  return {
    timestamp,
    signature: signParams(params),
    apiKey: API_KEY,
    uploadPreset: UPLOAD_PRESET,
    folder: ASSET_FOLDER,
  };
}

/** Params for removing an asset, so a replaced image does not leak storage. */
export function destroySignature(publicId: string): { timestamp: number; signature: string; apiKey: string } {
  const timestamp = Math.round(Date.now() / 1000);
  const params: Record<string, string | number> = { public_id: publicId, timestamp };
  return { timestamp, signature: signParams(params), apiKey: API_KEY };
}
