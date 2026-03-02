/**
 * API base URL.
 *
 * We use an EMPTY string so every fetch goes to a relative URL:
 *   fetch(`${API_BASE}/api/chat/messages`) → fetch('/api/chat/messages')
 *
 * Vite's dev proxy (vite.config.ts) then forwards /api/* → localhost:5000
 * on the server machine. This means only port 3000 needs to be exposed —
 * VSCode/GitHub port forwarding, ngrok, or any single-port tunnel works.
 */
export const API_BASE = '';
