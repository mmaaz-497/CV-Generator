/**
 * Photo pipeline (contract 5, research R7). Decodes a user-picked image, downscales
 * it so the longest side is ≤600px, and returns a JPEG data URL (quality 0.85).
 *
 * The image never leaves the device — decoding and resizing happen entirely in a
 * canvas in the browser (constitution Principle II). Caps state size (~≤200KB) so
 * keystroke re-renders stay fluid (Risk 3). Rejects on decode failure so the caller
 * can keep the prior photo and show an inline retry message.
 */
const MAX_EDGE = 600;
const JPEG_QUALITY = 0.85;

export function processPhoto(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith("image/")) {
      reject(new Error("Not an image file"));
      return;
    }

    const url = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      URL.revokeObjectURL(url);
      try {
        const { width, height } = img;
        if (!width || !height) {
          reject(new Error("Image has no dimensions"));
          return;
        }
        const scale = Math.min(1, MAX_EDGE / Math.max(width, height));
        const w = Math.round(width * scale);
        const h = Math.round(height * scale);

        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Canvas unavailable"));
          return;
        }
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL("image/jpeg", JPEG_QUALITY));
      } catch (err) {
        reject(err instanceof Error ? err : new Error("Photo processing failed"));
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not decode image"));
    };

    img.src = url;
  });
}
