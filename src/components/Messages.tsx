import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Send, MessageCircle, Search, Plus, X, ArrowLeft, Check, CheckCheck } from 'lucide-react';
import { API_BASE } from '../config';

const API = API_BASE;

interface ApiUser {
  _id: string;
  username: string;
  email: string;
  role?: string;
}

interface Conversation {
  _id: string;
  participants: ApiUser[];
  lastMessage: string;
  lastMessageAt: string;
  unread: number;
}

interface Message {
  _id: string;
  conversationId: string;
  senderId: ApiUser | string;
  content: string;
  createdAt: string;
  read: boolean;
}

type View = 'list' | 'chat' | 'new';

/* ─── helpers ─────────────────────────────────────────────────── */
const avatar = (name: string) => name?.charAt(0).toUpperCase() || '?';
const formatTime = (iso: string) =>
  new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
const formatDate = (iso: string) => {
  const d = new Date(iso);
  const now = new Date();
  if (d.toDateString() === now.toDateString()) return formatTime(iso);
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
};

/* ─── avatarColor helper (stable per username) ─────────────────── */
const AVATAR_COLORS = [
  ['#d94b38', '#fce8e6'], // red/accent
  ['#136f8a', '#e6f4f8'], // blue
  ['#2d9e5f', '#e6f7ee'], // green
  ['#7c3aed', '#ede9fe'], // purple
  ['#d97706', '#fef3c7'], // amber
];
const getColor = (name: string) => {
  const idx = (name?.charCodeAt(0) || 0) % AVATAR_COLORS.length;
  return AVATAR_COLORS[idx];
};

/* ════════════════════════════════════════════════════════════════ */

const Messages: React.FC = () => {
  const currentUser = JSON.parse(localStorage.getItem('civicUser') || '{}');
  const currentUserId: string = currentUser.id || currentUser._id || '';

  const [view, setView] = useState<View>('list');
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConv, setSelectedConv] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [allUsers, setAllUsers] = useState<ApiUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [lastPollTime, setLastPollTime] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  /* ── data loaders ──────────────────────────────────────────── */
  const loadConversations = useCallback(async () => {
    if (!currentUserId) return;
    try {
      const res = await fetch(`${API}/api/chat/conversations/${currentUserId}`);
      if (res.ok) setConversations(await res.json());
    } catch { /* offline */ }
  }, [currentUserId]);

  const loadUsers = useCallback(async () => {
    try {
      const res = await fetch(`${API}/api/chat/users`);
      if (res.ok) {
        const data: ApiUser[] = await res.json();
        setAllUsers(data.filter(u => u._id !== currentUserId));
      }
    } catch { /* offline */ }
  }, [currentUserId]);

  useEffect(() => {
    Promise.all([loadConversations(), loadUsers()]).finally(() => setLoading(false));
  }, [loadConversations, loadUsers]);

  /* ── message polling ───────────────────────────────────────── */
  const fetchMessages = useCallback(async (convId: string, since?: string) => {
    try {
      const url = since
        ? `${API}/api/chat/messages/${convId}?since=${encodeURIComponent(since)}`
        : `${API}/api/chat/messages/${convId}`;
      const res = await fetch(url);
      if (!res.ok) return;
      const data: Message[] = await res.json();
      if (since) {
        setMessages(prev => {
          const newMsgs = data.filter(m => !prev.some(p => p._id === m._id));
          return [...prev, ...newMsgs];
        });
      } else {
        setMessages(data);
      }
      if (data.length > 0) setLastPollTime(data[data.length - 1].createdAt);
    } catch { /* offline */ }
  }, []);

  useEffect(() => {
    if (!selectedConv) return;
    setMessages([]);
    setLastPollTime(null);
    setConversations(prev =>
      prev.map(c => c._id === selectedConv._id ? { ...c, unread: 0 } : c)
    );
    fetchMessages(selectedConv._id);
    pollRef.current = setInterval(() => {
      setLastPollTime(prev => {
        if (prev) fetchMessages(selectedConv._id, prev);
        return prev;
      });
      loadConversations();
    }, 3000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [selectedConv, fetchMessages, loadConversations]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (view === 'chat') setTimeout(() => inputRef.current?.focus(), 100);
  }, [view]);

  /* ── actions ───────────────────────────────────────────────── */
  const handleSend = async () => {
    if (!input.trim() || !selectedConv) return;
    const text = input.trim();
    setInput('');
    setSending(true);
    try {
      const res = await fetch(`${API}/api/chat/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversationId: selectedConv._id, senderId: currentUserId, content: text }),
      });
      if (res.ok) {
        const msg: Message = await res.json();
        setMessages(prev => prev.some(m => m._id === msg._id) ? prev : [...prev, msg]);
        setLastPollTime(msg.createdAt);
        loadConversations();
      }
    } catch { /* offline */ } finally {
      setSending(false);
    }
  };

  const startChat = async (user: ApiUser) => {
    setSearchQuery('');
    try {
      const res = await fetch(`${API}/api/chat/conversations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId1: currentUserId, userId2: user._id }),
      });
      if (res.ok) {
        const conv: Conversation = await res.json();
        setConversations(prev =>
          prev.find(c => c._id === conv._id) ? prev : [{ ...conv, unread: 0 }, ...prev]
        );
        setSelectedConv(conv);
        setView('chat');
      }
    } catch { /* offline */ }
  };

  const openConv = (conv: Conversation) => {
    setSelectedConv(conv);
    setView('chat');
  };

  const getOther = (conv: Conversation) =>
    conv.participants.find(p => p._id !== currentUserId);

  const filteredUsers = allUsers.filter(u =>
    u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const otherUser = selectedConv ? getOther(selectedConv) : null;

  /* ════════════ RENDER ══════════════════════════════════════════ */
  return (
    <div className="flex flex-col h-full" style={{ background: 'var(--bg-base)' }}>

      {/* ── CONVERSATIONS LIST ────────────────────────────────── */}
      {view === 'list' && (
        <div className="flex flex-col h-full">
          {/* Toolbar */}
          <div className="flex items-center justify-between px-4 pt-3 pb-2 flex-shrink-0"
            style={{ borderBottom: '1px solid var(--border)' }}>
            <h2 className="text-base font-extrabold tracking-tight"
              style={{ color: 'var(--text-primary)' }}>Messages</h2>
            <button
              onClick={() => { setSearchQuery(''); setView('new'); }}
              className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg transition-all hover:opacity-80"
              style={{ background: 'var(--accent)', color: 'white' }}
            >
              <Plus className="w-3.5 h-3.5" /> New
            </button>
          </div>

          {/* Search */}
          <div className="px-3 py-2 flex-shrink-0">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5"
                style={{ color: 'var(--text-faint)' }} />
              <input
                type="text"
                placeholder="Search conversations…"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-2 text-sm rounded-lg border outline-none transition-all"
                style={{
                  background: 'var(--bg-elevated)',
                  borderColor: 'var(--border)',
                  color: 'var(--text-primary)',
                  fontSize: '13px',
                }}
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2">
                  <X className="w-3.5 h-3.5" style={{ color: 'var(--text-faint)' }} />
                </button>
              )}
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto px-2 py-1 space-y-0.5">
            {loading ? (
              <div className="flex justify-center items-center h-32">
                <div className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin"
                  style={{ borderColor: 'var(--accent)', borderTopColor: 'transparent' }} />
              </div>
            ) : conversations.filter(c => {
              if (!searchQuery) return true;
              const other = getOther(c);
              return other?.username.toLowerCase().includes(searchQuery.toLowerCase());
            }).length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 gap-3">
                <MessageCircle className="w-10 h-10 opacity-20"
                  style={{ color: 'var(--text-primary)' }} />
                <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>
                  No conversations yet
                </p>
                <button
                  onClick={() => { setSearchQuery(''); setView('new'); }}
                  className="text-xs font-bold px-3 py-1.5 rounded-lg"
                  style={{ background: 'var(--accent-subtle)', color: 'var(--accent)' }}
                >
                  Start one
                </button>
              </div>
            ) : (
              conversations
                .filter(c => {
                  if (!searchQuery) return true;
                  const other = getOther(c);
                  return other?.username.toLowerCase().includes(searchQuery.toLowerCase());
                })
                .map(conv => {
                  const other = getOther(conv);
                  const isActive = selectedConv?._id === conv._id;
                  const [fg, bg] = getColor(other?.username || '');
                  return (
                    <button
                      key={conv._id}
                      onClick={() => openConv(conv)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all"
                      style={{
                        background: isActive ? 'var(--bg-elevated)' : 'transparent',
                      }}
                      onMouseEnter={e => {
                        if (!isActive) (e.currentTarget as HTMLElement).style.background = 'var(--bg-elevated)';
                      }}
                      onMouseLeave={e => {
                        if (!isActive) (e.currentTarget as HTMLElement).style.background = 'transparent';
                      }}
                    >
                      {/* Avatar */}
                      <div className="relative flex-shrink-0">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold"
                          style={{ background: bg, color: fg }}>
                          {avatar(other?.username || '')}
                        </div>
                        {conv.unread > 0 && (
                          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center"
                            style={{ background: 'var(--accent)', color: 'white' }}>
                            {conv.unread > 9 ? '9+' : conv.unread}
                          </span>
                        )}
                      </div>
                      {/* Text */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-[13px] font-semibold truncate"
                            style={{ color: 'var(--text-primary)' }}>
                            {other?.username || 'Unknown'}
                          </span>
                          {conv.lastMessageAt && (
                            <span className="text-[10px] ml-1 flex-shrink-0"
                              style={{ color: 'var(--text-faint)' }}>
                              {formatDate(conv.lastMessageAt)}
                            </span>
                          )}
                        </div>
                        <p className="text-[12px] truncate mt-0.5 font-normal"
                          style={{ color: conv.unread > 0 ? 'var(--text-primary)' : 'var(--text-muted)', fontWeight: conv.unread > 0 ? 600 : 400 }}>
                          {conv.lastMessage || 'Say hi 👋'}
                        </p>
                      </div>
                    </button>
                  );
                })
            )}
          </div>
        </div>
      )}

      {/* ── NEW CHAT ──────────────────────────────────────────── */}
      {view === 'new' && (
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3 flex-shrink-0"
            style={{ borderBottom: '1px solid var(--border)' }}>
            <button
              onClick={() => { setView('list'); setSearchQuery(''); }}
              className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:opacity-80"
              style={{ background: 'var(--bg-elevated)', color: 'var(--text-secondary)' }}
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <h2 className="text-base font-extrabold tracking-tight"
              style={{ color: 'var(--text-primary)' }}>New Message</h2>
          </div>

          {/* Search */}
          <div className="px-3 py-2 flex-shrink-0">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5"
                style={{ color: 'var(--text-faint)' }} />
              <input
                autoFocus
                type="text"
                placeholder="Find a user…"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-2 text-sm rounded-lg border outline-none"
                style={{
                  background: 'var(--bg-elevated)',
                  borderColor: 'var(--border)',
                  color: 'var(--text-primary)',
                  fontSize: '13px',
                }}
              />
            </div>
          </div>

          {/* User list */}
          <div className="flex-1 overflow-y-auto px-2 py-1 space-y-0.5">
            {filteredUsers.length === 0 ? (
              <div className="flex items-center justify-center h-32 text-sm"
                style={{ color: 'var(--text-muted)' }}>
                No users found
              </div>
            ) : (
              filteredUsers.map(u => {
                const [fg, bg] = getColor(u.username);
                return (
                  <button
                    key={u._id}
                    onClick={() => startChat(u)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all"
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--bg-elevated)'}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
                    style={{ background: 'transparent' }}
                  >
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                      style={{ background: bg, color: fg }}>
                      {avatar(u.username)}
                    </div>
                    <div>
                      <p className="text-[13px] font-semibold"
                        style={{ color: 'var(--text-primary)' }}>{u.username}</p>
                      <p className="text-[11px] capitalize"
                        style={{ color: 'var(--text-muted)' }}>{u.role || 'Citizen'}</p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ── CHAT VIEW ─────────────────────────────────────────── */}
      {view === 'chat' && selectedConv && (
        <div className="flex flex-col h-full">

          {/* Chat header */}
          <div className="flex items-center gap-3 px-3 py-2.5 flex-shrink-0"
            style={{ background: 'var(--bg-panel)', borderBottom: '1px solid var(--border)' }}>
            <button
              onClick={() => setView('list')}
              className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:opacity-70 flex-shrink-0"
              style={{ background: 'var(--bg-elevated)', color: 'var(--text-secondary)' }}
            >
              <ArrowLeft className="w-4 h-4" />
            </button>

            {/* Avatar */}
            {(() => {
              const [fg, bg] = getColor(otherUser?.username || '');
              return (
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                  style={{ background: bg, color: fg }}>
                  {avatar(otherUser?.username || '')}
                </div>
              );
            })()}

            <div className="flex-1 min-w-0">
              <p className="text-[14px] font-bold truncate"
                style={{ color: 'var(--text-primary)' }}>
                {otherUser?.username || 'Unknown'}
              </p>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                <p className="text-[10px] capitalize font-medium"
                  style={{ color: 'var(--text-muted)' }}>
                  {otherUser?.role || 'Citizen'}
                </p>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3"
            style={{ background: 'var(--bg-base)' }}>
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center border-2 border-dashed"
                  style={{ borderColor: 'var(--border)', background: 'var(--bg-elevated)' }}>
                  <MessageCircle className="w-6 h-6 opacity-30"
                    style={{ color: 'var(--text-primary)' }} />
                </div>
                <p className="text-xs font-bold uppercase tracking-widest"
                  style={{ color: 'var(--text-muted)' }}>Say hi 👋</p>
              </div>
            ) : (
              messages.map((msg: any) => {
                const senderObj = msg.senderId || '';
                const senderId = typeof senderObj === 'object' ? senderObj._id : senderObj;
                const isOwn = senderId === currentUserId;
                return (
                  <div key={msg._id}
                    className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                    <div className="max-w-[78%]">
                      <div className="px-3.5 py-2.5 text-sm leading-relaxed"
                        style={{
                          borderRadius: isOwn ? '16px 4px 16px 16px' : '4px 16px 16px 16px',
                          background: isOwn ? 'var(--accent)' : 'var(--bg-panel)',
                          color: isOwn ? '#fff' : 'var(--text-primary)',
                          border: isOwn ? 'none' : '1px solid var(--border)',
                          boxShadow: isOwn
                            ? '0 4px 12px rgba(217, 75, 56, 0.2)'
                            : 'var(--shadow-sm)',
                          wordBreak: 'break-word',
                        }}>
                        {msg.content}
                      </div>
                      <div className={`flex items-center gap-1 mt-1 px-1 ${isOwn ? 'justify-end' : 'justify-start'}`}>
                        <span className="text-[10px]" style={{ color: 'var(--text-faint)' }}>
                          {formatTime(msg.createdAt)}
                        </span>
                        {isOwn && (
                          msg.read
                            ? <CheckCheck className="w-3 h-3" style={{ color: 'var(--accent-blue)' }} />
                            : <Check className="w-3 h-3" style={{ color: 'var(--text-faint)' }} />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="flex items-center gap-2 px-3 py-2.5 flex-shrink-0"
            style={{ background: 'var(--bg-panel)', borderTop: '1px solid var(--border)' }}>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
              placeholder="Message…"
              className="flex-1 px-3.5 py-2.5 text-sm rounded-xl border outline-none transition-all"
              style={{
                background: 'var(--bg-elevated)',
                borderColor: 'var(--border)',
                color: 'var(--text-primary)',
                fontSize: '14px',
              }}
              onFocus={e => (e.currentTarget.style.borderColor = 'var(--accent)')}
              onBlur={e => (e.currentTarget.style.borderColor = 'var(--border)')}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || sending}
              className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all"
              style={{
                background: input.trim() ? 'var(--accent)' : 'var(--bg-elevated)',
                color: input.trim() ? 'white' : 'var(--text-faint)',
                cursor: input.trim() ? 'pointer' : 'default',
              }}
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Messages;