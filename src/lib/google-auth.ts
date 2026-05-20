import { makeRedirectUri } from 'expo-auth-session';
import { Platform } from 'react-native';

export const GOOGLE_CLIENT_ID =
  process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID ||
  '552505922546-552ts6iekmiar3v32515ng4qpi1iv6dp.apps.googleusercontent.com';

/** Redirect URI for native / Expo Go — add to Google Console if using mobile */
export function getNativeRedirectUri() {
  return makeRedirectUri({
    scheme: 'jctrade',
    path: 'redirect',
    preferLocalhost: true,
  });
}

/** Web uses @react-oauth/google (origin only). Native uses this redirect. */
export function getGoogleRedirectUri() {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    return window.location.origin;
  }
  return getNativeRedirectUri();
}

export const GOOGLE_WEB_ORIGIN =
  Platform.OS === 'web' && typeof window !== 'undefined'
    ? window.location.origin
    : 'http://localhost:8081';
