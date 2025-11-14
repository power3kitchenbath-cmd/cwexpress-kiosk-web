import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface ProgressiveImageProps {
  src: string;
  thumbnailSrc?: string;
  alt: string;
  className?: string;
  aspectRatio?: string;
  loading?: "lazy" | "eager";
  onLoad?: () => void;
}

/**
 * Progressive image component with blur-up effect
 * Shows a blurred thumbnail while loading the full-size image
 */
export const ProgressiveImage = ({
  src,
  thumbnailSrc,
  alt,
  className,
  aspectRatio = "aspect-[4/3]",
  loading = "lazy",
  onLoad,
}: ProgressiveImageProps) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(thumbnailSrc || src);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Reset state when src changes
    setImageLoaded(false);
    setIsLoading(true);
    setCurrentSrc(thumbnailSrc || src);

    // Preload the full-size image
    const img = new Image();
    img.src = src;
    
    img.onload = () => {
      setCurrentSrc(src);
      setImageLoaded(true);
      setIsLoading(false);
      onLoad?.();
    };

    img.onerror = () => {
      setIsLoading(false);
      // Keep showing thumbnail or placeholder on error
    };

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [src, thumbnailSrc, onLoad]);

  return (
    <div className={cn("relative overflow-hidden bg-muted", aspectRatio)}>
      {/* Loading skeleton */}
      {isLoading && !thumbnailSrc && (
        <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-muted via-muted/50 to-muted" />
      )}

      {/* Image with blur-up effect */}
      <img
        src={currentSrc}
        alt={alt}
        loading={loading}
        className={cn(
          "w-full h-full object-cover transition-all duration-500 ease-out",
          // Blur effect while loading
          !imageLoaded && thumbnailSrc && "blur-md scale-110",
          // Sharp and normal scale when loaded
          imageLoaded && "blur-0 scale-100",
          // Opacity transition
          isLoading && !thumbnailSrc ? "opacity-0" : "opacity-100",
          className
        )}
        style={{
          // Prevent layout shift
          imageRendering: !imageLoaded ? "auto" : "auto",
        }}
      />

      {/* Shimmer overlay for loading state */}
      {isLoading && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-background/10 to-transparent animate-[shimmer_2s_infinite]" />
      )}
    </div>
  );
};

// Add shimmer animation to tailwind config if not present
// @keyframes shimmer {
//   0% { transform: translateX(-100%); }
//   100% { transform: translateX(100%); }
// }
