import React, { useState, useEffect, useRef } from 'react';
import { Bell, UserPlus, MessageCircle, Info } from 'lucide-react';
import { API_BASE } from '../config';

interface Notification {
    _id: string;
    type: string;
    message: string;
    read: boolean;
    fromUserId?: {
        _id: string;
        username: string;
        profileImageUrl?: string;
    };
    meta?: any;
    createdAt: string;
}

const NotificationBell: React.FC = () => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const currentUser = JSON.parse(localStorage.getItem('civicUser') || '{}');
    const userId = currentUser.id || currentUser._id;

    const fetchUnreadCount = async () => {
        if (!userId) return;
        try {
            const res = await fetch(`${API_BASE}/api/notifications/${userId}`);
            if (res.ok) {
                const data = await res.json();
                setUnreadCount(data.count);
            }
        } catch (e) { }
    };

    const fetchNotifications = async () => {
        if (!userId) return;
        try {
            const res = await fetch(`${API_BASE}/api/notifications/${userId}`);
            if (res.ok) {
                const data = await res.json();
                setNotifications(data);
            }
        } catch (e) { }
    };

    const markAsRead = async (id: string) => {
        try {
            const res = await fetch(`${API_BASE}/api/notifications/${id}/read`, { method: 'PUT' });
            if (res.ok) {
                setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
                setUnreadCount(prev => Math.max(0, prev - 1));
            }
        } catch (e) { }
    };

    const markAllAsRead = async () => {
        try {
            const res = await fetch(`${API_BASE}/api/notifications/mark-all-read/${userId}`, { method: 'PUT' });
            if (res.ok) {
                setNotifications(prev => prev.map(n => ({ ...n, read: true })));
                setUnreadCount(0);
            }
        } catch (e) { }
    };

    const clearAllNotifications = async () => {
        try {
            const res = await fetch(`${API_BASE}/api/notifications/clear-all/${userId}`, { method: 'DELETE' });
            if (res.ok) {
                setNotifications([]);
                setUnreadCount(0);
                setTimeout(() => setIsOpen(false), 300); // Close smoothly after clearing
            }
        } catch (e) { }
    };

    useEffect(() => {
        fetchUnreadCount();
        // Poll every 15 seconds for new notifications
        const interval = setInterval(fetchUnreadCount, 15000);
        return () => clearInterval(interval);
    }, [userId]);

    useEffect(() => {
        if (isOpen) {
            fetchNotifications();
        }
    }, [isOpen]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const getIconForType = (type: string) => {
        switch (type) {
            case 'friend_request':
            case 'friend_accepted':
                return <UserPlus className="w-5 h-5 text-blue-500" />;
            case 'like':
                return <Bell className="w-5 h-5 text-red-500" />;
            case 'comment':
                return <MessageCircle className="w-5 h-5 text-green-500" />;
            case 'message':
                return <MessageCircle className="w-5 h-5 text-indigo-500" />;
            default:
                return <Info className="w-5 h-5 text-gray-500" />;
        }
    };

    const handleNotificationClick = (n: Notification) => {
        if (!n.read) markAsRead(n._id);
        // Do not close dropdown immediately to let users read other things
    };

    const acceptFriendRequest = async (n: Notification, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!n.meta?.friendshipId) return;

        try {
            const res = await fetch(`${API_BASE}/api/friends/${n.meta.friendshipId}/accept`, { method: 'PUT' });
            if (res.ok) {
                // Update notification text locally to reflect acceptance
                setNotifications(prev => prev.map(notif =>
                    notif._id === n._id ? {
                        ...notif,
                        read: true,
                        type: 'friend_accepted', // change type so buttons disappear
                        message: 'You accepted the friend request',
                        meta: { ...notif.meta, handled: true }
                    } : notif
                ));
                if (!n.read) setUnreadCount(prev => Math.max(0, prev - 1));
            }
        } catch (e) { }
    };

    const rejectFriendRequest = async (n: Notification, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!n.meta?.friendshipId) return;

        try {
            const res = await fetch(`${API_BASE}/api/friends/${n.meta.friendshipId}`, { method: 'DELETE' });
            if (res.ok) {
                // Remove notification or mark it read and rejected
                setNotifications(prev => prev.map(notif =>
                    notif._id === n._id ? {
                        ...notif,
                        read: true,
                        type: 'system', // change type so buttons disappear
                        message: 'Friend request removed',
                        meta: { ...notif.meta, handled: true }
                    } : notif
                ));
                if (!n.read) setUnreadCount(prev => Math.max(0, prev - 1));
            }
        } catch (e) { }
    };

    const viewProfile = (n: Notification, e: React.MouseEvent) => {
        e.stopPropagation();
        if (n.fromUserId?._id) {
            setIsOpen(false);
            if (!n.read) markAsRead(n._id);
            window.location.href = `#/profile/${n.fromUserId._id}`;
        }
    };

    if (!userId) return null;

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-10 h-10 flex items-center justify-center rounded-lg transition-all duration-200 btn-micro hover-lift"
                style={{ background: isOpen ? 'var(--bg-elevated)' : 'transparent', color: isOpen ? 'var(--accent)' : 'var(--text-muted)', willChange: 'transform' }}
                title="Notifications"
            >
                <Bell className="w-5 h-5 flex-shrink-0" />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold text-white ring-2" style={{ background: 'var(--accent-red)', ringColor: 'var(--bg-panel)' }}>
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-100 dark:border-gray-700 z-50 overflow-hidden transform origin-top-right transition-all">
                    <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
                        <h3 className="font-bold text-gray-900 dark:text-white">Notifications</h3>
                        <div className="flex gap-3">
                            {unreadCount > 0 && (
                                <button
                                    onClick={markAllAsRead}
                                    className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium transition-colors"
                                >
                                    Mark all read
                                </button>
                            )}
                            {notifications.length > 0 && (
                                <button
                                    onClick={clearAllNotifications}
                                    className="text-xs text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-medium transition-colors"
                                >
                                    Clear all
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="max-h-[400px] overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="p-8 text-center flex flex-col items-center justify-center text-gray-400">
                                <Bell className="w-12 h-12 mb-3 text-gray-200 dark:text-gray-700" />
                                <p>No notifications yet</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-50 dark:divide-gray-700/50">
                                {notifications.map((n) => (
                                    <div
                                        key={n._id}
                                        onClick={() => handleNotificationClick(n)}
                                        className={`flex items-start gap-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors ${!n.read ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''
                                            }`}
                                    >
                                        <div className="relative flex-shrink-0">
                                            {n.fromUserId?.profileImageUrl ? (
                                                <img
                                                    src={n.fromUserId.profileImageUrl}
                                                    alt=""
                                                    className="w-10 h-10 rounded-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-10 h-10 bg-gradient-to-br from-indigo-100 to-blue-100 dark:from-indigo-900/50 dark:to-blue-900/50 rounded-full flex items-center justify-center">
                                                    <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
                                                        {n.fromUserId?.username?.charAt(0).toUpperCase() || '?'}
                                                    </span>
                                                </div>
                                            )}
                                            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center shadow-sm">
                                                {getIconForType(n.type)}
                                            </div>
                                        </div>

                                        <div className="flex-1 min-w-0 pt-1">
                                            <p className={`text-sm text-gray-800 dark:text-gray-200 ${!n.read ? 'font-semibold' : ''}`}>
                                                {n.fromUserId ? (
                                                    <span
                                                        className="font-bold cursor-pointer hover:underline text-indigo-600 dark:text-indigo-400 mr-1"
                                                        onClick={(e) => viewProfile(n, e)}
                                                    >
                                                        {n.fromUserId.username}
                                                    </span>
                                                ) : null}
                                                {n.fromUserId ? n.message.replace(n.fromUserId.username, '').trim() : n.message}
                                            </p>

                                            {n.type === 'friend_request' && n.meta?.friendshipId && !n.meta?.handled && (
                                                <div className="flex gap-2 mt-2">
                                                    <button
                                                        onClick={(e) => acceptFriendRequest(n, e)}
                                                        className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-md transition-colors"
                                                    >
                                                        Accept
                                                    </button>
                                                    <button
                                                        onClick={(e) => rejectFriendRequest(n, e)}
                                                        className="px-3 py-1 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 text-xs font-medium rounded-md transition-colors"
                                                    >
                                                        Reject
                                                    </button>
                                                </div>
                                            )}
                                            <p className="text-xs text-gray-400 mt-1">
                                                {new Date(n.createdAt).toLocaleDateString(undefined, {
                                                    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                                                })}
                                            </p>
                                        </div>

                                        {!n.read && (
                                            <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0"></div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationBell;
