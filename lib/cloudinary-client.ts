/**
 * Browser-side Cloudinary calls. Every one of these starts by asking the
 * server for a signature, so the API secret never reaches the client.
 */

export const MAX_IMAGE_BYTES = 2 * 1024 * 1024;
export const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
export const ACCEPTED_IMAGE_LABEL = "JPG, PNG, atau WebP";

type Signature = {
  uploadUrl: string;
  apiKey: string;
  timestamp: number;
  signature: string;
  uploadPreset: string;
  folder: string;
};

/**
 * Returns a human-readable reason when the file cannot be accepted, or null
 * when it is fine. Checking before the upload keeps a bad file from ever
 * costing a transfer.
 */
export function validateImageFile(file: File): string | null {
  if (!(ACCEPTED_IMAGE_TYPES as readonly string[]).includes(file.type)) {
    return `Format tidak didukung. Gunakan ${ACCEPTED_IMAGE_LABEL}.`;
  }
  if (file.size > MAX_IMAGE_BYTES) {
    const mb = (file.size / (1024 * 1024)).toFixed(1);
    return `Ukuran file ${mb} MB melebihi batas 2 MB. Kompres dulu gambarnya.`;
  }
  return null;
}

/** Uploads straight to Cloudinary, reporting 0–100 as it goes. */
export async function uploadToCloudinary(
  file: File,
  onProgress?: (percent: number) => void
): Promise<{ secureUrl: string; publicId: string }> {
  const signResponse = await fetch("/api/admin/cloudinary", { method: "POST" });
  if (!signResponse.ok) {
    const data = (await signResponse.json().catch(() => null)) as { error?: string } | null;
    throw new Error(data?.error ?? "Gagal meminta tanda tangan unggahan.");
  }
  const sign = (await signResponse.json()) as Signature;

  const body = new FormData();
  body.append("file", file);
  body.append("api_key", sign.apiKey);
  body.append("timestamp", String(sign.timestamp));
  body.append("signature", sign.signature);
  body.append("upload_preset", sign.uploadPreset);
  body.append("folder", sign.folder);

  return new Promise((resolve, reject) => {
    const request = new XMLHttpRequest();
    request.open("POST", sign.uploadUrl);

    request.upload.onprogress = (event) => {
      if (event.lengthComputable) onProgress?.(Math.round((event.loaded / event.total) * 100));
    };

    request.onerror = () => reject(new Error("Koneksi terputus saat mengunggah."));

    request.onload = () => {
      if (request.status < 200 || request.status >= 300) {
        let message = "Gagal mengunggah gambar.";
        try {
          message = JSON.parse(request.responseText)?.error?.message || message;
        } catch {
          /* keep the generic message */
        }
        reject(new Error(message));
        return;
      }
      try {
        const result = JSON.parse(request.responseText) as { secure_url: string; public_id: string };
        resolve({ secureUrl: result.secure_url, publicId: result.public_id });
      } catch {
        reject(new Error("Respons Cloudinary tidak terbaca."));
      }
    };

    request.send(body);
  });
}

/**
 * Removes a replaced asset. Failures are deliberately swallowed by callers:
 * an orphaned image costs a little storage, but must never block the save
 * that follows it.
 */
export async function deleteCloudinaryAsset(publicId: string): Promise<boolean> {
  try {
    const response = await fetch(`/api/admin/cloudinary?public_id=${encodeURIComponent(publicId)}`, {
      method: "DELETE",
    });
    return response.ok;
  } catch {
    return false;
  }
}
