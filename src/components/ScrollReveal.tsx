import React from 'react';
import { useScrollAnimation } from '../hooks/useScrollAnimation';

interface ScrollRevealProps {
  children: React.ReactNode;
  animation?: 'up' | 'scale' | 'left' | 'right';
  delay?: number;
  className?: string;
}

export const ScrollReveal: React.FC<ScrollRevealProps> = ({
  children,
  animation = 'up',
  delay = 0,
  className = ''
}) => {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.1, triggerOnce: true });

  const animationClass = isVisible ? `reveal-${animation}` : '';
  const style = delay > 0 ? { animationDelay: `${delay}ms` } : {};

  return (
    <div
      ref={ref as React.RefObject<HTMLDivElement>}
      className={`${animationClass} ${className}`}
      style={{ ...style, opacity: isVisible ? 1 : 0 }}
    >
      {children}
    </div>
  );
};
