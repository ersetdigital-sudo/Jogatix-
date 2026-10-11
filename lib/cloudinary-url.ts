/**
 * Cloudinary delivery-URL helpers.
 *
 * Isomorphic and dependency-free on purpose: both the server components and
 * the browser import these, so nothing here may touch env vars or crypto.
 */

const UPLOAD_SEGMENT = "/image/upload/";

/**
 * Pulls the public id out of a delivery URL, e.g.
 * `.../image/upload/v1791/qris/jogatix.png` -> `qris/jogatix`.
 * Returns null for anything that is not a Cloudinary URL, including the
 * legacy base64 data URLs still sitting in existing rows.
 */
export function publicIdFromUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  const index = url.indexOf(UPLOAD_SEGMENT);
  if (index === -1) return null;

  const segments = url.slice(index + UPLOAD_SEGMENT.length).split("?")[0].split("/");

  if (segments[0] && /^v\d+$/.test(segments[0])) segments.shift();
  if (segments[0] && /^[a-z]{1,3}_[^/]+$/i.test(segments[0])) segments.shift();

  const publicId = segments.join("/").replace(/\.[a-z0-9]+$/i, "");
  return publicId || null;
}

/**
 * Injects delivery-time optimisation so every render costs the least
 * bandwidth it can: `f_auto` picks the lightest format the browser supports,
 * `q_auto` trims quality, and the caller passes the width the slot actually
 * needs instead of serving the original upload.
 *
 * `crop` defaults to false because these URLs carry QR codes: `c_fill`
 * without an explicit height would not crop today, but leaving it out keeps
 * a future width change from silently clipping a scannable code.
 */
export function cloudinarySrc(
  url: string | null | undefined,
  options: { width?: number; crop?: boolean } = {}
): string {
  if (!url) return "";
  if (!url.includes(UPLOAD_SEGMENT)) return url;

  const { width, crop = false } = options;
  const transforms = ["f_auto", "q_auto"];
  if (crop) transforms.push("c_fill");
  if (width) transforms.push(`w_${width}`);

  const firstSegment = url.slice(url.indexOf(UPLOAD_SEGMENT) + UPLOAD_SEGMENT.length).split("?")[0].split("/")[0];
  if (firstSegment.includes(",") && firstSegment.includes("_")) return url;

  return url.replace(UPLOAD_SEGMENT, `${UPLOAD_SEGMENT}${transforms.join(",")}/`);
}
