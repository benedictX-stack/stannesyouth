import { useEffect, useRef } from 'react';
import * as THREE from 'three';

// Ensure THREE is available globally for the threejs-components library
if (typeof window !== 'undefined') {
  (window as any).THREE = THREE;
}

export default function TubesCursor() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const appRef = useRef<any>(null);

  useEffect(() => {
    let lastTouch: { x: number; y: number } | null = null;
    let interval: any = null;

    const dispatchMouseMove = (x: number, y: number) => {
      const options = {
        clientX: x,
        clientY: y,
        bubbles: true,
        cancelable: true,
        view: window
      };
      
      const mouseEvent = new MouseEvent('mousemove', options);
      const pointerEvent = new PointerEvent('pointermove', { ...options, pointerType: 'touch' });
      
      window.dispatchEvent(mouseEvent);
      window.dispatchEvent(pointerEvent);
      document.dispatchEvent(mouseEvent);
      document.dispatchEvent(pointerEvent);
    };

    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      if (touch) {
        lastTouch = { x: touch.clientX, y: touch.clientY };
        dispatchMouseMove(lastTouch.x, lastTouch.y);
        
        if (interval) clearInterval(interval);
        interval = setInterval(() => {
          if (lastTouch) dispatchMouseMove(lastTouch.x, lastTouch.y);
        }, 16);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      const touch = e.touches[0];
      if (touch) {
        lastTouch = { x: touch.clientX, y: touch.clientY };
        dispatchMouseMove(lastTouch.x, lastTouch.y);
      }
    };

    const handleTouchEnd = () => {
      lastTouch = null;
      if (interval) {
        clearInterval(interval);
        interval = null;
      }
    };

    window.addEventListener('touchstart', handleTouchStart, { passive: false });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd);
    window.addEventListener('touchcancel', handleTouchEnd);

    const initTimer = setTimeout(() => {
      // @ts-ignore
      import('https://cdn.jsdelivr.net/npm/threejs-components@0.0.19/build/cursors/tubes1.min.js')
        .then(module => {
          const createTubesCursor = module.default;
          if (canvasRef.current) {
            const app = createTubesCursor(canvasRef.current, {
              tubes: {
                // Sunset Boulevard Palette: Deep Purple, Hot Pink, Orange, Gold
                colors: ["#2d3436", "#FF0080", "#FF8C00", "#40E0D0"], 
                lights: {
                  intensity: 200,
                  // Warm sunset lighting
                  colors: ["#FF0080", "#FF8C00", "#FF0055"] 
                }
              }
            });
            appRef.current = app;
          }
        })
        .catch(err => console.error("Failed to load TubesCursor module:", err));
    }, 100);

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('touchcancel', handleTouchEnd);
      if (interval) clearInterval(interval);
      clearTimeout(initTimer);
      if (appRef.current && typeof appRef.current.dispose === 'function') {
        appRef.current.dispose();
      }
    };
  }, []);

  const handleClick = () => {
    // Optional: Interaction on click
  };

  return (
    <div 
      onClick={handleClick} 
      className="fixed inset-0 z-0 h-screen w-screen bg-[#000000] overflow-hidden cursor-pointer"
    >
      <canvas ref={canvasRef} className="block w-full h-full opacity-80" />
      {/* Overlay to darken slightly and blend */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-black/60 via-transparent to-black/90"></div>
    </div>
  );
}
