import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface ImageComparisonSliderProps {
  beforeImage: string;
  afterImage: string;
  beforeLabel?: string;
  afterLabel?: string;
  className?: string;
}

export function ImageComparisonSlider({
  beforeImage,
  afterImage,
  beforeLabel = 'Original',
  afterLabel = 'Compressed',
  className,
}: ImageComparisonSliderProps) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = (clientX: number) => {
    if (!containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const percentage = (x / rect.width) * 100;
    setSliderPosition(percentage);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      handleMove(e.clientX);
    }
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (isDragging && e.touches[0]) {
      handleMove(e.touches[0].clientX);
    }
  };

  const handleStart = () => setIsDragging(true);
  const handleEnd = () => setIsDragging(false);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleEnd);
      window.addEventListener('touchmove', handleTouchMove);
      window.addEventListener('touchend', handleEnd);

      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleEnd);
        window.removeEventListener('touchmove', handleTouchMove);
        window.removeEventListener('touchend', handleEnd);
      };
    }
  }, [isDragging]);

  return (
    <div
      ref={containerRef}
      className={cn('relative overflow-hidden rounded-lg select-none', className)}
      style={{ aspectRatio: '16/9' }}
    >
      {/* After image (compressed) - full width */}
      <div className="absolute inset-0">
        <img
          src={afterImage}
          alt={afterLabel}
          className="w-full h-full object-cover"
          draggable={false}
        />
        <div className="absolute bottom-2 right-2 bg-background/80 backdrop-blur-sm px-2 py-1 rounded text-xs font-medium">
          {afterLabel}
        </div>
      </div>

      {/* Before image (original) - clipped */}
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
      >
        <img
          src={beforeImage}
          alt={beforeLabel}
          className="w-full h-full object-cover"
          draggable={false}
        />
        <div className="absolute bottom-2 left-2 bg-background/80 backdrop-blur-sm px-2 py-1 rounded text-xs font-medium">
          {beforeLabel}
        </div>
      </div>

      {/* Slider handle */}
      <div
        className="absolute inset-y-0 w-1 bg-primary cursor-ew-resize"
        style={{ left: `${sliderPosition}%`, transform: 'translateX(-50%)' }}
        onMouseDown={handleStart}
        onTouchStart={handleStart}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-primary rounded-full shadow-lg flex items-center justify-center">
          <div className="flex gap-0.5">
            <div className="w-0.5 h-4 bg-primary-foreground rounded" />
            <div className="w-0.5 h-4 bg-primary-foreground rounded" />
          </div>
        </div>
      </div>

      {/* Drag instruction overlay - shows on first render */}
      {sliderPosition === 50 && !isDragging && (
        <div className="absolute inset-0 bg-black/20 flex items-center justify-center pointer-events-none">
          <div className="bg-background/90 backdrop-blur-sm px-4 py-2 rounded-lg text-sm font-medium">
            ← Drag to compare →
          </div>
        </div>
      )}
    </div>
  );
}
