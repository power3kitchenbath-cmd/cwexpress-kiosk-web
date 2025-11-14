interface CompressionResult {
  file: File;
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
}

interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  outputFormat?: 'image/jpeg' | 'image/png' | 'image/webp';
}

/**
 * Checks if the browser supports WebP format
 */
const supportsWebP = (() => {
  const elem = document.createElement('canvas');
  if (elem.getContext && elem.getContext('2d')) {
    return elem.toDataURL('image/webp').indexOf('data:image/webp') === 0;
  }
  return false;
})();

/**
 * Compresses an image file by resizing and reducing quality
 * Uses WebP format by default for best compression, falls back to JPEG if unsupported
 * @param file - The original image file
 * @param options - Compression options
 * @returns Promise with the compressed file and compression stats
 */
export const compressImage = async (
  file: File,
  options: CompressionOptions = {}
): Promise<CompressionResult> => {
  // Default to WebP for best compression, fallback to JPEG if not supported
  const defaultFormat = supportsWebP ? 'image/webp' : 'image/jpeg';
  
  const {
    maxWidth = 1200,
    maxHeight = 1200,
    quality = 0.85,
    outputFormat = defaultFormat
  } = options;

  return new Promise((resolve, reject) => {
    const originalSize = file.size;
    const img = new Image();
    const reader = new FileReader();

    reader.onload = (e) => {
      img.src = e.target?.result as string;
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    img.onload = () => {
      try {
        // Calculate new dimensions while maintaining aspect ratio
        let { width, height } = img;
        
        if (width > maxWidth || height > maxHeight) {
          const aspectRatio = width / height;
          
          if (width > height) {
            width = maxWidth;
            height = Math.round(width / aspectRatio);
          } else {
            height = maxHeight;
            width = Math.round(height * aspectRatio);
          }
        }

        // Create canvas and draw resized image
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }

        // Use better image smoothing
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        
        // Draw the image
        ctx.drawImage(img, 0, 0, width, height);

        // Convert canvas to blob with specified format
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Failed to compress image'));
              return;
            }

            // Create new file from blob with appropriate extension
            const fileExtension = outputFormat.split('/')[1];
            const baseName = file.name.replace(/\.[^.]+$/, '');
            const fileName = `${baseName}.${fileExtension}`;
            
            const compressedFile = new File([blob], fileName, {
              type: outputFormat,
              lastModified: Date.now(),
            });

            const compressedSize = compressedFile.size;
            const compressionRatio = ((originalSize - compressedSize) / originalSize) * 100;

            resolve({
              file: compressedFile,
              originalSize,
              compressedSize,
              compressionRatio: Math.max(0, compressionRatio),
            });
          },
          outputFormat,
          quality
        );
      } catch (error) {
        reject(error);
      }
    };

    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };

    reader.readAsDataURL(file);
  });
};

/**
 * Formats file size in human-readable format
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};

/**
 * Checks if a file needs compression
 */
export const shouldCompressImage = (file: File, maxSize: number = 500 * 1024): boolean => {
  return file.size > maxSize;
};

/**
 * Returns the optimal output format based on browser support and input type
 */
export const getOptimalFormat = (inputFile: File): 'image/webp' | 'image/jpeg' | 'image/png' => {
  // Use WebP if supported (best compression)
  if (supportsWebP) {
    return 'image/webp';
  }
  
  // For PNG with transparency, keep as PNG if WebP not supported
  if (inputFile.type === 'image/png') {
    return 'image/png';
  }
  
  // Default to JPEG
  return 'image/jpeg';
};

/**
 * Gets the format name for display
 */
export const getFormatName = (format: string): string => {
  const formatMap: Record<string, string> = {
    'image/webp': 'WebP',
    'image/jpeg': 'JPEG',
    'image/png': 'PNG',
  };
  return formatMap[format] || format;
};
