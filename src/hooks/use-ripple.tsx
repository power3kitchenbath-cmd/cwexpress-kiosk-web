import { useCallback, useState } from "react";

interface Ripple {
  key: number;
  x: number;
  y: number;
  size: number;
}

export const useRipple = () => {
  const [ripples, setRipples] = useState<Ripple[]>([]);

  const addRipple = useCallback((event: React.MouseEvent<HTMLElement>) => {
    const button = event.currentTarget;
    const rect = button.getBoundingClientRect();
    
    // Calculate click position relative to button
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    // Calculate ripple size (diameter should cover the entire button)
    const size = Math.max(rect.width, rect.height) * 2;
    
    const newRipple: Ripple = {
      key: Date.now(),
      x,
      y,
      size,
    };

    setRipples((prev) => [...prev, newRipple]);

    // Remove ripple after animation completes
    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.key !== newRipple.key));
    }, 600);
  }, []);

  const rippleElements = ripples.map((ripple) => (
    <span
      key={ripple.key}
      className="absolute rounded-full bg-current opacity-30 animate-ripple pointer-events-none"
      style={{
        left: ripple.x,
        top: ripple.y,
        width: ripple.size,
        height: ripple.size,
        transform: 'translate(-50%, -50%) scale(0)',
      }}
    />
  ));

  return { addRipple, rippleElements };
};
