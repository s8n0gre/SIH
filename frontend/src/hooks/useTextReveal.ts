import { useEffect, useRef, useState } from 'react';

interface TextRevealOptions {
  threshold?: number;
  rootMargin?: string;
  stagger?: boolean;
  staggerDelay?: number;
}

export const useTextReveal = (options: TextRevealOptions = {}) => {
  const { threshold = 0.2, rootMargin = '0px', stagger = false, staggerDelay = 100 } = options;
  const ref = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          
          if (stagger) {
            const children = Array.from(element.children);
            children.forEach((child, index) => {
              setTimeout(() => {
                child.classList.add('text-animate-in');
              }, index * staggerDelay);
            });
          } else {
            element.classList.add('text-animate-in');
          }
          
          observer.unobserve(element);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [threshold, rootMargin, stagger, staggerDelay]);

  return { ref, isVisible };
};
