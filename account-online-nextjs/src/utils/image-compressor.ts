/**
 * Utility to compress and resize base64 images on the frontend before upload.
 * Reduces image size from ~5MB down to ~150KB-250KB, drastically improving network speed.
 */
export async function compressBase64Image(
  base64Str: string,
  maxWidth = 1200,
  maxHeight = 1200,
  quality = 0.78
): Promise<string> {
  if (typeof window === "undefined" || !base64Str) {
    return base64Str;
  }

  // Ensure prefix format
  const formattedBase64 = base64Str.startsWith("data:")
    ? base64Str
    : `data:image/jpeg;base64,${base64Str}`;

  return new Promise((resolve) => {
    const img = new Image();
    img.src = formattedBase64;
    img.onload = () => {
      let width = img.width;
      let height = img.height;

      // Calculate new dimensions keeping aspect ratio
      if (width > maxWidth || height > maxHeight) {
        if (width / height > maxWidth / maxHeight) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        } else {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve(base64Str);
        return;
      }

      // Smooth image rendering
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, 0, 0, width, height);

      // Export as JPEG with specified quality
      const compressedDataUrl = canvas.toDataURL("image/jpeg", quality);
      resolve(compressedDataUrl);
    };

    img.onerror = () => {
      // Return original on error
      resolve(base64Str);
    };
  });
}
