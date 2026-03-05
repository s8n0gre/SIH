import React, { useState, useEffect, useRef } from 'react';
import { Send, X, MessageSquare, User, ShieldCheck } from 'lucide-react';
import { API_BASE } from '../config';

export interface ChatMessage {
    id: string;
    text: string;
    fromRole: 'citizen' | 'staff' | 'system';
    senderName?: string;
    timestamp: string; // ISO
    read?: boolean;
}

interface TicketChatProps {
    reportId: string;
    reportTitle?: string;
    currentUserRole?: 'citizen' | 'staff';
    currentUserName?: string;
    onClose?: () => void;
}

// ─── Simulated local messages (fallback when offline/API unavailable) ─────────
function loadLocalMessages(reportId: string): ChatMessage[] {
    try {
        return JSON.parse(localStorage.getItem(`ticketChat_${reportId}`) || '[]');
    } catch { return []; }
}
function saveLocalMessages(reportId: string, msgs: ChatMessage[]) {
    localStorage.setItem(`ticketChat_${reportId}`, JSON.stringify(msgs.slice(-50)));
}

const TicketChat: React.FC<TicketChatProps> = ({
    reportId,
    reportTitle,
    currentUserRole = 'citizen',
    currentUserName,
    onClose,
}) => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [text, setText] = useState('');
    const [sending, setSending] = useState(false);
    const bottomRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const displayName = currentUserName || (currentUserRole === 'citizen' ? 'You (Citizen)' : 'Staff');

    // ── Load messages ─────────────────────────────────────────────────────────
    useEffect(() => {
        const load = async () => {
            // First load from localStorage (instant)
            const local = loadLocalMessages(reportId);
            if (local.length > 0) setMessages(local);

            // Then fetch from API
            try {
                const res = await fetch(`${API_BASE}/api/reports/${reportId}/chat`);
                if (res.ok) {
                    const data: ChatMessage[] = await res.json();
                    setMessages(data);
                    saveLocalMessages(reportId, data);
                }
            } catch {
                // Stay on local messages
            }
        };
        load();
    }, [reportId]);

    // ── Poll for new messages every 8s ────────────────────────────────────────
    useEffect(() => {
        const id = setInterval(async () => {
            try {
                const res = await fetch(`${API_BASE}/api/reports/${reportId}/chat`);
                if (res.ok) {
                    const data: ChatMessage[] = await res.json();
                    setMessages(data);
                    saveLocalMessages(reportId, data);
                }
            } catch { }
        }, 8000);
        return () => clearInterval(id);
    }, [reportId]);

    // ── Scroll to bottom on new messages ─────────────────────────────────────
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // ── Send ──────────────────────────────────────────────────────────────────
    const handleSend = async () => {
        const trimmed = text.trim();
        if (!trimmed) return;

        const optimistic: ChatMessage = {
            id: `local-${Date.now()}`,
            text: trimmed,
            fromRole: currentUserRole,
            senderName: displayName,
            timestamp: new Date().toISOString(),
            read: false,
        };

        const updated = [...messages, optimistic];
        setMessages(updated);
        saveLocalMessages(reportId, updated);
        setText('');
        setSending(true);

        try {
            const res = await fetch(`${API_BASE}/api/reports/${reportId}/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('authToken') || ''}`,
                },
                body: JSON.stringify({ text: trimmed, fromRole: currentUserRole, senderName: displayName }),
            });
            if (res.ok) {
                const saved: ChatMessage[] = await res.json();
                setMessages(saved);
                saveLocalMessages(reportId, saved);
            }
        } catch {
            // Keep the optimistic message
        } finally {
            setSending(false);
            inputRef.current?.focus();
        }
    };

    const formatTime = (iso: string) => {
        try {
            return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } catch { return ''; }
    };

    const formatDate = (iso: string) => {
        try {
            return new Date(iso).toLocaleDateString([], { month: 'short', day: 'numeric' });
        } catch { return ''; }
    };

    // Group messages with date separators ────────────────────────────────────
    const grouped: Array<ChatMessage | { type: 'date-separator'; date: string }> = [];
    let lastDate = '';
    for (const msg of messages) {
        const d = formatDate(msg.timestamp);
        if (d !== lastDate) {
            grouped.push({ type: 'date-separator', date: d });
            lastDate = d;
        }
        grouped.push(msg);
    }

    return (
        <div className="flex flex-col bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-xl border border-gray-200 dark:border-gray-700" style={{ height: '420px', width: '100%', maxWidth: '400px' }}>
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex-shrink-0">
                <div className="flex items-center gap-2 min-w-0">
                    <MessageSquare className="w-4 h-4 flex-shrink-0" />
                    <div className="min-w-0">
                        <p className="text-xs font-semibold leading-tight">Complaint Chat</p>
                        {reportTitle && (
                            <p className="text-[10px] text-blue-200 truncate">{reportTitle}</p>
                        )}
                    </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="flex items-center gap-1 text-[10px] bg-white/20 rounded-full px-2 py-0.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                        Live
                    </span>
                    {onClose && (
                        <button onClick={onClose} className="hover:bg-white/20 rounded-full p-1 transition-colors">
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
                {messages.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-gray-400 text-center px-6">
                        <MessageSquare className="w-10 h-10 mb-3 opacity-30" />
                        <p className="text-sm font-medium">No messages yet</p>
                        <p className="text-xs mt-1">Start by sending a message. Your assigned staff member will be notified.</p>
                    </div>
                )}

                {grouped.map((item, i) => {
                    if ('type' in item && item.type === 'date-separator') {
                        return (
                            <div key={`sep-${i}`} className="flex items-center gap-2 my-2">
                                <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
                                <span className="text-[10px] text-gray-400 dark:text-gray-500 font-medium whitespace-nowrap">{item.date}</span>
                                <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
                            </div>
                        );
                    }

                    const msg = item as ChatMessage;
                    const isMine = msg.fromRole === currentUserRole;
                    const isSystem = msg.fromRole === 'system';

                    if (isSystem) {
                        return (
                            <div key={msg.id} className="flex justify-center my-1">
                                <span className="text-[10px] text-gray-400 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
                                    {msg.text}
                                </span>
                            </div>
                        );
                    }

                    return (
                        <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'} gap-2`}>
                            {!isMine && (
                                <div className="w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center flex-shrink-0 mt-auto">
                                    {msg.fromRole === 'staff'
                                        ? <ShieldCheck className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                                        : <User className="w-3.5 h-3.5 text-gray-600 dark:text-gray-400" />
                                    }
                                </div>
                            )}
                            <div className={`max-w-[75%] ${isMine ? 'items-end' : 'items-start'} flex flex-col`}>
                                {!isMine && msg.senderName && (
                                    <span className="text-[10px] text-gray-500 dark:text-gray-400 mb-0.5 ml-1">
                                        {msg.senderName}
                                        {msg.fromRole === 'staff' && (
                                            <span className="ml-1 text-blue-600 dark:text-blue-400 font-medium">• Staff</span>
                                        )}
                                    </span>
                                )}
                                <div className={`px-3 py-2 rounded-2xl text-sm leading-relaxed max-w-full break-words ${isMine
                                        ? 'bg-blue-600 text-white rounded-br-sm'
                                        : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-sm'
                                    }`}>
                                    {msg.text}
                                </div>
                                <span className={`text-[10px] text-gray-400 mt-0.5 ${isMine ? 'mr-1' : 'ml-1'}`}>
                                    {formatTime(msg.timestamp)}
                                    {isMine && <span className="ml-1">{msg.read ? '✓✓' : '✓'}</span>}
                                </span>
                            </div>
                        </div>
                    );
                })}
                <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="px-3 py-3 border-t border-gray-100 dark:border-gray-700 flex-shrink-0">
                <div className="flex gap-2 items-end">
                    <input
                        ref={inputRef}
                        type="text"
                        value={text}
                        onChange={e => setText(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                        placeholder="Type a message..."
                        className="flex-1 px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    />
                    <button
                        onClick={handleSend}
                        disabled={!text.trim() || sending}
                        className="w-9 h-9 bg-blue-600 hover:bg-blue-700 text-white rounded-xl flex items-center justify-center flex-shrink-0 disabled:opacity-40 transition-colors"
                    >
                        <Send className="w-4 h-4" />
                    </button>
                </div>
                <p className="text-[10px] text-gray-400 mt-1 text-center">
                    End-to-end encrypted between citizen and assigned staff
                </p>
            </div>
        </div>
    );
};

export default TicketChat;
