import { useEffect, useRef, useState } from 'react';

type SnakeMascotProps = {
  biting?: boolean;
};

export default function SnakeMascot({ biting = false }: SnakeMascotProps) {
  const shellRef = useRef<HTMLDivElement>(null);
  const [eye, setEye] = useState({ x: 0, y: 0 });

  useEffect(() => {
    let frame = 0;
    let target = { x: 0, y: 0 };

    const updateTarget = (event: MouseEvent) => {
      const box = shellRef.current?.getBoundingClientRect();
      if (!box) return;
      const centerX = box.left + box.width / 2;
      const centerY = box.top + box.height / 2;
      target = {
        x: Math.max(-1, Math.min(1, (event.clientX - centerX) / (box.width * 0.42))),
        y: Math.max(-1, Math.min(1, (event.clientY - centerY) / (box.height * 0.42)))
      };
    };

    const animate = () => {
      setEye((current) => ({
        x: current.x + (target.x - current.x) * 0.14,
        y: current.y + (target.y - current.y) * 0.14
      }));
      frame = window.requestAnimationFrame(animate);
    };

    window.addEventListener('mousemove', updateTarget, { passive: true });
    frame = window.requestAnimationFrame(animate);
    return () => {
      window.removeEventListener('mousemove', updateTarget);
      window.cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div ref={shellRef} className={`snake-stage ${biting ? 'snake-stage-bite' : ''}`} aria-hidden="true">
      <div className="snake-glow" />
      <svg className="snake-svg" viewBox="0 0 520 420" role="img">
        <defs>
          <radialGradient id="snakeSkin" cx="35%" cy="25%" r="75%">
            <stop offset="0%" stopColor="#63f3ff" />
            <stop offset="44%" stopColor="#1688ff" />
            <stop offset="100%" stopColor="#241169" />
          </radialGradient>
          <linearGradient id="capGrad" x1="0%" x2="100%">
            <stop offset="0%" stopColor="#10172a" />
            <stop offset="100%" stopColor="#4338ca" />
          </linearGradient>
          <filter id="snakeShadow" x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="0" dy="18" stdDeviation="18" floodColor="#020617" floodOpacity="0.45" />
          </filter>
        </defs>

        <path className="snake-coil snake-coil-back" d="M121 287c16-88 133-106 208-66 65 35 91 3 83-29-8-35-59-42-92-29" />
        <path className="snake-coil" d="M103 306c34 74 185 67 253 17 47-35 93-25 111 10 18 36-19 69-78 69H149c-57 0-87-39-46-96z" />

        <g className="snake-head" style={{ transform: `rotate(${eye.x * 3}deg) translate(${eye.x * 8}px, ${eye.y * 5}px)` }}>
          <ellipse cx="260" cy="178" rx="122" ry="100" fill="url(#snakeSkin)" filter="url(#snakeShadow)" />
          <path d="M170 154c38-44 128-69 205-10-24-72-151-104-205 10z" fill="#6ff6ff" opacity=".22" />
          <path d="M210 91l106-28 101 53-23 25-78-35-91 21z" fill="url(#capGrad)" filter="url(#snakeShadow)" />
          <path d="M223 127l91-21 80 35-13 18-70-28-81 18z" fill="#0f172a" opacity=".9" />
          <path d="M188 228c37 49 108 52 147 0-37 19-97 18-147 0z" fill="#f8fafc" />
          <path d="M218 242c31 25 67 25 91 0-30 12-58 12-91 0z" fill="#fb7185" />
          <ellipse cx="212" cy="167" rx="37" ry="43" fill="#020617" />
          <ellipse cx="310" cy="167" rx="37" ry="43" fill="#020617" />
          <circle cx={212 + eye.x * 10} cy={165 + eye.y * 10} r="18" fill="#e0faff" />
          <circle cx={310 + eye.x * 10} cy={165 + eye.y * 10} r="18" fill="#e0faff" />
          <circle cx={218 + eye.x * 13} cy={160 + eye.y * 13} r="8" fill="#0f172a" />
          <circle cx={316 + eye.x * 13} cy={160 + eye.y * 13} r="8" fill="#0f172a" />
          <path className="snake-tongue" d="M258 246c0 18-7 27-20 39m20-39c0 18 8 27 22 39" fill="none" stroke="#fb2f6f" strokeWidth="7" strokeLinecap="round" />
        </g>

        <g className="snake-code">
          <rect x="172" y="285" width="180" height="74" rx="14" fill="#08111f" stroke="#67e8f9" strokeWidth="4" />
          <path d="M221 309l36 22-36 22" fill="none" stroke="#67e8f9" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M278 349h38" stroke="#c084fc" strokeWidth="10" strokeLinecap="round" />
        </g>
      </svg>
      <div className="snake-bite-flash">Access granted</div>
    </div>
  );
}
