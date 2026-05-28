/** Base URL for Socket.IO (no /api suffix). */
export function getSocketUrl(): string {
  let api = process.env.EXPO_PUBLIC_API_URL;
  if (!api) {
    if (typeof window !== 'undefined') {
      const host = window.location.hostname;
      const isLocalHost = host === 'localhost' || host === '127.0.0.1';
      api = isLocalHost ? 'http://localhost:4000/api' : `${window.location.origin}/api`;
    } else {
      api = 'http://localhost:4000/api';
    }
  }
  return api.replace(/\/api\/?$/, '');
}
