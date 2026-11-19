"use client";

import { useMemo } from "react";

/** Deterministic pseudo-random so SSR and client markup match. */
function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

interface Star {
  x: number;
  y: number;
  size: number;
  delay: number;
  duration: number;
  opacity: number;
}

export function StarField() {
  const stars = useMemo<Star[]>(() => {
    const rnd = mulberry32(20260214);
    return Array.from({ length: 120 }, () => {
      const size = rnd() < 0.85 ? 1 : 2;
      return {
        x: Math.round(rnd() * 10000) / 100, // 0-100, 2 decimals
        y: Math.round(rnd() * 10000) / 100,
        size,
        delay: Math.round(rnd() * 600) / 10,
        duration: 2.5 + Math.round(rnd() * 40) / 10,
        opacity: 0.25 + Math.round(rnd() * 50) / 100,
      };
    });
  }, []);

  return (
    <div aria-hidden className="starfield pointer-events-none fixed inset-0 overflow-hidden">
      {/* nebula orbs */}
      <div className="nebula nebula-cyan" />
      <div className="nebula nebula-violet" />
      <div className="nebula nebula-faint" />
      {/* stars */}
      {stars.map((s, i) => (
        <span
          key={i}
          className="star"
          style={{
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: s.size,
            height: s.size,
            animationDelay: `${s.delay}s`,
            animationDuration: `${s.duration}s`,
            opacity: s.opacity,
          }}
        />
      ))}
    </div>
  );
}
