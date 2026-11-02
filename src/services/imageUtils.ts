/**
 * Image Utilities for Institutional Branding & Face Photo Uploads
 * Converts files (PNG, JPG, WEBP, SVG) to optimized Base64 Data URLs
 */

export async function processImageUpload(file: File, maxWidth = 512, maxHeight = 512): Promise<string> {
  return new Promise((resolve, reject) => {
    // If SVG, read as DataURL directly to keep vector fidelity
    if (file.type === 'image/svg+xml') {
      const reader = new FileReader();
      reader.onload = e => resolve(e.target?.result as string);
      reader.onerror = err => reject(err);
      reader.readAsDataURL(file);
      return;
    }

    const reader = new FileReader();
    reader.onload = e => {
      const img = new window.Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }

        // Keep transparent background for PNG/WEBP
        if (file.type === 'image/jpeg' || file.type === 'image/jpg') {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, width, height);
        }

        ctx.drawImage(img, 0, 0, width, height);

        const mime = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
        const quality = mime === 'image/png' ? undefined : 0.92;
        const dataUrl = canvas.toDataURL(mime, quality);
        resolve(dataUrl);
      };
      img.onerror = () => resolve(e.target?.result as string);
      img.src = e.target?.result as string;
    };
    reader.onerror = err => reject(err);
    reader.readAsDataURL(file);
  });
}
