/** Base URL for Socket.IO (no /api suffix). */
export function getSocketUrl(): string {
  const api = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:4000/api';
  return api.replace(/\/api\/?$/, '');
}
