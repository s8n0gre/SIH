import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Send, MessageCircle, Search, Plus, X } from 'lucide-react';
import { API_BASE } from '../config';

const API = API_BASE;

interface ApiUser {
  _id: string;
  username: string;
  email: string;
  role?: string;
  profileImageUrl?: string;
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

// Bot chat lives in localStorage only — never hits the server

const Messages: React.FC = () => {
  const currentUser = JSON.parse(localStorage.getItem('civicUser') || '{}');
  const currentUserId: string = currentUser.id || currentUser._id || '';

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConvId, setSelectedConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [allUsers, setAllUsers] = useState<ApiUser[]>([]);
  const [showNewChat, setShowNewChat] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [lastPollTime, setLastPollTime] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);


  // ── Load data ─────────────────────────────────────────────────────────────
  const loadConversations = useCallback(async () => {
    if (!currentUserId) return;
    try {
      const res = await fetch(`${API}/api/chat/conversations/${currentUserId}`);
      if (res.ok) setConversations(await res.json());
    } catch { /* offline — keep current state */ }
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

  // ── Fetch messages for selected conversation ──────────────────────────────
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
          const newMessages = data.filter(apiMsg => !prev.some(m => m._id === apiMsg._id));
          return [...prev, ...newMessages];
        });
      } else {
        setMessages(data);
      }
      if (data.length > 0) setLastPollTime(data[data.length - 1].createdAt);
    } catch { /* offline */ }
  }, []);


  useEffect(() => {
    if (!selectedConvId) return;
    setMessages([]);
    setLastPollTime(null);

    // Optimistically clear unread count for this convo in the sidebar
    setConversations(prev => prev.map(c =>
      c._id === selectedConvId ? { ...c, unread: 0 } : c
    ));

    fetchMessages(selectedConvId);
    pollRef.current = setInterval(() => {
      setLastPollTime(prev => {
        if (prev) fetchMessages(selectedConvId, prev);
        return prev;
      });
      loadConversations();
    }, 3000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [selectedConvId, fetchMessages, loadConversations]);


  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, selectedConvId]);


  // ── Send message ──────────────────────────────────────────────────────────
  const handleSend = async () => {
    if (!input.trim() || !selectedConvId) return;
    const text = input.trim();
    setInput('');

    setSending(true);
    try {
      const res = await fetch(`${API}/api/chat/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversationId: selectedConvId, senderId: currentUserId, content: text })
      });
      if (res.ok) {
        const msg: Message = await res.json();
        setMessages(prev => {
          if (prev.some(m => m._id === msg._id)) return prev;
          return [...prev, msg];
        });
        setLastPollTime(msg.createdAt);
        loadConversations();
      }
    } catch { /* offline */ } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  // ── Start new real conversation ───────────────────────────────────────────
  const startChat = async (user: ApiUser) => {
    setShowNewChat(false);
    setSearchQuery('');
    try {
      const res = await fetch(`${API}/api/chat/conversations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId1: currentUserId, userId2: user._id })
      });
      if (res.ok) {
        const conv: Conversation = await res.json();
        setConversations(prev => {
          const exists = prev.find(c => c._id === conv._id);
          return exists ? prev : [{ ...conv, unread: 0 }, ...prev];
        });
        setSelectedConvId(conv._id);
      }
    } catch { /* offline */ }
  };

  const getOtherParticipant = (conv: Conversation) =>
    conv.participants.find(p => p._id !== currentUserId);

  const formatTime = (iso: string) =>
    new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const filteredUsers = allUsers.filter(u =>
    u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedConv = conversations.find(c => c._id === selectedConvId);
  const otherUser = selectedConv ? getOtherParticipant(selectedConv) : null;


  return (
    <div className="flex h-full bg-white dark:bg-gray-900">

      {/* ── Sidebar ──────────────────────────────────────────────────────── */}
      <div className="w-1/3 border-r border-gray-200 dark:border-gray-700 flex flex-col min-w-0">
        {/* Header */}
        <div className="p-3 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <h2 className="text-base font-bold text-gray-900 dark:text-white mb-2">Messages</h2>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 w-3.5 h-3.5" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
          </div>
        </div>

        {/* New chat button */}
        <div className="px-3 py-2 flex-shrink-0">
          <button
            onClick={() => setShowNewChat(true)}
            className="w-full flex items-center justify-center gap-1.5 py-1.5 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> New Chat
          </button>
        </div>

        {/* Conversation list */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center text-sm text-gray-400">Loading…</div>
          ) : conversations.length === 0 ? (
            <div className="p-4 text-center text-sm text-gray-400">No conversations yet</div>
          ) : (
            conversations.map(conv => {
              const other = getOtherParticipant(conv);
              return (
                <div
                  key={conv._id}
                  onClick={() => setSelectedConvId(conv._id)}
                  className={`p-3 border-b border-gray-100 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${selectedConvId === conv._id ? 'bg-indigo-50 dark:bg-indigo-900/30' : ''}`}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 bg-indigo-100 dark:bg-indigo-800 rounded-full flex items-center justify-center text-sm font-bold text-indigo-600 dark:text-indigo-300 flex-shrink-0">
                      {other?.username?.charAt(0).toUpperCase() || '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-900 dark:text-white truncate">{other?.username || 'Unknown'}</span>
                        {conv.unread > 0 && <span className="bg-indigo-500 text-white text-xs rounded-full px-1.5 py-0.5 flex-shrink-0">{conv.unread}</span>}
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{conv.lastMessage || 'No messages yet'}</p>
                      <p className="text-xs text-gray-400 mt-0.5">@{other?.username}</p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ── Chat Area ────────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">
        {selectedConvId ? (
          <>
            {/* Chat header */}
            <div className="p-3 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex-shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 bg-indigo-100 dark:bg-indigo-800 rounded-full flex items-center justify-center text-sm font-bold text-indigo-600 flex-shrink-0">
                  {otherUser?.username?.charAt(0).toUpperCase() || '?'}
                </div>
                <div>
                  <p className="font-semibold text-sm text-gray-900 dark:text-white">{otherUser?.username}</p>
                  <p className="text-xs text-gray-400">@{otherUser?.username} · {otherUser?.role || 'citizen'}</p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-gray-50 dark:bg-gray-900">
              {messages.length === 0 ? (
                <div className="text-center text-gray-400 mt-8">
                  <MessageCircle className="w-10 h-10 mx-auto mb-2 opacity-40" />
                  <p className="text-sm">No messages yet. Say hello!</p>
                </div>
              ) : (
                messages.map((msg: any) => {
                  const senderId = typeof msg.senderId === 'object' ? msg.senderId._id : msg.senderId;
                  const isOwn = senderId === currentUserId;
                  return (
                    <div key={msg._id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[75%] px-3 py-2 rounded-2xl text-sm ${isOwn
                        ? 'bg-indigo-500 text-white rounded-br-sm'
                        : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-bl-sm'
                        }`}>
                        <p>{msg.content}</p>
                        <p className={`text-[10px] mt-1 ${isOwn ? 'text-indigo-200' : 'text-gray-400'}`}>
                          {formatTime(msg.createdAt)}
                          {isOwn && <span className="ml-1">{msg.read ? '✓✓' : '✓'}</span>}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex-shrink-0">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type a message… (Enter to send)"
                  className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || sending}
                  className="p-2 bg-indigo-500 text-white rounded-xl hover:bg-indigo-600 disabled:opacity-40 transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
            <div className="text-center">
              <MessageCircle className="w-14 h-14 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
              <h3 className="text-base font-medium text-gray-700 dark:text-white">Select a conversation</h3>
              <p className="text-sm text-gray-400 mt-1">Choose from the sidebar or start a new chat</p>
            </div>
          </div>
        )}
      </div>

      {/* ── New Chat Modal ────────────────────────────────────────────────── */}
      {showNewChat && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[9999] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-sm max-h-[70vh] flex flex-col overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold text-gray-900 dark:text-white">New Chat</h3>
              <button onClick={() => { setShowNewChat(false); setSearchQuery(''); }}>
                <X className="w-5 h-5 text-gray-400 hover:text-gray-600" />
              </button>
            </div>
            <div className="p-3 border-b border-gray-100 dark:border-gray-700">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 w-3.5 h-3.5" />
                <input
                  autoFocus
                  type="text"
                  placeholder="Search users…"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto py-2">
              {filteredUsers.length === 0 ? (
                <div className="p-4 text-center text-sm text-gray-400">No users found</div>
              ) : (
                filteredUsers.map(u => (
                  <div
                    key={u._id}
                    onClick={() => startChat(u)}
                    className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                  >
                    <div className="w-9 h-9 bg-indigo-100 dark:bg-indigo-800 rounded-full flex items-center justify-center text-sm font-bold text-indigo-600">
                      {u.username.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{u.username}</p>
                      <p className="text-xs text-gray-400">{u.role || 'citizen'}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Messages;