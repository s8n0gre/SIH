import React, { useRef, useState } from 'react';

interface AnimatedCardProps {
  children: React.ReactNode;
  className?: string;
  enableTilt?: boolean;
  enableGlow?: boolean;
  onClick?: () => void;
}

export const AnimatedCard: React.FC<AnimatedCardProps> = ({
  children,
  className = '',
  enableTilt = false,
  enableGlow = false,
  onClick
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [tiltStyle, setTiltStyle] = useState({});

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!enableTilt || !cardRef.current) return;

    const card = cardRef.current;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -5;
    const rotateY = ((x - centerX) / centerX) * 5;

    setTiltStyle({
      transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(10px)`,
      transition: 'transform 0.1s ease'
    });
  };

  const handleMouseLeave = () => {
    if (enableTilt) {
      setTiltStyle({
        transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px)',
        transition: 'transform 0.3s var(--ease-out-expo)'
      });
    }
  };

  return (
    <div
      ref={cardRef}
      className={`card card-interactive ${enableGlow ? 'hover-glow' : ''} ${className}`}
      style={enableTilt ? tiltStyle : undefined}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
    >
      {children}
    </div>
  );
};
