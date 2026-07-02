import { useMemo } from 'react';

const COLORS = ['#f94144', '#f3722c', '#f9c74f', '#90be6d', '#43aa8b', '#577590', '#c77dff'];

export default function Confetti({ count = 60 }: { count?: number }) {
  const pieces = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        left: `${Math.random() * 100}%`,
        background: COLORS[i % COLORS.length],
        animationDelay: `${Math.random() * 2.5}s`,
        animationDuration: `${2.5 + Math.random() * 2}s`,
        width: `${6 + Math.random() * 6}px`,
        height: `${8 + Math.random() * 8}px`,
      })),
    [count],
  );

  return (
    <div className="confetti" aria-hidden="true">
      {pieces.map((style, i) => (
        <span key={i} className="confetti-piece" style={style} />
      ))}
    </div>
  );
}
