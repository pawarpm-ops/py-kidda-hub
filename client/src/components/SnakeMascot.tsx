import { useRef } from 'react';
import EyeTrackingController from './EyeTrackingController';
import { useMouseTracking } from './useMouseTracking';

type SnakeMascotProps = {
  biting?: boolean;
};

export default function SnakeMascot({ biting = false }: SnakeMascotProps) {
  const shellRef = useRef<HTMLDivElement>(null);
  const look = useMouseTracking(shellRef);
  const alertClass = look.alert ? 'snake-stage-alert' : '';
  const activeClass = look.active ? 'snake-stage-active' : 'snake-stage-idle';

  return (
    <div ref={shellRef} className={`snake-stage ${alertClass} ${activeClass} ${biting ? 'snake-stage-bite' : ''}`} aria-hidden="true">
      <div className="snake-glow" />
      <div className="snake-particles">
        {Array.from({ length: 14 }).map((_, index) => <span key={index} />)}
      </div>
      <div
        className="snake-image-wrap"
        style={{
          transform: `translate3d(${look.x * 18}px, ${look.y * 12}px, 0) rotateX(${-look.y * 5}deg) rotateY(${look.x * 8}deg) rotateZ(${look.x * 1.6}deg)`
        }}
      >
        <img className="snake-image" src="/login-snake.png" alt="" />
        <EyeTrackingController look={look} />
        <div className="snake-tongue-flick" />
        <div className="snake-energy-rip" />
      </div>
      <div className="snake-bite-flash">Access granted</div>
    </div>
  );
}
