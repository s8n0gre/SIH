import React, { useEffect, useState } from 'react';

interface PageTransitionProps {
  children: React.ReactNode;
  trigger?: any;
}

export const PageTransition: React.FC<PageTransitionProps> = ({ children, trigger }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(false);
    const timer = setTimeout(() => setIsVisible(true), 50);
    return () => clearTimeout(timer);
  }, [trigger]);

  return (
    <div className={isVisible ? 'page-transition-enter' : ''} style={{ opacity: isVisible ? 1 : 0 }}>
      {children}
    </div>
  );
};
