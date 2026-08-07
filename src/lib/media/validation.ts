export type DetectedFileType = "png" | "jpeg" | "webp" | "svg" | "pdf";

/**
 * Sniffs the actual file format from its bytes rather than trusting the
 * browser-supplied `file.type`, which is just the client's guess (and
 * trivially spoofable) — this is what catches a renamed/corrupt file before
 * it reaches Cloudinary. Shared by every upload path (avatars, portfolio
 * cover images, and whatever comes next) so format support only needs to be
 * taught here once.
 */
export function detectFileType(buffer: Buffer): DetectedFileType | null {
  if (buffer.length < 12) return null;

  if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47) {
    return "png";
  }

  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return "jpeg";
  }

  if (
    buffer[0] === 0x52 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x46 &&
    buffer[8] === 0x57 &&
    buffer[9] === 0x45 &&
    buffer[10] === 0x42 &&
    buffer[11] === 0x50
  ) {
    return "webp";
  }

  // "%PDF-"
  if (
    buffer[0] === 0x25 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x44 &&
    buffer[3] === 0x46 &&
    buffer[4] === 0x2d
  ) {
    return "pdf";
  }

  // SVG is text (XML), not fixed magic bytes — look for an <svg tag (an
  // optional <?xml prolog may precede it) within the first slice of the file.
  const head = buffer.subarray(0, 1024).toString("utf8").trimStart();
  if (/^(<\?xml[^>]*>\s*)?<svg[\s>]/i.test(head)) {
    return "svg";
  }

  return null;
}
