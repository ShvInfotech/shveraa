// Utility helper for client-side device image upload and automatic canvas compression
// Allows uploading high-res photos from computer/phone while keeping storage lean & fast

/**
 * Compresses an image File using an in-memory HTML5 Canvas.
 * @param {File} file - The uploaded image file from device.
 * @param {Object} options - Max dimensions & quality.
 * @returns {Promise<string>} - Resolves to an optimized base64 data URL.
 */
export const compressImageFile = (file, options = {}) => {
  const {
    maxWidth = 900,
    maxHeight = 900,
    quality = 0.78,
    outputType = 'image/jpeg',
  } = options;

  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith('image/')) {
      return reject(new Error('Selected file is not an image.'));
    }

    const reader = new FileReader();

    reader.onload = (readerEvent) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Calculate aspect-ratio preserved dimensions
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        // Draw onto canvas
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        // Clean high quality smoothing
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        // Export as compressed data URL
        const dataUrl = canvas.toDataURL(outputType, quality);
        resolve(dataUrl);
      };

      img.onerror = () => reject(new Error('Failed to load image for processing.'));
      img.src = readerEvent.target.result;
    };

    reader.onerror = () => reject(new Error('Failed to read image file.'));
    reader.readAsDataURL(file);
  });
};

/**
 * Handles batch multi-file upload from device with progress feedback.
 * @param {FileList|File[]} files - Files selected by the user.
 * @param {Object} options - Compression options.
 * @returns {Promise<string[]>} - Array of compressed base64 data URLs.
 */
export const processMultipleImageFiles = async (files, options = {}) => {
  if (!files || files.length === 0) return [];
  const fileArray = Array.from(files);
  const results = [];

  for (const file of fileArray) {
    if (file.type.startsWith('image/')) {
      try {
        const compressed = await compressImageFile(file, options);
        results.push(compressed);
      } catch (err) {
        console.warn('Error compressing image:', file.name, err);
      }
    }
  }

  return results;
};
