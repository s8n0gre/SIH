import { useEffect, useRef } from 'react';

const MobileScrollHandle: React.FC = () => {
  const handleRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLElement | null>(null);
  const stateRef = useRef({
    isDragging: false,
    startY: 0,
    startScrollTop: 0,
    handleHeight: 80,
    trackHeight: 0,
    trackOffsetY: 80,
    // Physics properties
    velocity: 0,
    lastY: 0,
    lastTime: 0,
    isInertia: false
  });

  useEffect(() => {
    const handle = handleRef.current;
    const track = trackRef.current;
    if (!handle || !track) return;

    const findContainer = () => {
      scrollContainerRef.current = document.querySelector('.mobile-scroll-container') as HTMLElement;
      if (scrollContainerRef.current) {
        stateRef.current.trackHeight = window.innerHeight - 160;
        updateHandleSize();
      }
    };

    const updateHandleSize = () => {
      const container = scrollContainerRef.current;
      if (!container) return;
      const viewportRatio = container.clientHeight / container.scrollHeight;
      stateRef.current.handleHeight = Math.max(80, Math.min(160, stateRef.current.trackHeight * viewportRatio));
      handle.style.height = `${stateRef.current.handleHeight}px`;
    };

    const syncUI = () => {
      const container = scrollContainerRef.current;
      if (!container || stateRef.current.isDragging || stateRef.current.isInertia) return;

      const scrollRange = container.scrollHeight - container.clientHeight;
      if (scrollRange <= 0) return;

      const scrollPercent = container.scrollTop / scrollRange;
      const scrollableTrackArea = stateRef.current.trackHeight - stateRef.current.handleHeight;
      handle.style.top = `${stateRef.current.trackOffsetY + (scrollPercent * scrollableTrackArea)}px`;
    };

    // Physics Engine loop
    let rafId: number;
    const loop = () => {
      const container = scrollContainerRef.current;
      if (!container) return;

      if (stateRef.current.isInertia) {
        // Friction coefficient (Carrom-style decay)
        const friction = 0.95;
        stateRef.current.velocity *= friction;

        // Apply movement
        container.scrollTop += stateRef.current.velocity;

        // Sync handle visually during inertia
        const scrollRange = container.scrollHeight - container.clientHeight;
        const scrollPercent = Math.max(0, Math.min(1, container.scrollTop / scrollRange));
        const scrollableTrackArea = stateRef.current.trackHeight - stateRef.current.handleHeight;
        handle.style.top = `${stateRef.current.trackOffsetY + (scrollPercent * scrollableTrackArea)}px`;

        // Stop condition
        if (Math.abs(stateRef.current.velocity) < 0.1 || container.scrollTop <= 0 || container.scrollTop >= scrollRange) {
          stateRef.current.isInertia = false;
          stateRef.current.velocity = 0;
        }
      } else {
        syncUI();
      }
      rafId = requestAnimationFrame(loop);
    };
    rafId = requestAnimationFrame(loop);

    const onStart = (clientY: number) => {
      const container = scrollContainerRef.current;
      if (!container) return;

      stateRef.current.isDragging = true;
      stateRef.current.isInertia = false; // Interrupt inertia
      stateRef.current.velocity = 0;
      stateRef.current.startY = clientY;
      stateRef.current.lastY = clientY;
      stateRef.current.lastTime = performance.now();
      stateRef.current.startScrollTop = container.scrollTop;
      
      handle.classList.add('dragging');
      document.body.style.userSelect = 'none';
      document.body.style.cursor = 'grabbing';
    };

    const onMove = (clientY: number) => {
      if (!stateRef.current.isDragging) return;
      const container = scrollContainerRef.current;
      if (!container) return;

      const now = performance.now();
      const dt = now - stateRef.current.lastTime;
      if (dt > 0) {
        // Track velocity during drag (delta scrollTop / time)
        const trackRect = track.getBoundingClientRect();
        const scrollableTrackArea = stateRef.current.trackHeight - stateRef.current.handleHeight;
        const scrollRange = container.scrollHeight - container.clientHeight;
        
        const relativeFingerY = clientY - trackRect.top - (stateRef.current.handleHeight / 2);
        const clampedRelativeTop = Math.max(0, Math.min(scrollableTrackArea, relativeFingerY));
        
        handle.style.top = `${stateRef.current.trackOffsetY + clampedRelativeTop}px`;
        
        const scrollPercent = clampedRelativeTop / scrollableTrackArea;
        const newScrollTop = scrollPercent * scrollRange;
        
        // Instant speed = distance / time
        stateRef.current.velocity = (newScrollTop - container.scrollTop) / (dt / 16); // normalized to 60fps frames
        container.scrollTop = newScrollTop;
      }

      stateRef.current.lastY = clientY;
      stateRef.current.lastTime = now;
    };

    const onEnd = () => {
      if (!stateRef.current.isDragging) return;
      stateRef.current.isDragging = false;
      
      // If velocity is high enough, start inertia
      if (Math.abs(stateRef.current.velocity) > 1) {
        stateRef.current.isInertia = true;
      }

      handle.classList.remove('dragging');
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
    };

    // Event Listeners
    const handleTouchStart = (e: TouchEvent) => {
      if (handle.contains(e.target as Node)) {
        onStart(e.touches[0].clientY);
        e.preventDefault();
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (stateRef.current.isDragging) {
        onMove(e.touches[0].clientY);
        e.preventDefault();
      }
    };

    const handleMouseDown = (e: MouseEvent) => {
      if (handle.contains(e.target as Node)) {
        onStart(e.clientY);
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (stateRef.current.isDragging) {
        onMove(e.clientY);
      }
    };

    const handleTrackInteraction = (clientY: number) => {
      onStart(clientY);
      onMove(clientY);
    };

    // Initialization
    findContainer();
    window.addEventListener('resize', findContainer);
    
    // Global listeners for drag stability
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', onEnd);
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', onEnd);
    
    // Direct listeners
    handle.addEventListener('mousedown', handleMouseDown);
    handle.addEventListener('touchstart', handleTouchStart, { passive: false });
    track.addEventListener('mousedown', (e) => handleTrackInteraction(e.clientY));
    track.addEventListener('touchstart', (e) => handleTrackInteraction(e.touches[0].clientY));

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', findContainer);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', onEnd);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', onEnd);
    };
  }, []);

  return (
    <>
      <div 
        ref={trackRef}
        className="mobile-scroll-track"
        style={{ 
          position: 'fixed',
          right: '0',
          top: '80px',
          bottom: '80px',
          width: '48px', // Massive touch-hit area for fingers
          zIndex: 9998,
          cursor: 'pointer'
        }}
      >
        <div className="track-line" />
      </div>
      
      <div 
        ref={handleRef} 
        className="mobile-scroll-handle"
        style={{ 
          position: 'fixed',
          right: '8px',
          width: '16px', // Much wider for easier finger grabs
          borderRadius: '100px',
          zIndex: 9999,
          cursor: 'grab'
        }}
      />
    </>
  );
};

export default MobileScrollHandle;
