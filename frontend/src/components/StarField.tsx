'use client';

import { useEffect, useRef } from 'react';

/** Generates a subtle animated star field canvas for the background */
export default function StarField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Resize to fill viewport
    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Create star data
    const STAR_COUNT = 160;
    const stars = Array.from({ length: STAR_COUNT }, () => ({
      x:         Math.random() * canvas.width,
      y:         Math.random() * canvas.height,
      r:         Math.random() * 1.4 + 0.2,
      opacity:   Math.random(),
      speed:     Math.random() * 0.3 + 0.05,
      direction: Math.random() * Math.PI * 2,
      twinkle:   Math.random() * Math.PI * 2, // phase offset
    }));

    let frame = 0;
    let rafId: number;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      frame++;
      stars.forEach((s) => {
        // Twinkle
        const opacity = 0.2 + 0.6 * Math.abs(Math.sin(s.twinkle + frame * 0.008));
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(200, 230, 255, ${opacity})`;
        ctx.fill();

        // Slow drift
        s.x += Math.cos(s.direction) * s.speed;
        s.y += Math.sin(s.direction) * s.speed;

        // Wrap around edges
        if (s.x < 0) s.x = canvas.width;
        if (s.x > canvas.width) s.x = 0;
        if (s.y < 0) s.y = canvas.height;
        if (s.y > canvas.height) s.y = 0;
      });

      rafId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ opacity: 0.6 }}
      aria-hidden="true"
    />
  );
}
