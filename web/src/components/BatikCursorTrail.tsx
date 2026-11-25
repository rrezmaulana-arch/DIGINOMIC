import React, { useEffect, useRef } from 'react';

interface BatikParticle {
  x: number;
  y: number;
  size: number;
  rotation: number;
  rotationSpeed: number;
  alpha: number;
  decay: number;
  color: string;
}

const BATIK_COLORS = ['#caa152', '#a87226', '#d8b467', '#8c5e2a'];

function drawKawungMotif(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  rotation: number,
  alpha: number,
  color: string
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation);
  ctx.globalAlpha = Math.max(0, alpha);
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 1.1;

  const petalOffset = size * 0.52;
  const rx = size * 0.28;
  const ry = size * 0.48;

  for (let i = 0; i < 4; i++) {
    ctx.save();
    ctx.rotate((i * Math.PI) / 2);
    ctx.beginPath();
    ctx.ellipse(0, -petalOffset, rx, ry, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  ctx.beginPath();
  ctx.arc(0, 0, Math.max(1.2, size * 0.14), 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

export const BatikCursorTrail: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const isTouch = window.matchMedia('(pointer: coarse)').matches;
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (isTouch || prefersReduced) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const particles: BatikParticle[] = [];
    let lastX = -999;
    let lastY = -999;
    let rafId = 0;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(window.innerWidth * dpr);
      canvas.height = Math.floor(window.innerHeight * dpr);
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    window.addEventListener('resize', resize);

    const onMouseMove = (e: MouseEvent) => {
      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;
      if (Math.hypot(dx, dy) < 24) return;
      lastX = e.clientX;
      lastY = e.clientY;

      particles.push({
        x: e.clientX,
        y: e.clientY,
        size: 9 + Math.random() * 5,
        rotation: Math.random() * Math.PI,
        rotationSpeed: (Math.random() - 0.5) * 0.025,
        alpha: 0.65,
        decay: 0.016 + Math.random() * 0.008,
        color: BATIK_COLORS[Math.floor(Math.random() * BATIK_COLORS.length)],
      });

      if (particles.length > 18) particles.shift();
      if (!rafId) rafId = window.requestAnimationFrame(render);
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });

    const render = () => {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.alpha -= p.decay;
        p.size += 0.18;
        p.rotation += p.rotationSpeed;

        if (p.alpha <= 0) {
          particles.splice(i, 1);
          continue;
        }
        drawKawungMotif(ctx, p.x, p.y, p.size, p.rotation, p.alpha, p.color);
      }

      rafId = particles.length ? window.requestAnimationFrame(render) : 0;
    };

    return () => {
      window.cancelAnimationFrame(rafId);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMouseMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none z-[60]"
    />
  );
};
