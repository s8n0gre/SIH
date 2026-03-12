import React, { useState, useEffect, useRef } from 'react';
import { Send, Paperclip, User } from 'lucide-react';
import { API_BASE } from '../config';

interface ThreadMessage {
  _id: string;
  senderType: 'citizen' | 'authority';
  senderId?: { _id: string; username: string; profileImageUrl?: string };
  content: string;
  attachments: Array<{ url: string; type: string; name: string }>;
  createdAt: string;
}

interface ThreadDiscussionProps {
  reportId: string;
  currentUserId?: string;
  currentUserRole?: string;
}

export const ThreadDiscussion: React.FC<ThreadDiscussionProps> = ({ reportId, currentUserId, currentUserRole }) => {
  const [messages, setMessages] = useState<ThreadMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadMessages();
    const interval = setInterval(loadMessages, 5000);
    return () => clearInterval(interval);
  }, [reportId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadMessages = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/threads/${reportId}/messages`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      }
    } catch (error) {
      console.error('Failed to load messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    setSending(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/threads/${reportId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` })
        },
        body: JSON.stringify({ content: input.trim(), isAnonymous })
      });
      if (res.ok) {
        setInput('');
        await loadMessages();
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setSending(false);
    }
  };

  const isAuthority = currentUserRole === 'department_admin' || currentUserRole === 'system_admin';

  return (
    <div className="flex flex-col h-full" style={{ background: 'var(--bg-base)' }}>
      {/* Header */}
      <div className="p-4 border-b" style={{ borderColor: 'var(--border)', background: 'var(--bg-panel)' }}>
        <h3 className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>Discussion Thread</h3>
        <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
          Communicate with {isAuthority ? 'the citizen' : 'municipal authorities'} about this report
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="w-6 h-6 border-2 border-[var(--accent-blue)] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ background: 'var(--bg-elevated)' }}>
              <Send className="w-8 h-8" style={{ color: 'var(--text-muted)' }} />
            </div>
            <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>No messages yet</p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-faint)' }}>Start the conversation</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isOwnMessage = msg.senderId?._id === currentUserId;
            const isAuthorityMsg = msg.senderType === 'authority';

            return (
              <div key={msg._id} className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[75%] ${isOwnMessage ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                  {/* Sender label */}
                  <div className="flex items-center gap-2 px-2">
                    {!msg.senderId ? (
                      <span className="text-xs font-bold" style={{ color: 'var(--text-muted)' }}>Anonymous Citizen</span>
                    ) : (
                      <>
                        <User className="w-3 h-3" style={{ color: isAuthorityMsg ? 'var(--accent-blue)' : 'var(--text-muted)' }} />
                        <span className="text-xs font-bold" style={{ color: isAuthorityMsg ? 'var(--accent-blue)' : 'var(--text-muted)' }}>
                          {msg.senderId.username} {isAuthorityMsg && '(Authority)'}
                        </span>
                      </>
                    )}
                  </div>

                  {/* Message bubble */}
                  <div
                    className="px-4 py-3 rounded-2xl"
                    style={{
                      background: isAuthorityMsg ? 'var(--accent-blue)' : 'var(--bg-elevated)',
                      color: isAuthorityMsg ? '#ffffff' : 'var(--text-primary)',
                      border: isAuthorityMsg ? 'none' : '1px solid var(--border)',
                      borderRadius: isOwnMessage ? '16px 4px 16px 16px' : '4px 16px 16px 16px'
                    }}
                  >
                    <p className="text-sm leading-relaxed">{msg.content}</p>
                    {msg.attachments?.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {msg.attachments.map((att, i) => (
                          <a key={i} href={att.url} target="_blank" rel="noopener noreferrer" className="text-xs underline block">
                            <Paperclip className="w-3 h-3 inline mr-1" />
                            {att.name}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Timestamp */}
                  <span className="text-[10px] px-2" style={{ color: 'var(--text-faint)' }}>
                    {new Date(msg.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t" style={{ borderColor: 'var(--border)', background: 'var(--bg-panel)' }}>
        {!isAuthority && (
          <label className="flex items-center gap-2 mb-3 cursor-pointer">
            <input
              type="checkbox"
              checked={isAnonymous}
              onChange={(e) => setIsAnonymous(e.target.checked)}
              className="w-4 h-4 rounded"
            />
            <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>Post anonymously</span>
          </label>
        )}
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
            placeholder="Type your message..."
            className="flex-1 px-4 py-3 rounded-xl border outline-none transition-all"
            style={{
              background: 'var(--bg-elevated)',
              borderColor: 'var(--border)',
              color: 'var(--text-primary)'
            }}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || sending}
            className="px-6 py-3 rounded-xl font-medium transition-all flex items-center gap-2"
            style={{
              background: input.trim() ? 'var(--accent-blue)' : 'var(--bg-elevated)',
              color: input.trim() ? '#ffffff' : 'var(--text-muted)',
              opacity: sending ? 0.6 : 1
            }}
          >
            <Send className="w-4 h-4" />
            Send
          </button>
        </div>
      </div>
    </div>
  );
};
