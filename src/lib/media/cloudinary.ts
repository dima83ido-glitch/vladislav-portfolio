import { v2 as cloudinary, type UploadApiOptions } from "cloudinary";

let configured = false;

export function isCloudinaryConfigured(): boolean {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
  );
}

function ensureConfigured() {
  if (configured) return;
  if (!isCloudinaryConfigured()) {
    throw new Error("Cloudinary is not configured");
  }
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
  configured = true;
}

function runUpload(buffer: Buffer, options: UploadApiOptions): Promise<{ url: string; publicId: string }> {
  ensureConfigured();

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(options, (error, result) => {
      if (error || !result) {
        reject(error ?? new Error("Cloudinary upload failed"));
        return;
      }
      resolve({ url: result.secure_url, publicId: result.public_id });
    });
    uploadStream.end(buffer);
  });
}

/**
 * Uploads a File/Blob straight from a Server Action's FormData — no
 * separate upload API route needed. Callers must check
 * isCloudinaryConfigured() first; this throws otherwise (same lazy-gate
 * pattern as getDb()/getStripeClient()).
 *
 * `resourceType` defaults to "image" (covers PNG/JPG/WEBP/SVG); pass "raw"
 * for non-image files (e.g. a future PDF/document upload) — Cloudinary
 * requires the correct resource type to serve the file back out correctly.
 */
export async function uploadMedia(
  file: File,
  folder: string,
  resourceType: "image" | "raw" = "image"
): Promise<{ url: string; publicId: string }> {
  const buffer = Buffer.from(await file.arrayBuffer());
  return runUpload(buffer, { folder: `vladislav-portfolio/${folder}`, resource_type: resourceType });
}

/**
 * Same upload path as uploadMedia, but forces a square face-aware crop plus
 * automatic quality/format compression — this is the project's stand-in for
 * a local image-processing step (no `sharp` dependency here), since
 * Cloudinary's own pipeline already does crop/resize/compress server-side.
 */
export async function uploadAvatarMedia(file: File): Promise<{ url: string; publicId: string }> {
  const buffer = Buffer.from(await file.arrayBuffer());
  return runUpload(buffer, {
    folder: "vladislav-portfolio/avatars",
    resource_type: "image",
    transformation: [
      { width: 512, height: 512, crop: "fill", gravity: "face", quality: "auto", fetch_format: "auto" },
    ],
  });
}

/**
 * Best-effort delete — cleanup must never block or fail the DB mutation
 * that already succeeded (a replaced/removed avatar or cover image is
 * already correct in the database even if this doesn't get around to
 * freeing the old asset). Errors are logged, never thrown.
 */
export async function deleteMedia(publicId: string, resourceType: "image" | "raw" = "image"): Promise<void> {
  try {
    ensureConfigured();
    await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
  } catch (error) {
    console.error(`Failed to delete media (publicId: ${publicId}):`, error);
  }
}
