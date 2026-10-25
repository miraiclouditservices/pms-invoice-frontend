'use client';

import React, { useEffect, useState, useRef } from 'react';

export const CustomCursor: React.FC = () => {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  const mousePos = useRef({ x: -100, y: -100 });
  const ringPos = useRef({ x: -100, y: -100 });

  useEffect(() => {
    setMounted(true);

    const onMouseMove = (e: MouseEvent) => {
      mousePos.current = { x: e.clientX, y: e.clientY };
      if (!visible) setVisible(true);

      const target = e.target as HTMLElement | null;
      if (target) {
        const isInteractive = target.closest('a, button, input, select, textarea, [role="button"], .btn');
        setIsHovered(!!isInteractive);
      }
    };

    const onMouseLeave = () => setVisible(false);
    const onMouseEnter = () => setVisible(true);

    window.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseleave', onMouseLeave);
    document.addEventListener('mouseenter', onMouseEnter);

    let animationFrameId: number;
    const render = () => {
      const lerp = 0.18;
      ringPos.current.x += (mousePos.current.x - ringPos.current.x) * lerp;
      ringPos.current.y += (mousePos.current.y - ringPos.current.y) * lerp;

      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${mousePos.current.x}px, ${mousePos.current.y}px, 0) translate(-50%, -50%)`;
      }
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ringPos.current.x}px, ${ringPos.current.y}px, 0) translate(-50%, -50%) ${isHovered ? 'scale(1.4)' : 'scale(1)'}`;
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseleave', onMouseLeave);
      document.removeEventListener('mouseenter', onMouseEnter);
      cancelAnimationFrame(animationFrameId);
    };
  }, [visible, isHovered]);

  if (!mounted) return null;

  return (
    <>
      {/* Outer trailing circular ring matching uploaded image */}
      <div
        ref={ringRef}
        aria-hidden="true"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '34px',
          height: '34px',
          borderRadius: '50%',
          border: '1.5px solid #60A5FA',
          backgroundColor: 'rgba(219, 234, 254, 0.45)',
          pointerEvents: 'none',
          zIndex: 999999,
          opacity: visible ? 1 : 0,
          transition: 'opacity 0.25s ease, background-color 0.2s ease, border-color 0.2s ease',
          willChange: 'transform',
        }}
      />
      {/* Inner sharp solid blue dot matching uploaded image */}
      <div
        ref={dotRef}
        aria-hidden="true"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          backgroundColor: '#2563EB',
          pointerEvents: 'none',
          zIndex: 999999,
          opacity: visible ? 1 : 0,
          transition: 'opacity 0.2s ease',
          willChange: 'transform',
        }}
      />
    </>
  );
};
