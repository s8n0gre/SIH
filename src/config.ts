import { Capacitor } from '@capacitor/core';

/**
 * API base URL.
 *
 * In web and development, we use an EMPTY string so every fetch goes to a relative URL:
 *   fetch(`${API_BASE}/api/chat/messages`) -> fetch('/api/chat/messages')
 * Vite's proxy then forwards this to localhost:5000.
 *
 * In the Capacitor Android app, relative URLs don't work (they point to localhost
 * on the phone). So we read from an environment variable, or fallback to the PC's
 * local IP address.
 */
export const API_BASE = Capacitor.isNativePlatform()
    ? import.meta.env.VITE_API_URL || 'http://192.168.1.4:5005'
    : '';
