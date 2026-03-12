import { useEffect, useRef, useState } from 'react';

interface ScrollAnimationOptions {
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
}

export const useScrollAnimation = (options: ScrollAnimationOptions = {}) => {
  const { threshold = 0.1, rootMargin = '0px', triggerOnce = true } = options;
  const ref = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (triggerOnce) observer.unobserve(element);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [threshold, rootMargin, triggerOnce]);

  return { ref, isVisible };
};

export const useStaggerAnimation = (count: number, delay: number = 50) => {
  const [visibleItems, setVisibleItems] = useState<number[]>([]);
  const { ref, isVisible } = useScrollAnimation();

  useEffect(() => {
    if (isVisible) {
      Array.from({ length: count }).forEach((_, i) => {
        setTimeout(() => {
          setVisibleItems(prev => [...prev, i]);
        }, i * delay);
      });
    }
  }, [isVisible, count, delay]);

  return { ref, visibleItems };
};
