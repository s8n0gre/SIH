import React, { useState, useRef } from 'react';
import { MessageCircle, X } from 'lucide-react';
import Messages from './Messages';
import '../styles/chat-system.css';

interface FloatingChatProps {
  unreadCount?: number;
}

export const FloatingChat: React.FC<FloatingChatProps> = ({ unreadCount = 0 }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const triggerRef = useRef<HTMLButtonElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const deltaX = (e.clientX - (rect.left + rect.width / 2)) * 0.15;
    const deltaY = (e.clientY - (rect.top + rect.height / 2)) * 0.15;
    setCursorPos({ x: deltaX, y: deltaY });
  };

  const handleToggle = () => {
    if (isOpen) {
      setIsExiting(true);
      setTimeout(() => { setIsOpen(false); setIsExiting(false); }, 250);
    } else {
      setIsOpen(true);
    }
  };

  return (
    <>
      {/* Trigger */}
      <button
        ref={triggerRef}
        onClick={handleToggle}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setCursorPos({ x: 0, y: 0 })}
        className={`chat-trigger ${unreadCount > 0 ? 'has-unread' : ''}`}
        style={{ transform: `translate(${cursorPos.x}px, ${cursorPos.y}px)`, transition: 'transform 0.2s ease-out' }}
        aria-label="Open chat"
      >
        {isOpen ? <X className="w-5 h-5" /> : <MessageCircle className="w-5 h-5" />}
        {unreadCount > 0 && !isOpen && (
          <span className="chat-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
        )}
      </button>

      {/* Panel — Messages manages its own internal headers */}
      {isOpen && (
        <div className={`chat-panel ${isExiting ? 'chat-panel-exit' : 'chat-panel-enter'}`}>
          <Messages />
        </div>
      )}
    </>
  );
};
