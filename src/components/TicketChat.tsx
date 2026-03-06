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

// ─── Simulated local messages (fallback) ─────────
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

    useEffect(() => {
        const load = async () => {
            const local = loadLocalMessages(reportId);
            if (local.length > 0) setMessages(local);
            try {
                const res = await fetch(`${API_BASE}/api/reports/${reportId}/chat`);
                if (res.ok) {
                    const data = await res.json();
                    setMessages(data);
                    saveLocalMessages(reportId, data);
                }
            } catch { }
        };
        load();
    }, [reportId]);

    useEffect(() => {
        const id = setInterval(async () => {
            try {
                const res = await fetch(`${API_BASE}/api/reports/${reportId}/chat`);
                if (res.ok) {
                    const data = await res.json();
                    setMessages(data);
                    saveLocalMessages(reportId, data);
                }
            } catch { }
        }, 8000);
        return () => clearInterval(id);
    }, [reportId]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

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
                const saved = await res.json();
                setMessages(saved);
                saveLocalMessages(reportId, saved);
            }
        } catch { } finally {
            setSending(false);
            inputRef.current?.focus();
        }
    };

    const formatTime = (iso: string) => {
        try { return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); } catch { return ''; }
    };
    const formatDate = (iso: string) => {
        try { return new Date(iso).toLocaleDateString([], { month: 'short', day: 'numeric' }); } catch { return ''; }
    };

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
        <div className="flex flex-col rounded-2xl overflow-hidden shadow-2xl border border-[var(--border)] animate-scale-in" style={{ height: '480px', width: '100%', maxWidth: '420px', background: 'var(--bg-panel)' }}>
            {/* Header - Heritage Themed */}
            <div className="flex items-center justify-between px-5 py-4 border-b flex-shrink-0 relative overflow-hidden" style={{ borderColor: 'var(--border)', background: 'var(--bg-elevated)' }}>
                <div className="absolute inset-0 heritage-pattern opacity-30 pointer-events-none" />
                <div className="relative z-10 flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm" style={{ background: 'var(--accent)', color: 'white' }}>
                        <MessageSquare className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-sm font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>Official Comm Channel</p>
                        {reportTitle && <p className="text-[11px] font-medium truncate" style={{ color: 'var(--accent)' }}>{reportTitle}</p>}
                    </div>
                </div>
                <div className="relative z-10 flex items-center gap-2 flex-shrink-0">
                    <span className="flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded bg-[var(--bg-base)] border border-[var(--border)] shadow-sm" style={{ color: 'var(--accent-green)' }}>
                        <span className="w-2 h-2 rounded-full bg-current animate-pulse shadow-[0_0_8px_currentColor]" /> Live
                    </span>
                    {onClose && (
                        <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors flex items-center justify-center">
                            <X className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                        </button>
                    )}
                </div>
            </div>

            {/* Messages Area - Parchment / Glass feel */}
            <div className="flex-1 overflow-y-auto px-4 py-5 space-y-4" style={{ background: 'var(--bg-base)' }}>
                {messages.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-center px-6">
                        <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4 border border-dashed" style={{ borderColor: 'var(--border-strong)', background: 'var(--bg-elevated)' }}>
                            <MessageSquare className="w-6 h-6 opacity-40" style={{ color: 'var(--text-primary)' }} />
                        </div>
                        <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Secure Channel Open</p>
                        <p className="text-[11px] mt-2 font-medium" style={{ color: 'var(--text-muted)' }}>Messages here are securely routed to the assigned municipal officer.</p>
                    </div>
                )}

                {grouped.map((item, i) => {
                    if ('type' in item && item.type === 'date-separator') {
                        return (
                            <div key={`sep-${i}`} className="flex justify-center my-6 relative">
                                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-[var(--border-strong)]" /></div>
                                <div className="relative px-4 text-[10px] font-bold uppercase tracking-widest bg-[var(--bg-base)]" style={{ color: 'var(--text-faint)' }}>{item.date}</div>
                            </div>
                        );
                    }

                    const msg = item as ChatMessage;
                    const isMine = msg.fromRole === currentUserRole;
                    const isSystem = msg.fromRole === 'system';

                    if (isSystem) {
                        return (
                            <div key={msg.id} className="flex justify-center my-3 relative z-10">
                                <span className="text-[10px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-full border shadow-sm" style={{ background: 'var(--bg-elevated)', color: 'var(--text-muted)', borderColor: 'var(--border)' }}>
                                    {msg.text}
                                </span>
                            </div>
                        );
                    }

                    return (
                        <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'} w-full relative group`}>
                            <div className={`flex gap-3 max-w-[85%] ${isMine ? 'flex-row-reverse' : 'flex-row'}`}>

                                {/* Avatar */}
                                {!isMine && (
                                    <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-1 shadow-sm border border-[var(--border)]" style={{ background: 'var(--bg-panel)' }}>
                                        {msg.fromRole === 'staff'
                                            ? <ShieldCheck className="w-4 h-4" style={{ color: 'var(--accent-blue)' }} />
                                            : <User className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                                        }
                                    </div>
                                )}

                                {/* Overlapping Parchment Message Bubble */}
                                <div className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}>
                                    {!isMine && msg.senderName && (
                                        <span className="text-[10px] font-bold uppercase tracking-wider mb-1.5 ml-1" style={{ color: 'var(--text-muted)' }}>
                                            {msg.senderName}
                                            {msg.fromRole === 'staff' && <span className="ml-1 select-none" style={{ color: 'var(--accent-blue)' }}>• Official</span>}
                                        </span>
                                    )}

                                    <div className="relative transition-transform duration-200 group-hover:-translate-y-0.5" style={{
                                        padding: '12px 16px',
                                        borderRadius: isMine ? '16px 4px 16px 16px' : '4px 16px 16px 16px',
                                        background: isMine ? 'var(--accent)' : 'var(--bg-panel)',
                                        color: isMine ? '#ffffff' : 'var(--text-primary)',
                                        boxShadow: isMine ? '0 4px 12px rgba(217, 75, 56, 0.2)' : 'var(--shadow-sm)',
                                        border: isMine ? '1px solid rgba(255,255,255,0.1)' : '1px solid var(--border)',
                                        position: 'relative',
                                        zIndex: 10
                                    }}>
                                        <p className="text-[13px] font-medium leading-relaxed tracking-wide break-words">{msg.text}</p>
                                    </div>

                                    <span className={`text-[9px] font-bold tracking-wider mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity ${isMine ? 'mr-1' : 'ml-1'}`} style={{ color: 'var(--text-faint)' }}>
                                        {formatTime(msg.timestamp)}
                                        {isMine && <span className="ml-1" style={{ color: msg.read ? 'var(--accent-blue)' : 'inherit' }}>{msg.read ? '✓✓' : '✓'}</span>}
                                    </span>
                                </div>

                            </div>
                        </div>
                    );
                })}
                <div ref={bottomRef} className="h-1" />
            </div>

            {/* Input Area */}
            <div className="px-4 py-4 border-t flex-shrink-0" style={{ borderColor: 'var(--border-strong)', background: 'var(--bg-panel)' }}>
                <div className="relative flex items-center shadow-inner rounded-xl border focus-within:ring-2 focus-within:border-transparent transition-all" style={{ borderColor: 'var(--border)', background: 'var(--bg-base)', '--tw-ring-color': 'var(--accent-subtle)' } as React.CSSProperties}>
                    <input
                        ref={inputRef}
                        type="text"
                        value={text}
                        onChange={e => setText(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                        placeholder="Originate secure reply..."
                        className="flex-1 w-full bg-transparent px-4 py-3.5 text-sm font-medium focus:outline-none"
                        style={{ color: 'var(--text-primary)' }}
                    />
                    <div className="pr-2 pl-1 flex items-center">
                        <button
                            onClick={handleSend}
                            disabled={!text.trim() || sending}
                            className="w-9 h-9 rounded-lg flex items-center justify-center transition-all disabled:opacity-40 disabled:hover:scale-100 hover:scale-105 active:scale-95 shadow-md"
                            style={{ background: 'var(--accent)', color: 'white' }}
                        >
                            <Send className="w-4 h-4 ml-0.5" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TicketChat;
